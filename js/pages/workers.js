/* 工人库：直接指派到人，记录每个人会哪些工种（多能工）
 * 这里的配置决定排期时同一天能派多少人出去，是影响工期的硬约束 */
window.PageWorkers = (function () {

  var state = { kw: '', trade: '' };

  function rows() {
    return Store.workerAll().filter(function (w) {
      if (state.kw && w.name.indexOf(state.kw) < 0) return false;
      if (state.trade && (w.skills || []).indexOf(state.trade) < 0) return false;
      return true;
    });
  }

  function stat() {
    var arr = Store.workerAll();
    var on = arr.filter(function (w) { return w.status !== '停用'; });
    var byTrade = {}, multi = 0;
    on.forEach(function (w) {
      (w.skills || []).forEach(function (s) { byTrade[s] = (byTrade[s] || 0) + 1; });
      if ((w.skills || []).length > 1) multi++;
    });
    return { total: arr.length, on: on.length, multi: multi, byTrade: byTrade };
  }

  /* 工种人力分布：哪个工种人最少，哪里就是工期瓶颈 */
  function tradeBar() {
    var s = stat();
    var trades = Store.trades().filter(function (t) { return s.byTrade[t]; });
    if (!trades.length) return '';
    return '<div class="card" style="margin-bottom:16px;"><div class="card-h"><h3>工种人力分布</h3>' +
      '<span style="font-size:12px;color:var(--t3);">在岗人数最少的工种，往往是拖长工期的瓶颈</span></div>' +
      '<div class="card-b" style="display:flex;gap:10px;flex-wrap:wrap;padding:14px 18px;">' +
      trades.map(function (t) {
        var n = s.byTrade[t];
        var hot = n <= 1;
        return '<div style="border:1px solid var(--line);border-radius:8px;padding:8px 14px;' +
          (hot ? 'border-color:var(--accent);background:#FFF6F2;' : '') + '">' +
          '<div style="font-size:12px;color:var(--t3);">' + U.esc(t) + '</div>' +
          '<div style="font-size:18px;font-weight:500;' + (hot ? 'color:var(--accent);' : '') + '">' +
          n + ' <span style="font-size:12px;color:var(--t3);font-weight:400;">人</span></div></div>';
      }).join('') +
      '</div></div>';
  }

  function lambdaCard() {
    var v = Store.crewLambda();
    var opts = [
      [0, '只省钱（不加人，哪怕工期长）'],
      [0.25, '均衡（4 天工期才值 1 个人天）'],
      [0.5, '偏快（2 天工期值 1 个人天）'],
      [1, '赶工（1 天工期值 1 个人天）']
    ];
    var known = opts.some(function (o) { return Math.abs(o[0] - v) < 1e-9; });
    return '<div class="card" style="margin-bottom:16px;"><div class="card-h"><h3>派工策略</h3>' +
      '<span style="font-size:12px;color:var(--t3);">工人干半天也付一天工费，加人未必划算</span></div>' +
      '<div class="card-b" style="padding:14px 18px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">' +
      '<label style="font-size:13px;color:var(--t2);">工期价值</label>' +
      '<select class="sel" id="f-lambda" style="width:280px;">' +
      opts.map(function (o) {
        return '<option value="' + o[0] + '"' + (Math.abs(o[0] - v) < 1e-9 ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') +
      (!known ? '<option value="' + v + '" selected>自定义 ' + v + '</option>' : '') +
      '</select>' +
      '<span style="font-size:12px;color:var(--t3);">决定「为了缩短工期，愿意多付几个人天」</span>' +
      '</div>' +
      '<div style="padding:0 18px 14px;color:var(--t3);font-size:12px;line-height:1.7;">' +
      '系统会在这个策略下，结合每个节点的工作面上限，算出派几个人最合适：' +
      '活太小（不足 8 小时）就只派 1 人；加人能把天数压下来才加；' +
      '加人压不下天数还多付工费时就不加。</div></div>';
  }

  function render() {
    var s = stat();
    var list = rows();
    var view = document.getElementById('view');

    var body = list.length ? list.map(function (w) {
      var skills = (w.skills || []);
      return '<tr' + (w.status === '停用' ? ' class="off"' : '') + '>' +
        '<td><span class="nm">' + U.esc(w.name) + '</span></td>' +
        '<td>' + (skills.length
          ? skills.map(function (t) {
            return '<span class="tag ' + (skills.length > 1 ? 'ok' : '') + '" style="margin-right:4px;">' + U.esc(t) + '</span>';
          }).join('')
          : '<span class="tag off">未配技能</span>') +
        (skills.length > 1 ? '<div class="deps">多能工，可跨工种补位</div>' : '') + '</td>' +
        '<td class="num">' + (w.status === '停用' ? '<span class="tag off">停用</span>' : '<span class="tag ok">在岗</span>') + '</td>' +
        '<td class="op">' +
        '<button class="btn btn-g btn-s" data-act="edit" data-id="' + w.id + '">编辑</button>' +
        '<button class="btn btn-g btn-s" data-act="del" data-id="' + w.id + '" style="color:var(--accent);">删除</button>' +
        '</td></tr>';
    }).join('') : '<tr><td colspan="4" class="empty">没有符合条件的工人</td></tr>';

    view.innerHTML =
      '<div class="page-h"><div><h2>工人库</h2>' +
      '<p>公司直接指派工人，没有班组也没有项目经理。这里记录每个人会哪些工种——' +
      '会得越多越灵活，排期时可跨工种补位。工人数量与技能组合决定了同一天能开几个节点</p></div>' +
      '<div style="display:flex;gap:10px;">' +
      '<div style="position:relative;"><input class="inp" id="f-kw" placeholder="搜索姓名" value="' + U.esc(state.kw) + '" style="width:170px;padding-left:32px;">' +
      '<span style="position:absolute;left:9px;top:9px;color:#93A1AD;display:flex;">' + U.icon('search', 15) + '</span></div>' +
      '<select class="sel" id="f-trade" style="width:130px;"><option value="">全部工种</option>' +
      Store.trades().map(function (t) { return '<option' + (state.trade === t ? ' selected' : '') + '>' + t + '</option>'; }).join('') +
      '</select>' +
      '<button class="btn btn-p" data-act="new">' + U.icon('plus', 15) + '新建工人</button>' +
      '</div></div>' +

      '<div class="stat-row">' +
      '<div class="stat"><div class="k">工人总数</div><div class="v">' + s.total + '<small>人</small></div></div>' +
      '<div class="stat"><div class="k">在岗</div><div class="v">' + s.on + '<small>人</small></div></div>' +
      '<div class="stat"><div class="k">多能工</div><div class="v">' + s.multi + '<small>人</small></div></div>' +
      '<div class="stat"><div class="k">覆盖工种</div><div class="v">' + Object.keys(s.byTrade).length + '<small>种</small></div></div>' +
      '</div>' +

      tradeBar() + lambdaCard() +

      '<div class="card"><div class="card-h"><h3>工人清单</h3>' +
      '<span style="font-size:12px;color:var(--t3);">共 ' + list.length + ' 人</span></div>' +
      '<div style="overflow:auto;"><table class="tbl"><thead><tr>' +
      '<th>姓名</th><th>会做的工种</th><th class="days">状态</th><th class="op">操作</th>' +
      '</tr></thead><tbody>' + body + '</tbody></table></div>' +
      '<div style="padding:12px 18px;border-top:1px solid var(--line);color:var(--t3);font-size:12px;">' +
      '排期时系统按「先派专职、多能工留作补位」的原则指派，' +
      '同一天同一名工人只会出现在一个节点上；若某个工种只剩 1 人，对应节点会自动减员开工、天数相应变长。</div>' +
      '</div>';

    bind();
  }

  function bind() {
    var view = document.getElementById('view');
    var kw = document.getElementById('f-kw');
    var tr = document.getElementById('f-trade');
    var lm = document.getElementById('f-lambda');
    if (kw) kw.addEventListener('input', function () { state.kw = kw.value.trim(); rerender(); });
    if (tr) tr.addEventListener('change', function () { state.trade = tr.value; render(); });
    if (lm) lm.addEventListener('change', function () {
      Store.setCrewLambda(lm.value);
      U.toast('派工策略已更新，重新打开报价单即可看到新的天数与工期');
      render();
    });

    view.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-act]') : null;
      if (!el) return;
      var a = el.getAttribute('data-act');
      var id = el.getAttribute('data-id');
      if (a === 'new') { openForm(null); return; }
      if (a === 'edit') { openForm(id); return; }
      if (a === 'del') {
        var w = Store.workerGet(id);
        U.confirm('确定删除工人「' + U.esc(w ? w.name : '') + '」？', function () {
          Store.workerRemove(id);
          U.toast('已删除工人');
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
    var w = id ? Store.workerGet(id) : null;
    var isNew = !w;
    var draft = {
      name: w ? w.name : '',
      skills: w ? (w.skills || []).slice() : [],
      status: w ? w.status : '在岗'
    };

    U.modal({
      title: isNew ? '新建工人' : '编辑工人',
      body:
        '<div class="fld"><label>姓名</label><input class="inp" id="w-name" value="' + U.esc(draft.name) + '" placeholder="如：王建国"></div>' +
        '<div class="fld"><label>会做的工种（可多选，选多个即为多能工）</label>' +
        '<div id="w-skills" style="display:flex;flex-wrap:wrap;gap:8px;padding:6px 0;">' +
        Store.trades().map(function (t) {
          var on = draft.skills.indexOf(t) >= 0;
          return '<label style="display:flex;align-items:center;gap:5px;font-size:13px;' +
            'border:1px solid var(--line);border-radius:6px;padding:5px 10px;cursor:pointer;' +
            (on ? 'border-color:var(--brand);background:#F0F7F5;' : '') + '">' +
            '<input type="checkbox" data-sk="' + U.esc(t) + '"' + (on ? ' checked' : '') + '>' + U.esc(t) + '</label>';
        }).join('') +
        '</div>' +
        '<div class="hint">只勾一个 = 专职，调度时优先派；勾多个 = 多能工，会留到缺人的工种上补位。</div></div>' +
        '<div class="fld"><label>状态</label><select class="sel" id="w-status">' +
        ['在岗', '停用'].map(function (s) {
          return '<option' + (draft.status === s ? ' selected' : '') + '>' + s + '</option>';
        }).join('') + '</select>' +
        '<div class="hint">停用后不再参与排期指派。</div></div>',
      onOk: function () {
        var name = document.getElementById('w-name').value.trim();
        if (!name) { U.toast('请填写姓名'); return false; }
        var skills = [];
        var box = document.getElementById('w-skills');
        if (box) {
          var cbs = box.querySelectorAll('input[data-sk]');
          for (var i = 0; i < cbs.length; i++) {
            if (cbs[i].checked) skills.push(cbs[i].getAttribute('data-sk'));
          }
        }
        if (!skills.length) { U.toast('至少勾选一个工种'); return false; }
        var status = document.getElementById('w-status').value;
        if (isNew) {
          Store.workerCreate({ name: name, skills: skills, status: status });
          U.toast('已添加工人');
        } else {
          Store.workerUpdate(id, { name: name, skills: skills, status: status });
          U.toast('已保存工人');
        }
        render();
        return true;
      }
    });
  }

  return { render: render };
})();
