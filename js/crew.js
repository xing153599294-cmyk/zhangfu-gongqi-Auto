/* 人力调度：把排好的节点分派到具体工人
 *
 * 业务前提：没有班组、没有项目经理，公司直接指派工人。
 * 因此排期必须考虑「同一天派不派得出这么多人」，否则排出来的是纸面工期。
 *
 * 做法：按天推进的贪心调度
 *  1. 每天找出「前置已全部完工」的就绪节点
 *  2. 按关键程度排序（时差小的先派，工期长的先派），保证关键路径优先拿到人
 *  3. 给节点挑人：先保证它列出的每个工种各有 1 人，剩余名额再补
 *  4. 挑人优先派「专职」的（会得越少越先派），把多能工留到真正缺人的时候
 *  5. 人不够 → 该节点今天不开工，顺延到明天再试
 *
 * 多能工的价值就体现在第 4 步：会两个工种的工人不会早早被占死，
 * 哪个工种的活堆了就去补哪个。
 */
window.Crew = (function () {

  var MAX_DAYS = 400;

  /* 挑一个会指定工种、当天有空、且未被本次选中的工人。专一的优先 */
  function pickWorker(pool, trade, busy, day, taken) {
    var cand = pool.filter(function (w) {
      if (taken.indexOf(w.id) >= 0) return false;
      if (busy[w.id] != null && busy[w.id] > day) return false;
      if (!trade) return true;
      return (w.skills || []).indexOf(trade) >= 0;
    });
    if (!cand.length) return null;
    cand.sort(function (a, b) {
      var sa = (a.skills || []).length, sb = (b.skills || []).length;
      if (sa !== sb) return sa - sb;                 /* 专一度：会得越少越先派 */
      return a.id < b.id ? -1 : 1;
    });
    return cand[0];
  }

  /* nodes: [{ id, name, days, crew, trades, deps, tf }]
     workers: [{ id, name, skills, status }]
     返回 { ok, total, sched, byDay, workerDays, manDays, blocked, unlimited } */
  function schedule(nodes, workers) {
    var pool = (workers || []).filter(function (w) { return w.status !== '停用'; });
    var list = (nodes || []).slice();

    var res = {
      ok: true, total: 0, sched: {}, byDay: {}, workerDays: {}, manDays: 0,
      blocked: [], unlimited: false
    };
    if (!list.length) return res;

    /* 没有工人库时退回纯前后置排期（不施加人力约束） */
    if (!pool.length) {
      res.unlimited = true;
      var esMap = {};
      var guard = 0;
      while (guard++ < MAX_DAYS) {
        var moved = false;
        list.forEach(function (n) {
          if (esMap[n.id] != null) return;
          var deps = (n.deps || []).filter(function (d) { return esMap[d] != null || !findNode(list, d); });
          var ok = deps.every(function (d) { return esMap[d] != null; });
          if (!ok) return;
          var s = 0;
          deps.forEach(function (d) { s = Math.max(s, esMap[d] || 0); });
          esMap[n.id] = s;
          moved = true;
        });
        if (!moved) break;
      }
      list.forEach(function (n) {
        var s = esMap[n.id] || 0, d = Number(n.days) || 0;
        res.sched[n.id] = { start: s, end: s + d, workers: [] };
        res.manDays += (Number(n.crew) || 1) * d;
        res.total = Math.max(res.total, s + d);
      });
      return res;
    }

    var busy = {};        /* workerId -> 忙到第几天（不含） */
    var done = {};        /* nodeId -> 完工日 */
    var sched = {};

    /* 虚拟「开工」节点与零天节点不消耗人力，直接视为第 0 天完成 */
    list.forEach(function (n) {
      if (n.fixed || !(Number(n.days) > 0)) {
        sched[n.id] = { start: 0, end: Number(n.days) || 0, workers: [], workerNames: [] };
        done[n.id] = Number(n.days) || 0;
      }
    });

    var byDay = {};
    var workerDays = {};
    var limit = 0;
    list.forEach(function (n) { limit += (Number(n.days) || 0) + 2; });
    limit = Math.min(MAX_DAYS, Math.max(60, limit * 3));

    var day = 0;
    while (day < limit) {
      var ready = list.filter(function (n) {
        if (sched[n.id]) return false;
        return (n.deps || []).every(function (d) {
          if (!findNode(list, d)) return true;
          return done[d] != null && done[d] <= day;
        });
      });

      /* 关键路径优先：时差小的先拿人，时差相同则工期长的先 */
      ready.sort(function (a, b) {
        var ta = Number(a.tf), tb = Number(b.tf);
        if (isNaN(ta)) ta = 0;
        if (isNaN(tb)) tb = 0;
        if (ta !== tb) return ta - tb;
        return (Number(b.days) || 0) - (Number(a.days) || 0);
      });

      ready.forEach(function (n) {
        var need = Math.max(1, Number(n.crew) || 1);
        var trades = (n.trades || []).filter(Boolean);
        var taken = [];

        /* 第一轮：每个工种先各占 1 人，保证工种覆盖 */
        for (var i = 0; i < trades.length && taken.length < need; i++) {
          var w = pickWorker(pool, trades[i], busy, day, taken);
          if (w) taken.push(w.id);
        }
        /* 第二轮：剩余名额只从「会该节点任一工种」的人里补，不能跨工种硬凑 */
        while (taken.length < need) {
          var w2 = null;
          for (var j = 0; j < trades.length && !w2; j++) {
            w2 = pickWorker(pool, trades[j], busy, day, taken);
          }
          if (!w2) break;
          taken.push(w2.id);
        }

        /* 节点没配工种时不做技能限制，任何人都能派 */
        if (!trades.length) {
          taken = [];
          while (taken.length < need) {
            var w3 = pickWorker(pool, null, busy, day, taken);
            if (!w3) break;
            taken.push(w3.id);
          }
        }

        var hours = Number(n.hours) || 0;
        var d = Number(n.days) || 0;
        var downgraded = false;

        /* 凑不齐理想人数：现场不会为等人而闲置，有多少人就先开工，天数按实际人数重算 */
        if (taken.length < need) {
          if (!taken.length) return;                 /* 一个都派不出，只能顺延 */
          if (hours > 0) {
            var d2 = Math.max(1, Math.ceil(hours / (8 * taken.length)));
            if (d2 !== d) { d = d2; downgraded = true; }
          }
        }

        if (taken.length < need && !downgraded && taken.length < 1) return;

        var names = [];
        taken.forEach(function (wid) {
          busy[wid] = day + Math.max(1, d);
          workerDays[wid] = (workerDays[wid] || 0) + Math.max(1, d);
          var w = pool.filter(function (x) { return x.id === wid; })[0];
          if (w) names.push(w.name);
        });
        sched[n.id] = {
          start: day, end: day + d, workers: taken.slice(), workerNames: names,
          crew: taken.length, downgraded: downgraded
        };
        done[n.id] = day + d;
        res.manDays += taken.length * d;
        for (var k = day; k < day + Math.max(1, d); k++) {
          (byDay[k] = byDay[k] || []).push({ id: n.id, name: n.name, workers: names.slice() });
        }
        res.total = Math.max(res.total, day + d);
      });

      day++;
      var left = list.filter(function (n) { return !sched[n.id]; });
      if (!left.length) break;
    }

    list.forEach(function (n) {
      if (!sched[n.id]) res.blocked.push({ id: n.id, name: n.name, need: n.crew, trades: n.trades || [] });
    });
    if (res.blocked.length) res.ok = false;

    res.sched = sched;
    res.byDay = byDay;
    res.workerDays = workerDays;
    return res;
  }

  function findNode(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  /* 工人负载：每个工人被占用了多少天、占哪些节点 */
  function loadOf(sched, workers) {
    var map = {};
    Object.keys(sched).forEach(function (nid) {
      (sched[nid].workers || []).forEach(function (wid) {
        var it = map[wid] = map[wid] || { days: 0, nodes: [] };
        it.days += Math.max(1, sched[nid].end - sched[nid].start);
        it.nodes.push(nid);
      });
    });
    return map;
  }

  return { schedule: schedule, loadOf: loadOf };
})();
