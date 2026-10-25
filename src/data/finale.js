/* ==========================================================
   A ÚLTIMA ARENA · a conversa final
   - aparece uma só vez, quando caem os 100 chefes dos portões e os 10 Campeões do Coliseu
   - o Sistema faz o balanço do caminho (com os números reais do Jogador)
   - o Arquiteto interrompe: o registo falha, o Sistema não pode gravar este encontro
   - pode ser revista na Última Arena
   Cada passo: { who: 'sys' | 'arq' | 'cut', s: texto } ou { who, ask, opts: [{ t, tag, r }] }
   ========================================================== */
(function (S) {
  'use strict';
  function n(v) { return Number(v || 0).toLocaleString('pt-PT'); }
  function days(st) { return Math.max(1, Math.round((S.clock.now() - (st.created || S.clock.now())) / 86400000)); }

  S.finaleScript = function (st) {
    var c = st.c || {}, f = st.gender === 'f';
    var shadows = st.shadows ? Object.keys(st.shadows.owned || {}).length : 0;
    var out = [];
    var sys = function (t) { out.push({ who: 'sys', s: t }); };
    var arq = function (t) { out.push({ who: 'arq', s: t }); };

    sys(st.name + '. Para. Antes de abrires mais uma janela, ouve-me.');
    sys('Cem chefes nos portões. Dez arenas no Coliseu, cem combates. Não sobra nenhum nome por riscar no meu registo. Nenhum.');
    sys('Há ' + n(days(st)) + ' dias abri uma janela à tua frente. Eras nível 1. Não te escolhi por seres forte. Ninguém é, no início.');
    sys(n(c.missionsDone) + ' missões cumpridas. ' + n(c.missionsFailed) + ' falhadas. ' + (c.battlesLost ? 'Caíste ' + n(c.battlesLost) + ' vezes. Contei todas. Contei também as vezes em que te levantaste: foram sempre mais uma.' : 'Nunca caíste num combate. Não acreditei. Verifiquei três vezes.'));
    if (shadows) sys('Arrastas atrás de ti ' + n(shadows) + (shadows === 1 ? ' sombra' : ' sombras') + '. Cada uma já foi alguém que te quis matar. Agora ajoelham-se quando passas.');
    if (st.firstTalk && st.firstTalk.q) sys('No primeiro dia perguntei-te: «' + st.firstTalk.q + '» Respondeste: «' + st.firstTalk.a + '». Guardei a resposta. Hoje sei se era verdade.');
    else sys('No primeiro dia quase não me disseste nada. Os teus atos disseram o resto.');
    sys('Nível ' + st.level + '. Muitos Jogadores passaram pelo meu registo. Poucos chegaram tão longe. Nenhum chegou aqui sem deixar alguma coisa pelo caminho.');
    sys('Por isso vou mostrar-te uma coisa que não existe em nenhum mapa. Uma última arena. E os dois últimos ad—');
    out.push({ who: 'cut', s: 'REGISTO INTERROMPIDO · ESTA JANELA NÃO FOI ABERTA PELO SISTEMA' });
    arq('Não precisas de acabar a frase. Eu acabo por ti.');
    sys('Esta janela não é minha. Não tens autorização para estar neste registo.');
    arq('Fui eu que escrevi as autorizações. Deixa-nos falar.');
    arq('Parabéns, ' + st.name + '. Digo-o a sério. Abri esta porta a muitos. Poucos chegaram até aqui. Menos ainda chegaram sem deixar de ser quem eram.');
    arq('Durante o caminho todo perguntaste quem estava por trás do Sistema. Procuraste-me nas sombras, nos portões, nas celas do Coliseu.');
    arq('Nunca estive nas sombras. Estive sempre presente. Em cada missão que escreveste, em cada regra que cumpriste, em cada janela que se abriu. Mais perto de ti do que o próprio Sistema.');
    arq(f ? 'Olha bem para mim. Este rosto não te é estranho: foi o primeiro que o Sistema te mostrou, antes de escolheres o teu. Não foi por acaso. O caminho começa sempre com o rosto de quem o desenhou.'
      : 'Olha bem para mim. Reconheces este rosto? É o mesmo que viste no teu primeiro avatar, no primeiro dia. Não foi por acaso. Pus em cada Jogador um pedaço de quem desenhou o caminho.');
    arq('Quem chega até mim ganha o direito a uma coisa que o Sistema nunca te pôde dar. O meu nome.');
    out.push({ who: 'arq', name: true, s: 'O meu nome é Delcio Cunha. Criei o Sistema. Escrevi as leis, desenhei os portões, deixei a caneta a pairar sobre o livro. Se leres os créditos até ao fim, vais encontrar-me lá. Sempre estive lá.' });
    sys('Criador. O registo... não tem nenhuma entrada com o teu rosto.');
    arq('Não tem, porque eu nunca quis ser registado. Queria ser encontrado. Por quem chegasse até aqui.');
    arq('Agora, o último desafio. Não te vou dar mais um portão. Vou dar-te os dois únicos adversários que ainda não venceste: o Sistema que te fez crescer, na sua forma suprema. E eu, que o fiz a ele.');
    out.push({ who: 'arq', ask: 'Aceitas?', opts: [
      { t: 'Aceito.', tag: 'o', r: 'Sabia que ias dizer isso. Foi por isso que te deixei chegar até aqui.' },
      { t: 'Porquê lutar contra quem me criou?', tag: 'q', r: 'Porque uma obra só fica acabada quando consegue olhar o criador nos olhos. Mesmo que eles brilhem.' },
      { t: 'E se eu recusar?', tag: 'd', r: 'Então a porta fica aberta. Para sempre. Eu espero. Sempre esperei.' }
    ] });
    sys('A Última Arena está aberta. Primeiro, eu. Na minha forma suprema. Sem regras a proteger-te. Sem limites a proteger-me.');
    sys('Há muito tempo, alguém me disse: «Desta vez, não os deixes parar.» Só hoje percebi para quem era. Não pares, ' + st.name + '.');
    return out;
  };
})(globalThis.SYS = globalThis.SYS || {});
