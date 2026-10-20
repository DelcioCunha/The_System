/* ==========================================================
   CORPO: peso e calorias
   - O jogador regista o peso (e, se quiser, altura, idade, sexo e atividade).
   - O Sistema estima as calorias de manutenção e quanto comer para
     ganhar ou perder 1 kg, a um ritmo saudável.
   Base: 1 kg de massa corporal ≈ 7700 kcal. Gasto diário pela fórmula de
   Mifflin-St Jeor × fator de atividade; só com o peso, uma estimativa de
   ~31 kcal por kg. São estimativas: não substituem um profissional de saúde.
   ========================================================== */
(function (S) {
  'use strict';
  var E = S.engine;
  var KCAL_PER_KG = 7700;
  var ACT = {
    sedentario: { name: 'Sedentário', desc: 'pouco ou nenhum exercício', f: 1.2 },
    leve: { name: 'Leve', desc: 'exercício 1 a 3 dias por semana', f: 1.375 },
    moderado: { name: 'Moderado', desc: 'exercício 3 a 5 dias por semana', f: 1.55 },
    intenso: { name: 'Intenso', desc: 'exercício 6 a 7 dias por semana', f: 1.725 }
  };
  var B = S.body = { ACT: ACT, KCAL_PER_KG: KCAL_PER_KG };

  B.ensure = function (st) {
    if (!st.body) st.body = { weights: [], height: null, age: null, sex: null, activity: 'leve' };
    if (!Array.isArray(st.body.weights)) st.body.weights = [];
    return st.body;
  };
  B.current = function (st) { var w = B.ensure(st).weights; return w.length ? w[w.length - 1].kg : null; };
  B.first = function (st) { var w = B.ensure(st).weights; return w.length ? w[0].kg : null; };

  /* regista o peso de hoje (um registo por dia; o último do dia conta) */
  B.logWeight = function (kg) {
    var st = E.state, b = B.ensure(st);
    kg = Math.round(parseFloat(String(kg).replace(',', '.')) * 10) / 10;
    if (!(kg >= 25 && kg <= 350)) return { ok: false, msg: 'Escreve um peso entre 25 e 350 kg.' };
    var d = E.dateKey(), last = b.weights[b.weights.length - 1];
    if (last && last.d === d) last.kg = kg; else b.weights.push({ d: d, kg: kg });
    if (b.weights.length > 400) b.weights.splice(0, b.weights.length - 400);
    E.commit('peso');
    return { ok: true, msg: 'Peso registado: ' + String(kg).replace('.', ',') + ' kg.' };
  };
  B.setProfile = function (p) {
    var st = E.state, b = B.ensure(st);
    var h = parseInt(p.height, 10), a = parseInt(p.age, 10);
    if (p.height !== undefined) b.height = h >= 100 && h <= 250 ? h : null;
    if (p.age !== undefined) b.age = a >= 10 && a <= 100 ? a : null;
    if (p.sex !== undefined) b.sex = p.sex === 'm' || p.sex === 'f' ? p.sex : null;
    if (ACT[p.activity]) b.activity = p.activity;
    if (p.goal === 'ganhar' || p.goal === 'perder' || p.goal === 'manter') b.goal = p.goal;
    E.commit('perfil do corpo');
    return { ok: true, msg: 'Dados guardados.' };
  };
  /* guarda tudo de uma vez (peso de hoje + dados) */
  B.saveAll = function (p) {
    var st = E.state, hasKg = String(p.kg || '').trim() !== '';
    if (hasKg) { var r = B.logWeight(p.kg); if (!r.ok) return r; }
    B.setProfile(p);
    if (!hasKg && !B.current(st)) return { ok: false, msg: 'Escreve o teu peso para o Sistema poder calcular.' };
    return { ok: true, msg: hasKg ? 'Guardado: ' + String(B.current(st)).replace('.', ',') + ' kg e os teus dados.' : 'Dados guardados.' };
  };
  /* corrigir ou apagar um registo antigo */
  B.editEntry = function (d, kg) {
    var st = E.state, b = B.ensure(st), w = b.weights.filter(function (x) { return x.d === d; })[0];
    if (!w) return { ok: false, msg: 'Registo não encontrado.' };
    kg = Math.round(parseFloat(String(kg).replace(',', '.')) * 10) / 10;
    if (!(kg >= 25 && kg <= 350)) return { ok: false, msg: 'Escreve um peso entre 25 e 350 kg.' };
    w.kg = kg; E.commit('peso corrigido');
    return { ok: true, msg: 'Registo corrigido.' };
  };
  B.removeEntry = function (d) {
    var st = E.state, b = B.ensure(st), n = b.weights.length;
    b.weights = b.weights.filter(function (x) { return x.d !== d; });
    if (b.weights.length === n) return { ok: false, msg: 'Registo não encontrado.' };
    E.commit('peso apagado');
    return { ok: true, msg: 'Registo apagado.' };
  };
  /* avaliação semanal: compara o último registo com o registo de há ~7 dias */
  B.weekly = function (st) {
    var w = B.ensure(st).weights;
    if (w.length < 2) return null;
    var last = w[w.length - 1], t = Date.parse(last.d + 'T12:00:00'), ref = null;
    for (var i = w.length - 2; i >= 0; i--) { var dd = (t - Date.parse(w[i].d + 'T12:00:00')) / 86400000; if (dd >= 6) { ref = { e: w[i], days: Math.round(dd) }; break; } }
    if (!ref) { var f = w[0]; ref = { e: f, days: Math.max(1, Math.round((t - Date.parse(f.d + 'T12:00:00')) / 86400000)) }; }
    var diff = Math.round((last.kg - ref.e.kg) * 10) / 10, perWeek = Math.round(diff / ref.days * 7 * 100) / 100;
    var goal = B.ensure(st).goal || 'manter', verdict;
    if (goal === 'ganhar') verdict = perWeek >= 0.3 ? 'No ritmo certo para ganhar peso.' : perWeek > 0 ? 'A ganhar, mas devagar: come um pouco mais.' : 'Não estás a ganhar: aumenta as calorias.';
    else if (goal === 'perder') verdict = perWeek <= -0.3 ? 'No ritmo certo para perder peso.' : perWeek < 0 ? 'A perder, mas devagar: ajusta um pouco.' : 'Não estás a perder: reduz um pouco as calorias.';
    else verdict = Math.abs(perWeek) <= 0.3 ? 'Peso estável. Bom trabalho.' : perWeek > 0 ? 'Estás a subir de peso.' : 'Estás a descer de peso.';
    if (goal === 'ganhar' && perWeek > 1) verdict = 'A subir depressa demais: o ideal é cerca de 0,5 kg por semana.';
    if (goal === 'perder' && perWeek < -1) verdict = 'A descer depressa demais: o ideal é cerca de 0,5 kg por semana.';
    return { from: ref.e, to: last, days: ref.days, diff: diff, perWeek: perWeek, goal: goal, verdict: verdict };
  };

  /* contas */
  B.calc = function (st) {
    var b = B.ensure(st), kg = B.current(st);
    if (!kg) return null;
    var f = (ACT[b.activity] || ACT.leve).f, full = !!(b.height && b.age && b.sex), bmr = null, tdee;
    if (full) {
      bmr = 10 * kg + 6.25 * b.height - 5 * b.age + (b.sex === 'm' ? 5 : -161);
      tdee = bmr * f;
    } else tdee = kg * 31 * (f / 1.375); // estimativa só com o peso
    tdee = Math.round(tdee / 10) * 10;
    var daily = 500, days = Math.round(KCAL_PER_KG / daily); // ≈ 0,5 kg por semana
    var floor = b.sex === 'f' ? 1200 : 1500;
    var lose = Math.max(floor, tdee - daily), loseDays = Math.ceil(KCAL_PER_KG / Math.max(1, tdee - lose));
    var bmi = b.height ? Math.round(kg / Math.pow(b.height / 100, 2) * 10) / 10 : null;
    return {
      kg: kg, full: full, bmr: bmr && Math.round(bmr), tdee: tdee, kcalPerKg: KCAL_PER_KG,
      gain: { perDay: tdee + daily, extra: daily, days: days },
      lose: { perDay: lose, less: tdee - lose, days: loseDays, floored: lose === floor && tdee - daily < floor },
      bmi: bmi, change: Math.round((kg - B.first(st)) * 10) / 10
    };
  };
  B.bmiLabel = function (v) { return v < 18.5 ? 'abaixo do peso' : v < 25 ? 'peso normal' : v < 30 ? 'excesso de peso' : 'obesidade'; };
})(globalThis.SYS = globalThis.SYS || {});
