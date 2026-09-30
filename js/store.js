/* 数据仓储：本地持久化 + 模板/节点增删改 */
window.Store = (function () {
  var KEY = 'zfgq_templates_v1';
  var list = null;

  function load() {
    if (list) return list;
    var raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { raw = null; }
    if (raw) {
      try { list = JSON.parse(raw); } catch (e) { list = null; }
    }
    if (!list || !list.length) {
      list = JSON.parse(JSON.stringify(window.SEED.templates));
      persist();
    }
    return list;
  }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* 忽略：隐私模式 */ }
  }

  function all() { return load(); }
  function get(id) {
    var arr = load();
    for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
    return null;
  }
  function types() { return window.SEED.types.slice(); }

  function newId(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  }

  function create(name, type) {
    var arr = load();
    var t = {
      id: newId('T'), name: name || '未命名工期模板', type: type || '整装',
      status: '停用', start: '', desc: '',
      created: U.today(), updated: U.today(),
      nodes: [{ id: newId('N'), name: '开工', days: 0, deps: [], fixed: true }]
    };
    arr.unshift(t);
    persist();
    return t;
  }

  function save() { persist(); }

  function remove(id) {
    var arr = load();
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === id) { arr.splice(i, 1); persist(); return true; }
    }
    return false;
  }

  function copyTpl(id) {
    var src = get(id);
    if (!src) return null;
    var arr = load();
    var t = JSON.parse(JSON.stringify(src));
    t.id = newId('T');
    t.name = src.name + '（副本）';
    t.status = '停用';
    t.created = U.today();
    t.updated = U.today();
    var map = {};
    t.nodes.forEach(function (n) {
      var old = n.id;
      n.id = newId('N');
      map[old] = n.id;
    });
    t.nodes.forEach(function (n) {
      n.deps = (n.deps || []).map(function (d) { return map[d]; }).filter(Boolean);
    });
    arr.unshift(t);
    persist();
    return t;
  }

  function toggle(id) {
    var t = get(id);
    if (!t) return;
    t.status = t.status === '启用' ? '停用' : '启用';
    t.updated = U.today();
    persist();
  }

  /* ---------- 节点 ---------- */
  function addNode(tplId, data) {
    var t = get(tplId);
    if (!t) return null;
    var n = {
      id: newId('N'),
      name: data.name,
      days: Number(data.days) || 0,
      deps: (data.deps || []).slice(),
      fixed: false
    };
    t.nodes.push(n);
    t.updated = U.today();
    persist();
    return n;
  }

  function updateNode(tplId, nodeId, data) {
    var t = get(tplId);
    if (!t) return false;
    for (var i = 0; i < t.nodes.length; i++) {
      if (t.nodes[i].id === nodeId) {
        if (data.name != null) t.nodes[i].name = data.name;
        if (data.days != null) t.nodes[i].days = Number(data.days) || 0;
        if (data.deps != null) t.nodes[i].deps = data.deps.slice();
        t.updated = U.today();
        persist();
        return true;
      }
    }
    return false;
  }

  /* 删除节点：同时从其他节点的前置里摘掉 */
  function removeNode(tplId, nodeId) {
    var t = get(tplId);
    if (!t) return false;
    for (var i = 0; i < t.nodes.length; i++) {
      if (t.nodes[i].id === nodeId) {
        if (t.nodes[i].fixed) return false;
        t.nodes.splice(i, 1);
        t.nodes.forEach(function (n) {
          n.deps = (n.deps || []).filter(function (d) { return d !== nodeId; });
        });
        t.updated = U.today();
        persist();
        return true;
      }
    }
    return false;
  }

  /* 判断：把 deps 作为 nodeId 的前置，是否成环。nodeId 为空表示新增节点 */
  function wouldCycle(tplId, nodeId, deps) {
    var t = get(tplId);
    if (!t) return false;
    var map = {};
    t.nodes.forEach(function (n) { map[n.id] = n; });
    if (nodeId) map[nodeId] = { id: nodeId, deps: deps };
    var visiting = {}, done = {};
    function dfs(id) {
      if (done[id]) return false;
      if (visiting[id]) return true;
      visiting[id] = true;
      var n = map[id];
      var ds = (n && n.deps) || [];
      for (var i = 0; i < ds.length; i++) {
        if (dfs(ds[i])) return true;
      }
      visiting[id] = false;
      done[id] = true;
      return false;
    }
    var ids = Object.keys(map);
    for (var i = 0; i < ids.length; i++) {
      visiting = {};
      if (dfs(ids[i])) return true;
    }
    return false;
  }

  function saveLayout(tplId) { persist(); }

  return {
    all: all, get: get, types: types, create: create, save: save, remove: remove,
    copyTpl: copyTpl, toggle: toggle,
    addNode: addNode, updateNode: updateNode, removeNode: removeNode,
    wouldCycle: wouldCycle, saveLayout: saveLayout, newId: newId
  };
})();
