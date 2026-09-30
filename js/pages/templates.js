/* 工期模板列表 */
window.PageTpl = (function () {

  var state = { kw: '', type: '', status: '' };

  function stat() {
    var arr = Store.all();
    var on = 0, days = 0, nodes = 0;
    arr.forEach(function (t) {
      if (t.status === '启用') on++;
      var c = Graph.calc(t.nodes);
      days += c.ok ? c.total : 0;
      nodes += t.nodes.length;
    });
    var avg = arr.length ? Math.round(days / arr.length) : 0;
    return { total: arr.length, on: on, avg: avg, nodes: nodes };
  }

  function render() {
    var arr = Store.all();
    var s = stat();

    var view = document.getElementById('view');
    var list = arr.filter(function (t) {
      if (state.kw && t.name.indexOf(state.kw) < 0) return false;
      if (state.type && t.type !== state.type) return false;
      if (state.status && t.status !== state.status) return false;
      return true;
    });

    var cards = list.map(function (t) {
      var c = Graph.calc(t.nodes);
      var total = c.ok ? c.total : 0;
      var crit = c.ok ? c.critNodes.length : 0;
      return '<div class="tpl">' +
        '<div class="tpl-t"><div><h4>' + U.esc(t.name) + '</h4>' +
        '<div class="sub">' + U.esc(t.type) + ' · 更新于 ' + U.esc(t.updated) + '</div></div>' +
        '<span class="tag ' + (t.status === '启用' ? 'ok' : 'off') + '">' + U.esc(t.status) + '</span></div>' +
        '<div class="tpl-m">' +
        '<div>总工期<b>' + total + '<small>天</small></b></div>' +
        '<div>节点数<b>' + t.nodes.length + '</b></div>' +
        '<div>关键节点<b>' + crit + '</b></div>' +
        '</div>' +
        '<div class="tpl-f">' +
        '<button class="btn btn-s btn-p" data-act="edit" data-id="' + t.id + '">配置节点</button>' +
        '<button class="btn btn-s" data-act="copy" data-id="' + t.id + '">复制</button>' +
        '<span class="sp"></span>' +
        '<button class="btn btn-s" data-act="toggle" data-id="' + t.id + '">' + (t.status === '启用' ? '停用' : '启用') + '</button>' +
        '<button class="btn btn-s btn-d" data-act="del" data-id="' + t.id + '">删除</button>' +
        '</div></div>';
    }).join('');

    view.innerHTML =
      '<div class="page-h"><div><h2>工期模板</h2>' +
      '<p>维护各类施工项目的标准工期模板，配置节点、施工天数与前后置关系</p></div>' +
      '<div style="display:flex;gap:10px;">' +
      '<div style="position:relative;"><input class="inp" id="f-kw" placeholder="搜索模板名称" value="' + U.esc(state.kw) + '" style="width:190px;padding-left:32px;">' +
      '<span style="position:absolute;left:9px;top:9px;color:#93A1AD;display:flex;">' + U.icon('search', 15) + '</span></div>' +
      '<select class="sel" id="f-type" style="width:120px;"><option value="">全部类型</option>' +
      Store.types().map(function (x) { return '<option' + (state.type === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') +
      '</select>' +
      '<select class="sel" id="f-status" style="width:120px;"><option value="">全部状态</option>' +
      ['启用', '停用'].map(function (x) { return '<option' + (state.status === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') +
      '</select>' +
      '<button class="btn btn-p" data-act="new">' + U.icon('plus', 15) + '新建模板</button>' +
      '</div></div>' +

      '<div class="stat-row">' +
      '<div class="stat"><div class="k">模板总数</div><div class="v">' + s.total + '</div></div>' +
      '<div class="stat"><div class="k">启用中</div><div class="v">' + s.on + '<small>个</small></div></div>' +
      '<div class="stat"><div class="k">平均总工期</div><div class="v">' + s.avg + '<small>天</small></div></div>' +
      '<div class="stat"><div class="k">节点总数</div><div class="v">' + s.nodes + '</div></div>' +
      '</div>' +

      (cards ? '<div class="tpl-grid">' + cards + '</div>'
        : '<div class="card"><div class="empty">没有符合条件的模板</div></div>');

    bind();
  }

  function bind() {
    var view = document.getElementById('view');
    var kw = document.getElementById('f-kw');
    var ty = document.getElementById('f-type');
    var st = document.getElementById('f-status');
    if (kw) kw.addEventListener('input', function () { state.kw = kw.value.trim(); rerenderList(); });
    if (ty) ty.addEventListener('change', function () { state.type = ty.value; render(); });
    if (st) st.addEventListener('change', function () { state.status = st.value; render(); });

    view.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-act]') : null;
      if (!el) return;
      var a = el.getAttribute('data-act');
      var id = el.getAttribute('data-id');

      if (a === 'new') {
        U.modal({
          title: '新建工期模板',
          body: '<div class="form-row"><div class="fld"><label>模板名称</label>' +
            '<input class="inp" id="m-name" placeholder="如：标准家装工期模板"></div>' +
            '<div class="fld"><label>适用类型</label><select class="sel" id="m-type">' +
            Store.types().map(function (x) { return '<option>' + x + '</option>'; }).join('') +
            '</select></div></div>' +
            '<div class="hint">创建后会自动生成第一个固定节点「开工」，再进入配置页添加后续节点。</div>',
          onOk: function () {
            var n = document.getElementById('m-name').value.trim();
            if (!n) { U.toast('请填写模板名称'); return false; }
            var t = Store.create(n, document.getElementById('m-type').value);
            U.toast('已创建，进入节点配置');
            location.hash = '#/editor/' + t.id;
          }
        });
        return;
      }

      if (a === 'edit') { location.hash = '#/editor/' + id; return; }

      if (a === 'copy') {
        var c = Store.copyTpl(id);
        if (c) { U.toast('已复制为副本'); render(); }
        return;
      }

      if (a === 'toggle') { Store.toggle(id); render(); return; }

      if (a === 'del') {
        var t0 = Store.get(id);
        U.confirm('确定删除模板「' + U.esc(t0 ? t0.name : '') + '」？该模板下的节点配置将一并移除，且不可恢复。', function () {
          Store.remove(id);
          U.toast('已删除');
          render();
        }, true);
        return;
      }
    });
  }

  /* 搜索时只重绘列表区，避免输入框失焦 */
  function rerenderList() {
    var kw = document.getElementById('f-kw');
    state.kw = kw ? kw.value.trim() : '';
    var pos = kw ? kw.selectionStart : 0;
    render();
    var kw2 = document.getElementById('f-kw');
    if (kw2) { kw2.focus(); try { kw2.setSelectionRange(pos, pos); } catch (e) { /* 忽略 */ } }
  }

  return { render: render };
})();
