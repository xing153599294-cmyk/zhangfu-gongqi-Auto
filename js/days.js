/* 施工天数折算：工程量 × 定额工种工时 → 自然天数（8 小时为 1 天） */
window.Days = (function () {

  var HOURS_PER_DAY = 8;

  function quotaHours(q) {
    var h = 0;
    (q.items || []).forEach(function (i) { h += Number(i.hours) || 0; });
    return h;
  }

  /* 单个模板节点的天数推算
     取值顺序：本模板手填的天数 > 按工程量与定额折算 > 节点库标准天数 */
  function calc(n) {
    var lib = n && n.ref ? Store.nodeGet(n.ref) : null;
    var qs = n && n.ref ? Store.quotaByNode(n.ref) : [];
    var qty = (n && n.qty) || {};

    var hours = 0, crew = 1, used = 0;
    qs.forEach(function (q) {
      var v = Number(qty[q.id]) || 0;
      if (v > 0) {
        hours += quotaHours(q) * v;
        crew = Math.max(crew, Number(q.crew) || 1);
        used++;
      }
    });

    if (used) {
      var min = lib ? (Number(lib.minDays) || 0) : 0;
      var d = Math.max(min, Math.ceil(hours / HOURS_PER_DAY / crew));
      return { days: d, hours: Math.round(hours * 100) / 100, crew: crew, by: 'quota', lib: lib };
    }

    if (n && n.daysOverride != null && n.daysOverride !== '') {
      return { days: Number(n.daysOverride) || 0, hours: 0, crew: 1, by: 'manual', lib: lib };
    }

    if (lib && (Number(lib.days) || 0) > 0) {
      return { days: Number(lib.days) || 0, hours: 0, crew: 1, by: 'lib', lib: lib };
    }

    return { days: Number(n ? n.days : 0) || 0, hours: 0, crew: 1, by: 'self', lib: lib };
  }

  /* 把一批节点的天数按折算结果写回，供关系图与工期测算使用 */
  function apply(nodes) {
    (nodes || []).forEach(function (n) {
      var r = calc(n);
      n.days = r.days;
      n._hours = r.hours;
      n._by = r.by;
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

  return { calc: calc, apply: apply, lines: lines, quotaHours: quotaHours, HOURS_PER_DAY: HOURS_PER_DAY };
})();
