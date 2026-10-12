/* 报价单：填写定额数量 → 提交 → 自动按定额排布工期 */
window.PageQuote = (function () {

  var cur = null, plan = null, svg = null;
  var pick = { kw: '' };

  function tradesOf(q) {
    return (q.items || []).map(function (i) {
      return U.esc(i.trade) + ' ' + i.hours + ' 小时';
    }).join(' + ') || '—';
  }

  function nodeNameOf(q) {
    var n = q && q.node ? Store.nodeGet(q.node) : null;
    return n ? n.name : '未绑定';
  }

  function validCount(q) {
    return (q.items || []).filter(function (i) { return Number(i.qty) > 0; }).length;
  }

  function kindSel(cur) {
    return Store.quoteKinds().map(function (k) {
      return '<option' + (k === cur ? ' selected' : '') + '>' + U.esc(k) + '</option>';
    }).join('');
  }

  /* ---------- 报价单列表 ---------- */
  function renderPick() {
    var view = document.getElementById('view');
    var arr = Store.quoteAll().filter(function (q) {
      if (!pick.kw) return true;
      return q.name.indexOf(pick.kw) >= 0 || (q.customer || '').indexOf(pick.kw) >= 0 ||
        (q.address || '').indexOf(pick.kw) >= 0 || (q.kind || '').indexOf(pick.kw) >= 0;
    });

    var cards = arr.map(function (q) {
      var p = QuoteCalc.build(q);
      var okDays = (p.ok && p.total) ? p.total : 0;
      return '<div class="tpl">' +
        '<div class="tpl-t"><div><h4>' + U.esc(q.name) + '</h4>' +
        '<div class="sub">' + U.esc(q.customer || '未填客户') +
        (q.house ? ' · ' + U.esc(q.house) : '') +
        (q.area ? ' · ' + q.area + '㎡' : '') + '</div></div>' +
        '<div style="display:flex;gap:6px;flex:0 0 auto;">' +
        (q.kind ? '<span class="tag acc">' + U.esc(q.kind) + '</span>' : '') +
        '<span class="tag ' + (q.status === '已提交' ? 'ok' : 'off') + '">' + U.esc(q.status) + '</span></div></div>' +
        '<div class="tpl-m">' +
        '<div>测算工期<b>' + okDays + '<small>天</small></b></div>' +
        '<div>定额明细<b>' + validCount(q) + '</b></div>' +
        '<div>施工节点<b>' + p.buildCount + '</b></div>' +
        '</div>' +
        '<div class="tpl-f">' +
        '<button class="btn btn-s btn-p" data-act="open" data-id="' + q.id + '">填写明细</button>' +
        '<span class="sp"></span>' +
        '<button class="btn btn-s" data-act="del" data-id="' + q.id + '" style="color:var(--accent);">删除</button>' +
        '</div></div>';
    }).join('');

    view.innerHTML =
      '<div class="page-h"><div><h2>报价单</h2>' +
      '<p>按定额逐条填写工程量，提交后系统自动聚合出本次要做的施工节点，补全验收节点并排布工期</p></div>' +
      '<div style="display:flex;gap:10px;">' +
      '<div style="position:relative;"><input class="inp" id="b-kw" placeholder="搜索项目或客户" value="' + U.esc(pick.kw) + '" style="width:190px;padding-left:32px;">' +
      '<span style="position:absolute;left:9px;top:9px;color:#93A1AD;display:flex;">' + U.icon('search', 15) + '</span></div>' +
      '<button class="btn btn-p" data-act="new">' + U.icon('plus', 15) + '新建报价单</button>' +
      '</div></div>' +
      (cards ? '<div class="tpl-grid">' + cards + '</div>'
        : '<div class="card"><div class="empty">还没有报价单，点右上角新建一份</div></div>');

    var kw = document.getElementById('b-kw');
    if (kw) kw.addEventListener('input', function () {
      pick.kw = kw.value.trim();
      renderPick();
      var k2 = document.getElementById('b-kw');
      if (k2) { k2.focus(); }
    });

    view.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-act]') : null;
      if (!el) return;
      var a = el.getAttribute('data-act');
      var id = el.getAttribute('data-id');
      if (a === 'open') { location.hash = '#/quote/' + id; return; }
      if (a === 'new') { openNew(); return; }
      if (a === 'del') {
        var q = Store.quoteGet(id);
        U.confirm('确定删除报价单「' + U.esc(q ? q.name : '') + '」？', function () {
          Store.quoteRemove(id);
          U.toast('已删除报价单');
          renderPick();
        }, true);
      }
    });
  }

  function openNew() {
    U.modal({
      title: '新建报价单',
      width: 560,
      body:
        '<div class="form-row">' +
        '<div class="fld"><label>项目名称</label><input class="inp" id="n-name" placeholder="如：华润二十四城 · 张女士住宅"></div>' +
        '<div class="fld"><label>客户称呼</label><input class="inp" id="n-cust" placeholder="如：张女士"></div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="fld"><label>方案类型</label><select class="sel" id="n-kind">' + kindSel('其他') + '</select></div>' +
        '<div class="fld"><label>户型</label><input class="inp" id="n-house" placeholder="如：两室两厅一卫"></div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="fld"><label>房屋地址</label><input class="inp" id="n-addr" placeholder="选填"></div>' +
        '<div class="fld"><label>建筑面积（㎡）</label><input class="inp" type="number" min="0" id="n-area" value="90"></div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="fld"><label>计划开工日期</label><input class="inp" type="date" id="n-start" value="' + U.today() + '"></div>' +
        '</div>',
      onOk: function () {
        var name = document.getElementById('n-name').value.trim();
        if (!name) { U.toast('请填写项目名称'); return false; }
        var q = Store.quoteCreate({
          name: name,
          kind: document.getElementById('n-kind').value,
          customer: document.getElementById('n-cust').value.trim(),
          address: document.getElementById('n-addr').value.trim(),
          house: document.getElementById('n-house').value.trim(),
          area: Number(document.getElementById('n-area').value) || 0,
          start: document.getElementById('n-start').value
        });
        var kd = document.getElementById('n-kind').value;
        var n = Store.quoteApplyPreset(q.id, kd);
        U.toast(n ? ('已按「' + kd + '」套用 ' + n + ' 条标准定额') : '已创建报价单');
        location.hash = '#/quote/' + q.id;
        return true;
      }
    });
  }

  /* ---------- 报价单详情 ---------- */
  function render(id) {
    if (!id) { renderPick(); return; }
    cur = Store.quoteGet(id);
    if (!cur) { location.hash = '#/quote'; return; }
    plan = QuoteCalc.build(cur);

    var view = document.getElementById('view');
    view.innerHTML = headHTML() + itemCard() +
      (cur.status === '已提交' ? planHTML() : beforeHTML());

    bind();
    if (cur.status === '已提交') {
      svg = document.getElementById('b-graph');
      drawGraph();
    }
  }

  function headHTML() {
    return '<div class="ed-top">' +
      '<div class="fld f-n"><label>项目名称</label><input class="inp" id="b-name" value="' + U.esc(cur.name) + '"></div>' +
      '<div class="fld f-s"><label>客户</label><input class="inp" id="b-cust" value="' + U.esc(cur.customer || '') + '"></div>' +
      '<div class="fld f-s"><label>方案类型</label><select class="sel" id="b-kind">' + kindSel(cur.kind || '其他') + '</select></div>' +
      '<div class="fld f-s"><label>户型</label><input class="inp" id="b-house" value="' + U.esc(cur.house || '') + '"></div>' +
      '<div class="fld f-s"><label>面积（㎡）</label><input class="inp" type="number" min="0" id="b-area" value="' + (cur.area || 0) + '"></div>' +
      '<div class="fld f-s"><label>计划开工</label><input class="inp" type="date" id="b-start" value="' + U.esc(cur.start || '') + '"></div>' +
      '<div class="fld"><label>&nbsp;</label><button class="btn" data-act="back">' + U.icon('back', 15) + '返回列表</button></div>' +
      '</div>';
  }

  function itemCard() {
    var valid = validCount(cur);
    var hours = Math.round((plan.hours || 0) * 100) / 100;

    /* 按施工节点分组，同节点多条定额的工时合并后折算天数 */
    var groups = [];
    var map = {};
    (cur.items || []).forEach(function (it) {
      var q = Store.quotaGet(it.qid);
      if (!q) return;
      var nid = q.node || '';
      if (!map[nid]) {
        map[nid] = { nid: nid, name: nodeNameOf(q), items: [], b: nid ? plan.byNode[nid] : null };
        groups.push(map[nid]);
      }
      map[nid].items.push({ it: it, q: q });
    });

    var rows = [];
    groups.forEach(function (g) {
      var b = g.b;
      var single = g.items.length === 1;

      if (!single) {
        rows.push('<tr class="node-group">' +
          '<td colspan="3"><b>' + U.esc(g.name) + '</b>' +
          '<span class="sub"> · 节点合计工时 ' + (b ? b.hours : 0) + ' 小时</span></td>' +
          '<td class="days num">' + (b ? b.days : '—') + ' 天</td>' +
          '<td colspan="2" style="color:var(--t3);font-size:12px;">' +
          (b && b.by === 'quota' ? '按工程量折算' : '按节点库标准') + '</td>' +
          '<td colspan="3"></td></tr>');
      }

      g.items.forEach(function (x) {
        var q = x.q, it = x.it;
        var lineHours = Math.round((Number(it.qty) || 0) * Days.quotaHours(q) * 100) / 100;
        var nodeDay = (single && b) ? b.days : 0;
        rows.push('<tr>' +
          '<td class="num">' + U.esc(q.code || '—') + '</td>' +
          '<td><span class="nm">' + U.esc(q.name) + '</span>' +
          '<div class="deps">' + U.esc(q.stage || '') + '</div></td>' +
          '<td class="num">' + U.esc(q.unit) + '</td>' +
          '<td class="num"><input class="inp" type="number" min="0" step="0.1" style="width:84px;height:26px;padding:2px 6px;" ' +
          'data-qi="' + U.esc(it.id) + '" value="' + (Number(it.qty) || 0) + '"></td>' +
          '<td>' + (single ? U.esc(g.name) : '') + '</td>' +
          '<td class="deps">' + tradesOf(q) + '</td>' +
          '<td class="num">' + lineHours + ' 小时</td>' +
          '<td class="days num">' + (single && nodeDay ? nodeDay + ' 天' : '—') +
          (single && b && b.by === 'quota' ? '<div class="deps">按工程量</div>' : '') + '</td>' +
          '<td class="op"><button class="btn btn-g btn-s" data-act="rm" data-id="' + U.esc(it.id) + '" style="color:var(--accent);">移除</button></td>' +
          '</tr>');
      });
    });

    return '<div class="card" style="margin-bottom:16px;"><div class="card-h"><h3>报价明细</h3>' +
      '<span style="font-size:12px;color:var(--t3);">按施工节点分组，同节点工时合并折算天数</span></div>' +
      '<div style="overflow:auto;max-height:460px;"><table class="tbl"><thead><tr>' +
      '<th>编号</th><th>定额名称</th><th class="days">单位</th><th class="days">数量</th>' +
      '<th>关联施工节点</th><th>工种与每单位工时</th><th class="days">本条工时</th>' +
      '<th class="days">节点折算天数</th><th class="op">操作</th></tr></thead>' +
      '<tbody>' + (rows.length ? rows.join('') : '<tr><td colspan="9" class="empty">还没有定额，点下方按钮从定额库中添加</td></tr>') + '</tbody></table></div>' +
      '<div class="card-b" style="border-top:1px solid var(--line);display:flex;align-items:center;gap:14px;flex-wrap:wrap;">' +
      '<button class="btn btn-s" data-act="add">' + U.icon('plus', 14) + '添加定额</button>' +
      (Store.quotePreset(cur.kind)
        ? '<button class="btn btn-s" data-act="preset">' + U.icon('flow', 14) +
        '套用「' + U.esc(cur.kind) + '」标准明细（' + Store.quotePresetCount(cur.kind) + ' 条）</button>'
        : '') +
      '<span style="font-size:13px;color:var(--t2);">已填 <b style="color:var(--t1);">' + valid + '</b> 条工程量' +
      '<span style="color:var(--t3);"> | </span>涉及 <b style="color:var(--t1);">' + plan.buildCount + '</b> 个施工节点' +
      '<span style="color:var(--t3);"> | </span>合计 <b style="color:var(--t1);">' + hours + '</b> 工时</span>' +
      '<span class="sp"></span>' +
      (cur.status === '已提交'
        ? '<button class="btn" data-act="totpl">' + U.icon('save', 15) + '另存为工期模板</button>' +
        '<button class="btn btn-p" data-act="submit">' + U.icon('check', 15) + '提交并生成排期</button>'
        : '<button class="btn btn-p" data-act="submit">' + U.icon('check', 15) + '提交并生成排期</button>') +
      '</div>' +
      '<div style="padding:10px 18px;border-top:1px solid var(--line);color:var(--t3);font-size:12px;">' +
      '折算天数 = 向上取整（同一施工节点下全部定额的工时合计 ÷ 8 小时 ÷ 班组人数），并不低于该节点的最少出场天数。' +
      '因此单条定额只有 3.6 小时，若同节点还有其他定额，合计工时会放大，天数也会相应增加。</div>' +
      '</div>';
  }

  function beforeHTML() {
    if (!plan.buildCount) {
      return '<div class="card"><div class="empty">' +
        '请先添加定额并填写数量，提交后系统会自动排出工期。</div></div>';
    }
    return '<div class="card"><div class="card-b">' +
      '<div style="font-size:14px;color:var(--t2);line-height:1.9;">' +
      '本次报价涉及 <b style="color:var(--t1);">' + plan.buildCount + '</b> 个施工节点，' +
      '合计 <b style="color:var(--t1);">' + Math.round(plan.hours * 100) / 100 + '</b> 工时。' +
      '<br>点上方「提交并生成排期」，系统会自动补全验收节点、推导前后置关系，并算出总工期与关键路径。' +
      '</div></div></div>';
  }

  function planHTML() {
    return '<div class="ap-body">' +
      planLeft() +
      '<div>' +
      resultCard() +
      graphCard() +
      noteCard() +
      '</div></div>';
  }

  function resultCard() {
    var endTxt = plan.endDate ? U.esc(plan.endDate)
      : '<span style="font-size:13px;color:var(--t3);font-weight:400;">填写开工日期后推算</span>';
    return '<div class="card" style="margin-bottom:16px;"><div class="card-h"><h3>工期结果</h3>' +
      '<span style="font-size:12px;color:var(--t3);">按报价工程量自动排布</span></div>' +
      '<div class="card-b">' +
      '<div class="plan">' +
      '<div class="plan-i"><div class="k">项目总工期</div><div class="v">' + (plan.total || 0) + '<small>天</small></div></div>' +
      '<div class="plan-i"><div class="k">排期节点</div><div class="v">' + plan.nodes.length + '<small>个</small></div></div>' +
      '<div class="plan-i"><div class="k">预计完工</div><div class="v" style="font-size:17px;">' + endTxt + '</div></div>' +
      '</div>' +
      critLine() +
      '</div></div>';
  }

  function critLine() {
    if (!plan.critNodes.length) return '';
    var next = {};
    (plan.critEdges || []).forEach(function (e) { next[e[0]] = e[1]; });
    var start = plan.critNodes.reduce(function (a, b) {
      return (plan.es[a] || 0) <= (plan.es[b] || 0) ? a : b;
    });
    var chain = [], curId = start;
    while (curId && chain.indexOf(curId) < 0) {
      chain.push(curId);
      curId = next[curId];
    }
    return '<div class="crit-line"><b style="color:var(--t1);">关键路径：</b>' +
      chain.map(function (id) {
        var n = nodeOf(id);
        return '<span class="cn">' + U.esc(n ? n.name : '开工') + '</span>';
      }).join('<span class="ar">→</span>') +
      '<div style="margin-top:6px;color:var(--t3);font-size:12px;">' +
      '关键路径上的任一节点延期，都会直接导致项目整体顺延。</div></div>';
  }

  function graphCard() {
    return '<div class="card" style="margin-bottom:16px;"><div class="card-h"><h3>节点关系图</h3>' +
      '<span style="font-size:12px;color:var(--t3);">按报价推导的前后置关系</span></div>' +
      '<div class="card-b" style="padding:12px;">' +
      '<div class="graph-wrap" style="padding:0;">' +
      '<svg class="graph-svg" id="b-graph"></svg>' +
      '<div class="graph-tools">' +
      '<button class="btn btn-s" data-act="zin" title="放大">' + U.icon('zoomIn', 15) + '</button>' +
      '<button class="btn btn-s" data-act="zout" title="缩小">' + U.icon('zoomOut', 15) + '</button>' +
      '<button class="btn btn-s" data-act="fullscreen" title="全屏/退出全屏">' + U.icon('fullscreen', 15) + '</button>' +
      '<button class="btn btn-s" data-act="fit" title="适应画布">' + U.icon('fit', 15) + '</button>' +
      '</div>' +
      '<div class="graph-legend">' +
      '<span><i style="background:#B9C6D1;"></i>普通依赖</span>' +
      '<span><i style="background:#C2410C;"></i>关键路径</span>' +
      '<span><i style="background:#0E4C6B;"></i>开工节点</span>' +
      '</div></div></div></div>';
  }

  function planLeft() {
    var total = plan.total || 1;
    var rows = plan.nodes.slice().sort(function (a, b) {
      return (a.es - b.es) || (a.ef - b.ef);
    }).map(function (n, i) {
      var left = (n.es / total * 100);
      var w = Math.max(n.days / total * 100, 1.2);
      return '<tr' + (n.crit ? ' class="crit"' : '') + '>' +
        '<td class="idx">' + (i + 1) + '</td>' +
        '<td class="nm">' + U.esc(n.name) +
        (n.fixed ? ' <span class="tag">起点</span>' : '') +
        (n.type === '验收' ? ' <span class="tag warn">验收</span>' : '') +
        '<div class="deps">' + U.esc(n.stage || '') + (n.trades.length ? ' · ' + U.esc(n.trades.join('、')) : '') + '</div></td>' +
        '<td class="days num">' + n.days + '</td>' +
        '<td class="days">' + dateAt(n.es) + '</td>' +
        '<td class="days">' + dateAt(n.ef - 1) + '</td>' +
        '<td style="min-width:150px;"><div class="gt"><div class="gt-bar">' +
        '<div class="gt-fill' + (n.crit ? ' crit' : '') + '" style="left:' + left.toFixed(2) + '%;width:' + w.toFixed(2) + '%;"></div>' +
        '</div><div class="gt-day">第 ' + (n.es + 1) + ' - ' + n.ef + ' 天</div></div></td>' +
        '<td class="deps">' + U.esc(depTxt(n)) + '</td>' +
        '</tr>';
    }).join('');

    return '<div class="card"><div class="card-h"><h3>工期安排</h3>' +
      '<span style="font-size:12px;color:var(--t3);">共 ' + plan.nodes.length + ' 个节点，橙色为关键路径</span></div>' +
      '<div style="overflow:auto;max-height:560px;"><table class="tbl node-tbl"><thead><tr>' +
      '<th class="idx">序</th><th>节点</th><th class="days">天数</th>' +
      '<th class="days">开始</th><th class="days">结束</th><th>工期安排</th><th>前置</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }

  function dateAt(offset) {
    if (!cur.start) return '—';
    return U.esc(U.addDays(cur.start, offset));
  }

  function nodeOf(id) {
    for (var i = 0; i < plan.nodes.length; i++) if (plan.nodes[i].id === id) return plan.nodes[i];
    return null;
  }

  function depTxt(n) {
    if (!n.deps || !n.deps.length) return '无前置';
    return n.deps.map(function (d) {
      var m = nodeOf(d);
      return m ? m.name : '开工';
    }).join('、');
  }

  function noteCard() {
    var lines = [];

    lines.push('<div class="nt"><b>施工节点来源</b>本次 ' + validCount(cur) + ' 条定额共归入 <b>' +
      plan.buildCount + '</b> 个施工节点，天数按工程量与定额工时折算。</div>');

    if (plan.checkAdded.length) {
      lines.push('<div class="nt"><b>自动补齐的验收节点</b>' +
        plan.checkAdded.map(function (c) {
          return '<span class="tag warn">' + U.esc(c.name) + '</span>';
        }).join(' ') +
        '<div style="margin-top:6px;color:var(--t3);font-size:12px;">' +
        '这些验收节点的前置工序已出现在本次报价中，系统自动排入工期。</div></div>');
    }

    if (plan.checkForced) {
      lines.push('<div class="nt"><b>已补入竣工验收</b>' +
        '本次报价未包含「开荒保洁」等收尾项，为保证工期有明确终点，系统已把「' +
        U.esc(plan.checkForced.name) + '」排在全部收尾工序之后。</div>');
    }

    var ups = [];
    plan.nodes.forEach(function (n) {
      (plan.trace[n.id] || []).forEach(function (t) {
        var miss = null;
        Store.nodeAll().forEach(function (x) { if (x.id === t.miss) miss = x; });
        var repl = nodeOf(t.repl);
        ups.push('「' + U.esc(n.name) + '」的前置「' + U.esc(miss ? miss.name : t.miss) +
          '」本次没有对应报价，已向上追溯至「' + U.esc(repl ? repl.name : t.repl) + '」');
      });
    });
    if (ups.length) {
      lines.push('<div class="nt"><b>前置缺失，已逐层上溯</b><ul>' +
        ups.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul></div>');
    }

    var cuts = [];
    plan.nodes.forEach(function (n) {
      (plan.removed[n.id] || []).forEach(function (p) {
        var m = null;
        Store.nodeAll().forEach(function (x) { if (x.id === p) m = x; });
        cuts.push('「' + U.esc(n.name) + '」的前置「' + U.esc(m ? m.name : p) + '」已由更靠近的前置传递约束，不再单独作为前置');
      });
    });
    if (cuts.length) {
      lines.push('<div class="nt"><b>冗余前置已省略</b><ul>' +
        cuts.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul></div>');
    }

    return '<div class="card"><div class="card-h"><h3>排布说明</h3>' +
      '<span style="font-size:12px;color:var(--t3);">系统如何由报价推出这套工期</span></div>' +
      '<div class="card-b">' + lines.join('') + '</div></div>';
  }

  /* ---------- 关系图 ---------- */
  function drawGraph() {
    if (!svg) return;
    Graph.render(svg, { id: 'q_' + cur.id, nodes: plan.nodes }, {
      ok: plan.ok, total: plan.total, es: plan.es, ef: plan.ef,
      order: plan.order, critNodes: plan.critNodes, critEdges: plan.critEdges
    }, {
      onMove: function () {
        Graph.update(svg, { id: 'q_' + cur.id, nodes: plan.nodes }, {
          ok: plan.ok, total: plan.total, es: plan.es, ef: plan.ef,
          order: plan.order, critNodes: plan.critNodes, critEdges: plan.critEdges
        });
      }
    });
  }

  /* ---------- 方案类型 → 标准明细 ---------- */
  function askPreset(kind) {
    var total = Store.quotePresetCount(kind);
    if (!total) { render(cur.id); return; }
    var filled = (cur.items || []).filter(function (i) { return Number(i.qty) > 0; }).length;

    function go() {
      var c = Store.quoteApplyPreset(cur.id, kind);
      cur = Store.quoteGet(cur.id);
      plan = QuoteCalc.build(cur);
      U.toast('已套用「' + kind + '」标准明细，共 ' + c + ' 条定额');
      render(cur.id);
    }

    if (!filled) { go(); return; }
    U.confirm('是否套用「' + U.esc(kind) + '」的标准定额明细（' + total + ' 条）？<br>' +
      '当前这 ' + filled + ' 条已填数量会被标准配置替换，其中随面积的项目会按本单建筑面积重新折算。', go);
  }

  /* ---------- 事件 ---------- */
  function bind() {
    var view = document.getElementById('view');

    view.addEventListener('change', function (e) {
      var el = e.target;
      if (!el || !el.id) return;

      if (el.id === 'b-kind') {
        var nk = document.getElementById('b-kind').value;
        var was = cur.kind;
        Store.quoteUpdate(cur.id, { kind: nk });
        cur = Store.quoteGet(cur.id);
        if (nk !== was && Store.quotePreset(nk)) { askPreset(nk); return; }
        render(cur.id);
        return;
      }

      if (el.id === 'b-name' || el.id === 'b-cust' || el.id === 'b-house' ||
        el.id === 'b-area' || el.id === 'b-start') {
        Store.quoteUpdate(cur.id, {
          name: document.getElementById('b-name').value.trim() || cur.name,
          customer: document.getElementById('b-cust').value.trim(),
          kind: document.getElementById('b-kind').value,
          house: document.getElementById('b-house').value.trim(),
          area: Number(document.getElementById('b-area').value) || 0,
          start: document.getElementById('b-start').value
        });
        render(cur.id);
        return;
      }

      if (el.getAttribute && el.getAttribute('data-qi')) {
        Store.quoteSetQty(cur.id, el.getAttribute('data-qi'), el.value);
        render(cur.id);
      }
    });

    view.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-act]') : null;
      if (!el) return;
      var a = el.getAttribute('data-act');

      if (a === 'back') { location.hash = '#/quote'; return; }
      if (a === 'add') { openPicker(); return; }
      if (a === 'preset') { askPreset(cur.kind); return; }
      if (a === 'rm') {
        Store.quoteRemoveItem(cur.id, el.getAttribute('data-id'));
        render(cur.id);
        return;
      }
      if (a === 'submit') { doSubmit(); return; }
      if (a === 'totpl') { doSaveTpl(); return; }
      if (a === 'zin') { Graph.zoom(svg, 1.15); return; }
      if (a === 'zout') { Graph.zoom(svg, 1 / 1.15); return; }
      if (a === 'fullscreen') { Graph.fullscreen(document.querySelector('.graph-wrap')); return; }
      if (a === 'fit') { Graph.fit(svg); return; }
    });
  }

  function doSubmit() {
    if (!validCount(cur)) { U.toast('请先为定额填写数量'); return; }
    if (!plan.ok) { U.toast('关系存在循环，无法排期'); return; }
    Store.quoteUpdate(cur.id, { status: '已提交' });
    U.toast('已生成排期，总工期 ' + plan.total + ' 天');
    render(cur.id);
  }

  function doSaveTpl() {
    if (!plan.ok || !plan.nodes.length) { U.toast('请先提交并生成排期'); return; }
    var t = QuoteCalc.toTemplate(cur, plan, cur.name + ' · 排期');
    if (!t) { U.toast('保存失败'); return; }
    U.toast('已另存为工期模板');
    location.hash = '#/editor/' + t.id;
  }

  /* ---------- 从定额库选择 ---------- */
  function openPicker() {
    var kw = '', stage = '';
    var chosen = {};

    function list() {
      return Store.quotaAll().filter(function (q) {
        if (kw && q.name.indexOf(kw) < 0 && String(q.code).indexOf(kw) < 0) return false;
        if (stage && q.stage !== stage) return false;
        if (!q.node) return false;
        return true;
      });
    }

    function body() {
      var arr = list();
      var rows = arr.length ? arr.map(function (q) {
        return '<tr>' +
          '<td class="ck"><input type="checkbox" data-q="' + U.esc(q.id) + '"' +
          (chosen[q.id] ? ' checked' : '') + '></td>' +
          '<td class="num">' + U.esc(q.code || '—') + '</td>' +
          '<td><span class="nm">' + U.esc(q.name) + '</span>' +
          '<div class="deps">' + U.esc(q.stage || '') + ' · ' + tradesOf(q) + '</div></td>' +
          '<td class="num">' + U.esc(q.unit) + '</td>' +
          '<td>' + U.esc(nodeNameOf(q)) + '</td>' +
          '</tr>';
      }).join('') : '<tr><td colspan="5" class="empty">没有符合条件的定额</td></tr>';

      return '<div class="form-row">' +
        '<div class="fld"><label>搜索定额</label><input class="inp" id="p-kw" value="' + U.esc(kw) + '" placeholder="名称或编号"></div>' +
        '<div class="fld" style="max-width:150px;"><label>阶段</label><select class="sel" id="p-stage">' +
        '<option value="">全部阶段</option>' +
        Store.stages().map(function (s) {
          return '<option' + (stage === s ? ' selected' : '') + '>' + s + '</option>';
        }).join('') + '</select></div></div>' +
        '<div style="max-height:330px;overflow:auto;border:1px solid var(--line);border-radius:8px;">' +
        '<table class="tbl"><thead><tr><th class="ck">选</th><th>编号</th><th>定额名称</th>' +
        '<th class="days">单位</th><th>关联施工节点</th></tr></thead><tbody id="p-list">' + rows + '</tbody></table></div>' +
        '<div class="hint">勾选后点「加入报价单」，加入时数量默认记为 1，可在明细里改成实际工程量。</div>';
    }

    U.modal({
      title: '从定额库添加',
      width: 680,
      body: body(),
      okText: '加入报价单',
      onOk: function () {
        var box = document.getElementById('p-list');
        if (!box) return true;
        var picked = box.querySelectorAll('input[data-q]:checked');
        var n = 0;
        for (var i = 0; i < picked.length; i++) {
          Store.quoteAddItem(cur.id, picked[i].getAttribute('data-q'), 1);
          n++;
        }
        U.toast(n ? ('已加入 ' + n + ' 条定额') : '未勾选定额');
        if (n) render(cur.id);
        return true;
      }
    });

    var box = document.getElementById('modal-box');
    function redraw() {
      var l = document.getElementById('p-list');
      if (!l) return;
      var arr = list();
      l.innerHTML = arr.length ? arr.map(function (q) {
        return '<tr>' +
          '<td class="ck"><input type="checkbox" data-q="' + U.esc(q.id) + '"' +
          (chosen[q.id] ? ' checked' : '') + '></td>' +
          '<td class="num">' + U.esc(q.code || '—') + '</td>' +
          '<td><span class="nm">' + U.esc(q.name) + '</span>' +
          '<div class="deps">' + U.esc(q.stage || '') + ' · ' + tradesOf(q) + '</div></td>' +
          '<td class="num">' + U.esc(q.unit) + '</td>' +
          '<td>' + U.esc(nodeNameOf(q)) + '</td>' +
          '</tr>';
      }).join('') : '<tr><td colspan="5" class="empty">没有符合条件的定额</td></tr>';
    }

    box.addEventListener('input', function (e) {
      if (e.target.id !== 'p-kw') return;
      kw = e.target.value.trim();
      redraw();
      var k = document.getElementById('p-kw');
      if (k) k.focus();
    });
    box.addEventListener('change', function (e) {
      if (e.target.id === 'p-stage') {
        stage = e.target.value;
        redraw();
        return;
      }
      var qid = e.target.getAttribute && e.target.getAttribute('data-q');
      if (qid) chosen[qid] = e.target.checked;
    });
  }

  return { render: render };
})();
