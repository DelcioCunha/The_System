/* ==========================================================
   RELÓGIO DO SISTEMA
   - Usa a hora do telemóvel do jogador.
   - Funciona em segundo plano desde o Despertar: conta os dias,
     guarda a hora mais avançada já vista e deteta quando o relógio
     do telemóvel é atrasado (para não se poder "voltar atrás no tempo").
   - Define as fases do dia, usadas por itens, acessórios e chefes.
   ========================================================== */
(function (S) {
  'use strict';
  var T = S.time = {};
  var TOLERANCE = 10 * 60 * 1000; // 10 minutos de margem para acertos de relógio

  /* Fases (hora local do telemóvel) */
  T.PHASES = {
    dia: { name: 'Dia', icon: '☀️', desc: 'das 06:00 às 17:59' },
    noite: { name: 'Noite', icon: '🌙', desc: 'das 18:00 às 05:59' },
    manha: { name: 'Manhã', icon: '🌅', desc: 'das 05:00 às 11:59' },
    crepusculo: { name: 'Crepúsculo', icon: '🌇', desc: 'das 18:00 às 20:59' },
    horaMorta: { name: 'Hora Morta', icon: '🕯️', desc: 'da 00:00 às 02:59' }
  };

  T.hour = function (ts) { return new Date(ts == null ? S.clock.now() : ts).getHours(); };
  T.is = function (phase, ts) {
    var h = T.hour(ts);
    switch (phase) {
      case 'dia': return h >= 6 && h < 18;
      case 'noite': return h >= 18 || h < 6;
      case 'manha': return h >= 5 && h < 12;
      case 'crepusculo': return h >= 18 && h < 21;
      case 'horaMorta': return h >= 0 && h < 3;
      default: return true;
    }
  };
  T.main = function (ts) { return T.is('dia', ts) ? 'dia' : 'noite'; };
  T.label = function (phase) { var p = T.PHASES[phase]; return p ? p.icon + ' ' + p.name : ''; };
  /* Fase especial a mostrar no topo (a mais específica) */
  T.current = function (ts) {
    if (T.is('horaMorta', ts)) return 'horaMorta';
    if (T.is('crepusculo', ts)) return 'crepusculo';
    if (T.is('manha', ts) && !T.is('dia', ts)) return 'manha';
    return T.main(ts);
  };

  /* ---------- relógio interno (oculto) ---------- */
  T.ensure = function (st) {
    if (!st.sysClock) st.sysClock = { first: st.created || S.clock.now(), maxSeen: S.clock.now(), anomalies: 0, lastAnomaly: 0 };
    return st.sysClock;
  };
  /* Chamado a cada verificação: avança a hora máxima ou regista anomalia */
  T.observe = function (st) {
    var c = T.ensure(st), now = S.clock.now();
    if (now > c.maxSeen) { c.maxSeen = now; return false; }
    if (now < c.maxSeen - TOLERANCE) {
      if (!c.lastAnomaly || now > c.lastAnomaly + 60000 || now < c.lastAnomaly - 60000) {
        c.anomalies += 1; c.lastAnomaly = now;
        return true;
      }
    }
    return false;
  };
  /* Verdadeiro enquanto o relógio do telemóvel estiver atrasado em relação ao que o Sistema já viu */
  T.tampered = function (st) {
    var c = T.ensure(st);
    return S.clock.now() < c.maxSeen - TOLERANCE;
  };
  /* Dia do Sistema: 1 no dia do Despertar */
  T.systemDay = function (st) {
    var c = T.ensure(st);
    var a = new Date(c.first); a.setHours(0, 0, 0, 0);
    var b = new Date(Math.max(S.clock.now(), c.maxSeen)); b.setHours(0, 0, 0, 0);
    return Math.round((b - a) / 86400000) + 1;
  };

  /* ---------- condições de horário dos itens ---------- */
  T.itemActive = function (it) { return !it || !it.phase || T.is(it.phase); };
  T.itemTag = function (it) { return it && it.phase ? T.label(it.phase) + ' (' + T.PHASES[it.phase].desc + ')' : ''; };

  /* Chefes que ficam mais fortes (e dão mais recompensas) em certas fases */
  T.BOSS_PHASES = { 1: 'noite', 9: 'noite', 4: 'dia', 8: 'dia' };
  T.bossEmpowered = function (b) { var ph = T.BOSS_PHASES[b.gate]; return ph && T.is(ph) ? ph : null; };
})(globalThis.SYS = globalThis.SYS || {});
