/* ==========================================================
   SALVAMENTO
   - Grava a cada alteração (ganho, perda, compra, combate...)
   - Cada gravação leva uma assinatura (checksum) para detetar corrupção
   - Mantém uma cópia de segurança da gravação anterior
   - No Android (Capacitor) grava também no armazenamento nativo
     (Preferences), que sobrevive mesmo se a WebView for limpa
   ========================================================== */
(function (S) {
  'use strict';

  var KEY = 'sistema.save.v1';
  var BAK = 'sistema.save.v1.bak';

  var memory = {};
  function ls() {
    try {
      var t = '__sys_test__';
      globalThis.localStorage.setItem(t, '1');
      globalThis.localStorage.removeItem(t);
      return globalThis.localStorage;
    } catch (e) { return null; }
  }
  var LS = null;
  function backend() {
    if (LS === null) LS = ls() || false;
    return LS || {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(memory, k) ? memory[k] : null; },
      setItem: function (k, v) { memory[k] = String(v); },
      removeItem: function (k) { delete memory[k]; }
    };
  }

  function nativePrefs() {
    try {
      var C = globalThis.Capacitor;
      if (C && C.isNativePlatform && C.isNativePlatform() && C.Plugins && C.Plugins.Preferences) return C.Plugins.Preferences;
    } catch (e) { /* sem nativo */ }
    return null;
  }

  /* FNV-1a 32 bits */
  function hash(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return ('0000000' + h.toString(16)).slice(-8);
  }

  function pack(state) {
    var data = JSON.stringify(state);
    return JSON.stringify({ v: S.SAVE_SCHEMA, t: (state.meta && state.meta.savedAt) || Date.now(), h: hash(data), d: data });
  }
  function unpack(raw) {
    if (!raw) return null;
    try {
      var rec = JSON.parse(raw);
      if (!rec || typeof rec.d !== 'string' || hash(rec.d) !== rec.h) return null;
      var state = JSON.parse(rec.d);
      if (!state || !state.cls || !state.name) return null;
      return { t: rec.t || 0, state: state };
    } catch (e) { return null; }
  }

  S.storage = {
    lastError: null,
    lastWrite: 0,
    hash: hash,
    pack: pack,
    unpack: unpack,

    /* Gravação síncrona e verificada */
    write: function (state) {
      var b = backend();
      var rec = pack(state);
      try {
        var prev = b.getItem(KEY);
        if (prev && unpack(prev)) b.setItem(BAK, prev);
        b.setItem(KEY, rec);
        if (b.getItem(KEY) !== rec) throw new Error('verificação falhou');
        this.lastError = null;
        this.lastWrite = Date.now();
      } catch (e) {
        this.lastError = String(e && e.message || e);
      }
      var np = nativePrefs();
      if (np) {
        try { np.set({ key: KEY, value: rec }); } catch (e) { /* tenta na próxima */ }
      }
      return !this.lastError;
    },

    /* Carrega a melhor gravação válida (principal ou cópia) */
    loadLocal: function () {
      var b = backend();
      var main = unpack(b.getItem(KEY));
      var bak = unpack(b.getItem(BAK));
      if (main && bak) return main.t >= bak.t ? main : bak;
      return main || bak || null;
    },

    /* No Android: verifica se a cópia nativa é mais recente */
    loadNative: function () {
      var np = nativePrefs();
      if (!np) return Promise.resolve(null);
      return np.get({ key: KEY }).then(function (r) { return unpack(r && r.value); }).catch(function () { return null; });
    },

    clear: function () {
      var b = backend();
      try { b.removeItem(KEY); b.removeItem(BAK); } catch (e) { /* ignora */ }
      var np = nativePrefs();
      if (np) { try { np.remove({ key: KEY }); } catch (e) { /* ignora */ } }
    },

    exportCode: function (state) {
      var rec = pack(state);
      try { return btoa(unescape(encodeURIComponent(rec))); } catch (e) { return rec; }
    },
    importCode: function (code) {
      var raw = String(code || '').trim();
      var txt = raw;
      try { txt = decodeURIComponent(escape(atob(raw))); } catch (e) { txt = raw; }
      var r = unpack(txt);
      return r ? r.state : null;
    },

    _resetBackendForTests: function () { LS = null; memory = {}; }
  };
})(globalThis.SYS = globalThis.SYS || {});
