/* 工期应用：按实际纳入的节点推导前置关系与工期
 *
 * 规则：
 *  1. 前置节点缺失时，向上找前置的前置，逐层上溯
 *  2. 追溯到的前置若同时是「另一个前置的前置」，属于传递冗余，不作为前置关系
 *  3. 节点开始时间 = 所有前置结束时间的最大值
 *  4. 节点结束时间 = 开始时间 + 施工天数
 */
window.ApplyCalc = (function () {

  /* 沿依赖表向上收集全部祖先 */
  function ancestorsIn(depMap, id) {
    var out = [], seen = {}, stack = (depMap[id] || []).slice();
    while (stack.length) {
      var c = stack.pop();
      if (seen[c]) continue;
      seen[c] = true;
      out.push(c);
      (depMap[c] || []).forEach(function (x) { if (!seen[x]) stack.push(x); });
    }
    return out;
  }

  function derive(nodes, selected) {
    var sel = {};
    (selected || []).forEach(function (id) { sel[id] = true; });

    var map = {};
    nodes.forEach(function (n) { map[n.id] = n; });

    var missing = nodes.filter(function (n) { return !sel[n.id]; });
    var active = nodes.filter(function (n) { return sel[n.id]; });

    /* 模板原依赖表 */
    var raw = {};
    nodes.forEach(function (n) { raw[n.id] = (n.deps || []).slice(); });

    /* 第一步：直接前置 + 缺失节点逐层上溯 */
    var cand = {}, trace = {};
    active.forEach(function (n) {
      var set = [], log = [];
      (n.deps || []).forEach(function (d) {
        if (sel[d]) {
          if (set.indexOf(d) < 0) set.push(d);
          return;
        }
        /* 前置缺失：沿它的前置继续往上找 */
        ancestorsIn(raw, d).forEach(function (a) {
          if (!sel[a] || a === n.id) return;
          if (set.indexOf(a) < 0) set.push(a);
          log.push({ miss: d, repl: a });
        });
      });
      cand[n.id] = set;
      trace[n.id] = log;
    });

    /* 第二步：传递冗余消除（基于上一步结果快照判断，避免边删边判） */
    var snap = {};
    Object.keys(cand).forEach(function (k) { snap[k] = cand[k].slice(); });
    var removed = {};
    active.forEach(function (n) {
      var set = snap[n.id] || [];
      var keep = [];
      set.forEach(function (p) {
        var covered = set.some(function (q) {
          return q !== p && ancestorsIn(snap, q).indexOf(p) >= 0;
        });
        if (covered) (removed[n.id] = removed[n.id] || []).push(p);
        else keep.push(p);
      });
      cand[n.id] = keep;
    });

    /* 上溯记录只保留最终生效的那条，避免说明里出现已被省略的候选 */
    active.forEach(function (n) {
      trace[n.id] = (trace[n.id] || []).filter(function (t) {
        return cand[n.id].indexOf(t.repl) >= 0;
      });
    });

    /* 第三步：应用后的节点表，并复用关键路径法算开始/结束时间 */
    var out = active.map(function (n) {
      return {
        id: n.id, name: n.name,
        days: Number(n.days) || 0,
        deps: (cand[n.id] || []).slice(),
        fixed: !!n.fixed
      };
    });

    var cpm = Graph.calc(out);

    return {
      cpm: cpm,
      ok: cpm.ok, cycle: cpm.cycle,
      nodes: out,
      es: cpm.es, ef: cpm.ef, total: cpm.total,
      critNodes: cpm.critNodes, critEdges: cpm.critEdges,
      missing: missing, active: active,
      trace: trace, removed: removed
    };
  }

  return { derive: derive, ancestorsIn: ancestorsIn };
})();
