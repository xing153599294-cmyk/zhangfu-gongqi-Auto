/* 定额库：单位工程量所需的工种与工时，绑定施工节点 */
window.PageQuotas = (function () {

  var state = { kw: '', stage: '', node: '' };

  function buildNodes() { return Store.nodeAll().filter(function (n) { return n.type === '施工'; }); }

  function rows() {
    return Store.quotaAll().filter(function (q) {
      if (state.kw && (q.name.indexOf(state.kw) < 0 && String(q.code).indexOf(state.kw) < 0)) return false;
      if (state.stage && q.stage !== state.stage) return false;
      if (state.node && q.node !== state.node) return false;
      return true;
    });
  }

  function stat() {
    var arr = Store.quotaAll();
    var ns = {}, ts = {};
    arr.forEach(function (q) {
      if (q.node) ns[q.node] = 1;
      (q.items || []).forEach(function (i) { if (i.trade) ts[i.trade] = 1; });
    });
    return { total: arr.length, nodes: Object.keys(ns).length, trades: Object.keys(ts).length };
  }

  function itemsText(q) {
    var its = q.items || [];
    if (!its.length) return '—';
    return its.map(function (i) {
      return U.esc(i.trade) + ' <b>' + i.hours + '</b> 小时/' + U.esc(q.unit);
    }).join('<br>');
  }

  function render() {
    var s = stat();
    var list = rows();
    var bns = buildNodes();
    var view = document.getElementById('view');

    var body = list.length ? list.map(function (q) {
      var n = q.node ? Store.nodeGet(q.node) : null;
      return '<tr>' +
        '<td class="num">' + U.esc(q.code || '—') + '</td>' +
        '<td><span class="nm">' + U.esc(q.name) + '</span>' +
        '<div class="deps">' + U.esc(q.stage || '') + '</div></td>' +
        '<td class="num">' + U.esc(q.unit) + '</td>' +
        '<td class="num">' + (q.crew || 1) + ' 人</td>' +
        '<td class="deps">' + itemsText(q) + '</td>' +
        '<td>' + (n ? '<span class="tag ok">' + U.esc(n.name) + '</span>'
          : '<span class="tag off">未绑定</span>') + '</td>' +
        '<td class="op">' +
        '<button class="btn btn-g btn-s" data-act="edit" data-id="' + q.id + '">编辑</button>' +
        '<button class="btn btn-g btn-s" data-act="del" data-id="' + q.id + '" style="color:var(--accent);">删除</button>' +
        '</td></tr>';
    }).join('') : '<tr><td colspan="7" class="empty">没有符合条件的定额</td></tr>';

    view.innerHTML =
      '<div class="page-h"><div><h2>定额库</h2>' +
      '<p>按单位工程量记录所需工种与工时，并绑定对应施工节点；报价时选用定额，排期即可按工程量折算该节点的施工天数</p></div>' +
      '<div style="display:flex;gap:10px;">' +
      '<div style="position:relative;"><input class="inp" id="f-kw" placeholder="搜索定额名称或编号" value="' + U.esc(state.kw) + '" style="width:190px;padding-left:32px;">' +
      '<span style="position:absolute;left:9px;top:9px;color:#93A1AD;display:flex;">' + U.icon('search', 15) + '</span></div>' +
      '<select class="sel" id="f-stage" style="width:120px;"><option value="">全部阶段</option>' +
      Store.stages().map(function (x) { return '<option' + (state.stage === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') +
      '</select>' +
      '<select class="sel" id="f-node" style="width:150px;"><option value="">全部施工节点</option>' +
      bns.map(function (n) { return '<option value="' + n.id + '"' + (state.node === n.id ? ' selected' : '') + '>' + U.esc(n.name) + '</option>'; }).join('') +
      '</select>' +
      '<button class="btn btn-p" data-act="new">' + U.icon('plus', 15) + '新建定额</button>' +
      '</div></div>' +

      '<div class="stat-row">' +
      '<div class="stat"><div class="k">定额总数</div><div class="v">' + s.total + '</div></div>' +
      '<div class="stat"><div class="k">覆盖施工节点</div><div class="v">' + s.nodes + '<small>个</small></div></div>' +
      '<div class="stat"><div class="k">涉及工种</div><div class="v">' + s.trades + '<small>种</small></div></div>' +
      '<div class="stat"><div class="k">工时折算口径</div><div class="v" style="font-size:17px;">8<small>小时/天</small></div></div>' +
      '</div>' +

      '<div class="card"><div class="card-h"><h3>定额清单</h3>' +
      '<span style="font-size:12px;color:var(--t3);">共 ' + list.length + ' 条定额</span></div>' +
      '<div style="overflow:auto;"><table class="tbl"><thead><tr>' +
      '<th>编号</th><th>定额名称</th><th class="days">单位</th><th class="days">班组</th>' +
      '<th>工种与工时</th><th>关联施工节点</th><th class="op">操作</th></tr></thead>' +
      '<tbody>' + body + '</tbody></table></div>' +
      '<div style="padding:12px 18px;border-top:1px solid var(--line);color:var(--t3);font-size:12px;">' +
      '施工天数 = 向上取整（工程量 × 每单位工时合计 ÷ 8 小时 ÷ 班组人数），并不低于该节点的最少出场天数。</div>' +
      '</div>';

    bind();
  }

  function bind() {
    var view = document.getElementById('view');
    var kw = document.getElementById('f-kw');
    var st = document.getElementById('f-stage');
    var nd = document.getElementById('f-node');
    if (kw) kw.addEventListener('input', function () { state.kw = kw.value.trim(); rerender(); });
    if (st) st.addEventListener('change', function () { state.stage = st.value; render(); });
    if (nd) nd.addEventListener('change', function () { state.node = nd.value; render(); });

    view.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-act]') : null;
      if (!el) return;
      var a = el.getAttribute('data-act');
      var id = el.getAttribute('data-id');
      if (a === 'new') { openForm(null); return; }
      if (a === 'edit') { openForm(id); return; }
      if (a === 'del') {
        var q = Store.quotaGet(id);
        U.confirm('确定删除定额「' + U.esc(q ? q.name : '') + '」？', function () {
          Store.quotaRemove(id);
          U.toast('已删除定额');
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

  function openForm(id) {
    var q = id ? Store.quotaGet(id) : null;
    var isNew = !q;
    var draft = {
      code: q ? q.code : '',
      name: q ? q.name : '',
      stage: q ? q.stage : '水电',
      unit: q ? q.unit : '平米',
      crew: q ? q.crew : 1,
      node: q ? q.node : '',
      items: q ? JSON.parse(JSON.stringify(q.items || [])) : [{ trade: '水电工', hours: 0.5 }]
    };

    function itemsHTML() {
      if (!draft.items.length) return '<div class="hint" style="padding:8px 0;">尚未配置工种，请点击下方添加。</div>';
      return draft.items.map(function (it, i) {
        return '<div class="form-row" style="margin-bottom:8px;align-items:flex-end;">' +
          '<div class="fld"><label>工种</label><select class="sel" data-i="' + i + '" data-f="trade">' +
          Store.trades().map(function (t) { return '<option' + (it.trade === t ? ' selected' : '') + '>' + t + '</option>'; }).join('') +
          '</select></div>' +
          '<div class="fld"><label>每单位工时（小时）</label>' +
          '<input class="inp" type="number" min="0" step="0.05" data-i="' + i + '" data-f="hours" value="' + it.hours + '"></div>' +
          '<div class="fld" style="max-width:80px;"><label>&nbsp;</label>' +
          '<button class="btn btn-s" data-act="rm" data-i="' + i + '">移除</button></div>' +
          '</div>';
      }).join('');
    }

    U.modal({
      title: isNew ? '新建定额' : '编辑定额',
      width: 600,
      body:
        '<div class="form-row">' +
        '<div class="fld"><label>定额编号</label><input class="inp" id="q-code" value="' + U.esc(draft.code) + '" placeholder="如：D001"></div>' +
        '<div class="fld"><label>定额名称</label><input class="inp" id="q-name" value="' + U.esc(draft.name) + '" placeholder="如：水路改造（明暗管综合）"></div>' +
        '</div>' +
        '<div class="form-row">' +
        '<div class="fld"><label>所属阶段</label><select class="sel" id="q-stage">' +
        Store.stages().map(function (x) { return '<option' + (draft.stage === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') +
        '</select></div>' +
        '<div class="fld"><label>计量单位</label><input class="inp" id="q-unit" value="' + U.esc(draft.unit) + '" placeholder="平米/米/个/套"></div>' +
        '<div class="fld"><label>标准班组人数</label><input class="inp" type="number" min="1" step="1" id="q-crew" value="' + draft.crew + '"></div>' +
        '</div>' +
        '<div class="fld"><label>关联施工节点</label><select class="sel" id="q-node">' +
        '<option value="">暂不绑定</option>' +
        buildNodes().map(function (n) { return '<option value="' + n.id + '"' + (draft.node === n.id ? ' selected' : '') + '>' + U.esc(n.name) + '</option>'; }).join('') +
        '</select>' +
        '<div class="hint">一条定额只绑定一个施工节点，排期时据此确定这活落在哪个节点上。</div></div>' +
        '<div class="fld"><label>工种与每单位工时</label><div id="q-items">' + itemsHTML() + '</div>' +
        '<button class="btn btn-s" data-act="additem" style="margin-top:6px;">' + U.icon('plus', 14) + '添加工种</button></div>',

      onOk: function () {
        var name = document.getElementById('q-name').value.trim();
        if (!name) { U.toast('请填写定额名称'); return false; }
        draft.code = document.getElementById('q-code').value.trim();
        draft.name = name;
        draft.stage = document.getElementById('q-stage').value;
        draft.unit = document.getElementById('q-unit').value.trim() || '项';
        draft.crew = Number(document.getElementById('q-crew').value) || 1;
        draft.node = document.getElementById('q-node').value;
        draft.items = draft.items.filter(function (i) { return i.trade && Number(i.hours) > 0; });
        if (!draft.items.length) { U.toast('请配置至少一个工种与工时'); return false; }
        if (isNew) { Store.quotaAdd(draft); U.toast('已新建定额'); }
        else { Store.quotaUpdate(id, draft); U.toast('已保存定额'); }
        render();
        return true;
      }
    });

    var box = document.getElementById('q-items');
    function redraw() { if (box) box.innerHTML = itemsHTML(); }

    document.getElementById('modal-box').addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-act]') : null;
      if (el && el.getAttribute('data-act') === 'additem') {
        draft.items.push({ trade: Store.trades()[0], hours: 0.5 });
        redraw();
        return;
      }
      if (el && el.getAttribute('data-act') === 'rm') {
        draft.items.splice(Number(el.getAttribute('data-i')), 1);
        redraw();
      }
    });
    if (box) {
      box.addEventListener('change', function (e) {
        var f = e.target.getAttribute('data-f');
        if (!f) return;
        var i = Number(e.target.getAttribute('data-i'));
        draft.items[i][f] = f === 'hours' ? Number(e.target.value) : e.target.value;
      });
      box.addEventListener('input', function (e) {
        if (e.target.getAttribute('data-f') === 'hours') {
          draft.items[Number(e.target.getAttribute('data-i'))].hours = Number(e.target.value);
        }
      });
    }
  }

  return { render: render };
})();
