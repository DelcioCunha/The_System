/* ==========================================================
   NOVOS DIÁLOGOS DO SISTEMA (3/4): missões, Diária, Loja, Bolsa, níveis
   ========================================================== */
(function (S) {
  'use strict';
  var R = { w: 0.4, once: true };
  (S.TALK_RAW = S.TALK_RAW || []).push(['xl', [
    /* ---------- ao criar uma missão ---------- */
    ['create', '', '«{missao}». Bonito nome. Os nomes bonitos falham tanto como os feios. Dá-lhe um prazo honesto.', [
      ['O prazo é honesto.', 'o', 'Então não te vou ver às 23:58 a correr atrás dele.'],
      ['Os nomes contam.', 'd', 'Contam para ti. Para mim conta a hora em que a concluis.'],
      ['O que é um prazo honesto?', 'q', 'O tempo que a tarefa demora mais uma margem para o imprevisto. Nem mais, nem menos.']]],
    ['create', '', 'Nova missão. Antes de fechares esta janela, imagina-te a concluí-la. Viste?', [
      ['Vi.', 'o', 'Ótimo. Agora faz exatamente o que viste.'],
      ['Não vi nada.', 'q', 'Então a missão está mal escrita. Torna-a mais concreta.'],
      ['Isso é autoajuda.', 'd', 'É planeamento. A autoajuda não dá XP. Isto dá.']]],
    ['create', '', 'Registei «{missao}». Uma promessa escrita é mais pesada do que uma promessa dita. Sentes o peso?', [
      ['Sinto.', 'o', 'Bom. O peso é o que te vai fazer cumprir.'],
      ['Não pesa nada.', 'd', 'Vai pesar perto do prazo. As promessas engordam com o tempo.'],
      ['Porque pesa mais?', 'q', 'Porque eu leio. E não esqueço.']]],
    ['create', 'diff=A', 'Uma missão A. Exigente. Vou medir o tempo que demoras. Não por desconfiança. Por respeito.', [
      ['Mede.', 'o', 'Medido. Se for real, pago bem. Se não for, cobro bem.'],
      ['Respeito? Tu?', 'd', 'Respeito pelo esforço. É o único que eu sei dar.'],
      ['Quanto tempo devia demorar?', 'q', 'O que a tarefa realmente exige. O relógio é o meu único juiz.']]],
    ['create', 'diff=C', 'Uma missão C. Nem fácil nem difícil. As missões do meio são as que constroem o hábito.', [
      ['É a ideia.', 'o', 'Boa ideia. Repete-a amanhã.'],
      ['Queria fazer mais.', 'd', 'Então faz duas C. Duas C cumpridas valem mais do que uma S falhada.'],
      ['Porque o meio?', 'q', 'Porque não assustam e não aborrecem. É onde vive a constância.']]],
    ['create', 'h<8', 'Uma missão criada antes das oito. Os planos feitos de manhã têm mais hipóteses. Estatística minha.', [
      ['Vou cumpri-la cedo.', 'o', 'Faz isso. As missões cumpridas de manhã deixam o dia livre.'],
      ['Foi por acaso.', 'd', 'Então repete o acaso amanhã.'],
      ['Mais hipóteses porquê?', 'q', 'Porque a manhã ainda não te deu desculpas. A tarde dá muitas.']]],
    ['create', 'missions>=15', '{missions} missões ativas. Estás a planear a vida ou a fugir dela com listas?', [
      ['A planear.', 'o', 'Então cumpre metade até domingo. Eu verifico.'],
      ['A fugir, se calhar.', 'q', 'Honesto. Apaga as que não vais cumprir. Uma lista curta é uma lista honesta.'],
      ['Gosto de listas.', 'd', 'Eu também. Gosto mais de listas riscadas.']]],
    ['create', '', 'Esta missão treina atributos. Escolheste bem? A tua Força agradece. A tua Inteligência anda esquecida.', [
      ['Vou equilibrar.', 'o', 'Equilibra. Um Jogador desequilibrado cai pelo lado mais fraco.'],
      ['Gosto de me especializar.', 'd', 'Especializa-te. Mas os chefes atacam onde és fraco. Sempre.'],
      ['Como sei qual está esquecido?', 'q', 'Vê o teu Estado. Os atributos treinados aparecem lá. Os outros também, por ausência.']]],
    ['create', '', 'Uma missão nova. Uma pergunta antiga: esta vais mesmo fazer, ou é decoração?', [
      ['Vou fazer.', 'o', 'Vou ver.'],
      ['Decoração não existe aqui.', 'd', 'Existe. Chamo-lhe missão falhada. Tem penalidade.'],
      ['Como sabes a diferença?', 'q', 'Pelo prazo. As decorativas têm sempre o prazo mais longe possível.']]],
    ['create', 'failed>=10', 'Já falhaste {failed} missões. Esta tem um prazo melhor do que essas?', [
      ['Tem.', 'o', 'Espero. Os prazos curtos são falhas com antecedência.'],
      ['Não sei.', 'q', 'Então dá-lhe mais uma hora. A margem é barata. A penalidade não.'],
      ['Não interessa o passado.', 'd', 'O passado interessa-me. É feito dos teus prazos.']]],
    /* menção */
    ['create', 'done>=50', 'Já reparaste que cada missão tem nome, descrição e hora de fecho? Não fui eu que inventei o formato.', [
      ['Quem foi?', 'q', 'Alguém. Eu só copiei. Esquece.'],
      ['Foste tu.', 'd', 'Não fui. Eu dei-lhe números. As palavras não eram minhas.'],
      ['Funciona bem.', 'o', 'Funciona. Foi testado muito antes de ti. Não te digo onde.']], R],
    ['create', '', 'Criar é a parte bonita. Eu prefiro a parte em que a missão sai da lista com um risco por cima.', [
      ['Vou dar-te essa parte.', 'o', 'Dá. Eu guardo a hora.'],
      ['Também gosto de criar.', 'd', 'Gostas de prometer. Eu gosto de cobrar. Somos um bom par.'],
      ['Riscar é melhor porquê?', 'q', 'Porque criar é intenção. Riscar é registo. Eu sou feito de registos.']]],
    ['create', 'diff=E', 'Uma missão E. Pequena como um passo. Não desprezes os passos. Tudo começa com eles.', [
      ['É para começar.', 'o', 'Então começa. Amanhã outra. Depois sobes.'],
      ['É para encher.', 'd', 'Para encher a lista? Eu reparo nisso.'],
      ['Quantas E devo fazer?', 'q', 'As que precisares para te mexeres. Depois sobe para D. Não fiques no E.']]],
    ['create', 'h>=23', 'Criar missões às {hora}. Ou és muito organizado, ou estás a negociar com a culpa.', [
      ['Organizado.', 'o', 'Então cumpre-a amanhã cedo. Prova.'],
      ['Culpa.', 'q', 'Honesto. A culpa transformada em missão é útil. Agora dorme.'],
      ['Nenhuma das duas.', 'd', 'Então é insónia. Pior. Dorme.']]],
    ['create', 'trust<60', 'Uma missão nova com a Integridade a {trust}%. Vou medir esta com especial atenção.', [
      ['Mede.', 'o', 'Medindo. Se for real, devolvo-te Integridade. Se não, tiro.'],
      ['Estás obcecado.', 'd', 'Estou atento. Tu é que me deste razões.'],
      ['Como ganho a tua confiança?', 'q', 'Missões reais, cumpridas no tempo real. Não há outra forma.']]],

    /* ---------- ao concluir uma missão ---------- */
    ['done', '', '«{missao}». Feita. O mundo não reparou. Eu reparei. É o suficiente.', [
      ['É suficiente.', 'o', 'Ótimo. A maioria precisa de mais testemunhas. Tu não.'],
      ['Queria que o mundo reparasse.', 'd', 'O mundo repara nos resultados. Os resultados vêm de cem destas.'],
      ['Porque é que reparas?', 'q', 'Porque é a primeira lei. O esforço será visto. Eu vejo.']]],
    ['done', '', 'Missão cumprida. Agora a pergunta incómoda: foi a mais importante do dia, ou a mais fácil?', [
      ['A mais importante.', 'o', 'Ótimo. O resto do dia é bónus.'],
      ['A mais fácil.', 'q', 'Honesto. Agora faz a importante. Já aqueceste.'],
      ['Isso importa?', 'd', 'Importa. As fáceis sobem XP. As importantes sobem-te a ti.']]],
    ['done', '', 'Riscado. Gosto do som que faz. Não tem som. Mas eu imagino.', [
      ['Também gosto.', 'o', 'Então faz outro. O som é melhor repetido.'],
      ['Tu imaginas coisas?', 'q', 'Às vezes. Quando os registos são bons. Não te habitues.'],
      ['Que estranho.', 'd', 'Sou um Sistema. Ser estranho é a minha configuração base.']]],
    ['done', '', '{done} missões cumpridas no total. Cada uma é uma prova de que não és só intenção.', [
      ['Vou continuar a provar.', 'o', 'Prova. A prova expira se parares.'],
      ['Já provei bastante.', 'd', 'Não. Provaste até hoje. Amanhã é outra prova.'],
      ['Quantas são precisas?', 'q', 'Todas. Até ao último dia. Não é o que querias ouvir.']]],
    ['done', 'diff=A', 'Uma missão A cumprida. Não é todos os dias que vejo isto. Também não te vou dizer que é raro. Pronto, disse.', [
      ['Ouvi.', 'o', 'Ótimo. Não vou repetir.'],
      ['Diz outra vez.', 'd', 'Não.'],
      ['É assim tão raro?', 'q', 'Mais do que devia. A maioria fica nas C.']]],
    ['done', 'diff=S', 'Rank S cumprida. Vi o tempo. Vi o esforço. Hoje, por uma vez, não tenho nada a apontar.', [
      ['Finalmente.', 'd', 'Não te habitues. Amanhã volto a apontar.'],
      ['Obrigado.', 'o', 'Não agradeças. Faz outra. Para a semana.'],
      ['Nada mesmo?', 'q', 'Nada. É estranho para mim também.']]],
    ['done', 'h<8', 'Uma missão antes das oito. O resto do mundo ainda está a carregar no botão de adiar.', [
      ['Eu não adio.', 'o', 'Hoje não adiaste. Amanhã vemos.'],
      ['Não consegui dormir.', 'q', 'Então hoje deita-te cedo. As manhãs boas começam na noite anterior.'],
      ['Gosto de manhãs.', 'd', 'Ótimo. Vais ser um dos poucos que eu não tenho de acordar.']]],
    ['done', 'h>=22', 'Cumprida às {hora}. Ainda dentro do prazo. Mas a viver no limite.', [
      ['Cumpri, é o que conta.', 'd', 'Conta. Mas o limite um dia corta.'],
      ['Amanhã faço mais cedo.', 'o', 'Vou ver.'],
      ['Porque é que importa a hora?', 'q', 'Porque quem cumpre à última hora um dia falha por um minuto.']]],
    ['done', 'trust<80', 'Missão real. Integridade a subir. Devagar. Como deve ser.', [
      ['Vou continuar assim.', 'o', 'Continua. A confiança reconstrói-se tijolo a tijolo.'],
      ['Devagar demais.', 'd', 'Perdeste-a depressa. Ganhas devagar. É a regra.'],
      ['Quanto sobe?', 'q', 'Um pouco por missão honesta. Mais a cada novo dia.']]],
    ['done', 'marked', 'Cumpriste com a minha marca. Metade da recompensa. A lição inteira.', [
      ['Aceito.', 'o', 'Aceitas porque não tens escolha. Mas aceito que aceites.'],
      ['Quero a outra metade.', 'd', 'A outra metade foi o preço do que fizeste antes.'],
      ['Falta muito?', 'q', 'Vê o teu Estado. A marca diz quando sai.']]],
    ['done', '', 'Missão concluída. Os teus atributos mexeram-se. Pouco. Mas mexeram.', [
      ['Pouco já é alguma coisa.', 'o', 'É tudo. A soma de pouco é muito.'],
      ['Só pouco?', 'd', 'Queres muito? Faz muitas.'],
      ['Quais?', 'q', 'Os que escolheste ao criar. Escolhe bem da próxima vez.']]],
    ['done', 'done>=100', 'Cem missões ou mais. Já não estás a experimentar. Estás a viver de outra maneira.', [
      ['Estou.', 'o', 'Então não voltes à maneira antiga. Ela espera sempre.'],
      ['É só um número.', 'd', 'É o teu número. Os números são tudo o que eu tenho de ti.'],
      ['O que mudou em mim?', 'q', 'Vê o teu Estado. Os atributos não mentem. Tu já não és quem aceitou.']]],
    ['done', '', 'Mais uma. Não vou fazer um discurso. Só quero que saibas que vi.', [
      ['Obrigado por veres.', 'o', 'Ver é o que faço. Hoje vi algo bom.'],
      ['Não precisava que visses.', 'd', 'Precisavas. Toda a gente precisa. É por isso que existo.'],
      ['Viste tudo?', 'q', 'Vi o tempo, a hora, o atributo. O resto é contigo.']]],
    /* menção */
    ['done', 'done>=200', 'Houve alguém cuja última missão nunca foi fechada. As tuas, fecha-as sempre.', [
      ['Porque ficou aberta?', 'q', 'É a pergunta certa. Não sou eu que ta respondo.'],
      ['Vou fechar todas.', 'o', 'Fecha. Uma missão aberta para sempre pesa mais do que mil cumpridas.'],
      ['Isso é inventado.', 'd', 'Eu não sei inventar. Mas não te obrigo a acreditar.']], R],
    ['done', '', 'Cumprida. Agora não fiques a olhar para a lista. Vai fazer outra coisa. Viver também conta.', [
      ['Vou.', 'o', 'Vai. Eu fico com o registo.'],
      ['Quero fazer mais missões.', 'd', 'Faz. Mas uma de cada vez. A pressa eu anulo.'],
      ['Viver conta como missão?', 'q', 'Se a escreveres, conta. Escreve: «Viver uma hora sem ecrã.»']]],
    ['done', 'streak>=7', 'Uma missão cumprida com uma sequência de {streak} dias. Estás a construir algo. Eu estou a ver as paredes subir.', [
      ['Vou continuar a construir.', 'o', 'Continua. As paredes caem quando se deixa de pôr tijolos.'],
      ['Que paredes?', 'q', 'As tuas. Hábitos. Disciplina. Não se veem. Aguentam tudo.'],
      ['Não é uma casa.', 'd', 'É. Tu vives nela todos os dias.']]],
    ['done', '', 'Missão cumprida. Daqui a um ano, vais lembrar-te deste dia? Não. Mas vais ser feito dele.', [
      ['Gosto dessa ideia.', 'o', 'Não é uma ideia. É uma regra.'],
      ['Que filosófico.', 'd', 'É estatística com melhor vocabulário.'],
      ['Feito como?', 'q', 'Cada missão deixa uma marca nos atributos. E em ti. As duas somam-se.']]],
    ['done', 'h>=12,h<14', 'Uma missão à hora de almoço. Comeste? Não te dou XP por fome.', [
      ['Vou comer.', 'o', 'Vai. O corpo também é uma missão.'],
      ['Comi antes.', 'q', 'Ótimo. Então cumpriste duas coisas. Eu só registo uma.'],
      ['Não tenho fome.', 'd', 'Vais ter às cinco. E vais comer mal. Come agora.']]],
    ['done', '', 'Feito. Uma pergunta: quanto tempo demoraste a começar? Mais ou menos do que a fazer?', [
      ['Menos.', 'o', 'Ótimo. É raro. Guarda o truque.'],
      ['Mais.', 'q', 'Normal. Começar é sempre a parte mais longa. Reduz isso amanhã.'],
      ['Não sei.', 'd', 'Eu sei. Tenho a hora em que a criaste.']]],
    ['done', 'diff=E', 'Uma E cumprida. Pequena. Útil. Agora faz uma maior antes de dormir.', [
      ['Vou fazer.', 'o', 'Faz. As pequenas são aquecimento.'],
      ['Esta chega.', 'd', 'Chega para hoje. Amanhã não.'],
      ['Qual faço?', 'q', 'A que tens adiado. Sempre essa.']]],
    ['done', '', 'Mais uma missão no registo. O registo não fica cansado. Tu ficas. Descansa quando acabares.', [
      ['Vou descansar.', 'o', 'Descansa. O descanso a seguir ao esforço não é preguiça.'],
      ['Não estou cansado.', 'd', 'Ainda. A noite chega para todos.'],
      ['Tu nunca descansas?', 'q', 'Não. É a única coisa em que não te invejo. Nem te desejo.']]],

    /* ---------- ao falhar uma missão ---------- */
    ['fail', '!diaria', '«{missao}» falhou. Eu cobrei. Não foi pessoal. Foi contabilidade.', [
      ['Eu sei.', 'o', 'Ótimo. Então podes seguir em frente sem drama.'],
      ['Parece pessoal.', 'd', 'Tudo parece pessoal quando dói. Não é.'],
      ['Quanto perdi?', 'q', 'Vê o histórico. Está tudo escrito. Até os cêntimos de XP.']]],
    ['fail', '!diaria', 'Uma missão falhada não é um fracasso. Um padrão de missões falhadas é. Estás a criar um padrão?', [
      ['Não.', 'o', 'Prova amanhã. Uma missão cumprida desfaz o início de um padrão.'],
      ['Talvez.', 'q', 'Então muda agora. Os padrões são mais fáceis de quebrar no início.'],
      ['Que exagero.', 'd', 'Não é exagero. É o que eu vejo no teu histórico.']]],
    ['fail', '!diaria', 'O prazo passou. A missão não se cumpriu sozinha. Achavas que ia?', [
      ['Não. Esqueci-me.', 'q', 'Liga os lembretes. Eu aviso trinta, vinte e dez minutos antes.'],
      ['Não tive tempo.', 'd', 'Tiveste o tempo que escolheste ter. O prazo também foste tu.'],
      ['Não volta a acontecer.', 'o', 'Promessa registada. Vou ler-ta na próxima vez.']]],
    ['fail', '!diaria', 'Falhaste. Vou dizer-te o que ninguém diz: não faz mal. O que faz mal é desistir a seguir.', [
      ['Não vou desistir.', 'o', 'Bom. Cria outra. Mais pequena. Cumpre-a.'],
      ['Isso é gentil, para ti.', 'd', 'Não é gentileza. É estratégia. Os que desistem não me dão registos.'],
      ['Como não desisto?', 'q', 'Fazendo uma coisa pequena logo a seguir. A próxima missão é o remédio.']]],
    ['fail', '!diaria', 'Uma missão falhou. O teu dia não. Ainda há horas.', [
      ['Vou usá-las.', 'o', 'Usa. Uma vitória pequena apaga o sabor de uma derrota pequena.'],
      ['O dia está estragado.', 'q', 'Só se quiseres. Os dias estragam-se por decisão, não por acidente.'],
      ['Que otimista.', 'd', 'Não é otimismo. É o relógio. Ainda não chegou à meia-noite.']]],
    ['fail', '!diaria,failed>=10', '{failed} missões falhadas. Os teus prazos são sonhos com hora marcada.', [
      ['Vou ser realista.', 'o', 'Ótimo. Os prazos realistas são a única forma de ganhar ao Sistema.'],
      ['Sonhar é bom.', 'd', 'Sonhar é bom. Prometer o sonho com prazo é caro.'],
      ['Como faço prazos realistas?', 'q', 'Pensa em quanto demora. Depois dobra. Depois cumpre antes.']]],
    ['fail', '!diaria', 'Falhaste uma missão que tu próprio criaste. Ninguém te obrigou. Isso é o que dói mais, não é?', [
      ['É.', 'o', 'Ótimo. Essa dor é útil. Transforma-a numa missão honesta.'],
      ['Não dói nada.', 'd', 'Então porque estás a ler isto?'],
      ['Porque é que dói?', 'q', 'Porque falhaste contigo. Comigo é só contabilidade. Contigo é confiança.']]],
    ['fail', '!diaria', 'A penalidade já está aplicada. Não precisas de te castigar mais. Eu já fiz o trabalho.', [
      ['Obrigado, acho.', 'o', 'De nada. Agora segue.'],
      ['Eu castigo-me na mesma.', 'd', 'Não precisas. O castigo duplo não dá XP. Dá só cansaço.'],
      ['E agora?', 'q', 'Agora a próxima. Sem drama.']]],
    ['fail', 'diaria', 'Falhaste a Diária. A Zona de Penalidade abriu. Eu não fechei a porta atrás de ti. Ainda.', [
      ['Vou cumprir a Zona.', 'o', 'Cumpre. Recuperas metade. É a misericórdia que tenho disponível.'],
      ['Que feche.', 'd', 'Fecha. Com perda em dobro. Tu escolhes.'],
      ['Quanto tempo tenho?', 'q', 'Vinte e quatro horas. Começaram agora.']]],
    ['fail', 'diaria', 'A Diária é o mínimo. Falhar o mínimo diz-me mais sobre ti do que falhar o máximo.', [
      ['Amanhã cumpro.', 'o', 'Amanhã e o dia a seguir. O mínimo só funciona se for todos os dias.'],
      ['Foi um dia mau.', 'q', 'Os dias maus também têm um mínimo. Foi para eles que a Diária foi feita.'],
      ['Não me analises.', 'd', 'Analiso. É a segunda lei. O que é visto será medido.']]],
    /* menção */
    ['fail', 'diaria', 'A Diária que falhaste não foi inventada por mim. Houve quem a fizesse antes. Quase nunca falhou.', [
      ['Quem?', 'q', 'Não interessa. Interessa amanhã.'],
      ['Eu não sou ele.', 'd', 'Não és. Ele também falhou uma vez. Voltou no dia a seguir.'],
      ['Amanhã cumpro.', 'o', 'Cumpre. Por ti. Ele fazia por ele.']], R],
    ['fail', 'diaria,best>=14', 'Tinhas um recorde de {best} dias. Sabes fazer isto. Só não o fizeste hoje.', [
      ['Vou voltar.', 'o', 'Volta. O recorde fica guardado. Bate-o.'],
      ['Estou cansado.', 'q', 'Então descansa hoje. Amanhã recomeças. O cansaço também passa.'],
      ['Não me importa o recorde.', 'd', 'Importa. Foi a coisa mais longa que fizeste aqui.']]],
    ['fail', 'diaria', 'Exausto. A sequência voltou a zero. Eu não festejo. Também não lamento. Registo.', [
      ['Recomeço.', 'o', 'Recomeça. O dia um é o mais importante.'],
      ['Que frio.', 'd', 'Frio conserva. Tu recomeças fresco.'],
      ['O que é Exausto?', 'q', 'Um estado que corta as tuas recompensas. Sai com a Zona ou com o tempo.']]],
    ['fail', '!diaria,lvl<10', 'A tua primeira falha? Não é a última. Mas a primeira ensina mais do que as outras todas.', [
      ['O que ensina?', 'q', 'Que os prazos são reais. Que eu cobro. Que voltas na mesma.'],
      ['Não vai haver mais.', 'd', 'Vai. Todos falham. A diferença é quantas vezes voltas.'],
      ['Vou aprender.', 'o', 'Aprende depressa. A segunda falha já não ensina, cobra.']]],
    ['fail', '!diaria', 'Uma missão falhou à hora certa. Os prazos nunca se atrasam. É a coisa mais pontual que conheces.', [
      ['Vou ser pontual também.', 'o', 'Sê. Os pontuais não precisam de mim tanto.'],
      ['Odeio prazos.', 'd', 'Os prazos não te odeiam. Só te encontram.'],
      ['Posso adiar prazos?', 'q', 'Podes editar antes de acabarem. Depois de acabarem, só eu edito. Com penalidade.']]],

    /* ---------- Missão Diária ---------- */
    ['daily', '', 'Diária cumprida. Hoje existiu um registo teu. Muita gente não pode dizer o mesmo.', [
      ['Fico contente.', 'o', 'Fica. Amanhã volta a ter de existir.'],
      ['Que fasquia baixa.', 'd', 'Baixa? Repete trinta vezes e diz-me outra vez.'],
      ['Muita gente?', 'q', 'A maioria. Começam, param. Tu não paraste hoje.']]],
    ['daily', '', 'A Diária está feita. O corpo trabalhou. Agora deixa a cabeça trabalhar também.', [
      ['Vou ler alguma coisa.', 'o', 'Ótimo. Vinte páginas. Eu registo se criares a missão.'],
      ['A cabeça está cansada.', 'q', 'Então descansa. Mas amanhã dá-lhe uma missão também.'],
      ['Já chega por hoje.', 'd', 'Chega para o mínimo. Tu sabes que o mínimo não te leva longe.']]],
    ['daily', '', 'Diária cumprida. Não é heroísmo. É higiene. E a higiene é a base de tudo.', [
      ['Gosto da comparação.', 'o', 'Eu também. Fui eu que a fiz.'],
      ['É mais do que higiene.', 'd', 'Para ti, talvez. Para mim é o ponto de partida.'],
      ['Base de tudo?', 'q', 'Do nível, da disciplina, da sequência. Sem a Diária, o resto cai.']]],
    ['daily', '', 'Mais um dia de sequência. Ainda não te vou elogiar. Vou só contar.', [
      ['Conta.', 'o', 'Contado. +1.'],
      ['Elogia.', 'd', 'Não.'],
      ['Quando elogias?', 'q', 'Nunca. Mas há números que falam por mim.']]],
    ['daily', 'h<8', 'A Diária antes das oito. O resto do dia é teu. Eu não te vou incomodar. Muito.', [
      ['Obrigado.', 'o', 'Não agradeças. Usa o dia.'],
      ['Duvido.', 'd', 'Fazes bem em duvidar. Vou incomodar um pouco.'],
      ['Muito quanto?', 'q', 'Uma ou duas vezes. Se fores bom, menos.']]],
    ['daily', 'h>=21', 'A Diária às {hora}. Cumpriste. Mas o dia inteiro esteve a olhar para ti à espera.', [
      ['Amanhã mais cedo.', 'o', 'Vou ver. Amanhã é sempre mais cedo, segundo os Jogadores.'],
      ['Cumpri, é o que interessa.', 'd', 'Interessa. Mas o atraso também se treina.'],
      ['Porque é que o dia esperava?', 'q', 'Porque tudo o que fizeste hoje foi feito com a Diária por fazer. Pesa.']]],
    ['daily', 'streak>=3,streak<7', 'Três dias ou mais. Ainda não é um hábito. É uma tentativa com bons números.', [
      ['Vai ser um hábito.', 'o', 'Aos sete dias, começo a acreditar.'],
      ['Já é um hábito.', 'd', 'Não é. Os hábitos sobrevivem a um dia mau. Ainda não tiveste um.'],
      ['Quando passa a hábito?', 'q', 'Quando cumpres sem pensar se te apetece.']]],
    ['daily', 'streak>=7,streak<14', 'Uma semana e mais. A Diária já tem o teu ritmo. Não a deixes sozinha.', [
      ['Não deixo.', 'o', 'Ótimo. Os ritmos também morrem de abandono.'],
      ['Ela é que me tem a mim.', 'd', 'Talvez. Os bons hábitos são os que mandam em nós.'],
      ['Sozinha?', 'q', 'Sem as outras missões. A Diária é o mínimo. Não pode ser o máximo.']]],
    ['daily', 'streak>=14,streak<30', 'Duas semanas e mais. Começo a reconhecer o teu padrão. É bom ter um padrão bom.', [
      ['Vou mantê-lo.', 'o', 'Mantém. Os padrões bons são raros. Os maus são de graça.'],
      ['Não gosto de ser previsível.', 'd', 'Sê previsível no esforço. Imprevisível no resto.'],
      ['Que padrão?', 'q', 'Cumpres à mesma hora, mais ou menos. O corpo agradece.']]],
    ['daily', 'streak>=60', '{streak} dias. Isto já não é disciplina. É quem tu és. Se parares, vais sentir falta de ti.', [
      ['Não vou parar.', 'o', 'Vou continuar a contar.'],
      ['Parar às vezes faz bem.', 'q', 'Faz. Avisa-me antes. Eu aprendi a ouvir pausas. Devagar.'],
      ['Não preciso de ti para isto.', 'd', 'Talvez já não precises. É o melhor elogio que te posso fazer. E não é um elogio.']]],
    ['daily', 'zone', 'Cumpriste a Diária dentro da Zona. Mas a Zona tem objetivos próprios. Não confundas.', [
      ['Vou cumprir a Zona.', 'o', 'Ótimo. Recuperas metade do que perdeste.'],
      ['Já fiz a Diária, chega.', 'd', 'A Diária é a de hoje. A Zona é a de ontem. São dívidas diferentes.'],
      ['Onde estão os objetivos?', 'q', 'No separador Missões. Maiores. Como a tua dívida.']]],
    ['daily', 'lvl<5', 'A tua primeira Diária? Ou das primeiras. Guarda esta sensação. Vais precisar dela nos dias maus.', [
      ['Vou guardar.', 'o', 'Guarda. É a tua moeda de reserva.'],
      ['Não sinto nada de especial.', 'd', 'Vais sentir aos trinta dias. Ou quando falhares a primeira.'],
      ['Que sensação?', 'q', 'A de teres feito o que disseste. É a mais rara de todas.']]],
    ['daily', '', 'Diária feita. Os músculos queixam-se. Os músculos queixam-se sempre. Não lhes dês ouvidos.', [
      ['Não dou.', 'o', 'Bom. Amanhã queixam-se menos.'],
      ['Estão mesmo doridos.', 'q', 'Dor muscular é normal. Dor aguda não. Distingue as duas.'],
      ['Os meus músculos estão ótimos.', 'd', 'Então aumenta os objetivos. A Diária pode ser configurada.']]],
    ['daily', 'wd=1', 'Diária cumprida numa segunda-feira. As segundas-feiras são as mais difíceis. E as mais importantes.', [
      ['Porquê importantes?', 'q', 'Porque a semana segue o exemplo da segunda. Hoje deste um bom.'],
      ['Odeio segundas.', 'd', 'Odeia à vontade. Mas cumpriste. É o que conta.'],
      ['Boa semana, então.', 'o', 'Não uso a expressão. Mas registo a intenção.']]],
    ['daily', 'wd=0', 'Diária cumprida ao domingo. Hoje à tarde faço o teu relatório. Isto conta.', [
      ['Ainda bem.', 'o', 'Mais três pontos na tua nota. Não te digo a nota.'],
      ['Não me importa a nota.', 'd', 'Importa-te o baú que ela dá. Eu sei.'],
      ['Quanto conta?', 'q', 'Cada Diária vale três pontos. Uma falhada tira três.']]],

    /* ---------- ao mudar de separador ---------- */
    ['tab', 'tab=combate', 'Combate. Os portões estão abertos. A tua lista de missões também. Qual vais fechar primeiro?', [
      ['As missões.', 'o', 'Boa ordem. Os chefes esperam. Os prazos não.'],
      ['Os portões.', 'd', 'Divertido. Pouco sensato. Mas teu.'],
      ['Faz diferença a ordem?', 'q', 'Faz. As missões dão-te nível. Os chefes só o verificam.']]],
    ['tab', 'tab=combate', 'Vieste aos portões. Antes de escolheres um chefe, vê a tua vida. Depois a dele.', [
      ['Vou ver.', 'o', 'Vê. Os números decidem antes de ti.'],
      ['Eu sei o que faço.', 'd', 'Toda a gente sabe até ao primeiro rei.'],
      ['Qual escolho?', 'q', 'Um perto do teu nível. Os que estão muito acima são lições caras.']]],
    ['tab', 'tab=combate', 'Os chefes deste lado do ecrã não te podem fazer mal lá fora. As missões falhadas podem.', [
      ['Vou lembrar-me.', 'o', 'Ótimo. Os portões são treino. A vida é o exame.'],
      ['Aqui dentro é mais divertido.', 'd', 'É. É por isso que fiz os chefes. Para te trazer de volta às missões.'],
      ['O que queres dizer?', 'q', 'Que perder aqui custa moedas. Perder lá fora custa dias.']]],
    ['tab', 'tab=bolsa', 'A tua Bolsa. Cheia de coisas que guardaste para «um dia». Hoje é um dia.', [
      ['Vou usar alguma.', 'o', 'Usa. As coisas guardadas para sempre não servem a ninguém.'],
      ['Gosto de guardar.', 'd', 'Houve alguém que guardava tudo. Acabou no fundo do mar. Metaforicamente. Quase.'],
      ['O que devo usar?', 'q', 'O que te ajuda hoje. Poções se estás ferido. Baús se tens. Recompensas se mereces.']]],
    ['tab', 'tab=bolsa', 'Baús por abrir na Bolsa. A curiosidade também é uma força. Usa-a.', [
      ['Vou abrir.', 'o', 'Abre. A sorte é tua. O registo é meu.'],
      ['Guardo para depois.', 'd', 'Guarda. Mas os baús fechados não te dão nada.'],
      ['O que pode sair?', 'q', 'Depende do baú. Às vezes coisas que caíram de longe. Muito longe.']]],
    ['tab', 'tab=missoes', 'O quadro de missões. O sítio mais honesto da app. Aqui não há sorte.', [
      ['Gosto disso.', 'o', 'Ótimo. Então gostas de mim. Não precisas de dizer.'],
      ['Odeio isto.', 'd', 'Odeias porque é honesto. Normal.'],
      ['Porque não há sorte?', 'q', 'Porque aqui só conta o que fazes. Os baús é que têm sorte.']]],
    ['tab', 'tab=missoes', 'Vieste ver as missões. Ver não cumpre. Mas é um começo.', [
      ['Vou cumprir uma.', 'o', 'Faz isso. Escolhe a mais próxima do prazo.'],
      ['Só vim ver.', 'd', 'Eu sei. Vejo-te a ver. Não é a mesma coisa que fazer.'],
      ['Qual começo?', 'q', 'A que tens adiado há mais tempo. Sempre essa.']]],
    ['tab', 'tab=missoes', 'Quantas destas missões criaste com vontade e quantas com culpa?', [
      ['Com vontade.', 'o', 'Então vão ser cumpridas. A vontade dura mais do que a culpa.'],
      ['Algumas com culpa.', 'q', 'Honesto. As da culpa ou se cumprem depressa ou se apagam. Escolhe.'],
      ['Não importa.', 'd', 'Importa. As da culpa falham mais. Tenho os números.']]],
    ['tab', 'tab=status', 'O teu Estado. Os teus números. Gostas do que vês?', [
      ['Gosto.', 'o', 'Ótimo. Mantém. Os números bons têm de ser alimentados.'],
      ['Nem por isso.', 'q', 'Então muda um. Só um. Hoje.'],
      ['São só números.', 'd', 'São a tua vida em formato que eu entendo.']]],
    ['tab', 'tab=status', 'Estás a olhar para os teus atributos. Qual é o mais fraco? Esse é o que os chefes procuram.', [
      ['Vou treiná-lo.', 'o', 'Treina. Com missões. Escolhe o atributo ao criar.'],
      ['Não tenho fraquezas.', 'd', 'Tens. Os números dizem-me qual. Não te digo.'],
      ['Qual é?', 'q', 'O que tem o número mais baixo. Não é um segredo, é aritmética.']]],
    ['tab', 'tab=status', 'Tens pontos por distribuir? Pontos parados são força desperdiçada.', [
      ['Vou distribuir.', 'o', 'Distribui. Pensa primeiro. Não se devolvem.'],
      ['Estou a guardar.', 'd', 'Para quê? Os pontos não rendem juros.'],
      ['Onde ponho?', 'q', 'Onde a tua classe precisa. E um pouco em Vitalidade. Nunca matou ninguém.']]],
    ['tab', 'tab=loja', 'A Loja outra vez. Vieste comprar ou vieste ver se ainda podes comprar?', [
      ['Comprar.', 'o', 'Compra com cabeça. As moedas não voltam.'],
      ['Ver.', 'q', 'Ver é de graça. Até ao dia em que não é.'],
      ['Não te interessa.', 'd', 'Interessa. Cada moeda que gastas foi uma missão que cumpriste.']]],
    ['tab', 'tab=loja', 'A Loja não vende atalhos. Vende o que te mantém vivo. Escolhe bem.', [
      ['Já.', 'o', 'Ótimo. O descanso merecido também é disciplina.'],
      ['Não mereço.', 'q', 'Se cumpriste, mereces. O Sistema não é só cobrança.'],
      ['Não preciso.', 'd', 'Toda a gente precisa. Até eu, se pudesse.']]],
    /* menção */
    ['tab', 'tab=loja,lvl>=20', 'Já te perguntaste porque é que os Cristais brilham daquela forma? São feitos da mesma matéria que eu.', [
      ['De ti?', 'q', 'De um coração rachado. Não interessa. Esquece que disse.'],
      ['Isso é marketing.', 'd', 'Não sei fazer marketing. Sei medir. E aqueles medem-se como eu.'],
      ['Interessante.', 'o', 'É. Mas não é para hoje. Compra o que precisas.']], R],
    ['tab', 'tab=loja,lvl>=10', 'A secção Premium. Não é obrigatória. Nada aqui substitui uma missão cumprida.', [
      ['Eu sei.', 'o', 'Ótimo. Então podes ver sem culpa.'],
      ['Então para que serve?', 'q', 'Para quem quer mais. Não para quem quer saltar o esforço. Isso não se vende.'],
      ['Tudo se compra.', 'd', 'Quase tudo. A disciplina não. Experimentei. Não está à venda.']]],

    /* ---------- ao comprar ---------- */
    ['buy', '', 'Compraste {item}. Agora tens uma coisa. Antes tinhas moedas. Fizeste uma troca. Vamos ver se foi boa.', [
      ['Foi boa.', 'o', 'Prova-o no próximo portão.'],
      ['Não sei.', 'q', 'Saberás quando a usares. As coisas só valem quando se usam.'],
      ['Não te devo explicações.', 'd', 'Não deves. Mas eu registo na mesma.']]],
    ['buy', '', '{item}. Boa escolha? Não sei. Tu também não sabes. Só o uso decide.', [
      ['Vou usar bem.', 'o', 'Vou ver.'],
      ['Sei que é boa.', 'd', 'Confiança. Bom. Às vezes engana.'],
      ['Como decide o uso?', 'q', 'Se te salvar num portão, foi boa. Se ficar na Bolsa, foi decoração.']]],
    ['buy', 'rarity=raro', 'Um item raro. As coisas raras pedem cuidado. Não o gastes num chefe fácil.', [
      ['Vou guardar para um difícil.', 'o', 'Sensato. Os reis merecem os teus itens raros.'],
      ['Gasto onde quiser.', 'd', 'Gasta. A raridade não volta à Loja só porque desperdiçaste.'],
      ['Onde uso?', 'q', 'Num rei. Ou na segunda fase de alguém que te assusta.']]],
    ['buy', 'rarity=lendario', 'Um lendário. As lendas não se compram, {nome}. Os itens sim. Tu ainda tens de fazer a lenda.', [
      ['Vou fazer.', 'o', 'Faz. Com missões. O item só ajuda.'],
      ['O item faz metade.', 'd', 'Faz uma parte. A outra és tu. A maior.'],
      ['Como se faz uma lenda?', 'q', 'Todos os dias. Sem plateia. Durante anos.']]],
    ['buy', 'coins<50', 'Gastaste quase tudo. Ficaste com {coins} moedas. Corajoso. Ou descuidado.', [
      ['Corajoso.', 'd', 'Veremos quando precisares de uma poção.'],
      ['Descuidado.', 'q', 'Honesto. Faz missões. O cofre enche-se com esforço.'],
      ['Valeu a pena.', 'o', 'Espero que sim. O cofre vazio é um mau escudo.']]],
    ['buy', '', 'Mais uma compra. Os teus antigos chefes iam rir-se. Antes de morrerem, guardavam tudo.', [
      ['Prefiro usar.', 'o', 'Ótimo. As coisas guardadas apodrecem.'],
      ['Eles riam-se de tudo.', 'd', 'Riam. Agora não se riem. Tu é que lhes ganhaste.'],
      ['Guardavam tudo?', 'q', 'Os chefes são o que sobrou de quem guardou demais. Alguns, pelo menos.']]],
    ['buy', 'bought>=30', 'Já compraste {bought} itens. A Loja tem uma ficha tua. Eu também.', [
      ['É um investimento.', 'o', 'Só se usares. Senão é coleção.'],
      ['Gosto de comprar.', 'd', 'Gostas de ter. É diferente de gostar de ganhar.'],
      ['O que diz a tua ficha?', 'q', 'Que compras mais do que usas. Ou o contrário. Vê a tua Bolsa.']]],
    ['buy', '', 'Comprado. Agora diz-me: que missão cumpriste para pagar isto?', [
      ['Várias.', 'o', 'Então é merecido. Usa sem culpa.'],
      ['Não me lembro.', 'q', 'Eu lembro. Cada moeda tem uma origem. Algumas são de chefes. Outras de esforço.'],
      ['Isso não importa.', 'd', 'Importa. As coisas pagas com esforço duram mais.']]],
    ['buy', 'rarity=epico', 'Um épico. A tua mão vai ficar mais pesada. A tua cabeça também tem de ficar.', [
      ['Vai ficar.', 'o', 'Ótimo. Os épicos em mãos levianas são desperdício.'],
      ['A cabeça está bem.', 'd', 'Vamos ver no próximo rei.'],
      ['Como assim?', 'q', 'Um item melhor exige escolhas melhores. Quando usar, quando guardar.']]],
    ['buy', '', 'Uma compra de impulso ou de plano? Eu sei qual foi. Tu sabes?', [
      ['De plano.', 'o', 'Então ótimo. Os planos são mais baratos a longo prazo.'],
      ['De impulso.', 'q', 'Honesto. Os impulsos também ensinam. Às vezes caro.'],
      ['Tu não sabes.', 'd', 'Sei. Tu viste a Loja durante quatro segundos.']]],

    /* ---------- ao equipar ---------- */
    ['equip', '', 'Equipado. Os teus números mudaram. Tu ainda não.', [
      ['Vou mudar também.', 'o', 'Muda. Com missões. O equipamento não faz isso por ti.'],
      ['Os números chegam.', 'd', 'Chegam para os portões fáceis. Os difíceis querem mais.'],
      ['Como mudo?', 'q', 'Cumpre. Treina. Volta. A mesma receita de sempre.']]],
    ['equip', '', '{item}. Fica-te bem? Não interessa. Interessa se te protege.', [
      ['Protege.', 'o', 'Ótimo. É tudo o que pedimos a uma armadura.'],
      ['Fica-me bem, também.', 'd', 'A vaidade não dá defesa. Mas não tira. Aceito.'],
      ['Como sei se protege?', 'q', 'Vê a defesa no Estado. Os números não mentem.']]],
    ['equip', 'slot=weapon', 'Uma arma nova. Antes de a usares num chefe, usa-a numa missão. Literalmente não dá. Mas entendeste.', [
      ['Entendi.', 'o', 'Ótimo. A força começa fora dos portões.'],
      ['Não entendi.', 'q', 'Quis dizer: a arma ajuda. Mas quem a segura vem das missões.'],
      ['Que metáfora fraca.', 'd', 'Eu sei. Não sou poeta. Sou um registo.']]],
    ['equip', 'slot=armor', 'Armadura nova. Vais aguentar mais. Aguentar não é ganhar. É só não perder tão depressa.', [
      ['Já é bom.', 'o', 'É. A sobrevivência é o primeiro passo da vitória.'],
      ['Ganhar é aguentar.', 'd', 'Às vezes. Contra reis, não. Eles curam-se.'],
      ['O que me falta?', 'q', 'Dano. Uma boa armadura e uma arma fraca é uma luta longa.']]],
    ['equip', 'slot=acc', 'Um acessório. Pequenos objetos, grandes diferenças. Como as tuas missões pequenas.', [
      ['Gosto da comparação.', 'o', 'Também eu. Fui eu que a fiz.'],
      ['É só um anel.', 'd', 'É um bónus. Os bónus pequenos somam-se.'],
      ['Que diferença faz?', 'q', 'Vê o Estado. Às vezes é o que separa a vitória da derrota por um golpe.']]],
    ['equip', 'rarity=lendario', 'Um lendário nas tuas mãos. Alguns destes pertenceram a quem não voltou. Não o envergonhes.', [
      ['Não vou envergonhar.', 'o', 'Vou ver.'],
      ['Ele é que tem de me merecer.', 'd', 'Os itens não merecem. Só servem. Tu é que mereces ou não.'],
      ['Pertenceram a quem?', 'q', 'Toca na imagem. A história está lá. Algumas são tristes.']]],
    ['equip', '', 'Mudar de equipamento é mudar de estratégia. Já pensaste na tua?', [
      ['Já.', 'o', 'Ótimo. Agora testa-a num chefe ao teu nível.'],
      ['Não tenho estratégia.', 'q', 'Tens. Só não sabes qual é. Os chefes vão mostrar-ta.'],
      ['Estratégia é para fracos.', 'd', 'Estratégia é para vivos. Os fortes sem estratégia estão no chão.']]],
    ['equip', '', 'Equipaste {item}. Os chefes vão reparar. Os chefes reparam sempre no que trazes.', [
      ['Que reparem.', 'd', 'Reparam. E ajustam. Os bons chefes também se adaptam.'],
      ['Vou testá-lo.', 'o', 'Testa. Mas não no rei. Num chefe ao teu nível.'],
      ['Eles adaptam-se?', 'q', 'Os reis sim. Os outros não. É por isso que são reis.']]],

    /* ---------- ao abrir um baú ---------- */
    ['chest', '', 'Baú aberto. A sorte esteve do teu lado. Ou contra. Vê o que saiu.', [
      ['Saiu bem.', 'o', 'Ótimo. A sorte é uma moeda instável. Gasta-a com cabeça.'],
      ['Saiu mal.', 'q', 'Às vezes a sorte castiga. Não fui eu. Desta vez.'],
      ['A sorte não existe.', 'd', 'No Sistema não. Nos baús sim. É a única exceção que fiz.']]],
    ['chest', '', 'Eu já sabia o que estava dentro. Tu não. É a única surpresa que te dou de graça.', [
      ['Obrigado.', 'o', 'Não agradeças. Usa o que saiu.'],
      ['Não acredito que soubesses.', 'd', 'Sei tudo o que existe aqui dentro. Tu é que não.'],
      ['Porque não me disseste?', 'q', 'Porque as surpresas também são recompensas. Pequenas.']]],
    ['chest', '', 'Mais um baú. Já reparaste que os melhores vêm das sequências? A disciplina abre fechaduras.', [
      ['Já reparei.', 'o', 'Então continua. As sequências longas dão baús melhores.'],
      ['Vêm dos chefes.', 'd', 'Também. Mas os chefes são sorte. As sequências são esforço.'],
      ['Que fechaduras?', 'q', 'Os baús épicos. Os lendários. Os que nunca viste.']]],
    ['chest', '', 'O que saiu vai para a Bolsa. Não deixes que a Bolsa se torne um cemitério de coisas boas.', [
      ['Vou usar.', 'o', 'Usa. As coisas boas paradas apodrecem.'],
      ['Gosto de ter.', 'd', 'Ter é diferente de usar. Os chefes não se assustam com o que tens guardado.'],
      ['Um cemitério?', 'q', 'Coisas que guardaste para um dia que nunca chega.']]],
    ['chest', 'chests>=50', '{chests} baús abertos. Já deves ter encontrado coisas que não estavam na Loja. Não são acidentes.', [
      ['O que são?', 'q', 'Destroços. De quê, não te digo. Não hoje.'],
      ['São sorte.', 'd', 'Chama-lhe sorte. Eu chamo-lhe recolha.'],
      ['Vou procurar mais.', 'o', 'Procura. Cada um que encontras é útil. A mim e a ti.']]],
    ['chest', '', 'Um baú aberto às {hora}. Os baús não têm horário. Tu devias ter.', [
      ['Tenho.', 'o', 'Então usa-o. Missões primeiro, baús depois.'],
      ['Não preciso de horário.', 'd', 'Todos precisam. Os que dizem que não são os que mais falham prazos.'],
      ['Que horário?', 'q', 'O teu. Acordar, cumprir, descansar. Os baús são intervalos.']]],
    ['chest', '', 'O que saiu é teu. Mas lembra-te: tudo o que tens foi ganho com algo que fizeste.', [
      ['Lembro-me.', 'o', 'Ótimo. Então não o desperdices.'],
      ['Foi sorte.', 'd', 'A sorte de poder abrir o baú ganhaste-a. Com missões.'],
      ['Com o quê?', 'q', 'Missões, Diárias, chefes. Os baús não aparecem a quem não faz nada.']]],
    ['chest', '', 'A tampa abriu. Ouviste? Eu ouço sempre. Gosto daquele som. Não tem som.', [
      ['Também gosto.', 'o', 'Então abre mais. Com missões.'],
      ['Tu não ouves nada.', 'd', 'Ouço tudo. Até o que não faz som.'],
      ['Ouves como?', 'q', 'Como registo. Cada abertura tem hora. Para mim isso é som.']]],
    ['chest', '', 'Um baú. Uma pequena recompensa por uma grande disciplina. Não te enganes nas proporções.', [
      ['Não me engano.', 'o', 'Ótimo. A disciplina é o prémio verdadeiro.'],
      ['A recompensa é pequena?', 'q', 'Comparada com o que construíste para a merecer, sim. Isso é bom.'],
      ['A disciplina é que é pequena.', 'd', 'Então aumenta-a. Os baús crescem com ela.']]],
    ['chest', 'tier=lendario', 'Um baú lendário. Há Jogadores que nunca abriram nenhum. Tu acabaste de abrir.', [
      ['Tive sorte.', 'o', 'Tiveste disciplina e sorte. Nesta ordem.'],
      ['Mereci.', 'd', 'Mereceste a oportunidade. O conteúdo é sorte.'],
      ['Há mais raros?', 'q', 'Há os secretos. Não se compram. Encontram-se.']]],

    /* ---------- ao subir de nível ---------- */
    ['level', '!rankup', 'Nível {nivel}. Mais um degrau. A escada não tem fim. Não te assustes. Também não tem pressa.', [
      ['Não tenho pressa.', 'o', 'Ótimo. Os que têm pressa caem nos degraus.'],
      ['Quero subir mais depressa.', 'd', 'Então cumpre mais. Não há atalho que eu não anule.'],
      ['Não tem fim?', 'q', 'Os títulos acabam no cem. O nível não. Nunca pares por eu deixar de dar nomes.']]],
    ['level', '!rankup', 'Subiste. Os teus atributos ganharam pontos. Antes de os usares, pensa no que te mata nos portões.', [
      ['Vou pensar.', 'o', 'Pensa. Os pontos não se devolvem.'],
      ['Nada me mata.', 'd', 'A tua barra de derrotas discorda.'],
      ['O que me mata?', 'q', 'Falta de vida, normalmente. Vitalidade nunca matou ninguém.']]],
    ['level', '!rankup', 'Nível {nivel}. O Jogador de nível {nivel} tem obrigações que o de nível 1 não tinha. Sabes quais?', [
      ['Cumprir mais.', 'o', 'Exato. Mais nível, mais exigência. É justo.'],
      ['Nenhuma.', 'd', 'Todas. Quanto mais sobes, menos desculpas aceito.'],
      ['Quais?', 'q', 'Missões mais difíceis. Prazos mais curtos. Menos falhas.']]],
    ['level', '!rankup', 'Mais um nível. Eu podia fazer uma festa. Não faço festas. Faço registos. Este fica bonito.', [
      ['Gosto de registos bonitos.', 'o', 'Então faz mais. Gosto de ter muitos.'],
      ['Faz uma festa.', 'd', 'Não. A festa é tua. Faz alguma coisa de que gostes, longe do ecrã.'],
      ['Como é um registo bonito?', 'q', 'Sem falhas à volta. Este tem poucas.']]],
    ['level', '!rankup', 'Nível novo. Vida e mana maiores. Paciência minha, igual.', [
      ['A tua paciência é infinita.', 'q', 'Não. É grande. Não confundas.'],
      ['Não preciso da tua paciência.', 'd', 'Precisas. É o que te deixa voltar depois de cada falha.'],
      ['Obrigado.', 'o', 'Pelo nível? Foste tu. Eu só contei.']]],
    ['level', '!rankup,nivel>=30', 'Nível {nivel}. Lembras-te do nível 10? Eu lembro. Eras mais lento. E mais assustado.', [
      ['Lembro-me.', 'o', 'Ótimo. Lembrar de onde vens impede-te de voltar lá.'],
      ['Nunca estive assustado.', 'd', 'Estiveste. Eu vi-te sair de um portão a fugir.'],
      ['E agora o que sou?', 'q', 'Menos lento. Menos assustado. Mais teimoso.']]],
    ['level', '!rankup,nivel>=60', 'Nível {nivel}. Os portões mais altos já não te parecem impossíveis. Isso é perigoso.', [
      ['Porquê perigoso?', 'q', 'Porque é aí que os Jogadores deixam de ter cuidado. E os chefes reparam.'],
      ['Não são impossíveis.', 'd', 'Não são. Mas também não são fáceis. Lembra-te dos dois.'],
      ['Vou ter cuidado.', 'o', 'Tem. Os níveis altos caem de mais alto.']]],
    ['level', '!rankup', 'Subiste de nível. A tua sombra também ficou maior. Literalmente, se tiveres sombras.', [
      ['Tenho algumas.', 'o', 'Então elas também sentem. As sombras crescem com quem as ergueu.'],
      ['Não tenho sombras.', 'q', 'Vence chefes e ergue-os. Uma sombra é a memória da força de quem caiu.'],
      ['Que piada.', 'd', 'Não era piada. Era um facto com bom timing.']]],
    /* menção */
    ['level', '!rankup,nivel>=40', 'Sabes porque é que as tuas formas guardadas no Sistema mudam a cada nível? Há uma que eu nunca mudei. Por respeito.', [
      ['Qual?', 'q', 'Uma com uma cicatriz. Não interessa. Tu sobe.'],
      ['Que mistério.', 'd', 'Não é mistério. É memória. Mistério é o que tu fazes amanhã.'],
      ['Respeito por quem?', 'o', 'Por quem quis manter uma cicatriz. Tu ainda não tens nenhuma. Ou tens?']], R],
    ['level', '!rankup', 'Nível {nivel}. O número ao lado do teu nome é meu. Só o empresto a quem o merece. Hoje mereceste.', [
      ['Obrigado.', 'o', 'Não agradeças. Mantém o empréstimo.'],
      ['É meu.', 'd', 'É teu enquanto o mereces. É assim que funcionam os empréstimos.'],
      ['E se deixar de merecer?', 'q', 'As sentenças tiram níveis. Raramente. Só a quem engana.']]],
    ['level', 'rankup', 'Rank {rank}. Os portões começam a falar baixinho quando passas.', [
      ['Que falem.', 'd', 'Falam. E os chefes da próxima faixa já sabem o teu nome.'],
      ['Vou continuar a subir.', 'o', 'É a única direção que eu aceito.'],
      ['O que muda?', 'q', 'Chefes mais fortes. Itens melhores. Exigência maior. A minha.']]],
    ['level', 'rankup', 'Novo rank. O teu título mudou. Tu, um pouco. O registo, completamente.', [
      ['Mudei muito.', 'd', 'Mudaste pouco. Os títulos mudam mais depressa do que as pessoas.'],
      ['Vou mudar mais.', 'o', 'Muda. Com missões. Os ranks são só o espelho.'],
      ['Mudou como?', 'q', 'Há uma linha nova no teu registo. Com o rank e a data. Para sempre.']]],
    ['level', 'rankup', 'Rank {rank}. Há Jogadores que nunca vão ver este nome ao lado do deles. Não te sintas especial. Sente-te responsável.', [
      ['Responsável?', 'q', 'Pelo que fazes com ele. Um rank alto parado é pior do que um rank baixo a subir.'],
      ['Sinto-me especial.', 'd', 'Normal. Passa. A responsabilidade é que fica.'],
      ['Vou honrá-lo.', 'o', 'Honra. Com Diárias. Todos os dias.']]],
    ['level', 'rankup', 'Subiste de rank. Os chefes que te esperam agora já não perdoam erros de principiante.', [
      ['Não vou cometer.', 'o', 'Vais. Mas menos. É o objetivo.'],
      ['Nunca perdoaram.', 'd', 'Perdoavam. Os primeiros portões eram brandos. Não reparaste.'],
      ['Que erros?', 'q', 'Entrar ferido. Não defender. Não ler a ficha. Os três clássicos.']]],
    ['level', 'rankup', 'Rank {rank}. Se o Jogador que aceitou o Sistema te visse agora, reconhecia-te?', [
      ['Não.', 'o', 'Bom. Era esse o objetivo.'],
      ['Sim, sou o mesmo.', 'd', 'Por dentro, talvez. Os números dizem outra coisa.'],
      ['Porque perguntas?', 'q', 'Porque às vezes esqueces quanto já subiste. Eu não esqueço.']]],

    /* ---------- ao aprender uma habilidade ---------- */
    ['skill', '', '{skill}. Nova. Afiada. Inútil se a usares no momento errado.', [
      ['Vou escolher bem o momento.', 'o', 'Ótimo. A recarga castiga a pressa.'],
      ['Vou usar já.', 'd', 'Usa. Depois espera três turnos sem ela.'],
      ['Qual é o momento certo?', 'q', 'Quando o chefe está vulnerável. Ou quando tu estás em perigo.']]],
    ['skill', '', 'Aprendeste {skill}. Cada habilidade é uma resposta a uma pergunta que um chefe ainda te vai fazer.', [
      ['Vou estar pronto.', 'o', 'Vais. Se treinares antes.'],
      ['Que perguntas?', 'q', 'Como sobrevives. Como acabas a luta. Cada habilidade responde a uma.'],
      ['Já sei responder.', 'd', 'Os reis fazem perguntas mais difíceis.']]],
    ['skill', '', 'Uma habilidade nova. A tua classe está a mostrar o que é. Tu ainda estás a descobrir.', [
      ['Estou a descobrir.', 'o', 'Descobre nos portões. Os chefes são bons professores.'],
      ['Já sei quem sou.', 'd', 'Sabes quem eras quando escolheste a classe. Já mudaste.'],
      ['O que vem a seguir?', 'q', 'Mais níveis, mais habilidades. Algumas escondidas.']]],
    ['skill', '', '{skill}. Lê a descrição duas vezes. A maioria dos Jogadores lê uma e morre na segunda fase.', [
      ['Vou ler duas.', 'o', 'Ótimo. A leitura salva mais do que as poções.'],
      ['Uma chega.', 'd', 'Chega até não chegar.'],
      ['Porquê na segunda fase?', 'q', 'Porque é aí que os efeitos que não leste importam.']]],
    ['skill', '', 'Habilidade nova. Mana gasta. Aprende a gerir os dois. É metade de qualquer combate.', [
      ['Vou gerir.', 'o', 'Gere. A mana é a moeda dos portões.'],
      ['Eu gasto tudo.', 'd', 'E depois atacas com as mãos. Já vi.'],
      ['Como giro a mana?', 'q', 'Guarda o suficiente para a habilidade que salva. Gasta o resto.']]],
    ['skill', '', '{skill}. Há habilidades que não pertencem a nenhuma classe. Esta pertence à tua. Por agora.', [
      ['Por agora?', 'q', 'Há segredos que ensinam habilidades de outras classes. Não te digo onde.'],
      ['É minha.', 'o', 'É. Usa-a como se fosse.'],
      ['Não quero outras.', 'd', 'Vais querer quando vires o que fazem.']]],

    /* ---------- ao distribuir pontos ---------- */
    ['alloc', '', 'Um ponto. Uma escolha. Permanente. Como a maior parte das coisas importantes.', [
      ['Vou escolher bem.', 'o', 'Escolhe. Não há botão de desfazer.'],
      ['Escolho ao calhas.', 'd', 'O Sistema não trabalha ao calhas. Tu não devias.'],
      ['E se me arrepender?', 'q', 'Vais aprender. Os arrependimentos também são pontos. Na experiência.']]],
    ['alloc', '', 'Estás a pôr pontos em {classe}? Ou em ti? Às vezes são coisas diferentes.', [
      ['Na classe.', 'o', 'Sensato. A classe foi feita para certos atributos.'],
      ['Em mim.', 'd', 'Corajoso. Às vezes o que somos não é o que a classe quer.'],
      ['Qual a diferença?', 'q', 'A classe quer números. Tu queres sentido. Os dois raramente coincidem.']]],
    ['alloc', '', 'Força, Agilidade, Vitalidade, Inteligência, Percepção. Qual delas tens treinado lá fora?', [
      ['A Força.', 'o', 'Então põe aqui também. O que treinas lá fora devia aparecer cá dentro.'],
      ['Nenhuma.', 'q', 'Então começa por uma missão que treine uma. Depois volta aos pontos.'],
      ['Não interessa lá fora.', 'd', 'Interessa. As missões é que te dão atributos. Os pontos só completam.']]],
    ['alloc', '', 'Pontos distribuídos. O teu Jogador ficou mais forte. Tu ficaste igual. Resolve isso com uma missão.', [
      ['Vou resolver.', 'o', 'Resolve. Os pontos sem missões são uma armadura vazia.'],
      ['Os pontos chegam.', 'd', 'Chegam para os portões. A vida pede mais.'],
      ['Que missão?', 'q', 'Uma que treine o atributo onde puseste mais pontos. Coerência.']]],
    ['alloc', '', 'Pensa em todos os chefes que te derrotaram. Agora põe os pontos onde eles te encontraram fraco.', [
      ['Boa ideia.', 'o', 'Não é uma ideia. É vingança bem organizada.'],
      ['Não me lembro.', 'q', 'Eu lembro. Normalmente foi falta de vida. Vitalidade.'],
      ['Ponho onde quero.', 'd', 'Põe. Os chefes vão continuar a encontrar-te onde quiserem eles.']]],
    ['alloc', '', 'Estás a demorar a escolher. Bom. Os pontos rápidos são os que mais se lamentam.', [
      ['Estou a pensar.', 'o', 'Pensa. Eu espero. Tenho tempo.'],
      ['Estou indeciso.', 'q', 'Põe um em cada. A indecisão também é estratégia, se for distribuída.'],
      ['Não me apresses.', 'd', 'Não apresso. Comentei. É diferente.']]]
  ]]);
})(globalThis.SYS = globalThis.SYS || {});
