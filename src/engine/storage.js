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

  /* ---------- Compressão (LZW sobre UTF-8) + texto seguro (base64url) ----------
     Reduz o código de transferência a uma fração do tamanho e usa só letras, números, "-" e "_",
     para não ser alterado por apps de mensagens. */
  var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  function utf8(str) {
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) { var c2 = str.charCodeAt(i + 1); if (c2 >= 0xdc00 && c2 <= 0xdfff) { c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00); i++; } }
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return out;
  }
  function fromUtf8(b) {
    var s = '', i = 0;
    while (i < b.length) {
      var c = b[i++];
      if (c >= 0xf0) c = ((c & 7) << 18) | ((b[i++] & 63) << 12) | ((b[i++] & 63) << 6) | (b[i++] & 63);
      else if (c >= 0xe0) c = ((c & 15) << 12) | ((b[i++] & 63) << 6) | (b[i++] & 63);
      else if (c >= 0xc0) c = ((c & 31) << 6) | (b[i++] & 63);
      if (c > 0xffff) { c -= 0x10000; s += String.fromCharCode(0xd800 + (c >> 10), 0xdc00 + (c & 1023)); } else s += String.fromCharCode(c);
    }
    return s;
  }
  function widthFor(k) { var n = 255 + k, w = 0; while (n > 0) { w++; n >>= 1; } return Math.min(16, Math.max(9, w)); }
  function compress(str) {
    var bytes = utf8(str), dict = new Map(), next = 256, out = '', acc = 0, nbits = 0, k = 0;
    function emit(code) {
      var w = widthFor(k++);
      for (var b = w - 1; b >= 0; b--) {
        acc = (acc << 1) | ((code >> b) & 1); nbits++;
        if (nbits === 6) { out += B64[acc]; acc = 0; nbits = 0; }
      }
    }
    if (!bytes.length) return '';
    var cur = bytes[0];
    for (var i = 1; i < bytes.length; i++) {
      var key = cur * 256 + bytes[i];
      var hit = dict.get(key);
      if (hit !== undefined) { cur = hit; continue; }
      emit(cur);
      if (next < 65536) dict.set(key, next++);
      cur = bytes[i];
    }
    emit(cur);
    if (nbits) out += B64[acc << (6 - nbits)];
    return out;
  }
  function decompress(txt) {
    var bits = [], i, j;
    for (i = 0; i < txt.length; i++) {
      var v = B64.indexOf(txt[i]);
      if (v < 0) throw new Error('carácter inválido');
      for (j = 5; j >= 0; j--) bits.push((v >> j) & 1);
    }
    var pos = 0, k = 0;
    function read() {
      var w = widthFor(k);
      if (pos + w > bits.length) return -1;
      var c = 0;
      for (var b = 0; b < w; b++) c = (c << 1) | bits[pos++];
      k++;
      return c;
    }
    var dict = [];
    for (i = 0; i < 256; i++) dict.push([i]);
    var first = read();
    if (first < 0) return '';
    if (first > 255) throw new Error('código inválido');
    var prev = dict[first], out = prev.slice();
    while (true) {
      var code = read();
      if (code < 0) break;
      var entry;
      if (code < dict.length) entry = dict[code];
      else if (code === dict.length) entry = prev.concat([prev[0]]);
      else throw new Error('código inválido');
      for (i = 0; i < entry.length; i++) out.push(entry[i]);
      if (dict.length < 65536) dict.push(prev.concat([entry[0]]));
      prev = entry;
    }
    return fromUtf8(out);
  }

  /* ---------- Código de transferência ----------
     Formato: SISTEMA2-<dados comprimidos>-<assinatura 8 hex>
     A assinatura deteta qualquer carácter em falta ou trocado (ex.: mensagem cortada). */
  var TR_PREFIX = 'SISTEMA2-';
  var MOVED = 'sistema.moved.v1';
  var USED = 'sistema.transfers.used.v1';
  function slimState(state) {
    var st = JSON.parse(JSON.stringify(state));
    st.history = (st.history || []).slice(0, 25);
    // o registo de missões só precisa das últimas semanas (sequências e prazos)
    var limit = state.meta && state.meta.savedAt ? state.meta.savedAt - 40 * 86400000 : 0;
    Object.keys(st.missionLog || {}).forEach(function (k) {
      var e = st.missionLog[k];
      if (e && e.at && e.at < limit) delete st.missionLog[k];
    });
    return st;
  }
  function encodeTransfer(state, meta) {
    var body = JSON.stringify({ k: 'transfer', v: S.SAVE_SCHEMA, id: meta.id, at: meta.at, s: slimState(state) });
    var data = compress(body);
    return TR_PREFIX + data + '-' + hash(data);
  }
  function normalizeCode(code) {
    var t = String(code || '').replace(/[\s​-‍﻿"'`«»]/g, '');
    var i = t.indexOf(TR_PREFIX);
    return i >= 0 ? t.slice(i) : t;
  }
  function decodeTransfer(code) {
    var t = normalizeCode(code);
    if (t.indexOf(TR_PREFIX) !== 0) return null;
    var rest = t.slice(TR_PREFIX.length), cut = rest.lastIndexOf('-');
    if (cut < 0) return { error: 'incomplete' };
    var data = rest.slice(0, cut), sig = rest.slice(cut + 1, cut + 9);
    if (!/^[0-9a-f]{8}$/.test(sig) || hash(data) !== sig) return { error: 'incomplete' };
    try {
      var o = JSON.parse(decompress(data));
      if (!o || o.k !== 'transfer' || !o.s || !o.s.cls || !o.s.name) return { error: 'invalid' };
      return { id: o.id, at: o.at, state: o.s };
    } catch (e) { return { error: 'invalid' }; }
  }

  S.storage = {
    compress: compress,
    decompress: decompress,
    encodeTransfer: encodeTransfer,
    decodeTransfer: decodeTransfer,
    normalizeCode: normalizeCode,
    /* conta transferida para outro aparelho: este aparelho fica sem conta */
    setMoved: function (rec) { try { backend().setItem(MOVED, JSON.stringify(rec)); } catch (e) { /* ignora */ } var np = nativePrefs(); if (np) { try { np.set({ key: MOVED, value: JSON.stringify(rec) }); } catch (e) { /* ignora */ } } },
    getMoved: function () { try { return JSON.parse(backend().getItem(MOVED) || 'null'); } catch (e) { return null; } },
    clearMoved: function () { try { backend().removeItem(MOVED); } catch (e) { /* ignora */ } var np = nativePrefs(); if (np) { try { np.remove({ key: MOVED }); } catch (e) { /* ignora */ } } },
    loadNativeMoved: function () {
      var np = nativePrefs();
      if (!np) return Promise.resolve(null);
      return np.get({ key: MOVED }).then(function (r) { try { return JSON.parse(r && r.value || 'null'); } catch (e) { return null; } }).catch(function () { return null; });
    },
    /* códigos já usados (ou criados) neste aparelho: não podem ser usados aqui outra vez */
    usedTransfers: function () { try { return JSON.parse(backend().getItem(USED) || '[]'); } catch (e) { return []; } },
    markTransferUsed: function (id) {
      var l = this.usedTransfers();
      if (l.indexOf(id) < 0) l.push(id);
      try { backend().setItem(USED, JSON.stringify(l.slice(-200))); } catch (e) { /* ignora */ }
      var np = nativePrefs();
      if (np) { try { np.set({ key: USED, value: JSON.stringify(l.slice(-200)) }); } catch (e) { /* ignora */ } }
    },

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
      var raw = String(code || '').replace(/\s+/g, '');
      var txt = raw;
      try { txt = decodeURIComponent(escape(atob(raw))); } catch (e) { txt = raw; }
      var r = unpack(txt);
      return r ? r.state : null;
    },

    _resetBackendForTests: function () { LS = null; memory = {}; }
  };
})(globalThis.SYS = globalThis.SYS || {});
