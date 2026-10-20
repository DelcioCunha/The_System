/* ==========================================================
   VOZ DO SISTEMA NO FIM DOS TREINOS COM AS SOMBRAS
   O Sistema restaura o jogador, mas não perde a oportunidade
   de comentar. {nome} = jogador, {servo} = nome do servo.
   ========================================================== */
(function (S) {
  'use strict';
  S.SPAR_VOICE = {
    title: {
      win: ['RESTAURAÇÃO DO SISTEMA', 'O SISTEMA RESTAUROU-TE', 'TREINO ENCERRADO', 'CORPO RESTABELECIDO'],
      lose: ['RESTAURAÇÃO DO SISTEMA', 'O SISTEMA RESTAUROU-TE', 'RECOLHIDO DO CHÃO', 'RESTAURAÇÃO DE EMERGÊNCIA'],
      flee: ['TREINO ABANDONADO', 'RESTAURAÇÃO DO SISTEMA', 'O SISTEMA RESTAUROU-TE']
    },
    win: [
      'Venceste a tua própria sombra, {nome}. Era o mínimo.',
      'Treino concluído. O servo lembra-se de quem manda. Ótimo.',
      'Ganhaste a quem já tinhas ganho. Não esperes aplausos.',
      'Registado: o senhor continua acima do servo. Por agora.',
      'Bom. Agora faz o mesmo com as tuas missões.',
      'O Sistema devolve o que gastaste. A vitória fica contigo.'
    ],
    lose: [
      'Perdendo para um servo. QUE VERGONHA.',
      'Derrotado por quem te jurou obediência. Registei isto, {nome}.',
      'O teu próprio servo. O TEU PRÓPRIO SERVO.',
      '{servo} venceu o seu senhor. O Sistema vai fingir que não viu. Não vai.',
      'Vou restaurar-te. A tua dignidade fica por tua conta.',
      'Um servo de joelhos levantou-se e deitou-te ao chão. Interessante.',
      'Se o servo é mais forte do que o senhor, quem devia obedecer a quem?',
      'Deplorável. Levanta-te, {nome}. Ninguém precisa de saber. Eu sei.'
    ],
    flee: [
      'Fugiste de um treino. De um TREINO, {nome}.',
      'Abandonaste a luta contra o teu próprio servo. Anotado.',
      'O servo ficou à espera. Tu foste embora. Que exemplo.',
      'Restauro-te na mesma. Não te habitues a fugir.'
    ],
    shame: [
      'Perdendo para um servo. QUE VERGONHA.',
      'Caíste perante {servo}. O teu servo, {nome}.',
      'Até as tuas sombras te ultrapassam.',
      'O exército ri-se em silêncio.',
      'Um senhor derrotado pelo servo. O Sistema já viu de tudo. Agora viu isto.'
    ],
    close: [
      'Nenhum ferimento fica registado. O fracasso, esse, fica.',
      'Volta quando estiveres pronto. Eu estou sempre.',
      'O Sistema não desperdiça um jogador por causa de um treino.',
      'Tudo o que gastaste foi devolvido. O tempo, não.',
      'Restaurado. Agora mexe-te, {nome}.'
    ]
  };
})(globalThis.SYS = globalThis.SYS || {});
