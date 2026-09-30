/* 工期关系图：关键路径计算 + 分层布局（重心法降交叉）+ 曲线避让路由 + SVG 渲染 + 拖拽/缩放 */
window.Graph = (function () {

  var W = 168, H = 62, GAP_X = 88, GAP_Y = 26, PAD = 26;
  var BG = '#FBFCFD';   /* 画布底色，用于连线描边光晕 */
  var TOL = 4;          /* 避让检测时节点框的内缩容差 */

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

  /* ---------- 曲线工具：Catmull-Rom 转三次贝塞尔 ---------- */
  function num(v) { return (Math.round(v * 10) / 10).toString(); }

  function crSegments(pts, tension) {
    var segs = [], n = pts.length, i;
    for (i = 0; i < n - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
      segs.push([
        p1,
        [p1[0] + (p2[0] - p0[0]) / 6 * tension, p1[1] + (p2[1] - p0[1]) / 6 * tension],
        [p2[0] - (p3[0] - p1[0]) / 6 * tension, p2[1] - (p3[1] - p1[1]) / 6 * tension],
        p2
      ]);
    }
    return segs;
  }

  function bezPoint(g, t) {
    var mt = 1 - t;
    var a = mt * mt * mt, b = 3 * mt * mt * t, c = 3 * mt * t * t, d = t * t * t;
    return [
      a * g[0][0] + b * g[1][0] + c * g[2][0] + d * g[3][0],
      a * g[0][1] + b * g[1][1] + c * g[2][1] + d * g[3][1]
    ];
  }

  function segsToPath(segs) {
    if (!segs.length) return '';
    var d = 'M' + num(segs[0][0][0]) + ' ' + num(segs[0][0][1]), i;
    for (i = 0; i < segs.length; i++) {
      var s = segs[i];
      d += ' C' + num(s[1][0]) + ' ' + num(s[1][1]) + ',' +
        num(s[2][0]) + ' ' + num(s[2][1]) + ',' + num(s[3][0]) + ' ' + num(s[3][1]);
    }
    return d;
  }

  /* 曲线是否穿过任何节点框（采样点判定） */
  function segsHit(segs, rects) {
    var i, k, r;
    for (i = 0; i < segs.length; i++) {
      for (k = 0; k <= 14; k++) {
        var p = bezPoint(segs[i], k / 14);
        for (r = 0; r < rects.length; r++) {
          var rc = rects[r];
          if (p[0] > rc.x + TOL && p[0] < rc.x + W - TOL &&
            p[1] > rc.y + TOL && p[1] < rc.y + H - TOL) return true;
        }
      }
    }
    return false;
  }

  /* ---------- 走向点：按节点实际位置决定出入口，不依赖固定列 ---------- */
  function wpFor(a, b, f) {
    var ax = a.x, ay = a.y, bx = b.x, by = b.y;

    /* b 在 a 右侧：右出左进 */
    if (bx >= ax + W - 4) {
      var ex = ax + W, ey = ay + H / 2, ix = bx, iy = by + H / 2;
      var gap = ix - ex;
      var pts = (gap > 30 && Math.abs(iy - ey) > 1)
        ? [[ex, ey], [ex + gap * f, ey], [ex + gap * f, iy], [ix, iy]]
        : [[ex, ey], [ix, iy]];
      return { pts: pts, ex: ex, ey: ey, ix: ix, iy: iy, horiz: true, gap: gap };
    }

    /* b 在 a 左侧：左出右进 */
    if (bx + W <= ax) {
      var ex2 = ax, ey2 = ay + H / 2, ix2 = bx + W, iy2 = by + H / 2;
      var gap2 = ex2 - ix2;
      var pts2 = (gap2 > 30 && Math.abs(iy2 - ey2) > 1)
        ? [[ex2, ey2], [ix2 + gap2 * f, ey2], [ix2 + gap2 * f, iy2], [ix2, iy2]]
        : [[ex2, ey2], [ix2, iy2]];
      return { pts: pts2, ex: ex2, ey: ey2, ix: ix2, iy: iy2, horiz: true, gap: gap2 };
    }

    /* 水平方向重叠：改成上下相接 */
    var down = by >= ay;
    var ex3 = ax + W / 2, ey3 = down ? ay + H : ay;
    var ix3 = bx + W / 2, iy3 = down ? by : by + H;
    return {
      pts: [[ex3, ey3], [ix3, iy3]], ex: ex3, ey: ey3, ix: ix3, iy: iy3,
      horiz: false, gap: Math.abs(iy3 - ey3)
    };
  }

  /* 被挡住时的绕行走法 */
  function wpDetour(base, rects) {
    /* 只考虑横向区间内的节点：绕行高度必须避开它们，而不是只避开起终点 */
    var lo, hi;
    if (base.horiz) { lo = Math.min(base.ex, base.ix) - 4; hi = Math.max(base.ex, base.ix) + 4; }
    else { lo = Math.min(base.ex, base.ix) - W / 2 - 4; hi = Math.max(base.ex, base.ix) + W / 2 + 4; }

    var minY = Infinity, maxY = -Infinity, minX = Infinity, maxX = -Infinity;
    rects.forEach(function (r) {
      if (r.x + W < lo || r.x > hi) return;
      if (r.y < minY) minY = r.y;
      if (r.y + H > maxY) maxY = r.y + H;
      if (r.x < minX) minX = r.x;
      if (r.x + W > maxX) maxX = r.x + W;
    });
    if (minY === Infinity) {
      minY = Math.min(base.ey, base.iy) - H / 2;
      maxY = Math.max(base.ey, base.iy) + H / 2;
      minX = Math.min(base.ex, base.ix) - W / 2;
      maxX = Math.max(base.ex, base.ix) + W / 2;
    }

    if (base.horiz) {
      var midY = (base.ey + base.iy) / 2;
      var upY = minY - 22, dnY = maxY + 22;
      var useUp = Math.abs(midY - upY) <= Math.abs(midY - dnY);
      if (useUp && upY < 8) useUp = false;          /* 上方贴边就改走下方 */
      var byY = useUp ? upY : dnY;
      var dir = base.ix >= base.ex ? 1 : -1;
      var o = Math.max(20, Math.min(64, Math.abs(base.gap) * 0.35));
      o = Math.min(o, Math.abs(base.gap) * 0.45 + 2);   /* 不回头，避免自交 */
      var p1 = base.ex + dir * o, p2 = base.ix - dir * o;
      return [[base.ex, base.ey], [p1, base.ey], [p1, byY], [p2, byY], [p2, base.iy], [base.ix, base.iy]];
    }

    /* 上下相接：从侧面绕出去 */
    var down = base.iy > base.ey;
    var midX = (base.ex + base.ix) / 2;
    var sRight = maxX + 24, sLeft = minX - 24;
    var useRight = Math.abs(midX - sRight) <= Math.abs(midX - sLeft);
    if (!useRight && sLeft < 8) useRight = true;
    var sx = useRight ? sRight : sLeft;
    var oy = base.ey + (down ? 26 : -26);
    var ny = base.iy + (down ? -26 : 26);
    return [[base.ex, base.ey], [base.ex, oy], [sx, oy], [sx, ny], [base.ix, ny], [base.ix, base.iy]];
  }

  /* 生成路径：直线段 + 三次贝塞尔圆角，拐角切线连续（不会回勾、不会鼓包） */
  function buildPath(pts) {
    return { d: cornerPath(pts, 24), segs: crSegments(pts, 0) };
  }

  /* ---------- 圆角路径 ---------- */
  function cornerPath(pts, r) {
    var clean = [], i;
    for (i = 0; i < pts.length; i++) {
      if (i === 0 || Math.abs(pts[i][0] - pts[i - 1][0]) > 0.5 || Math.abs(pts[i][1] - pts[i - 1][1]) > 0.5) {
        clean.push(pts[i]);
      }
    }
    pts = clean;
    if (pts.length < 2) return '';
    var d = 'M' + num(pts[0][0]) + ' ' + num(pts[0][1]);
    if (pts.length === 2) return d + ' L' + num(pts[1][0]) + ' ' + num(pts[1][1]);

    for (i = 1; i < pts.length - 1; i++) {
      var p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1];
      var v1 = [p1[0] - p0[0], p1[1] - p0[1]], v2 = [p2[0] - p1[0], p2[1] - p1[1]];
      var l1 = Math.hypot(v1[0], v1[1]), l2 = Math.hypot(v2[0], v2[1]);
      if (l1 < 0.5 || l2 < 0.5) continue;
      var u1 = [v1[0] / l1, v1[1] / l1], u2 = [v2[0] / l2, v2[1] / l2];
      var dd = Math.min(r, l1 / 2, l2 / 2);
      var t = 0.42;
      var A = [p1[0] - u1[0] * dd, p1[1] - u1[1] * dd];
      var B = [p1[0] + u2[0] * dd, p1[1] + u2[1] * dd];
      var C1 = [p1[0] - u1[0] * dd * (1 - t), p1[1] - u1[1] * dd * (1 - t)];
      var C2 = [p1[0] + u2[0] * dd * (1 - t), p1[1] + u2[1] * dd * (1 - t)];
      d += ' L' + num(A[0]) + ' ' + num(A[1]) +
        ' C' + num(C1[0]) + ' ' + num(C1[1]) + ',' + num(C2[0]) + ' ' + num(C2[1]) +
        ',' + num(B[0]) + ' ' + num(B[1]);
    }
    var last = pts[pts.length - 1];
    return d + ' L' + num(last[0]) + ' ' + num(last[1]);
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
    var pos = {}, off = 0;
    function place(dy) {
      keys.forEach(function (L) {
        var ids = ord[L];
        var lh = ids.length * (H + GAP_Y) - GAP_Y;
        var y0 = PAD + dy + (totalH - lh) / 2;
        ids.forEach(function (id, k) {
          pos[id] = { x: PAD + L * (W + GAP_X), y: y0 + k * (H + GAP_Y) };
        });
      });
      nodes.forEach(function (n) { if (n.pos) pos[n.id] = { x: n.pos.x, y: n.pos.y }; });
    }

    /* 5) 通道内错开：同一组的连线用不同的转弯位置，避免完全重合 */
    var laneN = {};
    nodes.forEach(function (n) {
      (n.deps || []).forEach(function (d) {
        if (!map[d]) return;
        var k = layer[d] + '>' + layer[n.id];
        laneN[k] = (laneN[k] || 0) + 1;
      });
    });

    var routes = {}, paths = {}, samples = {};
    var minY = 0, maxY = 0, minX = 0, maxX = 0, detour = 0;

    function compute() {
      routes = {}; paths = {}; samples = {};
      detour = 0;
      var rects = nodes.map(function (n) { return { id: n.id, x: pos[n.id].x, y: pos[n.id].y }; });
      var laneUsed = {};

      minY = Infinity; maxY = -Infinity; minX = Infinity; maxX = -Infinity;
      nodes.forEach(function (n) {
        var p = pos[n.id];
        if (p.y < minY) minY = p.y;
        if (p.y + H > maxY) maxY = p.y + H;
        if (p.x < minX) minX = p.x;
        if (p.x + W > maxX) maxX = p.x + W;
      });

      nodes.forEach(function (n) {
        (n.deps || []).forEach(function (d) {
          if (!map[d] || !pos[d] || !pos[n.id]) return;
          var k = layer[d] + '>' + layer[n.id];
          var idx = laneUsed[k] || 0;
          laneUsed[k] = idx + 1;
          var f = (laneN[k] || 1) > 1 ? 0.34 + 0.32 * ((idx % 3) / 2) : 0.5;

          var base = wpFor(pos[d], pos[n.id], f);
          var pts = base.pts;
          if (segsHit(crSegments(pts, 0), rects)) { pts = wpDetour(base, rects); detour++; }
          var built = buildPath(pts);

          var key = d + '>' + n.id;
          routes[key] = pts;
          paths[key] = built.d;
          samples[key] = sampleOf(built.segs);
          for (var j = 0; j < pts.length; j++) {
            if (pts[j][1] < minY) minY = pts[j][1];
            if (pts[j][1] > maxY) maxY = pts[j][1];
            if (pts[j][0] < minX) minX = pts[j][0];
            if (pts[j][0] > maxX) maxX = pts[j][0];
          }
        });
      });
    }

    function sampleOf(segs) {
      var out = [];
      for (var i = 0; i < segs.length; i++) {
        for (var k = 0; k <= 14; k++) out.push(bezPoint(segs[i], k / 14));
      }
      return out;
    }

    /* 6) 上方被绕行线顶出画布时整体下移 */
    place(0);
    compute();
    if (minY < 2) {
      off = 2 - minY;
      place(off);
      compute();
    }

    var box = { w: maxX + PAD, h: maxY + PAD };
    return {
      pos: pos, layer: layer, box: box, cols: ord,
      routes: routes, paths: paths, samples: samples, detour: detour
    };
  }

  /* ---------- 文本截断 ---------- */
  function cut(s, n) {
    s = String(s == null ? '' : s);
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }

  /* ---------- 连线 HTML ---------- */
  function edgesHTML(nodes, lay, cpm) {
    var critEdge = {};
    (cpm.critEdges || []).forEach(function (e) { critEdge[e[0] + '>' + e[1]] = true; });
    var pos = lay.pos, paths = lay.paths || {}, routes = lay.routes || {};
    var rects = nodes.map(function (n) { return { id: n.id, x: pos[n.id].x, y: pos[n.id].y }; });
    var halo = '', line = '';
    nodes.forEach(function (n) {
      (n.deps || []).forEach(function (d) {
        var a = pos[d], b = pos[n.id];
        if (!a || !b) return;
        var key = d + '>' + n.id;
        var dd = paths[key];
        if (!dd) {
          var base = wpFor(a, b, 0.5);
          if (segsHit(crSegments(base.pts, 0), rects)) base.pts = wpDetour(base, rects);
          dd = buildPath(base.pts).d;
        }
        if (!dd) return;
        var isC = !!critEdge[key];
        halo += '<path d="' + dd + '" fill="none" stroke="' + BG + '" stroke-width="' +
          (isC ? 6 : 5) + '" stroke-linecap="round" stroke-linejoin="round"></path>';
        line += '<path d="' + dd + '" fill="none" stroke="' + (isC ? '#C2410C' : '#B9C6D1') +
          '" stroke-width="' + (isC ? 2 : 1.4) + '" stroke-linejoin="round" stroke-linecap="round"' +
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
    if (eg) eg.innerHTML = edgesHTML(nodes, lay, cpm);
    var gs = svg.querySelectorAll('.g-node');
    for (var i = 0; i < gs.length; i++) {
      var id = gs[i].getAttribute('data-id');
      var p = lay.pos[id];
      if (p) gs[i].setAttribute('transform', 'translate(' + p.x + ',' + p.y + ')');
    }
    /* 拖动后画布变大时同步扩大可视范围，避免连线被裁掉 */
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

    var edges = edgesHTML(nodes, lay, cpm);
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

  return {
    calc: calc, layout: layout, render: render, update: update,
    zoom: zoom, fit: fit, fullscreen: fullscreen, W: W, H: H
  };
})();
