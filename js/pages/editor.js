/* 工期模板编辑：节点配置 + 前置关系 + 关系图 */
window.PageEditor = (function () {

  var tpl = null, cpm = null, svg = null;

  /* 按施工先后排序（开工恒在最前） */
  function ordered() {
    if (!cpm || !cpm.ok) return tpl.nodes.slice();
    var arr = tpl.nodes.slice();
    arr.sort(function (a, b) {
      if (a.fixed !== b.fixed) return a.fixed ? -1 : 1;
      var ea = cpm.es[a.id] || 0, eb = cpm.es[b.id] || 0;
      if (ea !== eb) return ea - eb;
      return 0;
    });
    return arr;
  }

  function nameOf(id) {
    for (var i = 0; i < tpl.nodes.length; i++) if (tpl.nodes[i].id === id) return tpl.nodes[i].name;
    return '（已删除）';
  }

  /* ---------- 主渲染 ---------- */
  function render(id) {
    tpl = Store.get(id);
    if (!tpl) { location.hash = '#/templates'; return; }
    cpm = Graph.calc(tpl.nodes);

    var view = document.getElementById('view');
    view.innerHTML =
      '<div class="ed-top">' +
      '<div class="fld f-n"><label>模板名称</label><input class="inp" id="e-name" value="' + U.esc(tpl.name) + '"></div>' +
      '<div class="fld f-t"><label>适用类型</label><select class="sel" id="e-type">' +
      Store.types().map(function (x) { return '<option' + (tpl.type === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') +
      '</select></div>' +
      '<div class="fld f-s"><label>计划起始日期</label><input class="inp" type="date" id="e-start" value="' + U.esc(tpl.start || '') + '"></div>' +
      '<div class="fld"><label>模板状态</label>' +
      '<button class="btn" id="e-status" data-act="toggle-status" style="width:96px;justify-content:center;">' +
      (tpl.status === '启用' ? '启用中' : '已停用') + '</button></div>' +
      '<div class="sp"></div>' +
      '<div class="fld"><label>&nbsp;</label><div style="display:flex;gap:10px;">' +
      '<button class="btn" data-act="back">' + U.icon('back', 15) + '返回列表</button>' +
      '<button class="btn btn-p" data-act="add">' + U.icon('plus', 15) + '添加节点</button>' +
      '</div></div>' +
      '</div>' +

      '<div class="ed-body">' +
      '<div class="card"><div class="card-h"><h3>节点清单</h3>' +
      '<span style="font-size:12px;color:var(--t3);">按施工先后排列</span></div>' +
      '<div style="overflow:auto;"><table class="tbl node-tbl"><thead><tr>' +
      '<th class="idx">序</th><th>节点名称</th><th class="days">施工天数</th>' +
      '<th>前置节点</th><th class="op">操作</th></tr></thead>' +
      '<tbody id="e-rows"></tbody></table></div>' +
      '<div style="padding:12px 18px;border-top:1px solid var(--line);">' +
      '<button class="btn btn-s" data-act="add" style="width:100%;justify-content:center;">' + U.icon('plus', 14) + '添加施工节点</button>' +
      '</div></div>' +

      '<div>' +
      '<div class="card" style="margin-bottom:16px;"><div class="card-h"><h3>节点关系图</h3>' +
      '<span style="font-size:12px;color:var(--t3);">可拖动节点调整位置，滚轮缩放</span></div>' +
      '<div class="card-b" style="padding:12px;">' +
      '<div id="e-alert"></div>' +
      '<div class="graph-wrap" style="padding:0;">' +
      '<svg class="graph-svg" id="e-graph"></svg>' +
      '<div class="graph-tools">' +
      '<button class="btn btn-s" data-act="zin" title="放大">' + U.icon('zoomIn', 15) + '</button>' +
      '<button class="btn btn-s" data-act="zout" title="缩小">' + U.icon('zoomOut', 15) + '</button>' +
      '<button class="btn btn-s" data-act="fit" title="复位">' + U.icon('fit', 15) + '</button>' +
      '</div>' +
      '<div class="graph-legend">' +
      '<span><i style="background:#B9C6D1;"></i>普通依赖</span>' +
      '<span><i style="background:#C2410C;"></i>关键路径</span>' +
      '<span><i style="background:#0E4C6B;"></i>开工节点</span>' +
      '</div></div></div></div>' +

      '<div class="card"><div class="card-h"><h3>工期测算</h3>' +
      '<span style="font-size:12px;color:var(--t3);">按关键路径法自动推算</span></div>' +
      '<div class="card-b" id="e-plan"></div></div>' +
      '</div>' +
      '</div>';

    svg = document.getElementById('e-graph');
    bindTop();
    bindBody();
    refresh();
  }

  /* ---------- 局部刷新 ---------- */
  function refresh() {
    cpm = Graph.calc(tpl.nodes);
    renderRows();
    renderAlert();
    Graph.render(svg, { id: tpl.id, nodes: ordered() }, cpm, {
      onMove: function () { Graph.update(svg, { id: tpl.id, nodes: ordered() }, cpm); },
      onMoveEnd: function () { Store.saveLayout(tpl.id); }
    });
    renderPlan();
  }

  function renderRows() {
    var tb = document.getElementById('e-rows');
    if (!tb) return;
    var arr = ordered();
    if (!arr.length) { tb.innerHTML = '<tr><td colspan="5" class="empty">暂无节点</td></tr>'; return; }

    tb.innerHTML = arr.map(function (n, i) {
      var es = cpm.ok ? (cpm.es[n.id] || 0) : 0;
      var ef = cpm.ok ? (cpm.ef[n.id] || 0) : 0;
      var depNames = (n.deps || []).map(nameOf).join('、') || '—';
      var dateTxt = '';
      if (tpl.start && cpm.ok && !n.fixed) {
        dateTxt = '<div class="deps">' + U.addDays(tpl.start, es) + ' 起</div>';
      } else if (tpl.start && cpm.ok && n.fixed) {
        dateTxt = '<div class="deps">' + U.addDays(tpl.start, 0) + ' 进场</div>';
      }
      return '<tr class="' + (n.fixed ? 'fixed' : '') + '">' +
        '<td class="idx">' + (i + 1) + '</td>' +
        '<td><span class="nm">' + U.esc(n.name) + '</span>' +
        (n.fixed ? ' <span class="tag" style="margin-left:4px;">固定起点</span>' : '') +
        (cpm.ok && cpm.tf && cpm.tf[n.id] === 0 && !n.fixed ? ' <span class="tag acc" style="margin-left:4px;">关键</span>' : '') +
        dateTxt + '</td>' +
        '<td class="days num">' + (n.fixed ? '—' : (Number(n.days) || 0) + ' 天') + '</td>' +
        '<td class="deps">' + U.esc(depNames) + '</td>' +
        '<td class="op">' +
        (n.fixed ? '<span style="color:var(--t3);font-size:12px;">不可修改</span>' :
          '<button class="btn btn-g btn-s" data-act="edit" data-id="' + n.id + '">编辑</button>' +
          '<button class="btn btn-g btn-s" data-act="del" data-id="' + n.id + '" style="color:var(--accent);">删除</button>') +
        '</td></tr>';
    }).join('');
  }

  function renderAlert() {
    var box = document.getElementById('e-alert');
    if (!box) return;
    var h = '';
    if (!cpm.ok) {
      h += '<div class="alert err"><span class="ic">' + U.icon('warn', 16) + '</span>' +
        '<div>节点之间存在循环依赖，无法推算工期。请检查并调整前置关系。</div></div>';
    }
    /* 非末节点的孤立提示：完全孤立 或 无前置（将并行开始） */
    var hasNoDep = [], fullyAlone = [];
    tpl.nodes.forEach(function (n) {
      if (n.fixed) return;
      var noDep = !(n.deps || []).length;
      var noSucc = !tpl.nodes.some(function (m) { return (m.deps || []).indexOf(n.id) >= 0; });
      if (noDep && noSucc) fullyAlone.push(n);
      else if (noDep) hasNoDep.push(n);
    });
    if (fullyAlone.length) {
      h += '<div class="alert warn"><span class="ic">' + U.icon('warn', 16) + '</span><div>' +
        '以下节点尚未接入完整链路：' + fullyAlone.map(function (n) { return '「' + U.esc(n.name) + '」'; }).join('、') +
        '。请为其设置前置或让其他节点依赖它，否则该节点不影响总工期。</div></div>';
    }
    if (hasNoDep.length) {
      h += '<div class="alert warn"><span class="ic">' + U.icon('info', 16) + '</span><div>' +
        '以下节点未设置前置节点：' + hasNoDep.map(function (n) { return '「' + U.esc(n.name) + '」'; }).join('、') +
        '。它们将与「开工」同时开始，属于并行施工。</div></div>';
    }
    box.innerHTML = h;
  }

  function renderPlan() {
    var box = document.getElementById('e-plan');
    if (!box) return;
    if (!cpm.ok) {
      box.innerHTML = '<div class="empty">存在循环依赖，工期测算已暂停</div>';
      return;
    }
    var total = cpm.total;
    /* 抽出一条关键路径链（存在多条时只展示其中一条最长链） */
    var critChain = [];
    if (cpm.critNodes.length) {
      var critStart = cpm.critNodes.reduce(function (a, b) { return (cpm.es[a] || 0) <= (cpm.es[b] || 0) ? a : b; });
      var critNext = {};
      (cpm.critEdges || []).forEach(function (e) { critNext[e[0]] = e[1]; });
      var cur = critStart;
      while (cur && critChain.indexOf(cur) < 0) {
        critChain.push(cur);
        cur = critNext[cur];
      }
    }
    var end = tpl.start ? U.addDays(tpl.start, total - 1) : '';

    box.innerHTML =
      '<div class="plan">' +
      '<div class="plan-i"><div class="k">总工期</div><div class="v">' + total + '<small>天</small></div></div>' +
      '<div class="plan-i"><div class="k">关键路径节点</div><div class="v">' + cpm.critNodes.length + '<small>个</small></div></div>' +
      '<div class="plan-i"><div class="k">预计完工</div><div class="v" style="font-size:17px;">' +
      (end ? U.esc(end) : '<span style="font-size:13px;color:var(--t3);font-weight:400;">设置起始日期后推算</span>') + '</div></div>' +
      '</div>' +
      '<div class="crit-line"><b style="color:var(--t1);">关键路径：</b>' +
      critChain.map(function (id) { return '<span class="cn">' + U.esc(nameOf(id)) + '</span>'; }).join('<span class="ar">→</span>') +
      '<div style="margin-top:6px;color:var(--t3);font-size:12px;">关键路径上的任一节点延期，都会直接导致整体工期顺延；若存在多条关键路径，当前展示其中一条最长链，其余路径节点同样需按期完成。</div>' +
      '</div>';
  }

  /* ---------- 事件 ---------- */
  function bindTop() {
    var nm = document.getElementById('e-name');
    var ty = document.getElementById('e-type');
    var st = document.getElementById('e-start');
    if (nm) nm.addEventListener('input', function () { tpl.name = nm.value; tpl.updated = U.today(); Store.save(); });
    if (ty) ty.addEventListener('change', function () { tpl.type = ty.value; Store.save(); });
    if (st) st.addEventListener('change', function () {
      tpl.start = st.value; Store.save(); renderRows(); renderPlan();
    });
  }

  function bindBody() {
    var view = document.getElementById('view');
    view.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-act]') : null;
      if (!el) return;
      var a = el.getAttribute('data-act');
      var id = el.getAttribute('data-id');

      if (a === 'back') { location.hash = '#/templates'; return; }
      if (a === 'toggle-status') {
        Store.toggle(tpl.id);
        tpl = Store.get(tpl.id);
        el.textContent = tpl.status === '启用' ? '启用中' : '已停用';
        U.toast('模板已' + tpl.status);
        return;
      }
      if (a === 'add') { openNode(null); return; }
      if (a === 'edit') { openNode(id); return; }
      if (a === 'del') {
        var n = find(id);
        var used = tpl.nodes.filter(function (m) { return (m.deps || []).indexOf(id) >= 0; });
        U.confirm('确定删除节点「' + U.esc(n ? n.name : '') + '」？' +
          (used.length ? '<br>该节点是 ' + used.length + ' 个节点的前置，删除后这些节点的前置将同步移除。' : ''), function () {
          Store.removeNode(tpl.id, id);
          U.toast('已删除节点');
          refresh();
        }, true);
        return;
      }
      if (a === 'zin') { Graph.zoom(svg, 1.15); return; }
      if (a === 'zout') { Graph.zoom(svg, 1 / 1.15); return; }
      if (a === 'fit') { Graph.fit(svg); return; }
    });
  }

  function find(id) {
    for (var i = 0; i < tpl.nodes.length; i++) if (tpl.nodes[i].id === id) return tpl.nodes[i];
    return null;
  }

  /* ---------- 节点编辑弹窗 ---------- */
  function openNode(id) {
    var node = id ? find(id) : null;
    var isNew = !node;
    var draft = {
      name: node ? node.name : '',
      days: node ? node.days : 3,
      deps: node ? (node.deps || []).slice() : (tpl.nodes.length ? [tpl.nodes[0].id] : [])
    };

    function depHTML() {
      return tpl.nodes.map(function (m) {
        if (node && m.id === node.id) return '';
        var cycle = Store.wouldCycle(tpl.id, node ? node.id : null, dedupe(draft.deps.concat([m.id])));
        var on = draft.deps.indexOf(m.id) >= 0;
        return '<div class="dep-i ' + (on ? 'on' : '') + (cycle && !on ? ' off' : '') + '" data-dep="' + m.id + '">' +
          '<span class="bx">' + (on ? U.icon('check', 12) : '') + '</span>' +
          '<span>' + U.esc(m.name) + '</span>' +
          (m.fixed ? '<span class="dl">起点</span>' : '<span class="dl">' + (Number(m.days) || 0) + '天</span>') +
          (cycle && !on ? '<span class="why">选择后形成循环</span>' : '') +
          '</div>';
      }).join('');
    }

    function dedupe(a) {
      var o = [], i;
      for (i = 0; i < a.length; i++) if (o.indexOf(a[i]) < 0) o.push(a[i]);
      return o;
    }

    U.modal({
      title: isNew ? '添加施工节点' : '编辑节点',
      width: 520,
      body:
        '<div class="form-row">' +
        '<div class="fld"><label>节点名称</label><input class="inp" id="n-name" value="' + U.esc(draft.name) + '" placeholder="如：水电改造"></div>' +
        '<div class="fld"><label>施工天数</label><input class="inp" type="number" min="0" step="1" id="n-days" value="' + draft.days + '"></div>' +
        '</div>' +
        '<div class="fld"><label>前置节点（可多选，全部完成后本节点才能开始）</label>' +
        '<div class="dep-list" id="n-deps">' + depHTML() + '</div>' +
        '<div class="hint">不选前置节点，表示该节点可与「开工」同时开始。<br>已自动屏蔽会造成循环依赖的选项。</div>' +
        '</div>',
      onOk: function () {
        var name = document.getElementById('n-name').value.trim();
        var days = Number(document.getElementById('n-days').value);
        if (!name) { U.toast('请填写节点名称'); return false; }
        if (isNaN(days) || days < 0) { U.toast('施工天数不能为负数'); return false; }
        if (Store.wouldCycle(tpl.id, node ? node.id : null, draft.deps)) {
          U.toast('前置关系存在循环，请重新选择'); return false;
        }
        if (isNew) {
          Store.addNode(tpl.id, { name: name, days: days, deps: draft.deps });
          U.toast('已添加节点');
        } else {
          Store.updateNode(tpl.id, node.id, { name: name, days: days, deps: draft.deps });
          U.toast('已保存节点');
        }
        refresh();
        return true;
      }
    });

    /* 前置多选交互 */
    var box = document.getElementById('n-deps');
    if (box) {
      box.addEventListener('click', function (e) {
        var it = e.target.closest ? e.target.closest('.dep-i') : null;
        if (!it || it.classList.contains('off')) return;
        var did = it.getAttribute('data-dep');
        var i = draft.deps.indexOf(did);
        if (i >= 0) draft.deps.splice(i, 1); else draft.deps.push(did);
        it.classList.toggle('on');
        it.querySelector('.bx').innerHTML = draft.deps.indexOf(did) >= 0 ? U.icon('check', 12) : '';
        box.innerHTML = depHTML();
      });
    }
  }

  return { render: render };
})();
