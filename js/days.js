/* 施工天数与派工人数折算
 *
 * 业务前提（与客户确认口径）：
 *  1. 工人按天计酬，干半天也付一天工费 —— 天数一律向上取整到整天
 *  2. 没有班组概念，直接指派工人；一个节点能派几个人由「工作面」决定（节点库 maxCrew）
 *  3. 多能工：一个工人会多个工种，调度时可跨工种补位
 *
 * 派工人数不是越多越好。因为不足一天按一天算，盲目加人会出现
 * 「派 2 人比派 1 人多付工费」的情况。因此在 [1, maxCrew] 里挑一个综合最优：
 *    综合成本 = 人天（= 人数 × 天数）+ 工期价值系数 × 天数
 * 工期价值系数 λ 表示「工期每缩短 1 天，愿意多付几个人天」，默认 0.25
 * （即 4 天工期才值 1 个人天）。λ=0 为纯省钱，λ 越大越倾向赶工。
 */
window.Days = (function () {

  var HOURS_PER_DAY = 8;

  function quotaHours(q) {
    var h = 0;
    (q.items || []).forEach(function (i) { h += Number(i.hours) || 0; });
    return h;
  }

  /* 在 [1, maxCrew] 里挑最优派工人数
     判据：先比综合成本（人天 + λ×天数），成本相同取人数少的（少派一个人更好管理） */
  function bestCrew(hours, maxCrew, minDays, lambda) {
    var M = Math.max(1, Math.min(12, Number(maxCrew) || 1));
    var minD = Math.max(0, Number(minDays) || 0);
    var lam = Number(lambda);
    if (isNaN(lam)) lam = 0.25;

    var best = null;
    for (var n = 1; n <= M; n++) {
      var d = Math.ceil(hours / (HOURS_PER_DAY * n));
      if (d < 1) d = 1;
      if (d < minD) d = minD;                 /* 工艺要求的最少出场天数，加人也压不掉 */
      var manDays = n * d;
      var score = manDays + lam * d;
      if (!best) { best = { n: n, d: d, manDays: manDays, score: score }; continue; }
      if (score < best.score - 1e-9 ||
        (Math.abs(score - best.score) < 1e-9 && n < best.n)) {
        best = { n: n, d: d, manDays: manDays, score: score };
      }
    }
    return best || { n: 1, d: 1, manDays: 1, score: 1 };
  }

  /* 单个模板节点的天数与派工人数推算
     取值顺序：按工程量与定额折算 > 本模板手填的天数 > 节点库标准天数 */
  function calc(n) {
    var lib = n && n.ref ? Store.nodeGet(n.ref) : null;
    var qs = n && n.ref ? Store.quotaByNode(n.ref) : [];
    var qty = (n && n.qty) || {};

    var hours = 0, used = 0;
    qs.forEach(function (q) {
      var v = Number(qty[q.id]) || 0;
      if (v > 0) { hours += quotaHours(q) * v; used++; }
    });

    var maxCrew = lib ? (Number(lib.maxCrew) || 1) : 1;
    var minDays = lib ? (Number(lib.minDays) || 0) : 0;

    if (used) {
      var r = bestCrew(hours, maxCrew, minDays, Store.crewLambda());
      return {
        days: r.d, hours: Math.round(hours * 100) / 100,
        crew: r.n, manDays: r.manDays, maxCrew: maxCrew,
        by: 'quota', lib: lib
      };
    }

    /* 没有工程量：按标准天数走，默认派 1 人 */
    if (n && n.daysOverride != null && n.daysOverride !== '') {
      var dm = Number(n.daysOverride) || 0;
      return { days: dm, hours: 0, crew: 1, manDays: dm, maxCrew: maxCrew, by: 'manual', lib: lib };
    }

    if (lib && (Number(lib.days) || 0) > 0) {
      var dl = Number(lib.days) || 0;
      return { days: dl, hours: 0, crew: 1, manDays: dl, maxCrew: maxCrew, by: 'lib', lib: lib };
    }

    var ds = Number(n ? n.days : 0) || 0;
    return { days: ds, hours: 0, crew: 1, manDays: ds, maxCrew: maxCrew, by: 'self', lib: lib };
  }

  /* 把一批节点的天数与派工人数写回，供关系图与工期测算使用 */
  function apply(nodes) {
    (nodes || []).forEach(function (n) {
      var r = calc(n);
      n.days = r.days;
      n._hours = r.hours;
      n._by = r.by;
      n.crew = r.crew;
      n.manDays = r.manDays;
      n.maxCrew = r.maxCrew;
      if (r.lib) {
        n.trades = (r.lib.trades || []).slice();
        n.stage = r.lib.stage || n.stage || '';
        n.nodeType = r.lib.type || '';
      }
    });
    return nodes;
  }

  /* 某节点关联的定额及其工程量，供界面展示 */
  function lines(n) {
    if (!n || !n.ref) return [];
    return Store.quotaByNode(n.ref).map(function (q) {
      return {
        id: q.id, code: q.code, name: q.name, unit: q.unit, crew: q.crew,
        hours: quotaHours(q), qty: Number(((n.qty || {})[q.id])) || 0
      };
    });
  }

  return {
    calc: calc, apply: apply, lines: lines, quotaHours: quotaHours,
    bestCrew: bestCrew, HOURS_PER_DAY: HOURS_PER_DAY
  };
})();
