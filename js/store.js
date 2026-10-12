/* 数据仓储：本地持久化 + 模板/节点增删改 */
window.Store = (function () {
  var KEY = 'zfgq_templates_v1';
  var SKEY = 'zfgq_seed_v1';
  var list = null;

  /* 示例模板同步状态：id -> 已注入的版本号；-1 表示用户主动删过，不再补回 */
  function seedState() {
    var o = {};
    try { o = JSON.parse(localStorage.getItem(SKEY)) || {}; } catch (e) { o = {}; }
    return o;
  }
  function saveSeedState(o) {
    try { localStorage.setItem(SKEY, JSON.stringify(o)); } catch (e) { /* 忽略 */ }
  }

  /* 补齐示例模板：本地没有的补进来，用户改过的不覆盖 */
  function syncSeed() {
    var st = seedState();
    var seeds = (window.SEED && window.SEED.templates) || [];
    var changed = false;
    seeds.forEach(function (seed) {
      var rev = seed.rev || 1;
      var prev = st[seed.id];
      if (prev === -1) return;
      var idx = -1;
      for (var i = 0; i < list.length; i++) { if (list[i].id === seed.id) { idx = i; break; } }
      if (idx < 0) {
        list.push(JSON.parse(JSON.stringify(seed)));
        st[seed.id] = rev;
        changed = true;
        return;
      }
      if (prev === undefined) { st[seed.id] = rev; changed = true; return; }
      if (prev < rev) {
        if (!list[idx]._dirty) list[idx] = JSON.parse(JSON.stringify(seed));
        st[seed.id] = rev;
        changed = true;
      }
    });
    saveSeedState(st);
    if (changed) persist();
  }

  /* 模板节点挂到施工节点库：按名称匹配，匹配不到就在库里补一条，保证 100% 有归属 */
  function linkNodes() {
    var changed = false;
    list.forEach(function (t) {
      (t.nodes || []).forEach(function (n) {
        if (n.ref && nodeGet(n.ref)) return;
        var m = nodeByName(n.name);
        if (!m) {
          m = nodeAdd({
            name: n.name, type: n.fixed ? '施工' : '施工',
            stage: n.fixed ? '开工准备' : '安装',
            days: Number(n.days) || 0, trades: ['杂工'], minDays: 0, deps: []
          });
          changed = true;
        }
        n.ref = m.id;
        if (n.daysOverride == null && !n.fixed) n.daysOverride = Number(n.days) || 0;
        changed = true;
      });
    });
    if (changed) persist();
  }

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
    syncSeed();
    if (window.SEED && window.SEED.nodes) linkNodes();
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
      if (arr[i].id === id) {
        arr.splice(i, 1);
        var seeds = (window.SEED && window.SEED.templates) || [];
        for (var k = 0; k < seeds.length; k++) {
          if (seeds[k].id === id) {
            var st = seedState();
            st[id] = -1;
            saveSeedState(st);
            break;
          }
        }
        persist();
        return true;
      }
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
    t._dirty = true;
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
      ref: data.ref || '',
      trades: (data.trades || []).slice(),
      qty: data.qty || {},
      daysOverride: (data.daysOverride != null && data.daysOverride !== '') ? Number(data.daysOverride) : null,
      fixed: false
    };
    t.nodes.push(n);
    t._dirty = true;
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
        if (data.ref != null) t.nodes[i].ref = data.ref;
        if (data.trades != null) t.nodes[i].trades = data.trades.slice();
        if (data.qty != null) t.nodes[i].qty = data.qty;
        if (data.daysOverride !== undefined) {
          t.nodes[i].daysOverride = (data.daysOverride != null && data.daysOverride !== '') ? Number(data.daysOverride) : null;
        }
        t._dirty = true;
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
        t._dirty = true;
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

  /* ---------- 工期应用（项目实际纳入的节点） ---------- */
  var AKEY = 'zfgq_apply_v1';

  function applyAll() {
    var o = {};
    try { o = JSON.parse(localStorage.getItem(AKEY)) || {}; } catch (e) { o = {}; }
    return o;
  }

  /* 取某模板的应用配置；未配置过则默认全纳入 */
  function getApply(tplId) {
    var t = get(tplId);
    if (!t) return null;
    var o = applyAll();
    var a = o[tplId];
    if (!a || !a.ids) {
      return { ids: t.nodes.map(function (n) { return n.id; }), start: t.start || '' };
    }
    /* 过滤掉模板中已不存在的节点 */
    var ids = a.ids.filter(function (id) {
      return t.nodes.some(function (n) { return n.id === id; });
    });
    return { ids: ids, start: a.start || '' };
  }

  function setApply(tplId, data) {
    var o = applyAll();
    o[tplId] = { ids: (data.ids || []).slice(), start: data.start || '' };
    try { localStorage.setItem(AKEY, JSON.stringify(o)); } catch (e) { /* 忽略 */ }
  }

  function saveLayout(tplId) { persist(); }

  /* ---------- 施工节点库 / 定额库 / 产品类目 ---------- */
  var LKEY = 'zfgq_lib_v1';
  var LSKEY = 'zfgq_libseed_v1';
  var lib = null;

  function libSeedState() {
    var o = {};
    try { o = JSON.parse(localStorage.getItem(LSKEY)) || {}; } catch (e) { o = {}; }
    return o;
  }
  function saveLibSeedState(o) {
    try { localStorage.setItem(LSKEY, JSON.stringify(o)); } catch (e) { /* 忽略 */ }
  }

  function libPersist() {
    try { localStorage.setItem(LKEY, JSON.stringify(lib)); } catch (e) { /* 忽略 */ }
  }

  /* 字典补齐：本地没有的补进来，改过的不覆盖，删过的不复活 */
  function syncLib() {
    var st = libSeedState();
    var changed = false;
    ['nodes', 'quota', 'productCats'].forEach(function (key) {
      var seeds = (window.SEED && window.SEED[key]) || [];
      seeds.forEach(function (seed) {
        var prev = st[seed.id];
        if (prev === -1) return;
        var idx = -1;
        for (var i = 0; i < lib[key].length; i++) { if (lib[key][i].id === seed.id) { idx = i; break; } }
        if (idx < 0) {
          lib[key].push(JSON.parse(JSON.stringify(seed)));
          st[seed.id] = seed.rev || 1;
          changed = true;
          return;
        }
        if (prev === undefined) { st[seed.id] = 1; changed = true; return; }
      });
    });
    saveLibSeedState(st);
    if (changed) libPersist();
  }

  function loadLib() {
    if (lib) return lib;
    var raw = null;
    try { raw = localStorage.getItem(LKEY); } catch (e) { raw = null; }
    if (raw) {
      try { lib = JSON.parse(raw); } catch (e) { lib = null; }
    }
    if (!lib || !lib.nodes) {
      lib = {
        nodes: JSON.parse(JSON.stringify((window.SEED && window.SEED.nodes) || [])),
        quota: JSON.parse(JSON.stringify((window.SEED && window.SEED.quota) || [])),
        productCats: JSON.parse(JSON.stringify((window.SEED && window.SEED.productCats) || []))
      };
      libPersist();
    }
    syncLib();
    return lib;
  }

  function pick(arr, id) {
    for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
    return null;
  }

  function nodeAll() { return loadLib().nodes.slice(); }
  function nodeGet(id) { return pick(loadLib().nodes, id); }
  function nodeByName(name) {
    var a = loadLib().nodes;
    for (var i = 0; i < a.length; i++) if (a[i].name === name) return a[i];
    return null;
  }
  function nodeAdd(data) {
    var n = {
      id: newId('SN'), name: data.name || '未命名节点', type: data.type || '施工',
      stage: data.stage || '安装', days: Number(data.days) || 0,
      trades: (data.trades || []).slice(), minDays: Number(data.minDays) || 0,
      deps: (data.deps || []).slice(), cat: data.cat || '', lead: Number(data.lead) || 0,
      measure: !!data.measure, status: '启用'
    };
    loadLib().nodes.push(n);
    libPersist();
    return n;
  }
  function nodeUpdate(id, data) {
    var n = nodeGet(id);
    if (!n) return false;
    if (data.name != null) n.name = data.name;
    if (data.type != null) n.type = data.type;
    if (data.stage != null) n.stage = data.stage;
    if (data.days != null) n.days = Number(data.days) || 0;
    if (data.trades != null) n.trades = data.trades.slice();
    if (data.minDays != null) n.minDays = Number(data.minDays) || 0;
    if (data.deps != null) n.deps = data.deps.slice();
    if (data.cat != null) n.cat = data.cat;
    if (data.lead != null) n.lead = Number(data.lead) || 0;
    if (data.measure != null) n.measure = !!data.measure;
    n._dirty = true;
    libPersist();
    return true;
  }
  function nodeRemove(id) {
    var a = loadLib().nodes;
    for (var i = 0; i < a.length; i++) {
      if (a[i].id === id) {
        a.splice(i, 1);
        var seeds = (window.SEED && window.SEED.nodes) || [];
        for (var k = 0; k < seeds.length; k++) {
          if (seeds[k].id === id) { var st = libSeedState(); st[id] = -1; saveLibSeedState(st); break; }
        }
        libPersist();
        return true;
      }
    }
    return false;
  }

  function quotaAll() { return loadLib().quota.slice(); }
  function quotaGet(id) { return pick(loadLib().quota, id); }
  function quotaAdd(data) {
    var q = {
      id: newId('Q'), code: data.code || '', name: data.name || '未命名定额',
      stage: data.stage || '安装', unit: data.unit || '项', crew: Number(data.crew) || 1,
      node: data.node || '', items: (data.items || []).map(function (i) {
        return { trade: i.trade, hours: Number(i.hours) || 0 };
      }), status: '启用'
    };
    loadLib().quota.push(q);
    libPersist();
    return q;
  }
  function quotaUpdate(id, data) {
    var q = quotaGet(id);
    if (!q) return false;
    if (data.code != null) q.code = data.code;
    if (data.name != null) q.name = data.name;
    if (data.stage != null) q.stage = data.stage;
    if (data.unit != null) q.unit = data.unit;
    if (data.crew != null) q.crew = Number(data.crew) || 1;
    if (data.node != null) q.node = data.node;
    if (data.items != null) q.items = data.items.map(function (i) {
      return { trade: i.trade, hours: Number(i.hours) || 0 };
    });
    q._dirty = true;
    libPersist();
    return true;
  }
  function quotaRemove(id) {
    var a = loadLib().quota;
    for (var i = 0; i < a.length; i++) {
      if (a[i].id === id) {
        a.splice(i, 1);
        var seeds = (window.SEED && window.SEED.quota) || [];
        for (var k = 0; k < seeds.length; k++) {
          if (seeds[k].id === id) { var st = libSeedState(); st[id] = -1; saveLibSeedState(st); break; }
        }
        libPersist();
        return true;
      }
    }
    return false;
  }
  /* 某个施工节点挂了哪些定额 */
  function quotaByNode(nodeId) {
    return loadLib().quota.filter(function (q) { return q.node === nodeId; });
  }
  /* 某个节点名称能匹配到的定额（用于模板节点按名称直接取定额） */
  function quotaByNodeName(name) {
    var n = nodeByName(name);
    return n ? quotaByNode(n.id) : [];
  }

  function catAll() { return loadLib().productCats.slice(); }
  function catGet(id) { return pick(loadLib().productCats, id); }
  function catName(id) {
    var c = catGet(id);
    if (!c) return '';
    var p = c.parent ? catGet(c.parent) : null;
    return p ? p.name + ' - ' + c.name : c.name;
  }
  function catTop() { return loadLib().productCats.filter(function (c) { return !c.parent; }); }
  function catSub(pid) { return loadLib().productCats.filter(function (c) { return c.parent === pid; }); }

  function stages() { return ((window.SEED && window.SEED.stages) || []).slice(); }
  function trades() { return ((window.SEED && window.SEED.trades) || []).slice(); }
  function nodeTypes() { return ((window.SEED && window.SEED.nodeTypes) || []).slice(); }

  /* ---------- 报价单 ---------- */
  var BKEY = 'zfgq_quote_v1';
  var BSKEY = 'zfgq_quoteseed_v1';
  var quotes = null;

  function quoteSeedState() {
    var o = {};
    try { o = JSON.parse(localStorage.getItem(BSKEY)) || {}; } catch (e) { o = {}; }
    return o;
  }
  function saveQuoteSeedState(o) {
    try { localStorage.setItem(BSKEY, JSON.stringify(o)); } catch (e) { /* 忽略 */ }
  }
  function quotePersist() {
    try { localStorage.setItem(BKEY, JSON.stringify(quotes)); } catch (e) { /* 忽略 */ }
  }

  /* 示例报价单同步：缺的补进来，改过的不覆盖，删过的不复活，升版的自动刷新 */
  function syncQuoteSeed() {
    var st = quoteSeedState();
    var seeds = (window.SEED && window.SEED.quotes) || [];
    var changed = false;
    seeds.forEach(function (seed) {
      if (st[seed.id] === -1) return;
      var rev = seed.rev || 1;
      var idx = -1;
      for (var i = 0; i < quotes.length; i++) { if (quotes[i].id === seed.id) { idx = i; break; } }
      if (idx < 0) {
        quotes.push(JSON.parse(JSON.stringify(seed)));
        st[seed.id] = rev;
        changed = true;
        return;
      }
      if (st[seed.id] === undefined) { st[seed.id] = rev; changed = true; return; }
      if (st[seed.id] < rev) {
        if (!quotes[idx]._dirty) quotes[idx] = JSON.parse(JSON.stringify(seed));
        st[seed.id] = rev;
        changed = true;
      }
    });
    saveQuoteSeedState(st);
    if (changed) quotePersist();
  }

  function loadQuotes() {
    if (quotes) return quotes;
    var raw = null;
    try { raw = localStorage.getItem(BKEY); } catch (e) { raw = null; }
    if (raw) {
      try { quotes = JSON.parse(raw); } catch (e) { quotes = null; }
    }
    if (!quotes || !quotes.length) {
      quotes = JSON.parse(JSON.stringify((window.SEED && window.SEED.quotes) || []));
      quotePersist();
    }
    syncQuoteSeed();
    return quotes;
  }

  function quoteAll() { return loadQuotes().slice(); }
  function quoteGet(id) { return pick(loadQuotes(), id); }

  function quoteKinds() { return ((window.SEED && window.SEED.quoteKinds) || []).slice(); }

  function quoteCreate(data) {
    var q = {
      id: newId('B'), code: data.code || '',
      name: data.name || '未命名报价单',
      kind: data.kind || '其他',
      customer: data.customer || '', address: data.address || '',
      house: data.house || '', area: Number(data.area) || 0,
      start: data.start || '', status: '草稿',
      items: [], created: U.today(), updated: U.today()
    };
    loadQuotes().unshift(q);
    quotePersist();
    return q;
  }

  function quoteUpdate(id, data) {
    var q = quoteGet(id);
    if (!q) return false;
    if (data.name != null) q.name = data.name;
    if (data.kind != null) q.kind = data.kind;
    if (data.customer != null) q.customer = data.customer;
    if (data.address != null) q.address = data.address;
    if (data.house != null) q.house = data.house;
    if (data.area != null) q.area = Number(data.area) || 0;
    if (data.start != null) q.start = data.start;
    if (data.status != null) q.status = data.status;
    q._dirty = true;
    q.updated = U.today();
    quotePersist();
    return true;
  }

  function quoteRemove(id) {
    var arr = loadQuotes();
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].id === id) {
        arr.splice(i, 1);
        var seeds = (window.SEED && window.SEED.quotes) || [];
        for (var k = 0; k < seeds.length; k++) {
          if (seeds[k].id === id) {
            var st = quoteSeedState();
            st[id] = -1;
            saveQuoteSeedState(st);
            break;
          }
        }
        quotePersist();
        return true;
      }
    }
    return false;
  }

  /* 同一条定额重复添加时累加数量 */
  function quoteAddItem(id, qid, qty) {
    var q = quoteGet(id);
    if (!q) return null;
    var exist = null;
    q.items.forEach(function (it) { if (it.qid === qid) exist = it; });
    if (exist) exist.qty = (Number(exist.qty) || 0) + (Number(qty) || 0);
    else q.items.push({ id: newId('BI'), qid: qid, qty: Number(qty) || 0 });
    q._dirty = true;
    q.updated = U.today();
    quotePersist();
    return q;
  }

  function quoteSetQty(id, itemId, qty) {
    var q = quoteGet(id);
    if (!q) return false;
    for (var i = 0; i < q.items.length; i++) {
      if (q.items[i].id === itemId) {
        q.items[i].qty = Number(qty) || 0;
        q._dirty = true;
        q.updated = U.today();
        quotePersist();
        return true;
      }
    }
    return false;
  }

  function quoteRemoveItem(id, itemId) {
    var q = quoteGet(id);
    if (!q) return false;
    for (var i = 0; i < q.items.length; i++) {
      if (q.items[i].id === itemId) {
        q.items.splice(i, 1);
        q._dirty = true;
        q.updated = U.today();
        quotePersist();
        return true;
      }
    }
    return false;
  }

  /* ---------- 方案类型 → 标准定额明细 ---------- */
  function quotePresetList() {
    return JSON.parse(JSON.stringify((window.SEED && window.SEED.quotePresets) || []));
  }

  function quotePreset(kind) {
    var arr = (window.SEED && window.SEED.quotePresets) || [];
    for (var i = 0; i < arr.length; i++) { if (arr[i].kind === kind) return arr[i]; }
    return null;
  }

  function quotePresetCount(kind) {
    var p = quotePreset(kind);
    return p ? (p.items || []).length : 0;
  }

  /* 套用某方案类型的标准明细：随面积的按建筑面积折算，其余按标准量固定 */
  function quoteApplyPreset(id, kind) {
    var q = quoteGet(id);
    var p = quotePreset(kind);
    if (!q || !p) return 0;
    var area = Number(q.area) || 0;
    var base = Number(p.baseArea) || 0;
    var ratio = (area > 0 && base > 0) ? (area / base) : 1;

    var items = [];
    (p.items || []).forEach(function (pi) {
      if (!quotaGet(pi.qid)) return;
      var v = Number(pi.qty) || 0;
      if (pi.byArea) v = Math.round(v * ratio * 10) / 10;
      items.push({ id: newId('BI'), qid: pi.qid, qty: v });
    });

    q.items = items;
    q._dirty = true;
    q.updated = U.today();
    quotePersist();
    return items.length;
  }

  return {
    all: all, get: get, types: types, create: create, save: save, remove: remove,
    copyTpl: copyTpl, toggle: toggle,
    addNode: addNode, updateNode: updateNode, removeNode: removeNode,
    wouldCycle: wouldCycle, saveLayout: saveLayout, newId: newId,
    getApply: getApply, setApply: setApply,
    nodeAll: nodeAll, nodeGet: nodeGet, nodeByName: nodeByName,
    nodeAdd: nodeAdd, nodeUpdate: nodeUpdate, nodeRemove: nodeRemove,
    quotaAll: quotaAll, quotaGet: quotaGet, quotaAdd: quotaAdd,
    quotaUpdate: quotaUpdate, quotaRemove: quotaRemove,
    quotaByNode: quotaByNode, quotaByNodeName: quotaByNodeName,
    catAll: catAll, catGet: catGet, catName: catName, catTop: catTop, catSub: catSub,
    stages: stages, trades: trades, nodeTypes: nodeTypes,
    quoteAll: quoteAll, quoteGet: quoteGet, quoteCreate: quoteCreate, quoteKinds: quoteKinds,
    quoteUpdate: quoteUpdate, quoteRemove: quoteRemove,
    quoteAddItem: quoteAddItem, quoteSetQty: quoteSetQty, quoteRemoveItem: quoteRemoveItem,
    quotePresetList: quotePresetList, quotePreset: quotePreset,
    quotePresetCount: quotePresetCount, quoteApplyPreset: quoteApplyPreset
  };
})();
