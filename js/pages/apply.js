/* 工期应用：选模板 → 勾选项目实际节点 → 输出节点关系图与工期 */
window.PageApply = (function () {

  var tpl = null, ids = [], start = '', res = null, svg = null;

  /* ---------- 模板选择页 ---------- */
  function renderPick() {
    var view = document.getElementById('view');
    var arr = Store.all();

    var cards = arr.map(function (t) {
      var c = Graph.calc(t.nodes);
      var total = c.ok ? c.total : 0;
      return '<div class="tpl">' +
        '<div class="tpl-t"><div><h4>' + U.esc(t.name) + '</h4>' +
        '<div class="sub">' + U.esc(t.type) + ' · 共 ' + t.nodes.length + ' 个节点</div></div>' +
        '<span class="tag ' + (t.status === '启用' ? 'ok' : 'off') + '">' + U.esc(t.status) + '</span></div>' +
        '<div class="tpl-m">' +
        '<div>模板总工期<b>' + total + '<small>天</small></b></div>' +
        '<div>节点数<b>' + t.nodes.length + '</b></div>' +
        '</div>' +
        '<div class="tpl-f">' +
        '<button class="btn btn-s btn-p" data-act="use" data-id="' + t.id + '">应用此模板</button>' +
        '<span class="sp"></span>' +
        '<button class="btn btn-s" data-act="cfg" data-id="' + t.id + '">查看节点配置</button>' +
        '</div></div>';
    }).join('');

    view.innerHTML =
      '<div class="page-h"><div><h2>工期应用</h2>' +
      '<p>挑选一个工期模板，勾选本项目实际存在的节点，系统会按规则自动推导前置关系并输出工期安排</p></div></div>' +
      (cards ? '<div class="tpl-grid">' + cards + '</div>'
        : '<div class="card"><div class="empty">还没有工期模板，请先到「工期模板」中创建</div></div>');

    view.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-act]') : null;
      if (!el) return;
      var a = el.getAttribute('data-act');
      var id = el.getAttribute('data-id');
      if (a === 'use') location.hash = '#/apply/' + id;
      if (a === 'cfg') location.hash = '#/editor/' + id;
    });
  }

  /* ---------- 应用配置页 ---------- */
  function render(id) {
    if (!id) { renderPick(); return; }

    tpl = Store.get(id);
    if (!tpl) { location.hash = '#/apply'; return; }

    var a = Store.getApply(id);
    ids = a.ids.slice();
    start = a.start;
    /* 开工是工期起点，必须纳入 */
    tpl.nodes.forEach(function (n) {
      if (n.fixed && ids.indexOf(n.id) < 0) ids.push(n.id);
    });

    var view = document.getElementById('view');
    view.innerHTML =
      '<div class="ed-top">' +
      '<div class="fld f-n"><label>应用模板</label><input class="inp" value="' + U.esc(tpl.name) + '" readonly></div>' +
      '<div class="fld f-s"><label>项目开工日期</label><input class="inp" type="date" id="a-start" value="' + U.esc(start) + '"></div>' +
      '<div class="fld"><label>&nbsp;</label><div style="display:flex;gap:10px;">' +
      '<button class="btn" data-act="all">全部纳入</button>' +
      '<button class="btn" data-act="none">全部取消</button>' +
      '</div></div>' +
      '<div class="sp"></div>' +
      '<div class="fld"><label>&nbsp;</label><div style="display:flex;gap:10px;">' +
      '<button class="btn" data-act="back">' + U.icon('back', 15) + '换个模板</button>' +
      '</div></div>' +
      '</div>' +

      '<div class="ap-body">' +
      '<div class="card"><div class="card-h"><h3>项目节点</h3>' +
      '<span style="font-size:12px;color:var(--t3);">勾选本项目实际存在的节点</span></div>' +
      '<div style="overflow:auto;max-height:520px;"><table class="tbl node-tbl"><thead><tr>' +
      '<th class="ck">纳入</th><th class="idx">序</th><th>节点名称</th><th class="days">天数</th>' +
      '<th class="days">计划开始</th></tr></thead>' +
      '<tbody id="a-rows"></tbody></table></div>' +
      '<div class="card-b" id="a-sum" style="border-top:1px solid var(--line);"></div>' +
      '</div>' +

      '<div>' +
      '<div class="card" style="margin-bottom:16px;"><div class="card-h"><h3>项目节点关系图</h3>' +
      '<span style="font-size:12px;color:var(--t3);">按推导后的前置关系绘制</span></div>' +
      '<div class="card-b" style="padding:12px;">' +
      '<div id="a-alert"></div>' +
      '<div class="graph-wrap" style="padding:0;">' +
      '<svg class="graph-svg" id="a-graph"></svg>' +
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
      '</div></div></div></div>' +

      '<div class="card" style="margin-bottom:16px;"><div class="card-h"><h3>工期结果</h3>' +
      '<span style="font-size:12px;color:var(--t3);">按推导后的前置关系测算</span></div>' +
      '<div class="card-b" id="a-plan"></div></div>' +

      '<div class="card"><div class="card-h"><h3>推导说明</h3>' +
      '<span style="font-size:12px;color:var(--t3);">前置缺失与关系省略的处理记录</span></div>' +
      '<div class="card-b" id="a-note"></div></div>' +
      '</div>' +
      '</div>';

    svg = document.getElementById('a-graph');
    bind();
    refresh();
  }

  function persist() {
    Store.setApply(tpl.id, { ids: ids.slice(), start: start });
  }

  function refresh() {
    res = ApplyCalc.derive(tpl.nodes, ids);
    renderRows();
    renderSum();
    renderPlan();
    renderNote();
    Graph.render(svg, { id: tpl.id, nodes: res.nodes }, res.cpm, {
      onMove: function () { Graph.update(svg, { id: tpl.id, nodes: res.nodes }, res.cpm); },
      onMoveEnd: function () { Store.saveLayout(tpl.id); }
    });
  }

  function nameOf(id) {
    for (var i = 0; i < tpl.nodes.length; i++) if (tpl.nodes[i].id === id) return tpl.nodes[i].name;
    return '（已删除）';
  }

  function renderRows() {
    var tb = document.getElementById('a-rows');
    if (!tb) return;
    if (!tpl.nodes.length) { tb.innerHTML = '<tr><td colspan="5" class="empty">模板暂无节点</td></tr>'; return; }

    var order = {};
    (res.cpm.order || []).forEach(function (id, i) { order[id] = i + 1; });

    tb.innerHTML = tpl.nodes.map(function (n, i) {
      var on = ids.indexOf(n.id) >= 0;
      var es = res.es ? (res.es[n.id] || 0) : 0;
      var dateTxt = (on && start && res.ok) ? U.addDays(start, es) : '—';
      var deps = [];
      if (on) {
        var nd = null;
        res.nodes.forEach(function (x) { if (x.id === n.id) nd = x; });
        deps = (nd && nd.deps) || [];
      }
      var depTxt = !on ? '—' :
        (deps.length ? deps.map(nameOf).join('、') : '无前置（第 1 天开始）');
      var chg = on && res.trace[n.id] && res.trace[n.id].length ? ' <span class="tag warn">已上溯</span>' : '';

      return '<tr class="' + (on ? '' : 'off') + '">' +
        '<td class="ck"><input type="checkbox" data-node="' + U.esc(n.id) + '"' +
        (on ? ' checked' : '') + (n.fixed ? ' disabled title="开工为工期起点，不可取消"' : '') + '></td>' +
        '<td class="idx">' + (on ? (order[n.id] || (i + 1)) : '—') + '</td>' +
        '<td class="nm">' + U.esc(n.name) +
        (n.fixed ? ' <span class="tag">起点</span>' : '') + chg +
        '<div class="deps">前置：' + U.esc(depTxt) + '</div></td>' +
        '<td class="days num">' + (Number(n.days) || 0) + ' 天</td>' +
        '<td class="days">' + U.esc(dateTxt) + '</td>' +
        '</tr>';
    }).join('');
  }

  function renderSum() {
    var box = document.getElementById('a-sum');
    if (!box) return;
    box.innerHTML =
      '<div style="display:flex;align-items:center;gap:10px;font-size:13px;color:var(--t2);">' +
      '<span>已纳入 <b style="color:var(--t1);">' + res.active.length + '</b> 个节点</span>' +
      '<span style="color:var(--t3);">|</span>' +
      '<span>未纳入 <b style="color:var(--t1);">' + res.missing.length + '</b> 个</span>' +
      '</div>';
  }

  function renderPlan() {
    var box = document.getElementById('a-plan');
    if (!box) return;
    if (!res.ok) { box.innerHTML = '<div class="empty">推导后的关系存在异常，工期测算已暂停</div>'; return; }

    var total = res.total;
    var end = start ? U.addDays(start, total - 1) : '';
    var chain = [];
    if ((res.critNodes || []).length) {
      var critStart = res.critNodes.reduce(function (a, b) { return (res.es[a] || 0) <= (res.es[b] || 0) ? a : b; });
      var next = {};
      (res.critEdges || []).forEach(function (e) { next[e[0]] = e[1]; });
      var cur = critStart;
      while (cur && chain.indexOf(cur) < 0) { chain.push(cur); cur = next[cur]; }
    }

    box.innerHTML =
      '<div class="plan">' +
      '<div class="plan-i"><div class="k">项目总工期</div><div class="v">' + total + '<small>天</small></div></div>' +
      '<div class="plan-i"><div class="k">实际节点数</div><div class="v">' + res.active.length + '<small>个</small></div></div>' +
      '<div class="plan-i"><div class="k">预计完工</div><div class="v" style="font-size:17px;">' +
      (end ? U.esc(end) : '<span style="font-size:13px;color:var(--t3);font-weight:400;">填写开工日期后推算</span>') +
      '</div></div>' +
      '</div>' +
      '<div class="crit-line"><b style="color:var(--t1);">关键路径：</b>' +
      chain.map(function (id) { return '<span class="cn">' + U.esc(nameOf(id)) + '</span>'; }).join('<span class="ar">→</span>') +
      '<div style="margin-top:6px;color:var(--t3);font-size:12px;">关键路径上的任一节点延期，都会直接导致项目整体顺延。</div>' +
      '</div>';
  }

  function renderNote() {
    var box = document.getElementById('a-note');
    if (!box) return;

    var lines = [];

    /* 未纳入的节点 */
    if (res.missing.length) {
      lines.push('<div class="nt"><b>未纳入本项目的节点</b>' +
        res.missing.map(function (n) { return '<span class="tag off">' + U.esc(n.name) + '</span>'; }).join(' ') +
        '</div>');
    }

    /* 前置缺失后上溯 */
    var ups = [];
    res.nodes.forEach(function (n) {
      var log = res.trace[n.id] || [];
      log.forEach(function (r) {
        ups.push('「' + U.esc(n.name) + '」的前置「' + U.esc(nameOf(r.miss)) +
          '」未纳入，已向上追溯至「' + U.esc(nameOf(r.repl)) + '」');
      });
    });
    if (ups.length) {
      lines.push('<div class="nt"><b>前置缺失，已逐层上溯</b><ul>' +
        ups.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul></div>');
    }

    /* 传递冗余被省略 */
    var cuts = [];
    res.nodes.forEach(function (n) {
      var rm = res.removed[n.id] || [];
      rm.forEach(function (p) {
        cuts.push('「' + U.esc(n.name) + '」的前置「' + U.esc(nameOf(p)) +
          '」已由更靠近的前置传递约束，不再单独作为前置');
      });
    });
    if (cuts.length) {
      lines.push('<div class="nt"><b>冗余前置已省略</b><ul>' +
        cuts.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ul></div>');
    }

    /* 无前置的非开工节点 */
    var free = res.nodes.filter(function (n) { return !n.fixed && !(n.deps || []).length; });
    if (free.length) {
      lines.push('<div class="nt"><b>无前置约束的节点</b>' +
        free.map(function (n) { return '<span class="tag">' + U.esc(n.name) + '</span>'; }).join(' ') +
        '<div style="margin-top:6px;color:var(--t3);font-size:12px;">这些节点没有可用前置（前置全部未纳入且无法上溯），将与「开工」同时开始。</div></div>');
    }

    if (!lines.length) {
      lines.push('<div class="empty">本项目纳入了模板的全部节点，前置关系与模板一致，无需推导调整</div>');
    }

    box.innerHTML = lines.join('');
  }

  /* ---------- 事件 ---------- */
  function bind() {
    var view = document.getElementById('view');
    var dt = document.getElementById('a-start');

    if (dt) dt.addEventListener('change', function () {
      start = dt.value;
      persist();
      renderRows();
      renderPlan();
    });

    view.addEventListener('change', function (e) {
      var el = e.target;
      if (!el || el.tagName !== 'INPUT' || !el.getAttribute('data-node')) return;
      var id = el.getAttribute('data-node');
      var i = ids.indexOf(id);
      if (el.checked && i < 0) ids.push(id);
      if (!el.checked && i >= 0) ids.splice(i, 1);
      persist();
      refresh();
    });

    view.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-act]') : null;
      if (!el) return;
      var a = el.getAttribute('data-act');

      if (a === 'back') { location.hash = '#/apply'; return; }
      if (a === 'all') {
        ids = tpl.nodes.map(function (n) { return n.id; });
        persist(); refresh(); U.toast('已纳入全部节点');
        return;
      }
      if (a === 'none') {
        ids = tpl.nodes.filter(function (n) { return n.fixed; }).map(function (n) { return n.id; });
        persist(); refresh(); U.toast('已取消，仅保留开工');
        return;
      }
      if (a === 'zin') { Graph.zoom(svg, 1.15); return; }
      if (a === 'zout') { Graph.zoom(svg, 1 / 1.15); return; }
      if (a === 'fullscreen') { Graph.fullscreen(document.querySelector('.graph-wrap')); return; }
      if (a === 'fit') { Graph.fit(svg); return; }
    });
  }

  return { render: render };
})();
