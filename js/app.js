/* 路由与外壳 */
(function () {
  var MENU = [
    { k: 'templates', name: '工期模板', ico: 'tpl', title: '工期模板' },
    { k: 'help', name: '配置规则', ico: 'book', title: '配置规则说明' }
  ];

  function renderMenu(active) {
    document.getElementById('menu').innerHTML = MENU.map(function (m) {
      return '<div class="menu-item' + (m.k === active ? ' on' : '') + '" data-menu="' + m.k + '">' +
        '<span class="mi-ico">' + U.icon(m.ico, 17) + '</span>' + m.name + '</div>';
    }).join('');
    document.getElementById('menu').onclick = function (e) {
      var el = e.target.closest ? e.target.closest('[data-menu]') : null;
      if (!el) return;
      location.hash = '#/' + el.getAttribute('data-menu');
    };
    document.getElementById('brand-mark').innerHTML = U.icon('logo', 20);
  }

  function route() {
    var h = location.hash.replace(/^#\/?/, '');
    var seg = h.split('/');
    var key = seg[0] || 'templates';
    var crumb = document.getElementById('crumb');
    var top = document.getElementById('top-actions');

    if (key === 'editor') {
      renderMenu('templates');
      var t = seg[1] ? Store.get(seg[1]) : null;
      crumb.innerHTML = '<a href="#/templates">工期模板</a><span class="sep">/</span><b>' +
        U.esc(t ? t.name : '模板配置') + '</b>';
      top.innerHTML = '<span style="font-size:12px;color:var(--t3);">修改自动保存</span>';
      PageEditor.render(seg[1]);
      return;
    }

    if (key === 'help') {
      renderMenu('help');
      crumb.innerHTML = '<b>配置规则说明</b>';
      top.innerHTML = '';
      PageHelp.render();
      return;
    }

    renderMenu('templates');
    crumb.innerHTML = '<b>工期模板</b>';
    top.innerHTML = '';
    PageTpl.render();
  }

  window.addEventListener('hashchange', route);
  if (!location.hash) location.hash = '#/templates';
  route();
})();
