/* 工期关系图：关键路径计算 + 分层布局 + SVG 渲染 + 拖拽/缩放 */
window.Graph = (function () {

  var W = 168, H = 62, GAP_X = 78, GAP_Y = 24, PAD = 26;

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

  /* ---------- 分层布局 ---------- */
  function layout(nodes, cpm) {
    var map = {}, i;
    for (i = 0; i < nodes.length; i++) map[nodes[i].id] = nodes[i];

    var layer = {};
    cpm.order.forEach(function (id) {
      var n = map[id], v = 0;
      (n.deps || []).forEach(function (d) {
        if (layer[d] != null && layer[d] + 1 > v) v = layer[d] + 1;
      });
      layer[id] = v;
    });
    /* 环里的节点兜底 */
    nodes.forEach(function (n) { if (layer[n.id] == null) layer[n.id] = 0; });

    var cols = {};
    nodes.forEach(function (n) {
      var L = layer[n.id];
      cols[L] = cols[L] || [];
      cols[L].push(n.id);
    });

    var keys = Object.keys(cols).map(Number).sort(function (a, b) { return a - b; });
    var maxRows = 0;
    keys.forEach(function (L) { if (cols[L].length > maxRows) maxRows = cols[L].length; });
    var totalH = maxRows * (H + GAP_Y) - GAP_Y;
    var boxH = totalH + PAD * 2;

    var pos = {};
    keys.forEach(function (L) {
      var ids = cols[L].slice().sort(function (a, b) {
        var ea = (cpm.es && cpm.es[a]) || 0, eb = (cpm.es && cpm.es[b]) || 0;
        if (ea !== eb) return ea - eb;
        return nodes.findIndex(function (n) { return n.id === a; }) -
               nodes.findIndex(function (n) { return n.id === b; });
      });
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
    var box = { w: maxX + PAD, h: Math.max(maxY + PAD, boxH) };
    return { pos: pos, layer: layer, box: box };
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
    var out = '';
    nodes.forEach(function (n) {
      (n.deps || []).forEach(function (d) {
        var a = pos[d], b = pos[n.id];
        if (!a || !b) return;
        var x1 = a.x + W, y1 = a.y + H / 2, x2 = b.x, y2 = b.y + H / 2;
        var dx = Math.max(34, Math.abs(x2 - x1) / 2);
        var isC = !!critEdge[d + '>' + n.id];
        out += '<path d="M' + x1 + ' ' + y1 + ' C' + (x1 + dx) + ' ' + y1 + ',' +
          (x2 - dx) + ' ' + y2 + ',' + x2 + ' ' + y2 + '" fill="none" stroke="' +
          (isC ? '#C2410C' : '#B9C6D1') + '" stroke-width="' + (isC ? 2 : 1.4) + '"' +
          (isC ? ' marker-end="url(#gq-arw-c)"' : ' marker-end="url(#gq-arw)"') + '></path>';
      });
    });
    return out;
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
  }

  /* ---------- 渲染 ---------- */
  function render(svg, tpl, cpm, opts) {
    opts = opts || {};
    var nodes = tpl.nodes;
    var lay = layout(nodes, cpm);
    var pos = lay.pos;
    var critSet = {};
    (cpm.critNodes || []).forEach(function (id) { critSet[id] = true; });
    var critEdge = {};
    (cpm.critEdges || []).forEach(function (e) { critEdge[e[0] + '>' + e[1]] = true; });

    var defs =
      '<defs>' +
      '<marker id="gq-arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">' +
      '<path d="M0 1 L9 5 L0 9 z" fill="#9AAAB8"/></marker>' +
      '<marker id="gq-arw-c" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">' +
      '<path d="M0 1 L9 5 L0 9 z" fill="#C2410C"/></marker>' +
      '</defs>';

    var edges = edgesHTML(nodes, pos, cpm);

    /* 节点 */
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
        var node = null;
        tpl.nodes.forEach(function (n) { if (n.id === id) node = n; });
        if (!node) return;
        var lay = layout(tpl.nodes, svg._cpm || calc(tpl.nodes));
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
        tpl.nodes.forEach(function (n) { if (n.id === drag.id) node = n; });
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

  return { calc: calc, layout: layout, render: render, update: update, zoom: zoom, fit: fit, fullscreen: fullscreen, W: W, H: H };
})();
