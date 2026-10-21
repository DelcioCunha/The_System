/* ==========================================================
   PRIMEIRA CONVERSA COM O SISTEMA
   Aparece uma única vez, logo depois de o Jogador despertar.
   A conversa junta, ao acaso: uma abertura (3 falas), a leitura da
   classe escolhida (2 falas), uma pergunta pessoal (com 3 respostas
   e a réplica do Sistema) e um fecho (2 a 3 falas).
   No total são sempre 8 ou mais falas seguidas do Sistema.
   {nome} = nome do Jogador · {classe} = nome da classe
   ========================================================== */
(function (S) {
  'use strict';
  S.FIRST_TALK = {
    open: [
      ['{nome}. O nome ficou registado. É a primeira coisa tua que me pertence.',
        'Não te escolhi por seres especial. Escolhi-te porque ainda não desististe. Ainda.',
        'A partir de hoje, tudo o que fazes conta. E tudo o que não fazes também.'],
      ['Acordaste. Bom. Muitos não acordam quando eu chamo.',
        'Eu sou o Sistema. Não sou teu amigo, não sou teu treinador e não sou a tua consciência.',
        'Sou o registo. Vejo o que fazes, peso o que vales e cobro o que prometes.'],
      ['Alguém, algures, desistiu hoje de si próprio. Tu não. Por isso estás aqui.',
        'Não te vou mentir, {nome}: a maioria dos Jogadores dura menos de uma semana.',
        'Não por falta de força. Por falta de vontade de ser vista.'],
      ['Ligação estabelecida. Jogador identificado: {nome}.',
        'Durante anos ninguém registou os teus dias. Eles passaram e ninguém deu por isso.',
        'Isso acabou. A partir de agora, cada dia teu tem testemunha.'],
      ['Silêncio. Gosto do primeiro segundo. É o único em que ainda não me desiludiste.',
        'Sabes o que és agora, {nome}? Um Jogador de nível 1. O mais baixo que existe.',
        'Não é um insulto. É um ponto de partida. Os insultos guardo-os para mais tarde, se os mereceres.']
    ],
    cls: {
      guerreiro: [
        ['Escolheste Guerreiro. Força e resistência. A classe de quem prefere aguentar a fugir.',
          'Mas os golpes que mais te vão custar não vêm dos chefes. Vêm do sofá, do cansaço e das desculpas.'],
        ['Guerreiro. Bom. Quem escolhe esta classe costuma achar que a força resolve tudo.',
          'Às vezes resolve. Mas a espada mais pesada que vais levantar é a da tua própria rotina.']
      ],
      assassino: [
        ['Assassino. Rápido, preciso, invisível. Gostas de acabar as coisas antes que os outros reparem.',
          'Usa essa pressa nas missões. Mas lembra-te: eu vejo tudo, até quem se esconde nas sombras.'],
        ['Escolheste Assassino. Críticos, venenos, golpes certeiros.',
          'Um assassino vive de escolher o momento. O teu momento é hoje. Não amanhã. Hoje.']
      ],
      mago: [
        ['Mago. Escolheste a mente em vez do músculo. Interessante.',
          'Pensar muito é uma força, {nome}. Pensar demais e não agir é a fraqueza mais comum que registo.'],
        ['Mago. Magia arcana, dano enorme, pouca defesa. Uma descrição que talvez te sirva melhor do que imaginas.',
          'Vou ensinar-te a proteger o que és. Com disciplina, não com feitiços.']
      ],
      arqueiro: [
        ['Arqueiro. Paciência, distância, olho no alvo.',
          'Uma flecha só é perigosa quando é disparada. Apontar a vida inteira não conta. Eu registo disparos.'],
        ['Escolheste Arqueiro. Gostas de ver a batalha de longe antes de entrar nela.',
          'Prudência é útil. Mas a distância entre ti e quem queres ser não se encurta com pontaria. Encurta-se com passos.']
      ],
      guardiao: [
        ['Guardião. Escudo, armadura, resistência. A classe de quem protege os outros.',
          'Bonito. Mas quem protege tudo à sua volta costuma esquecer-se de proteger a si próprio. Aqui, primeiro és tu.'],
        ['Guardião. Uma muralha. Os chefes vão bater em ti até se cansarem.',
          'O problema nunca foi aguentar os golpes, {nome}. O problema é levantares-te cedo para os ir buscar.']
      ],
      invocador: [
        ['Invocador. Não lutas sozinho. Chamas outros para lutar por ti.',
          'Útil contra chefes. Inútil contra a preguiça. Esse combate ninguém o pode travar no teu lugar.'],
        ['Escolheste Invocador. Um dia vais comandar sombras de chefes que derrotaste.',
          'Mas antes de mandares num exército, vais ter de mandar em ti. É o primeiro servo que tens de dominar.']
      ]
    },
    ask: [
      { q: 'Uma pergunta, e quero a verdade: porque é que estás aqui?', a: [
        ['Quero mudar de vida.', 'o', 'Muita gente quer. Querer é barato. Vamos ver quanto estás disposto a pagar.'],
        ['Estou só a experimentar.', 'd', 'Honesto. Experimenta, então. Mas fica a saber que eu não experimento. Eu registo.'],
        ['Ainda não sei.', 'q', 'Não faz mal. A maioria só descobre porque é que veio no dia em que pensa em desistir.']] },
      { q: 'Diz-me uma coisa, {nome}: o que é que tens adiado há mais tempo?', a: [
        ['Cuidar de mim.', 'o', 'Então é por aí que começamos. As primeiras missões vão ser sobre ti.'],
        ['Não te interessa.', 'd', 'Interessa. Tudo o que adias é meu. Eu sei esperar, tu é que não sabes fugir.'],
        ['Tantas coisas que nem sei.', 'q', 'Escolhe uma. Só uma. As outras esperam na fila, como sempre esperaram.']] },
      { q: 'Quando foi a última vez que te sentiste orgulhoso de ti?', a: [
        ['Há muito tempo.', 'o', 'Então temos trabalho. O orgulho não se pede. Ganha-se, missão a missão.'],
        ['Hoje, por ter começado.', 'd', 'Começar é o mais fácil, {nome}. Fala-me de orgulho daqui a trinta dias.'],
        ['Isso importa?', 'q', 'Importa mais do que imaginas. Quem não se orgulha de nada acaba por não se esforçar por nada.']] },
      { q: 'Se eu te pedisse para descreveres o teu dia de ontem, terias orgulho da resposta?', a: [
        ['Não. Por isso estou aqui.', 'o', 'Boa resposta. Ontem não tinha registo. Hoje tem.'],
        ['Ontem foi um bom dia.', 'd', 'Talvez. Mas não estava registado. Para mim, ontem não existiu.'],
        ['Porque perguntas?', 'q', 'Porque a vida não muda nos grandes dias. Muda nos dias banais que ninguém repara.']] },
      { q: 'Uma última verificação: estás disposto a falhar à minha frente?', a: [
        ['Estou.', 'o', 'Ótimo. Quem aceita falhar pode crescer. Quem esconde as falhas fica parado.'],
        ['Eu não vou falhar.', 'd', 'Vais. Todos falham. A diferença está em quem volta no dia seguinte.'],
        ['E o que acontece se falhar?', 'q', 'Penalidades. Perdas. Vergonha, às vezes. Mas nunca o fim. O fim é só quando paras de voltar.']] }
    ],
    close: [
      ['As regras são simples. Tu crias as tuas missões. Eu verifico se são reais.',
        'Cumpres: ficas mais forte. Falhas: pagas. E todos os dias há uma Missão Diária que não é negociável.',
        'Bem-vindo ao Sistema, {classe}. Não me faças arrepender.'],
      ['Não te vou dizer que vai ser fácil. Não vai.',
        'Mas cada missão cumprida deixa marca. Nos teus atributos, no teu nível e em ti.',
        'O registo está aberto, {nome}. Começa.'],
      ['Vou estar sempre aqui. Quando cumprires, quando falhares, e sobretudo quando pensares que não estou a ver.',
        'Começas com pouco: algumas moedas, umas poções e um baú.',
        'O resto, {nome}, vais ter de o ganhar.'],
      ['Mais uma coisa. Não me tentes enganar com missões falsas. Eu reparo sempre.',
        'E se reparar, o castigo não é para o personagem. É para ti.',
        'Agora vai. O Sistema está à tua espera.']
    ]
  };
})(globalThis.SYS = globalThis.SYS || {});
