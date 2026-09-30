/* 通用工具与线性图标 */
window.U = (function () {
  var ICONS = {
    logo: '<path d="M4 17h16M6 17V8l6-4 6 4v9M10 17v-5h4v5" fill="none" stroke="#0C3247" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    tpl: '<rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 9h18M8 4v5M8 13h8M8 16h5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 7h7M8 11h7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    plus: '<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    edit: '<path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M5 15V5a2 2 0 0 1 2-2h8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    trash: '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    close: '<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    check: '<path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    warn: '<path d="M12 4l9 16H3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 10v4M12 17h.01" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    info: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 11v5M12 8h.01" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    clock: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    flag: '<path d="M6 21V4M6 4h11l-2 4 2 4H6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    flow: '<circle cx="5" cy="6" r="2.4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="19" cy="12" r="2.4" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="5" cy="18" r="2.4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M7.2 6.9 16.8 10.9M7.2 17.1 16.8 13.1M5 8.4v7.2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    save: '<path d="M5 4h11l3 3v13H5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 4v5h8V4M8 20v-6h8v6" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    back: '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    zoomIn: '<circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M20 20l-4.2-4.2M11 8v6M8 11h6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    zoomOut: '<circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M20 20l-4.2-4.2M8 11h6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    fullscreen: '<path d="M4 9V4h5M20 15v5h-5M20 9V4h-5M4 15v5h5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    fit: '<path d="M9 4h5v5M15 20h-5v-5M20 9v5h-5M4 15V10h5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    search: '<circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M20 20l-4.2-4.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'
  };

  function icon(name, size, color) {
    var p = ICONS[name] || '';
    var s = size || 16;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24"' +
      (color ? ' style="color:' + color + '"' : '') + '>' + p + '</svg>';
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  var toastTimer = null;
  function toast(msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('on'); }, 1900);
  }

  /* 弹窗：opts = { title, body, okText, cancelText, onOk, width } */
  function modal(opts) {
    var mask = document.getElementById('modal');
    var box = document.getElementById('modal-box');
    if (!mask || !box) return;
    box.style.width = opts.width ? opts.width + 'px' : '';
    box.innerHTML =
      '<div class="modal-h">' + esc(opts.title || '') +
      '<span class="x" data-act="close">' + icon('close', 18) + '</span></div>' +
      '<div class="modal-b">' + (opts.body || '') + '</div>' +
      '<div class="modal-f">' +
      (opts.cancelText === false ? '' : '<button class="btn" data-act="close">' + esc(opts.cancelText || '取消') + '</button>') +
      (opts.okText === false ? '' : '<button class="btn btn-p" data-act="ok">' + esc(opts.okText || '确定') + '</button>') +
      '</div>';
    mask.hidden = false;
    box._onOk = opts.onOk || null;
  }

  function closeModal() {
    var mask = document.getElementById('modal');
    if (mask) mask.hidden = true;
  }

  function confirm(text, onOk, danger) {
    modal({
      title: danger ? '删除确认' : '操作确认',
      body: '<div style="font-size:14px;line-height:1.8;">' + text + '</div>',
      okText: danger ? '删除' : '确定',
      onOk: onOk
    });
  }

  /* 事件委托：data-act */
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-act]') : null;
    if (t && t.closest('#modal')) {
      var a = t.getAttribute('data-act');
      if (a === 'close') { closeModal(); return; }
      if (a === 'ok') {
        var box = document.getElementById('modal-box');
        if (box && box._onOk) { if (box._onOk() !== false) closeModal(); }
        else closeModal();
        return;
      }
    }
  });

  /* 日期加减 */
  function addDays(dateStr, n) {
    if (!dateStr) return '';
    var d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return '';
    d.setDate(d.getDate() + n);
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
  }

  function today() {
    var d = new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
  }

  return {
    icon: icon, esc: esc, toast: toast, modal: modal, closeModal: closeModal,
    confirm: confirm, addDays: addDays, today: today
  };
})();
