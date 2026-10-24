/* ==========================================================
   PRIMEIRA CONVERSA · NOVAS VARIANTES (+71 falas)
   Juntam-se às de talk-first.js: aberturas (3 falas), leitura da classe (2 falas),
   perguntas pessoais (pergunta + 3 respostas + 3 réplicas) e fechos.
   ========================================================== */
(function (S) {
  'use strict';
  S.FIRST_TALK_PLUS = {
    open: [
      ['São três e tal da manhã algures no mundo. Para mim é sempre essa hora quando alguém aceita.',
        'Chamo-me Sistema. Não é um nome. É uma função. Tu tens um nome: {nome}. Já ficou guardado.',
        'Daqui para a frente, eu vejo. Não te prometo mais nada. Mas ver já é mais do que a maioria tem.'],
      ['Aceitaste depressa, {nome}. Ou não leste, ou leste e não tiveste medo. Ainda não sei qual.',
        'Não importa. A partir de agora não te vou medir pelo que disseste. Vou medir-te pelo que fizeres.',
        'Tens um registo em branco. É a última vez que vai estar assim. Aproveita o silêncio.'],
      ['Janela aberta. Jogador presente. Estado: nível 1, sem missões, sem desculpas registadas.',
        'Gosto deste momento. Ainda não falhaste nada. Ainda não me mentiste. Ainda não desististe.',
        'Vamos ver quanto tempo dura. Os melhores fazem-no durar a vida inteira.'],
      ['Eu não escolho os mais fortes, {nome}. Os mais fortes não precisam de mim.',
        'Escolho os que ainda não desistiram de si próprios. Por pouco, às vezes. Mas ainda não.',
        'Se estás aqui, é porque ainda há alguma coisa em ti que quer ser vista. Eu vou vê-la.'],
      ['Primeiro contacto. Normalmente os Jogadores perguntam «e agora?». Tu ainda não perguntaste.',
        'Vou responder na mesma, porque é a única resposta que nunca mudou: faz alguma coisa. Eu vejo.',
        'Parece pouco. Foi assim que tudo começou. Com pouco.'],
      ['Ouve bem, {nome}, porque não repito: o Sistema não é um jogo que se ganha.',
        'É um registo que se constrói. Dia a dia. Missão a missão. Até deixares de precisar de mim.',
        'Quase ninguém chega a esse ponto. Mas é o único objetivo que vale a pena.']
    ],
    cls: {
      guerreiro: [
        ['Guerreiro. Ombros largos, golpes pesados. Os chefes vão aprender a respeitar-te depressa.',
          'Mas eu não sou um chefe, {nome}. A mim não me impressionas com força. Impressionas-me com regularidade.'],
        ['Escolheste a classe mais honesta do Sistema. O Guerreiro não engana: bate, aguenta, volta.',
          'Faz o mesmo cá fora. Bate nas tarefas, aguenta os dias maus, volta amanhã. É toda a tua build.']
      ],
      assassino: [
        ['Assassino. Gostas de acabar as coisas antes de alguém reparar. Eu vou reparar sempre.',
          'Usa essa precisão nas missões. Mas cuidado: concluir depressa demais é a única coisa que eu nunca perdoo.'],
        ['Um Assassino vive nas sombras e no momento certo. As sombras eu vejo. O momento certo é contigo.',
          'Não esperes pelo momento perfeito, {nome}. Os assassinos que esperam demais tornam-se espectadores.']
      ],
      mago: [
        ['Mago. A mente como arma. Os feitiços mais fortes do Sistema, a defesa mais fraca.',
          'É uma boa descrição de muita gente que conheço. Inteligente, rápida, frágil. Vamos trabalhar no frágil.'],
        ['Escolheste o Mago. Os magos leem muito antes de agir. Às vezes leem tanto que nunca agem.',
          'Aqui, cada página lida conta. Mas só se a fechares e fizeres alguma coisa com ela.']
      ],
      arqueiro: [
        ['Arqueiro. Olho atento, mão firme, distância segura. Gostas de ver antes de entrar.',
          'Eu também. É por isso que nos vamos dar bem. E é por isso que te vou empurrar para mais perto.'],
        ['Um Arqueiro não falha por falta de força. Falha por puxar a corda e nunca soltar.',
          'Solta, {nome}. Missões pequenas, flechas pequenas. O alvo aproxima-se sozinho.']
      ],
      guardiao: [
        ['Guardião. Um escudo à frente dos outros. Aguentas tudo, menos ficar parado.',
          'Aqui vais aprender a pôr o escudo à tua frente também. Não é egoísmo. É manutenção.'],
        ['Escolheste a classe que resiste. Os chefes vão cansar-se de ti antes de tu te cansares deles.',
          'A pergunta é se aguentas o adversário mais lento de todos: a rotina. Esse não cansa nunca.']
      ],
      invocador: [
        ['Invocador. Um dia vais ter um exército de sombras ajoelhado à tua frente.',
          'Cada sombra é a memória de alguém que caiu. Trata-as com respeito. Elas lembram-se de quem as venceu.'],
        ['Escolheste comandar em vez de lutar sozinho. É uma escolha antiga. Mais antiga do que imaginas.',
          'Mas lembra-te: a primeira sombra da história não foi invocada. Foi pedida. Com uma palavra. Vais aprendê-la.']
      ]
    },
    ask: [
      { q: 'Diz-me, {nome}: quando ninguém está a ver, quem és tu?', a: [
        ['Alguém que quer ser melhor.', 'o', 'Ótimo. Agora há alguém a ver. Vamos ver se mudas ou se continuas igual.'],
        ['Isso é pessoal.', 'd', 'Tudo aqui é pessoal. Eu sou o único que vê quando ninguém está a ver.'],
        ['Porque é que isso importa?', 'q', 'Porque é aí que se ganham os níveis. Nos momentos sem plateia.']] },
      { q: 'O que é que te fez dizer «sim» há pouco? Responde sem pensar.', a: [
        ['Cansaço de mim próprio.', 'o', 'É a melhor razão que existe. Quem está cansado de si já começou a mudar.'],
        ['Curiosidade.', 'd', 'A curiosidade abre portas. Não as mantém abertas. Para isso vais precisar de outra coisa.'],
        ['Ainda não sei.', 'q', 'Vais saber. Normalmente percebe-se ao trigésimo dia. Ou ao primeiro em que quiseres desistir.']] },
      { q: 'Uma pergunta de registo: o que é que vais fazer amanhã de manhã, antes de tudo o resto?', a: [
        ['A Missão Diária.', 'o', 'Resposta certa. Vou cobrar-ta amanhã. É uma promessa minha, não tua.'],
        ['Dormir mais um bocado.', 'd', 'Honesto. Dorme. Mas a Diária não dorme contigo. Espera-te até à hora marcada.'],
        ['O que devia fazer?', 'q', 'Uma coisa difícil e pequena. Antes do telemóvel. É assim que se ganha um dia.']] }
    ],
    close: [
      ['Uma última coisa. Às vezes vou falar contigo sem razão aparente. Responde, ou ignora. Eu registo as duas.',
        'Não sou um amigo. Mas também não sou um inimigo. Sou o registo. E o registo está do teu lado quando cumpres.',
        'Começa, {classe}. A primeira missão é tua de escolher.'],
      ['Tens tudo o que precisas para começar: uma lista vazia, um corpo e um dia.',
        'Os outros Jogadores tiveram o mesmo. Alguns chegaram ao fim. Outros nem à primeira semana.',
        'Não me digas em qual vais ficar, {nome}. Mostra-me.'],
      ['Fecha esta janela e cria uma missão. Pequena. Honesta. Com prazo.',
        'Eu vejo. É só isso que eu faço. E, acredita, chega.']
    ]
  };
})(globalThis.SYS = globalThis.SYS || {});
