/* 工期关系图：关键路径计算 + 分层布局（重心法降交叉）+ 贝塞尔曲线连线 + SVG 渲染 + 拖拽/缩放 */
window.Graph = (function () {

  var W = 168, H = 62, GAP_X = 78, GAP_Y = 24, PAD = 26;
  var BG = '#FBFCFD';   /* 画布底色，用于连线描边光晕，交叉处更清楚 */

  /* ---------- 关键路径法（CPM） ---------- */
  function calc(nodes) {
    var map = {}, i;
    for (i = 0; i < nodes.length; i++) map[nodes[i].id] = nodes[i];

    var indeg = {}, succ = {};
    nodes.forEach(function (n) {
      indeg[n.id] = 0;
      succ[n.id] = succ[n.id] || [];
    });
    nodes.forEach(function (n) {
      (n.deps || []).forEach(function (d) {
        if (!map[d]) return;
        indeg[n.id]++;
        succ[d] = succ[d] || [];
        succ[d].push(n.id);
      });
    });

    /* 拓扑排序（检测环） */
    var q = [], order = [];
    nodes.forEach(function (n) { if (indeg[n.id] === 0) q.push(n.id); });
    var deg = {};
    Object.keys(indeg).forEach(function (k) { deg[k] = indeg[k]; });
    while (q.length) {
      var id = q.shift();
      order.push(id);
      (succ[id] || []).forEach(function (s) {
        deg[s]--;
        if (deg[s] === 0) q.push(s);
      });
    }
    if (order.length !== nodes.length) {
      return { ok: false, cycle: true, total: 0, order: order };
    }

    /* 前向：最早开始 / 最早完成 */
    var es = {}, ef = {};
    order.forEach(function (id) {
      var n = map[id];
      var v = 0;
      (n.deps || []).forEach(function (d) {
        if (ef[d] != null && ef[d] > v) v = ef[d];
      });
      es[id] = v;
      ef[id] = v + (Number(n.days) || 0);
    });

    var total = 0;
    order.forEach(function (id) { if (ef[id] > total) total = ef[id]; });

    /* 后向：最晚完成 / 最晚开始 / 总浮动 */
    var lf = {}, ls = {}, tf = {};
    for (i = order.length - 1; i >= 0; i--) {
      var id2 = order[i];
      var has = (succ[id2] || []).length > 0;
      var v2 = total;
      if (has) {
        v2 = Infinity;
        succ[id2].forEach(function (s) { if (ls[s] < v2) v2 = ls[s]; });
      }
      lf[id2] = v2;
      ls[id2] = v2 - (Number(map[id2].days) || 0);
      tf[id2] = ls[id2] - es[id2];
    }

    /* 开工节点固定为关键：它是整个工期的起始锚点，总工期 > 0 时必须按期开始 */
    if (total > 0) {
      nodes.forEach(function (n) {
        if (n.fixed) { tf[n.id] = 0; }
      });
    }

    var critNodes = order.filter(function (id) { return tf[id] === 0; });
    var critEdges = [];
    nodes.forEach(function (n) {
      (n.deps || []).forEach(function (d) {
        if (map[d] && tf[d] === 0 && tf[n.id] === 0 && ef[d] === es[n.id]) critEdges.push([d, n.id]);
      });
    });

    return {
      ok: true, cycle: false, total: total, order: order,
      es: es, ef: ef, ls: ls, lf: lf, tf: tf,
      critNodes: critNodes, critEdges: critEdges
    };
  }

  /* ---------- 层内排序：重心法迭代，减少连线交叉 ---------- */
  function barySort(nodes, layer, predOf, succOf, es, seedIdx) {
    var cols = {};
    nodes.forEach(function (n) {
      var L = layer[n.id];
      cols[L] = cols[L] || [];
      cols[L].push(n.id);
    });
    var keys = Object.keys(cols).map(Number).sort(function (a, b) { return a - b; });

    var ord = {};
    keys.forEach(function (L) {
      ord[L] = cols[L].slice().sort(function (a, b) {
        var ea = es[a] || 0, eb = es[b] || 0;
        if (ea !== eb) return ea - eb;
        return seedIdx[a] - seedIdx[b];
      });
    });

    function sortBy(L, side) {
      var ids = cols[L], w = {};
      ids.forEach(function (id) {
        var ns = (side === 'pred' ? predOf[id] : succOf[id]) || [];
        var s = 0, c = 0;
        ns.forEach(function (m) {
          var arr = ord[layer[m]];
          if (!arr) return;
          var k = arr.indexOf(m);
          if (k >= 0) { s += k; c++; }
        });
        w[id] = c ? s / c : -1;
      });
      ord[L] = ids.slice().sort(function (a, b) {
        var wa = w[a], wb = w[b];
        if (wa < 0 && wb < 0) return seedIdx[a] - seedIdx[b];
        if (wa < 0) return 1;
        if (wb < 0) return -1;
        if (Math.abs(wa - wb) > 1e-6) return wa - wb;
        return seedIdx[a] - seedIdx[b];
      });
    }

    function crossBetween(L1, L2) {
      var A = ord[L1], B = ord[L2];
      var pb = {};
      B.forEach(function (id, i) { pb[id] = i; });
      var edges = [];
      A.forEach(function (u, i) {
        (succOf[u] || []).forEach(function (v) {
          if (layer[v] === L2 && pb[v] != null) edges.push([i, pb[v]]);
        });
      });
      var c = 0;
      for (var i = 0; i < edges.length; i++) {
        for (var j = i + 1; j < edges.length; j++) {
          if ((edges[i][0] - edges[j][0]) * (edges[i][1] - edges[j][1]) < 0) c++;
        }
      }
      return c;
    }
    function totalCross() {
      var s = 0;
      for (var i = 0; i + 1 < keys.length; i++) s += crossBetween(keys[i], keys[i + 1]);
      return s;
    }
    function snapshot() {
      var o = {};
      keys.forEach(function (L) { o[L] = ord[L].slice(); });
      return o;
    }

    var best = snapshot(), bestC = totalCross();
    for (var it = 0; it < 10; it++) {
      var i;
      for (i = 1; i < keys.length; i++) sortBy(keys[i], 'pred');
      var c1 = totalCross();
      var s1 = snapshot();
      for (i = keys.length - 2; i >= 0; i--) sortBy(keys[i], 'succ');
      var c2 = totalCross();
      var s2 = snapshot();
      if (c1 <= c2) { if (c1 < bestC) { bestC = c1; best = s1; } }
      else { if (c2 < bestC) { bestC = c2; best = s2; } }
    }
    keys.forEach(function (L) { ord[L] = best[L].slice(); });
    return ord;
  }

  /* ---------- 连线：三次贝塞尔曲线 ---------- */
  /* 只依赖两个节点的实际位置，任何摆放方式都是一条完整曲线，拖动不会断开 */
  function num(v) { return (Math.round(v * 10) / 10).toString(); }

  function edgePath(a, b) {
    var ax = a.x, ay = a.y, bx = b.x, by = b.y;

    /* 目标在右侧：从右边出、左边进，横向 S 形 */
    if (bx >= ax + W - 4) {
      var x1 = ax + W, y1 = ay + H / 2, x2 = bx, y2 = by + H / 2;
      var dx = Math.max(34, Math.abs(x2 - x1) / 2);
      return 'M' + num(x1) + ' ' + num(y1) +
        ' C' + num(x1 + dx) + ' ' + num(y1) + ',' +
        num(x2 - dx) + ' ' + num(y2) + ',' +
        num(x2) + ' ' + num(y2);
    }

    /* 目标在左侧：从左边出、右边进，横向 S 形反向 */
    if (bx + W <= ax) {
      var x3 = ax, y3 = ay + H / 2, x4 = bx + W, y4 = by + H / 2;
      var dx2 = Math.max(34, Math.abs(x4 - x3) / 2);
      return 'M' + num(x3) + ' ' + num(y3) +
        ' C' + num(x3 - dx2) + ' ' + num(y3) + ',' +
        num(x4 + dx2) + ' ' + num(y4) + ',' +
        num(x4) + ' ' + num(y4);
    }

    /* 上下位置重叠：改成竖向 S 形，底出顶进 */
    var down = by >= ay;
    var x5 = ax + W / 2, y5 = down ? ay + H : ay;
    var x6 = bx + W / 2, y6 = down ? by : by + H;
    var dy = Math.max(24, Math.abs(y6 - y5) / 2);
    var s = down ? 1 : -1;
    return 'M' + num(x5) + ' ' + num(y5) +
      ' C' + num(x5) + ' ' + num(y5 + s * dy) + ',' +
      num(x6) + ' ' + num(y6 - s * dy) + ',' +
      num(x6) + ' ' + num(y6);
  }

  /* ---------- 分层布局 ---------- */
  function layout(nodes, cpm) {
    var map = {}, i, id;
    for (i = 0; i < nodes.length; i++) map[nodes[i].id] = nodes[i];
    var seedIdx = {};
    nodes.forEach(function (n, k) { seedIdx[n.id] = k; });

    /* 1) 分层：层号 = 所有前置层号最大值 + 1 */
    var layer = {};
    (cpm.order || []).forEach(function (id) {
      var n = map[id], v = 0;
      (n.deps || []).forEach(function (d) {
        if (layer[d] != null && layer[d] + 1 > v) v = layer[d] + 1;
      });
      layer[id] = v;
    });
    nodes.forEach(function (n) { if (layer[n.id] == null) layer[n.id] = 0; });

    /* 2) 邻接表 */
    var predOf = {}, succOf = {};
    nodes.forEach(function (n) { predOf[n.id] = []; succOf[n.id] = []; });
    nodes.forEach(function (n) {
      (n.deps || []).forEach(function (d) {
        if (!map[d]) return;
        predOf[n.id].push(d);
        succOf[d].push(n.id);
      });
    });

    /* 3) 层内排序（降交叉） */
    var ord = barySort(nodes, layer, predOf, succOf, cpm.es || {}, seedIdx);
    var keys = Object.keys(ord).map(Number).sort(function (a, b) { return a - b; });
    var maxRows = 0;
    keys.forEach(function (L) { if (ord[L].length > maxRows) maxRows = ord[L].length; });
    var totalH = maxRows * (H + GAP_Y) - GAP_Y;

    /* 4) 坐标：整层垂直居中；手动拖过的节点保留其位置 */
    var pos = {};
    keys.forEach(function (L) {
      var ids = ord[L];
      var lh = ids.length * (H + GAP_Y) - GAP_Y;
      var y0 = PAD + (totalH - lh) / 2;
      ids.forEach(function (id, k) {
        pos[id] = { x: PAD + L * (W + GAP_X), y: y0 + k * (H + GAP_Y) };
      });
    });
    nodes.forEach(function (n) { if (n.pos) pos[n.id] = { x: n.pos.x, y: n.pos.y }; });

    var maxX = 0, maxY = 0;
    Object.keys(pos).forEach(function (id) {
      var p = pos[id];
      if (p.x + W > maxX) maxX = p.x + W;
      if (p.y + H > maxY) maxY = p.y + H;
    });
    var box = { w: maxX + PAD, h: Math.max(maxY + PAD, totalH + PAD * 2) };
    return { pos: pos, layer: layer, box: box, cols: ord };
  }

  /* ---------- 文本截断 ---------- */
  function cut(s, n) {
    s = String(s == null ? '' : s);
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }

  /* ---------- 连线 HTML ---------- */
  function edgesHTML(nodes, pos, cpm) {
    var critEdge = {};
    (cpm.critEdges || []).forEach(function (e) { critEdge[e[0] + '>' + e[1]] = true; });
    var halo = '', line = '';
    nodes.forEach(function (n) {
      (n.deps || []).forEach(function (d) {
        var a = pos[d], b = pos[n.id];
        if (!a || !b) return;
        var dd = edgePath(a, b);
        var isC = !!critEdge[d + '>' + n.id];
        halo += '<path d="' + dd + '" fill="none" stroke="' + BG + '" stroke-width="' +
          (isC ? 6 : 5) + '" stroke-linecap="round"></path>';
        line += '<path d="' + dd + '" fill="none" stroke="' + (isC ? '#C2410C' : '#B9C6D1') +
          '" stroke-width="' + (isC ? 2 : 1.4) + '" stroke-linecap="round"' +
          (isC ? ' marker-end="url(#gq-arw-c)"' : ' marker-end="url(#gq-arw)"') + '></path>';
      });
    });
    return halo + line;
  }

  /* ---------- 节点 HTML ---------- */
  function nodesHTML(nodes, pos, cpm) {
    var critSet = {};
    (cpm.critNodes || []).forEach(function (id) { critSet[id] = true; });
    var out = '';
    nodes.forEach(function (n, idx) {
      var p = pos[n.id];
      if (!p) return;
      var isCrit = !!critSet[n.id] && cpm.ok;
      var fx = n.fixed;
      var fill = fx ? '#0E4C6B' : '#FFFFFF';
      var stroke = fx ? '#0E4C6B' : (isCrit ? '#C2410C' : '#D8E0E6');
      var sw = fx || isCrit ? 1.6 : 1.1;
      var c1 = fx ? '#FFFFFF' : '#16232D';
      var c2 = fx ? 'rgba(255,255,255,.72)' : '#5A6B79';
      var bar = fx ? '#FFFFFF' : (isCrit ? '#C2410C' : '#B9C6D1');
      var sub = fx ? '施工起点' :
        (Number(n.days) || 0) + ' 天 · 第 ' + (((cpm.es && cpm.es[n.id]) || 0) + 1) + ' 天开始';

      out +=
        '<g class="g-node" data-id="' + U.esc(n.id) + '" transform="translate(' + p.x + ',' + p.y + ')" style="cursor:move">' +
        '<rect class="n-box" x="0" y="0" width="' + W + '" height="' + H + '" rx="9" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + sw + '"></rect>' +
        '<rect x="0" y="14" width="3.5" height="34" rx="1.75" fill="' + bar + '"></rect>' +
        '<text x="15" y="26" font-size="13.5" font-weight="600" fill="' + c1 + '">' + U.esc(cut(n.name, 12)) + '</text>' +
        '<text x="15" y="45" font-size="11.5" fill="' + c2 + '">' + U.esc(sub) + '</text>' +
        '<text x="' + (W - 13) + '" y="26" font-size="11" text-anchor="end" fill="' + (fx ? 'rgba(255,255,255,.7)' : '#93A1AD') + '">' +
        (idx + 1) + '</text>' +
        (isCrit && !fx ? '<rect x="' + (W - 44) + '" y="34" width="32" height="16" rx="4" fill="#FDF0E9"></rect>' +
          '<text x="' + (W - 28) + '" y="45.5" font-size="10.5" text-anchor="middle" fill="#C2410C">关键</text>' : '') +
        '</g>';
    });
    return out;
  }

  /* ---------- 局部更新：拖动节点时只改位置与连线，不重建画布 ---------- */
  function update(svg, tpl, cpm) {
    var nodes = tpl.nodes;
    var lay = layout(nodes, cpm);
    var eg = svg.querySelector('.g-edges');
    if (eg) eg.innerHTML = edgesHTML(nodes, lay.pos, cpm);
    var gs = svg.querySelectorAll('.g-node');
    for (var i = 0; i < gs.length; i++) {
      var id = gs[i].getAttribute('data-id');
      var p = lay.pos[id];
      if (p) gs[i].setAttribute('transform', 'translate(' + p.x + ',' + p.y + ')');
    }
    /* 拖动后画布变大时同步扩大可视范围，避免节点被裁掉 */
    if (svg._base) {
      var grown = false;
      if (lay.box.w > svg._base.w + 1) { svg._base.w = lay.box.w; grown = true; }
      if (lay.box.h > svg._base.h + 1) { svg._base.h = lay.box.h; grown = true; }
      if (grown) {
        svg._vb.w = Math.max(svg._vb.w, svg._base.w);
        svg._vb.h = Math.max(svg._vb.h, svg._base.h);
        applyVb(svg);
      }
    }
  }

  /* ---------- 渲染 ---------- */
  function render(svg, tpl, cpm, opts) {
    opts = opts || {};
    var nodes = tpl.nodes;
    var lay = layout(nodes, cpm);
    var pos = lay.pos;

    var defs =
      '<defs>' +
      '<marker id="gq-arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">' +
      '<path d="M0 1 L9 5 L0 9 z" fill="#9AAAB8"/></marker>' +
      '<marker id="gq-arw-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">' +
      '<path d="M0 1 L9 5 L0 9 z" fill="#C2410C"/></marker>' +
      '</defs>';

    var edges = edgesHTML(nodes, pos, cpm);
    var boxes = nodesHTML(nodes, pos, cpm);

    var vb = '0 0 ' + Math.round(lay.box.w) + ' ' + Math.round(lay.box.h);
    svg.setAttribute('viewBox', vb);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.innerHTML = defs +
      '<g class="g-edges">' + edges + '</g>' +
      '<g class="g-nodes">' + boxes + '</g>';
    svg._vb = { x: 0, y: 0, w: lay.box.w, h: lay.box.h };
    svg._base = { w: lay.box.w, h: lay.box.h };

    bind(svg, tpl, opts);
    return lay;
  }

  /* ---------- 交互：节点拖拽 / 画布平移 / 缩放 ---------- */
  function bind(svg, tpl, opts) {
    if (svg._bound) { svg._tpl = tpl; svg._opts = opts; return; }
    svg._bound = true;
    svg._tpl = tpl;
    svg._opts = opts;

    var drag = null;

    function toUser(e) {
      var r = svg.getBoundingClientRect();
      var vb = svg._vb;
      var scale = Math.min(r.width / vb.w, r.height / vb.h);
      var ox = (r.width - vb.w * scale) / 2, oy = (r.height - vb.h * scale) / 2;
      return { x: (e.clientX - r.left - ox) / scale + vb.x, y: (e.clientY - r.top - oy) / scale + vb.y };
    }

    svg.addEventListener('mousedown', function (e) {
      var g = e.target.closest ? e.target.closest('.g-node') : null;
      if (g && !g.getAttribute('data-id')) return;
      var p = toUser(e);
      if (g) {
        var id = g.getAttribute('data-id');
        var cur = svg._tpl;
        var node = null;
        cur.nodes.forEach(function (n) { if (n.id === id) node = n; });
        if (!node) return;
        var lay = layout(cur.nodes, svg._cpm || calc(cur.nodes));
        var cur = lay.pos[id] || { x: 0, y: 0 };
        drag = { type: 'node', id: id, dx: p.x - cur.x, dy: p.y - cur.y };
      } else {
        drag = { type: 'pan', sx: p.x, sy: p.y, vx: svg._vb.x, vy: svg._vb.y };
        svg.classList.add('panning');
      }
      e.preventDefault();
    });

    window.addEventListener('mousemove', function (e) {
      if (!drag) return;
      var p = toUser(e);
      if (drag.type === 'node') {
        var node = null;
        svg._tpl.nodes.forEach(function (n) { if (n.id === drag.id) node = n; });
        if (!node) return;
        node.pos = { x: Math.max(0, p.x - drag.dx), y: Math.max(0, p.y - drag.dy) };
        if (svg._opts && svg._opts.onMove) svg._opts.onMove(node);
      } else if (drag.type === 'pan') {
        svg._vb.x = drag.vx - (p.x - drag.sx);
        svg._vb.y = drag.vy - (p.y - drag.sy);
        applyVb(svg);
      }
    });

    window.addEventListener('mouseup', function () {
      if (!drag) return;
      if (drag.type === 'node' && svg._opts && svg._opts.onMoveEnd) svg._opts.onMoveEnd();
      drag = null;
      svg.classList.remove('panning');
    });

    svg.addEventListener('wheel', function (e) {
      e.preventDefault();
      zoom(svg, e.deltaY < 0 ? 1.12 : 1 / 1.12);
    }, { passive: false });
  }

  function applyVb(svg) {
    var v = svg._vb;
    svg.setAttribute('viewBox', v.x + ' ' + v.y + ' ' + v.w + ' ' + v.h);
  }

  function zoom(svg, k) {
    var v = svg._vb;
    var cx = v.x + v.w / 2, cy = v.y + v.h / 2;
    v.w = Math.max(80, v.w / k);
    v.h = Math.max(80, v.h / k);
    v.x = cx - v.w / 2;
    v.y = cy - v.h / 2;
    applyVb(svg);
  }

  function fit(svg) {
    if (!svg._base) return;
    svg._vb = { x: 0, y: 0, w: svg._base.w, h: svg._base.h };
    applyVb(svg);
  }

  function fullscreen(el) {
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(function (err) {
        if (window.U && U.toast) U.toast('全屏失败：' + (err.message || err));
      });
    } else {
      document.exitFullscreen();
    }
  }

  return {
    calc: calc, layout: layout, render: render, update: update,
    zoom: zoom, fit: fit, fullscreen: fullscreen, W: W, H: H
  };
})();
