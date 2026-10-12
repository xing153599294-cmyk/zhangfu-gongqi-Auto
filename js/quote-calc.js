/* 报价 → 工期排布
 *
 * 输入：报价单里每条定额的数量
 * 输出：自动推导出的施工节点、验收节点、前后置关系与工期安排
 *
 * 处理顺序：
 *  1. 定额按「关联施工节点」聚合，同一节点的多条定额工时合并后折算天数
 *  2. 折算口径与全系统一致：天数 = 向上取整（总工时 ÷ 8 小时 ÷ 班组人数），不低于最少出场天数
 *  3. 自动补齐验收节点：某个验收节点的前置中只要有一项已出现，就把它排进来
 *  4. 竣工验收兜底：只要报了施工内容，最后一定有竣工验收，前置为所有收尾工序
 *  5. 前置缺失逐层上溯 + 传递冗余消除（复用工期应用规则）
 *  6. 关键路径法测算开始/结束时间与总工期
 */
window.QuoteCalc = (function () {

  var START = '__START__';
  var START_NAME = '开工';

  /* 施工节点集合：按定额归属聚合 */
  function collect(items) {
    var byNode = {};
    (items || []).forEach(function (it) {
      var qty = Number(it.qty) || 0;
      if (qty <= 0) return;
      var q = Store.quotaGet(it.qid);
      if (!q || !q.node) return;
      if (!Store.nodeGet(q.node)) return;

      var b = byNode[q.node];
      if (!b) b = byNode[q.node] = { id: q.node, qty: {}, lines: [], crew: 1 };

      b.qty[q.id] = (b.qty[q.id] || 0) + qty;
      b.crew = Math.max(b.crew, Number(q.crew) || 1);

      var line = null;
      b.lines.forEach(function (l) { if (l.qid === q.id) line = l; });
      if (line) line.qty += qty;
      else {
        b.lines.push({
          qid: q.id, code: q.code, name: q.name, unit: q.unit,
          hours: Days.quotaHours(q), crew: Number(q.crew) || 1, qty: qty
        });
      }
    });

    Object.keys(byNode).forEach(function (id) {
      var b = byNode[id];
      var r = Days.calc({ ref: id, qty: b.qty });
      b.days = r.days;
      b.hours = r.hours;
      b.crew = r.crew;
      b.by = r.by;
      b.lib = r.lib;
    });

    return byNode;
  }

  /* 收尾工序：没有其他已纳入节点等着它先完成的节点 */
  function leavesOf(sel, depOf) {
    var used = {};
    Object.keys(sel).forEach(function (id) {
      (depOf[id] || []).forEach(function (d) { used[d] = true; });
    });
    return Object.keys(sel).filter(function (id) { return !used[id]; });
  }

  function build(quote) {
    var byNode = collect(quote && quote.items);
    var nodeIds = Object.keys(byNode);
    var lib = Store.nodeAll();

    var result = {
      ok: true, cycle: null,
      nodes: [], byNode: byNode,
      total: 0, es: {}, ef: {}, order: [],
      critNodes: [], critEdges: [],
      buildCount: nodeIds.length,
      checkAdded: [], checkForced: null,
      hours: 0, trace: {}, removed: {},
      startDate: (quote && quote.start) || '', endDate: '',
      notes: []
    };

    if (!nodeIds.length) {
      result.notes.push('还没有填写定额数量，填写后提交即可自动生成排期。');
      return result;
    }

    var depOf = {};
    lib.forEach(function (n) { depOf[n.id] = (n.deps || []).slice(); });

    var sel = {};
    nodeIds.forEach(function (id) { sel[id] = true; });

    /* 自动补齐验收节点 */
    var checks = lib.filter(function (n) { return n.type === '验收'; });
    var pass = 0;
    while (pass < 8) {
      var grew = false;
      checks.forEach(function (v) {
        if (sel[v.id]) return;
        var ds = (v.deps || []).filter(function (d) { return d !== v.id; });
        if (!ds.length) return;
        if (!ds.some(function (d) { return sel[d]; })) return;
        sel[v.id] = true;
        grew = true;
        result.checkAdded.push({
          id: v.id, name: v.name, stage: v.stage, days: Number(v.days) || 0,
          hit: ds.filter(function (d) { return sel[d]; }).length, all: ds.length
        });
      });
      if (!grew) break;
      pass++;
    }

    /* 竣工验收兜底：只要报了施工内容，最终一定有竣工验收 */
    var fin = checks.filter(function (n) { return n.stage === '竣工'; });
    if (fin.length && !sel[fin[0].id]) {
      var lv = leavesOf(sel, depOf);
      if (!lv.length) lv = Object.keys(sel);
      sel[fin[0].id] = true;
      result.checkForced = { id: fin[0].id, name: fin[0].name, deps: lv.slice() };
    }

    /* 组装全部节点，交给工期应用规则做缺失上溯与冗余消除 */
    var forcedDeps = result.checkForced ? result.checkForced.deps : null;
    var all = [{ id: START, name: START_NAME, days: 0, deps: [], fixed: true }];
    lib.forEach(function (n) {
      var b = byNode[n.id];
      all.push({
        id: n.id, name: n.name,
        days: b ? b.days : (Number(n.days) || 0),
        deps: (result.checkForced && n.id === result.checkForced.id) ? forcedDeps.slice() : (n.deps || []).slice(),
        fixed: false, ref: n.id
      });
    });

    var picked = Object.keys(sel);
    picked.push(START);

    var res = ApplyCalc.derive(all, picked);
    result.trace = res.trace || {};
    result.removed = res.removed || {};

    if (!res.ok) {
      result.ok = false;
      result.cycle = res.cycle;
      result.notes.push('推导出的前后置关系存在循环，工期测算已暂停，请检查节点库里的标准前置。');
      return result;
    }

    /* 没有前置的节点统一挂在「开工」之后 */
    var out = res.nodes.map(function (n) {
      return {
        id: n.id, name: n.name, days: Number(n.days) || 0,
        deps: (n.deps || []).slice(), fixed: !!n.fixed
      };
    });
    out.forEach(function (n) {
      if (!n.fixed && !n.deps.length) n.deps = [START];
    });

    var cpm = Graph.calc(out);
    result.ok = cpm.ok;
    result.cycle = cpm.cycle;
    result.total = cpm.total || 0;
    result.order = cpm.order || [];
    result.critNodes = cpm.critNodes || [];
    result.critEdges = cpm.critEdges || [];

    var libMap = {};
    lib.forEach(function (n) { libMap[n.id] = n; });

    result.nodes = out.map(function (n) {
      var b = byNode[n.id];
      var l = n.id === START ? null : libMap[n.id];
      var hours = 0;
      if (b) {
        hours = b.hours;
        result.hours += b.hours;
      }
      return {
        id: n.id, name: n.name,
        days: n.days,
        deps: n.deps,
        fixed: n.fixed,
        type: n.id === START ? '开工' : (l ? l.type : ''),
        stage: l ? (l.stage || '') : '',
        trades: l ? ((l.trades || []).slice()) : [],
        hours: hours,
        crew: b ? b.crew : 1,
        by: b ? b.by : (n.id === START ? '' : 'lib'),
        lines: b ? b.lines : [],
        es: cpm.es ? (cpm.es[n.id] || 0) : 0,
        ef: cpm.ef ? (cpm.ef[n.id] || 0) : 0,
        crit: (result.critNodes || []).indexOf(n.id) >= 0
      };
    });

    result.es = cpm.es || {};
    result.ef = cpm.ef || {};

    if (result.startDate && result.ok && result.total) {
      result.endDate = U.addDays(result.startDate, result.total - 1);
    }

    result.hours = Math.round(result.hours * 100) / 100;
    return result;
  }

  /* 排期结果转成一个工期模板，便于后续手工调整 */
  function toTemplate(quote, plan, name) {
    var t = Store.create(name || (quote.name + ' · 排期'));
    if (!t) return null;

    /* 开工沿用模板自带的起点节点 */
    var map = {};
    plan.nodes.forEach(function (n) { if (n.fixed) map[n.id] = t.nodes[0].id; });

    /* 先建节点再连关系，避免前置还没建出来导致连线丢失 */
    plan.nodes.forEach(function (n) {
      if (n.fixed) return;
      var b = plan.byNode[n.id];
      var node = Store.addNode(t.id, {
        name: n.name,
        days: n.days,
        deps: [],
        ref: n.id,
        trades: n.trades || [],
        qty: b ? b.qty : {},
        daysOverride: n.days
      });
      if (node) map[n.id] = node.id;
    });

    plan.nodes.forEach(function (n) {
      if (n.fixed || !map[n.id]) return;
      Store.updateNode(t.id, map[n.id], {
        deps: (n.deps || []).map(function (d) { return map[d]; }).filter(Boolean)
      });
    });

    t.status = '停用';
    t.start = quote.start || '';
    t.desc = '由报价单「' + quote.name + '」自动生成，共 ' + plan.buildCount + ' 个施工节点';
    Store.save();
    return t;
  }

  return { build: build, toTemplate: toTemplate, START: START };
})();
