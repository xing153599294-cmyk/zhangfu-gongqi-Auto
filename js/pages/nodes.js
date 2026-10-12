/* 施工节点库：施工节点 / 验收节点 / 产品节点 */
window.PageNodes = (function () {

  var state = { kw: '', type: '', stage: '' };

  function all() { return Store.nodeAll(); }

  function stat() {
    var arr = all();
    var s = { total: arr.length, build: 0, check: 0, product: 0, covered: 0 };
    arr.forEach(function (n) {
      if (n.type === '施工') s.build++;
      if (n.type === '验收') s.check++;
      if (n.type === '产品') s.product++;
      if (n.type === '施工' && Store.quotaByNode(n.id).length) s.covered++;
    });
    return s;
  }

  function rows() {
    return all().filter(function (n) {
      if (state.kw && n.name.indexOf(state.kw) < 0) return false;
      if (state.type && n.type !== state.type) return false;
      if (state.stage && n.stage !== state.stage) return false;
      return true;
    });
  }

  function relText(n) {
    if (n.type === '产品') {
      var c = Store.catName(n.cat);
      return '<span class="tag">' + U.esc(c || '未关联类目') + '</span>' +
        '<div class="deps">生产周期 ' + (n.lead || 0) + ' 天' + (n.measure ? ' · 需复尺' : '') + '</div>';
    }
    if (n.type === '验收') return '<span class="tag">公司监理</span>';
    var q = Store.quotaByNode(n.id);
    return q.length
      ? '<span class="tag ok">定额 ' + q.length + ' 条</span>'
      : '<span class="tag off">未配定额</span>';
  }

  function render() {
    var s = stat();
    var list = rows();
    var view = document.getElementById('view');

    var body = list.length ? list.map(function (n) {
      var daysTxt = n.type === '产品' ? '—' : ((Number(n.days) || 0) + ' 天');
      return '<tr>' +
        '<td><span class="nm">' + U.esc(n.name) + '</span>' +
        '<div class="deps">' + U.esc(n.stage || '') + '</div></td>' +
        '<td><span class="tag ' + (n.type === '施工' ? '' : (n.type === '验收' ? 'acc' : 'ok')) + '">' +
        U.esc(n.type) + '</span></td>' +
        '<td class="days num">' + daysTxt + '</td>' +
        '<td class="deps">' + U.esc((n.trades || []).join('、') || '—') + '</td>' +
        '<td>' + relText(n) + '</td>' +
        '<td class="op">' +
        '<button class="btn btn-g btn-s" data-act="edit" data-id="' + n.id + '">编辑</button>' +
        '<button class="btn btn-g btn-s" data-act="del" data-id="' + n.id + '" style="color:var(--accent);">删除</button>' +
        '</td></tr>';
    }).join('') : '<tr><td colspan="6" class="empty">没有符合条件的节点</td></tr>';

    view.innerHTML =
      '<div class="page-h"><div><h2>施工节点库</h2>' +
      '<p>维护标准施工节点，供工期模板引用；施工节点带出天数与工种，验收节点由公司监理把关，产品节点关联产品类目与生产周期</p></div>' +
      '<div style="display:flex;gap:10px;">' +
      '<div style="position:relative;"><input class="inp" id="f-kw" placeholder="搜索节点名称" value="' + U.esc(state.kw) + '" style="width:180px;padding-left:32px;">' +
      '<span style="position:absolute;left:9px;top:9px;color:#93A1AD;display:flex;">' + U.icon('search', 15) + '</span></div>' +
      '<select class="sel" id="f-type" style="width:120px;"><option value="">全部类型</option>' +
      Store.nodeTypes().map(function (x) { return '<option' + (state.type === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') +
      '</select>' +
      '<select class="sel" id="f-stage" style="width:120px;"><option value="">全部阶段</option>' +
      Store.stages().map(function (x) { return '<option' + (state.stage === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') +
      '</select>' +
      '<button class="btn btn-p" data-act="new">' + U.icon('plus', 15) + '新建节点</button>' +
      '</div></div>' +

      '<div class="stat-row">' +
      '<div class="stat"><div class="k">节点总数</div><div class="v">' + s.total + '</div></div>' +
      '<div class="stat"><div class="k">施工节点</div><div class="v">' + s.build + '<small>个</small></div></div>' +
      '<div class="stat"><div class="k">验收节点</div><div class="v">' + s.check + '<small>个</small></div></div>' +
      '<div class="stat"><div class="k">已配定额的施工节点</div><div class="v">' + s.covered + '<small>个</small></div></div>' +
      '</div>' +

      '<div class="card"><div class="card-h"><h3>节点清单</h3>' +
      '<span style="font-size:12px;color:var(--t3);">共 ' + list.length + ' 个节点</span></div>' +
      '<div style="overflow:auto;"><table class="tbl"><thead><tr>' +
      '<th>节点名称</th><th>类型</th><th class="days">标准天数</th><th>需求工种</th>' +
      '<th>关联</th><th class="op">操作</th></tr></thead>' +
      '<tbody>' + body + '</tbody></table></div></div>';

    bind();
  }

  function bind() {
    var view = document.getElementById('view');
    var kw = document.getElementById('f-kw');
    var ty = document.getElementById('f-type');
    var st = document.getElementById('f-stage');
    if (kw) kw.addEventListener('input', function () { state.kw = kw.value.trim(); rerender(); });
    if (ty) ty.addEventListener('change', function () { state.type = ty.value; render(); });
    if (st) st.addEventListener('change', function () { state.stage = st.value; render(); });

    view.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-act]') : null;
      if (!el) return;
      var a = el.getAttribute('data-act');
      var id = el.getAttribute('data-id');
      if (a === 'new') { openForm(null); return; }
      if (a === 'edit') { openForm(id); return; }
      if (a === 'del') {
        var n = Store.nodeGet(id);
        var used = Store.quotaByNode(id).length;
        U.confirm('确定删除节点「' + U.esc(n ? n.name : '') + '」？' +
          (used ? '<br>该节点下挂了 ' + used + ' 条定额，删除后这些定额将失去关联。' : ''), function () {
          Store.nodeRemove(id);
          U.toast('已删除节点');
          render();
        }, true);
      }
    });
  }

  function rerender() {
    var kw = document.getElementById('f-kw');
    state.kw = kw ? kw.value.trim() : '';
    var pos = kw ? kw.selectionStart : 0;
    render();
    var kw2 = document.getElementById('f-kw');
    if (kw2) { kw2.focus(); try { kw2.setSelectionRange(pos, pos); } catch (e) { /* 忽略 */ } }
  }

  /* ---------- 新建 / 编辑 ---------- */
  function openForm(id) {
    var node = id ? Store.nodeGet(id) : null;
    var isNew = !node;
    var draft = {
      name: node ? node.name : '',
      type: node ? node.type : '施工',
      stage: node ? node.stage : '水电',
      days: node ? node.days : 1,
      minDays: node ? node.minDays : 1,
      trades: node ? (node.trades || []).slice() : [],
      deps: node ? (node.deps || []).slice() : [],
      cat: node ? node.cat : '',
      lead: node ? node.lead : 0,
      measure: node ? !!node.measure : false
    };

    function tradeHTML() {
      return Store.trades().map(function (t) {
        var on = draft.trades.indexOf(t) >= 0;
        return '<div class="dep-i ' + (on ? 'on' : '') + '" data-trade="' + U.esc(t) + '">' +
          '<span class="bx">' + (on ? U.icon('check', 12) : '') + '</span><span>' + U.esc(t) + '</span></div>';
      }).join('');
    }

    function catHTML() {
      var tops = Store.catTop();
      return tops.map(function (t) {
        return '<optgroup label="' + U.esc(t.name) + '">' +
          Store.catSub(t.id).map(function (c) {
            return '<option value="' + c.id + '"' + (draft.cat === c.id ? ' selected' : '') + '>' + U.esc(c.name) + '</option>';
          }).join('') + '</optgroup>';
      }).join('');
    }

    U.modal({
      title: isNew ? '新建节点' : '编辑节点',
      width: 560,
      body:
        '<div class="form-row">' +
        '<div class="fld"><label>节点名称</label><input class="inp" id="k-name" value="' + U.esc(draft.name) + '" placeholder="如：水路改造"></div>' +
        '<div class="fld"><label>节点类型</label><select class="sel" id="k-type">' +
        Store.nodeTypes().map(function (x) { return '<option' + (draft.type === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') +
        '</select></div></div>' +

        '<div class="form-row">' +
        '<div class="fld"><label>所属阶段</label><select class="sel" id="k-stage">' +
        Store.stages().map(function (x) { return '<option' + (draft.stage === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') +
        '</select></div>' +
        '<div class="fld"><label>标准施工天数</label><input class="inp" type="number" min="0" step="1" id="k-days" value="' + draft.days + '"></div>' +
        '</div>' +

        '<div id="k-prod">' +
        '<div class="form-row">' +
        '<div class="fld"><label>关联产品类目</label><select class="sel" id="k-cat"><option value="">不关联</option>' + catHTML() + '</select></div>' +
        '<div class="fld"><label>标准生产周期（天）</label><input class="inp" type="number" min="0" step="1" id="k-lead" value="' + draft.lead + '"></div>' +
        '</div>' +
        '<div class="fld"><label>是否需复尺下单</label><select class="sel" id="k-measure">' +
        '<option value="0"' + (draft.measure ? '' : ' selected') + '>不需要</option>' +
        '<option value="1"' + (draft.measure ? ' selected' : '') + '>需要复尺</option></select></div>' +
        '</div>' +

        '<div class="fld"><label>需求工种（可多选）</label>' +
        '<div class="dep-list" id="k-trades">' + tradeHTML() + '</div></div>' +
        '<div class="hint">验收节点的工种固定为公司监理。产品节点的工期来自生产周期，不按定额计算。</div>',

      onOk: function () {
        var name = document.getElementById('k-name').value.trim();
        if (!name) { U.toast('请填写节点名称'); return false; }
        draft.name = name;
        draft.type = document.getElementById('k-type').value;
        draft.stage = document.getElementById('k-stage').value;
        draft.days = Number(document.getElementById('k-days').value) || 0;
        if (draft.type === '产品') {
          draft.cat = document.getElementById('k-cat').value;
          draft.lead = Number(document.getElementById('k-lead').value) || 0;
          draft.measure = document.getElementById('k-measure').value === '1';
        } else {
          draft.cat = ''; draft.lead = 0; draft.measure = false;
        }
        if (draft.type === '验收') draft.trades = ['监理'];
        if (!draft.trades.length && draft.type === '施工') { U.toast('请至少选择一个工种'); return false; }

        if (isNew) { Store.nodeAdd(draft); U.toast('已新建节点'); }
        else { Store.nodeUpdate(id, draft); U.toast('已保存节点'); }
        render();
        return true;
      }
    });

    /* 类型切换：产品节点才显示类目与生产周期 */
    var ty = document.getElementById('k-type');
    var box = document.getElementById('k-prod');
    function toggleType() {
      if (!box) return;
      box.style.display = (ty && ty.value === '产品') ? '' : 'none';
    }
    if (ty) ty.addEventListener('change', toggleType);
    toggleType();

    var tb = document.getElementById('k-trades');
    if (tb) {
      tb.addEventListener('click', function (e) {
        var it = e.target.closest ? e.target.closest('.dep-i') : null;
        if (!it) return;
        var t = it.getAttribute('data-trade');
        var i = draft.trades.indexOf(t);
        if (i >= 0) draft.trades.splice(i, 1); else draft.trades.push(t);
        tb.innerHTML = tradeHTML();
      });
    }
  }

  return { render: render };
})();
