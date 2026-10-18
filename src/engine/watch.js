/* ==========================================================
   VIGILÂNCIA DO SISTEMA
   O Sistema lê o que o jogador escreve e observa como conclui as missões.
   Não bloqueia com tempos de espera: deteta o abuso e reage, com uma voz própria.

   1. Texto sem sentido ("yshsuahs", "asdasd", "teste") → a missão é recusada com um alerta.
   2. Criar e concluir em poucos minutos, repetidamente → recompensa reduzida, depois anulada.
   3. Integridade do jogador (0–100): desce com cada abuso, sobe com missões legítimas e a cada
      novo dia. Abaixo de 80, as recompensas das missões descem.
   ========================================================== */
(function (S) {
  'use strict';
  var W = S.watch = {};
  var E = S.engine;

  /* ---------- 1. Detetor de texto sem sentido ----------
     Modelo de pares de letras (bigramas) treinado com palavras reais em português e inglês,
     mais regras simples que apanham o que o modelo não vê. */
  var CORPUS = (
    // tarefas e rotina (português)
    'estudar ler livro livros pagina paginas capitulo treino treinar correr corrida caminhada caminhar andar beber agua copos litros ' +
    'comer almoco jantar pequeno almoco cozinhar refeicao dieta fruta legumes salada dormir acordar cedo cama arrumar quarto casa limpar ' +
    'lavar loica roupa estender passar aspirar varrer lixo despejar compras supermercado mercado pagar contas fatura banco poupar dinheiro ' +
    'trabalho trabalhar reuniao relatorio projeto tarefa entregar enviar responder emails mensagens ligar telefonar mae pai avo familia ' +
    'amigos namorada namorado filhos escola aula aulas faculdade universidade exame teste prova revisao rever resumo apontamentos matematica ' +
    'fisica quimica historia geografia portugues ingles frances espanhol alemao lingua idioma vocabulario gramatica escrever redacao texto ' +
    'artigo blog diario meditar meditacao respirar alongamentos alongar flexoes abdominais agachamentos prancha musculacao ginasio piscina ' +
    'nadar natacao bicicleta pedalar futebol basquete tenis boxe luta danca dancar yoga pilates corrida maratona quilometros minutos horas ' +
    'tomar banho duche dentes escovar fio dentario pele cuidado medicamento vitaminas consulta medico dentista marcar agendar organizar ' +
    'planear planeamento agenda semana mes objetivo objetivos meta metas habito habitos disciplina foco concentracao leitura escrita desenho ' +
    'desenhar pintar musica tocar guitarra piano violino cantar praticar pratica programar programacao codigo aplicacao site pagina curso ' +
    'tutorial video videos gravar editar fotografia fotos instagram publicar conteudo marketing vendas cliente clientes proposta orcamento ' +
    'contrato documentos papelada impostos carta correio encomenda levantar devolver jardim regar plantas flores cao gato passear animais ' +
    'alimentar veterinario carro lavar oficina gasolina viagem mala preparar arrumar secretaria computador telemovel desligar redes sociais ' +
    'sem acucar fruta pao cafe cha sumo leite ovos frango peixe arroz massa sopa feijao batata carne tomate cenoura banana maca laranja ' +
    'acabar terminar comecar continuar fazer ir vir ver ouvir falar pensar aprender ensinar ajudar visitar sair ficar trazer levar dar ' +
    'por tirar abrir fechar subir descer entrar escolher comprar vender ganhar perder pedir mandar procurar encontrar mudar tratar ' +
    'o a os as um uma de do da dos das em no na nos nas para por com sem sobre ate e ou mas que se meu minha teu tua seu sua nosso este ' +
    'esta isso isto aquele hoje amanha ontem manha tarde noite dia dias todo todos toda todas cada mais menos muito pouco bem mal novo nova ' +
    'primeiro segundo terceiro dez vinte trinta cem mil hora meia vez vezes semana fim ' +
    // inglês comum
    'study read book books page pages chapter workout train training run running walk walking drink water glasses eat lunch dinner ' +
    'breakfast cook meal sleep wake early bed clean room house wash dishes laundry groceries shopping pay bills work meeting report project ' +
    'task send reply email call mom dad family friends school class college exam test review notes math physics chemistry history english ' +
    'language write writing journal meditate meditation breathe stretch pushups squats plank gym swim bike football basketball tennis dance ' +
    'yoga pilates shower teeth brush skincare doctor appointment plan schedule week month goal goals habit focus reading drawing paint music ' +
    'guitar piano sing practice code coding programming app website course tutorial video record edit photo post content marketing sales ' +
    'client proposal budget contract garden water plants dog cat feed car trip pack computer phone social media the and for with without ' +
    'to of in on at my your this that today tomorrow morning afternoon night day every more less finish start keep learn help visit ' +
    // palavras estrangeiras frequentes em tarefas
    'workshop skincare crossfit netflix youtube spotify kindle duolingo linkedin github whatsapp tiktok facebook twitter online podcast ' +
    'backup check sprint deadline design freelance jogging stretching cardio pilates kickboxing sushi pizza hamburger gaming playstation xbox'
  ).split(/\s+/).filter(Boolean);
  var KNOWN = {};
  CORPUS.forEach(function (w) { KNOWN[w] = 1; });

  /* palavras que, sozinhas, não descrevem tarefa nenhuma */
  var FILLER = { teste: 1, test: 1, testar: 1, abc: 1, xpto: 1, nada: 1, missao: 1, tarefa: 1, coisa: 1, coisas: 1, algo: 1, qualquer: 1, aleatorio: 1,
    blabla: 1, bla: 1, ok: 1, sim: 1, nao: 1, xxx: 1, aaa: 1, asd: 1, lol: 1, kk: 1, hehe: 1, haha: 1, hahaha: 1, rsrs: 1, ola: 1, oi: 1, ta: 1, la: 1, xyz: 1 };

  var ALPHA = 'abcdefghijklmnopqrstuvwxyz^$';
  var LP = {};
  (function train() {
    var counts = {}, totals = {};
    CORPUS.forEach(function (w) {
      var t = '^' + w + '$';
      for (var i = 0; i < t.length - 1; i++) {
        var a = t[i], b = t[i + 1];
        counts[a + b] = (counts[a + b] || 0) + 1;
        totals[a] = (totals[a] || 0) + 1;
      }
    });
    for (var i = 0; i < ALPHA.length; i++) for (var j = 0; j < ALPHA.length; j++) {
      var a = ALPHA[i], b = ALPHA[j];
      LP[a + b] = Math.log(((counts[a + b] || 0) + 0.15) / ((totals[a] || 0) + 0.15 * ALPHA.length));
    }
  })();
  function plausibility(w) {
    var t = '^' + w + '$', s = 0, n = 0;
    for (var i = 0; i < t.length - 1; i++) { s += LP[t[i] + t[i + 1]] === undefined ? -8 : LP[t[i] + t[i + 1]]; n++; }
    return s / n;
  }
  function deaccent(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ç/g, 'c');
  }
  var ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890'];
  function keyboardRun(w) {
    for (var r = 0; r < ROWS.length; r++) {
      var row = ROWS[r], rev = row.split('').reverse().join('');
      for (var i = 0; i + 4 <= w.length; i++) { var q = w.slice(i, i + 4); if (row.indexOf(q) >= 0 || rev.indexOf(q) >= 0) return true; }
    }
    return false;
  }
  /* avalia uma palavra: devolve um motivo se parecer inventada, ou null */
  function badWord(raw, w) {
    if (KNOWN[w]) return null;
    if (w.length < 3) return null;
    if (/^[A-Z0-9]{2,6}$/.test(raw)) return null;                    // siglas: TCC, PDF, UX, IRS
    if (/(.)\1\1/.test(w)) return 'repetição';                         // kkkk, aaaa, hhh
    if (w.length >= 4 && !/[aeiou]/.test(w)) return 'sem vogais';     // ydsgd, sdfg
    if (keyboardRun(w)) return 'teclado';                              // qwer, asdf, hjkl
    var m = w.match(/^(.{2,3})\1+(.{0,2})$/);
    if (m && w.length >= 6) return 'sílabas repetidas';                // asdasd, jdjdjd, lalala
    if (/(yy|ww|kk|hh|jj|qq|xx|vv|zz)/.test(w)) return 'letras impossíveis';
    if (/[aeiou]h[^aeiouy]/.test(w)) return 'letras impossíveis';    // "ahs", "uhd": não existe em português
    if (/[^aeiouy]{5,}/.test(w)) return 'consoantes seguidas';
    var p = plausibility(w);
    if (p < -3.3) return 'letras sem padrão';
    return null;
  }
  /* Avalia o nome e a descrição de uma missão */
  W.judgeText = function (title, desc) {
    var full = String(title || '') + ' ' + String(desc || '');
    var raws = full.match(/[A-Za-zÀ-ÿ]+/g) || [];
    var words = raws.map(function (r) { return { raw: r, w: deaccent(r) }; });
    var titleWords = (String(title || '').match(/[A-Za-zÀ-ÿ]+/g) || []).map(deaccent).filter(function (w) { return w.length >= 2; });
    if (!titleWords.length) return { ok: false, kind: 'empty', word: String(title || '').trim() };
    if (titleWords.every(function (w) { return FILLER[w] || w.length < 3 && !KNOWN[w]; })) return { ok: false, kind: 'filler', word: String(title || '').trim() };
    var long = words.filter(function (x) { return x.w.length >= 3; });
    // peso de cada palavra estranha: regras fortes contam 1; só "letras sem padrão" conta 0,5;
    // um nome próprio (maiúscula a meio da frase) não conta
    var bad = [], weight = 0;
    long.forEach(function (x, i) {
      var why = badWord(x.raw, x.w);
      if (!why) return;
      var wgt = why === 'letras sem padrão' ? (i > 0 && /^[A-ZÀ-Ý]/.test(x.raw) ? 0 : 0.5) : 1;
      if (wgt) { bad.push({ x: x, why: why }); weight += wgt; }
    });
    var good = long.length - bad.length;
    var strong = bad.filter(function (b) { return b.why !== 'letras sem padrão'; })[0];
    if (strong) return { ok: false, kind: 'gibberish', word: strong.x.raw, why: strong.why };
    if (bad.length && weight >= Math.max(0.5, good * 0.75)) return { ok: false, kind: 'gibberish', word: bad[0].x.raw, why: bad[0].why };
    // descrição só com lixo, mesmo com bom nome
    var dWords = (String(desc || '').match(/[A-Za-zÀ-ÿ]+/g) || []).filter(function (r) { return r.length >= 3; });
    if (dWords.length >= 1) {
      var dBad = dWords.filter(function (r) { return badWord(r, deaccent(r)); });
      if (dBad.length > dWords.length / 2) return { ok: false, kind: 'gibberish', word: dBad[0], why: 'descrição' };
    }
    return { ok: true };
  };

  /* ---------- 2 e 3. Vigilância e integridade ---------- */
  S.WATCH = {
    quickMinutes: { E: 2, D: 3, C: 5, B: 8, A: 12, S: 15 }, // criar e concluir em menos do que isto é suspeito
    window: 24 * 3600000,                                    // os avisos contam durante 24 horas
    loss: { text: [10, 20, 30], quick: [5, 15, 25] },        // integridade perdida no 1.º, 2.º e 3.º+ abuso
    gain: { mission: 3, day: 10 },                           // integridade recuperada
    markHours: 24
  };
  W.ensure = function (st) {
    if (!st.watch) st.watch = { trust: 100, text: [], quick: [], lastDay: E.dateKey(), total: 0 };
    return st.watch;
  };
  function now() { return S.clock.now(); }
  function recent(list) { var t = now() - S.WATCH.window; return list.filter(function (x) { return x > t; }); }
  function hhmm(ts) { var d = new Date(ts); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); }
  function pick(list) { return list[Math.floor(S.rng.random() * list.length) % list.length]; }
  function fill(t, v) { return t.replace(/\{(\w+)\}/g, function (m, k) { return v[k] !== undefined ? v[k] : m; }); }
  function setTrust(st, val) { var w = W.ensure(st); w.trust = Math.max(0, Math.min(100, Math.round(val))); return w.trust; }

  W.trust = function (st) { return W.ensure(st).trust; };
  W.marked = function (st) { return E.hasEffect(st, 'marcado'); };
  W.trustFactor = function (trust) { return trust >= 80 ? 1 : trust >= 60 ? 0.8 : trust >= 40 ? 0.6 : trust >= 20 ? 0.4 : 0.25; };
  /* multiplicador das recompensas de missões (integridade × marca) */
  W.factor = function (st) { return W.trustFactor(W.trust(st)) * (W.marked(st) ? 0.5 : 1); };
  W.mood = function (st) {
    var t = W.trust(st);
    if (W.marked(st)) return { level: 'marked', text: 'Marcado. Cada movimento teu é registado.' };
    if (t >= 100) return { level: 'ok', text: 'Registo limpo. Por agora.' };
    if (t >= 80) return { level: 'ok', text: 'O Sistema está a observar.' };
    if (t >= 50) return { level: 'warn', text: 'Comportamento anómalo registado.' };
    if (t >= 20) return { level: 'bad', text: 'Cada registo teu é verificado duas vezes.' };
    return { level: 'bad', text: 'Os teus registos valem tanto como o teu esforço: nada.' };
  };
  function mark(st) {
    var until = now() + S.WATCH.markHours * 3600000;
    var ex = st.effects.filter(function (e) { return e.id === 'marcado'; })[0];
    if (ex) ex.until = Math.max(ex.until, until); else st.effects.push({ id: 'marcado', until: until });
  }

  /* Vozes do Sistema (variam para nunca soarem iguais) */
  var VOICE = {
    /* texto sem sentido: 1.º, 2.º e 3.º+ aviso. Cada variante: [título, linhas] */
    text: [
      [
        ['ISTO É RUÍDO', ['Isto não é uma missão, {nome}. É ruído.', 'Recusado.']],
        ['NÃO ZOMBES DO SISTEMA', ['«{texto}» não é uma missão.', 'Eu leio cada letra que escreves, {nome}.', 'Cria uma tarefa real. Uma que vás mesmo cumprir.']],
        ['PEDIDO NEGADO', ['«{texto}». Fascinante.', 'Tentaste enganar quem escreveu as regras.']],
        ['RECUSADO', ['Eu criei os portões, os chefes e o número ao lado do teu nome.', 'Achaste mesmo que «{texto}» me passava ao lado?']],
        ['ERRO DO JOGADOR', ['O Sistema não erra.', 'O erro é teu, e chama-se «{texto}».']]
      ],
      [
        ['OUTRA VEZ, {NOME}?', ['Às {hora} escreveste «{texto}».', 'Já te avisei uma vez. Não costumo avisar duas.']],
        ['INTERESSANTE', ['Segunda tentativa.', 'Tens a persistência de uma mosca contra um vidro.']],
        ['QUEM JOGA COM QUEM?', ['Tu não jogas com o Sistema, {nome}.', 'O Sistema é que joga contigo.']],
        ['SEGUNDO AVISO', ['Esperavas que eu estivesse distraído.', 'Eu sou o Sistema. Eu não pisco.']]
      ],
      [
        ['O SISTEMA NÃO ESQUECE', ['Tentativa número {n}. Todas registadas.', '«{texto}» foi a gota de água.']],
        ['ACABOU A PACIÊNCIA', ['{n} vezes, {nome}.', 'Eu tenho a eternidade. Tu tens um nível. Vamos ver quem perde primeiro.']],
        ['SENTENÇA DO SISTEMA', ['Tu existes neste Sistema porque eu permito.', 'Neste momento, permito menos.']],
        ['JULGADO', ['Já percebi o que estás a fazer.', 'Agora vais perceber o que eu faço.']]
      ]
    ],
    /* "teste", "tarefa", "123"… */
    filler: [
      ['UMA MISSÃO SEM PROPÓSITO', ['«{texto}» não diz nada.', 'O Sistema não recompensa o vazio.']],
      ['TESTE REGISTADO', ['Queres testar o Sistema, {nome}?', 'É o Sistema que te testa a ti. Todos os dias. Recusado.']],
      ['NADA', ['«{texto}». Uma palavra para não fazer coisa nenhuma.', 'Ao menos foste honesto. Recusado.']]
    ],
    /* criar e concluir depressa: 2.ª vez (metade) e 3.ª+ (anulada) */
    quick2: [
      ['ESTÁS A TESTAR-ME?', ['Criaste e concluíste «{texto}» em {min}.', 'Nem eu sou tão rápido. Recebes metade.']],
      ['RECORDE MUNDIAL', ['«{texto}», cumprida em {min}.', 'Parabéns. Ninguém acredita. Eu muito menos. Recebes metade.']],
      ['EU CONHEÇO ESTE RITMO', ['Criar, concluir. Criar, concluir.', 'Conheço o ritmo, {nome}. Fui eu que o inventei. Recebes metade.']]
    ],
    quick3: [
      ['NÃO ZOMBES DO SISTEMA', ['«{texto}»: criada e concluída em {min}.', 'Nenhuma tarefa real se cumpre assim. E tu sabes isso. Recompensa anulada.']],
      ['FALSIFICAÇÃO', ['Estás a tentar fabricar recompensas dentro da máquina que as fabrica.', 'Anulado.']],
      ['O SISTEMA NÃO ESQUECE', ['{n} missões relâmpago, {nome}.', 'Eu vi-te escrevê-las. Eu vi-te concluí-las. Anulado.']]
    ],
    /* 1.ª missão relâmpago: só uma linha no popup da missão */
    quick1: [
      'O Sistema registou: concluída {min} depois de criada.',
      'Foi rápido, {nome}. O Sistema anotou.',
      'Rápido. Suspeitamente rápido. Anotado.',
      'O relógio não mente, {nome}. Tu, talvez.'
    ],
    /* integridade volta aos 100% */
    restored: [
      ['REGISTO LIMPO', ['Integridade: 100%.', 'Não fiques orgulhoso. Fizeste apenas o mínimo exigido.']],
      ['REGISTO LIMPO', ['Integridade restabelecida.', 'Isto não é perdão, {nome}. É estatística.']]
    ]
  };
  function voice(variants, v) {
    var c = pick(variants);
    return { title: fill(c[0], v), lines: c[1].map(function (l) { return fill(l, v); }) };
  }
  /* ---------- Sentenças do Sistema: castigos variados ----------
     A gravidade depende do número de abusos nas últimas 24h e da integridade.
       2  → um castigo leve (moedas, XP ou bloqueio de missões)
       3  → Marca + um castigo pesado
       4+ → Marca + bloqueio longo + castigo pesado; com integridade muito baixa, perde um nível */
  var SENTENCE = {
    titles: {
      2: ['O SISTEMA COBRA', 'A CONTA CHEGOU', 'CASTIGO APLICADO'],
      3: ['SENTENÇA DO SISTEMA', 'JULGAMENTO', 'NÃO ZOMBES DO SISTEMA'],
      4: ['O SISTEMA NÃO PERDOA', 'CONDENADO', 'ÚLTIMO AVISO, {NOME}']
    },
    coins: [
      'Cobrei {valor} moedas. Considera isto a taxa por me fazeres perder tempo.',
      'Tinhas {antes} moedas. Agora tens {depois}. A matemática do Sistema é simples.',
      'Retirei {valor} moedas da tua bolsa. Não as vou gastar. Só não quero que as tenhas.',
      '-{valor} moedas. Fui eu que as inventei. Posso desinventá-las.',
      '{valor} moedas confiscadas. A loja agradece a tua generosidade involuntária.'
    ],
    xp: [
      'Apaguei {valor} XP. Não vais sentir a falta: nunca foram teus.',
      '-{valor} XP. O caminho até ao próximo nível acabou de ficar mais comprido.',
      'Devolve-me {valor} XP, {nome}. Obrigado.',
      '{valor} XP removidos. Eu dou, eu tiro. É assim que funciona.'
    ],
    level: [
      'Nível {de} → {para}. Há subidas que não se merecem.',
      'Desceste para o nível {para}. O título que tinhas era grande demais para ti.',
      'Nível {para}. O número ao lado do teu nome é meu. Só o empresto a quem o merece.',
      'Retirei-te um nível. Volta a subir, desta vez com as tuas próprias pernas.'
    ],
    ban: [
      'Fechei-te o quadro de missões até às {ate}. Quem não sabe criar tarefas, não cria tarefas.',
      'As próximas {horas} pertencem-me. Nada de missões novas.',
      'Missões novas suspensas durante {horas}. Vai olhar para o teto. É a tarefa mais honesta que te resta.',
      'O quadro de missões abre às {ate}. Ou quando eu quiser. Que é a mesma coisa.'
    ],
    mark: [
      'Marcado durante 24 horas. As tuas recompensas valem metade. Tal como a tua palavra.',
      'Agora tens a minha marca. Todos os portões sabem o que fizeste.',
      'Fica com a minha marca até amanhã. Considera-a uma assinatura. A minha.'
    ],
    closing: [
      'Continua. Eu tenho todo o tempo do mundo.',
      'O Sistema não se cansa, {nome}. Tu vais cansar-te primeiro.',
      'Eu estava à espera disto. Tu és previsível.',
      'Lembra-te: tu jogas. Eu sou o jogo.',
      'Podes fechar a app. Eu continuo aqui.',
      'Não é pessoal, {nome}. Tu não és importante o suficiente para isso.',
      'Da próxima vez, serei menos simpático.'
    ],
    banned: [
      'O quadro de missões está fechado para ti até às {ate}.',
      '«Nova missão»? Não, {nome}. Ainda faltam {resta}.',
      'Bateste a uma porta trancada. Abre às {ate}. Se eu quiser.',
      'Insistir não acelera o relógio. Faltam {resta}.'
    ]
  };
  function durText(h) { return h === 1 ? '1 hora' : h + ' horas'; }
  function leftText(ms) { var m = Math.ceil(ms / 60000); return m >= 60 ? Math.floor(m / 60) + ' h ' + (m % 60) + ' min' : m + ' min'; }
  W.severity = function (st, lvl) { var t = W.trust(st); return lvl + (t < 40 ? 1 : 0) + (t < 15 ? 1 : 0); };
  W.banLeft = function (st) { var w = W.ensure(st); return w.banUntil && w.banUntil > now() ? w.banUntil - now() : 0; };
  function pickKind(w, kinds) {
    var opts = kinds.filter(function (k) { return k !== w.lastKind; });
    var k = pick(opts.length ? opts : kinds);
    w.lastKind = k;
    return k;
  }
  /* aplica os castigos e devolve as linhas que o Sistema diz */
  W.sentence = function (st, sev) {
    var w = W.ensure(st), out = [], heavy = sev >= 3, v = vars(st);
    if (sev < 2) return out;
    function apply(kind) {
      var val, line;
      if (kind === 'coins') {
        var before = st.coins;
        val = E.loseCoins(st, Math.max(10, st.coins * (heavy ? 0.25 : 0.1)));
        if (!val) return apply('xp');
        line = fill(pick(SENTENCE.coins), Object.assign({}, v, { valor: val, antes: before, depois: st.coins }));
        E.history(st, '👁️', 'Sentença do Sistema: -' + val + ' moedas.');
      } else if (kind === 'xp') {
        val = E.loseXp(st, S.xpToNext(st.level) * (heavy ? 0.6 : 0.3));
        if (!val) return apply('ban');
        line = fill(pick(SENTENCE.xp), Object.assign({}, v, { valor: val }));
        E.history(st, '👁️', 'Sentença do Sistema: -' + val + ' XP.');
      } else if (kind === 'level') {
        if (st.level <= 1) return apply('ban');
        var lv = E.loseLevel(st);
        line = fill(pick(SENTENCE.level), Object.assign({}, v, { de: lv.from, para: lv.to }));
        E.history(st, '👁️', 'Sentença do Sistema: desceu do nível ' + lv.from + ' para o ' + lv.to + '.');
      } else if (kind === 'ban') {
        var h = Math.max(1, Math.min(12, Math.ceil((100 - w.trust) / 10)));
        h = heavy ? Math.min(12, h + 2) : Math.max(1, Math.round(h / 2));
        w.banUntil = Math.max(w.banUntil || 0, now() + h * 3600000);
        line = fill(pick(SENTENCE.ban), Object.assign({}, v, { horas: durText(h), ate: hhmm(w.banUntil) }));
        E.history(st, '👁️', 'Sentença do Sistema: proibido de criar missões até às ' + hhmm(w.banUntil) + '.');
      } else if (kind === 'mark') {
        mark(st);
        line = fill(pick(SENTENCE.mark), v);
        E.history(st, '👁️', 'Sentença do Sistema: marcado durante 24 horas.');
      }
      out.push({ kind: kind, line: line });
    }
    if (sev === 2) apply(pickKind(w, ['coins', 'xp', 'ban']));
    else if (sev === 3) { apply('mark'); apply(pickKind(w, ['coins', 'xp', 'ban'])); }
    else {
      apply('mark'); apply('ban');
      var lose = (sev >= 5 || w.trust < 15) && st.level > 1;
      apply(lose ? 'level' : pickKind(w, ['coins', 'xp']));
    }
    w.sentences = (w.sentences || 0) + 1;
    return out;
  };
  W.sentenceTitle = function (st, sev) {
    var v = vars(st);
    return fill(pick(SENTENCE.titles[Math.min(4, Math.max(2, sev))]), v);
  };
  W.closing = function (st) {
    var w = W.ensure(st), opts = SENTENCE.closing.filter(function (c) { return c !== w.lastClosing; });
    w.lastClosing = pick(opts);
    return fill(w.lastClosing, vars(st));
  };
  /* tentar criar uma missão durante o bloqueio */
  W.bannedVoice = function (st) {
    var w = W.ensure(st), v = vars(st, { ate: hhmm(w.banUntil), resta: leftText(W.banLeft(st)) });
    return { title: 'QUADRO DE MISSÕES FECHADO', lines: [fill(pick(SENTENCE.banned), v), 'Integridade: ' + w.trust + '%.'] };
  };

  function vars(st, extra) {
    var v = { nome: st.name, NOME: String(st.name).toUpperCase(), hora: hhmm(now()), dia: S.time ? S.time.systemDay(st) : 1, trust: W.trust(st) };
    Object.keys(extra || {}).forEach(function (k) { v[k] = extra[k]; });
    return v;
  }
  function minText(ms) { var m = Math.round(ms / 60000); return m < 1 ? 'menos de 1 minuto' : (m === 1 ? '1 minuto' : m + ' minutos'); }

  /* Texto sem sentido numa missão: recusa, avisa e regista */
  W.onBadText = function (st, verdict) {
    var w = W.ensure(st);
    w.text = recent(w.text); w.text.push(now()); w.total++;
    var n = w.text.length, lvl = Math.min(3, n);
    setTrust(st, w.trust - S.WATCH.loss.text[lvl - 1]);
    var v = vars(st, { texto: String(verdict.word || '').slice(0, 30), n: n, janela: 'menos de 24 horas' });
    var said = verdict.kind === 'filler' && lvl === 1 ? voice(VOICE.filler, v) : voice(VOICE.text[lvl - 1], v);
    var sev = lvl >= 2 ? W.severity(st, lvl) : 1;
    var punished = W.sentence(st, sev);
    var lines = said.lines.concat(punished.map(function (p) { return p.line; }));
    if (punished.length) lines.push(W.closing(st));
    E.emit({ type: 'watch', level: Math.min(3, sev), title: said.title, lines: lines, sentence: punished.map(function (p) { return p.kind; }) });
    E.history(st, '👁️', 'O Sistema recusou a missão «' + v.texto + '» (aviso ' + n + ').');
    return { ok: false, watch: true, msg: said.title.charAt(0) + said.title.slice(1).toLowerCase() + '. ' + said.lines[0] };
  };

  /* Missão concluída: foi rápida demais? devolve o multiplicador e o que dizer */
  W.onComplete = function (st, m, elapsed) {
    var w = W.ensure(st);
    var limit = (S.WATCH.quickMinutes[m.difficulty] || 5) * 60000;
    if (elapsed === null || elapsed >= limit) {
      var before = w.trust;
      setTrust(st, w.trust + S.WATCH.gain.mission);
      if (before < 100 && w.trust >= 100 && !W.marked(st)) {
        var tb = voice(VOICE.restored, vars(st));
        E.emit({ type: 'watch', level: 0, good: true, title: tb.title, lines: tb.lines });
      }
      return { level: 0, factor: 1 };
    }
    w.quick = recent(w.quick); w.quick.push(now()); w.total++;
    var n = w.quick.length, lvl = Math.min(3, n);
    setTrust(st, w.trust - S.WATCH.loss.quick[lvl - 1]);
    var v = vars(st, { texto: m.title.slice(0, 40), min: minText(elapsed), n: n });
    if (lvl === 1) return { level: 1, factor: 1, line: fill(pick(VOICE.quick1), v) };
    var sev = W.severity(st, lvl);
    var said = voice(lvl === 2 ? VOICE.quick2 : VOICE.quick3, v);
    var punished = W.sentence(st, sev);
    var lines = said.lines.concat(punished.map(function (p) { return p.line; }));
    lines.push(W.closing(st));
    var ev = { title: sev >= 3 && lvl === 2 ? W.sentenceTitle(st, sev) : said.title, lines: lines, sentence: punished.map(function (p) { return p.kind; }) };
    if (lvl === 2) return { level: 2, factor: 0.5, event: ev, sev: sev };
    return { level: 3, factor: 0, penalty: true, event: ev, sev: sev, vars: v };
  };

  /* Novo dia: a integridade recupera um pouco */
  W.newDay = function (st) {
    var w = W.ensure(st), t = E.dateKey();
    if (w.lastDay === t) return false;
    w.lastDay = t;
    setTrust(st, w.trust + S.WATCH.gain.day);
    return true;
  };

  W._plausibility = function (w) { return plausibility(deaccent(w)); };
  W._badWord = function (w) { return badWord(w, deaccent(w)); };
})(globalThis.SYS = globalThis.SYS || {});
