# Sistema — app Android e web

Criado por **Delcio Cunha** · [Portfólio](https://delciocunha.github.io/Meu-Portfolio/)

> Para pôr a app no telemóvel (GitHub Pages ou APK), segue o guia **[PUBLICAR.md](PUBLICAR.md)**.

App de evolução pessoal ao estilo de um "Sistema" de RPG: cumpres missões da vida real antes do horário de encerramento, ganhas XP e moedas, sobes de nível (1 a 100), compras itens e enfrentas 100 chefes num combate por turnos.

## O que tem

- **Personagem**: nome, 6 classes (Guerreiro, Assassino, Mago, Guardião, Arqueiro, Invocador), cada uma com atributos iniciais e crescimento próprios. 5 atributos: Força, Agilidade, Vitalidade, Inteligência, Percepção. +3 pontos livres por nível.
- **Níveis**: 1 a 100, cada um com o seu título (de "Despertado" a "O Absoluto") e rank (E, D, C, B, A, S, SS, SSS, Ω).
- **Vigilância do Sistema (anti-abuso)**: o Sistema lê o nome e a descrição de cada missão e recusa texto sem sentido ("asdasd", "kkkk", "teste"), com avisos que escalam e chamam o jogador pelo nome. Criar e concluir em poucos minutos (conforme a dificuldade) é registado e punido com sentenças variadas: perda de moedas, de XP, de nível (com Integridade muito baixa), Marca do Sistema (-50% nas missões) ou proibição de criar missões durante 1 a 12 horas, conforme a Integridade. A Integridade (0–100%) desce com cada abuso e sobe com missões legítimas e a cada novo dia. Mantém-se a fadiga depois de 5 missões por dia e o limite de 12 missões novas por dia.
- **Sistema vivo**:
  - **Saudação** ao abrir a app, conforme a hora, a ausência e o estado do jogador.
  - **Missões de Emergência**: até 2 por dia (08h–22h), aparecem sem aviso e duram pouco; recompensa extra.
  - **Zona de Penalidade**: falhar a Missão Diária abre 24h de objetivos 1,5×; cumprir recupera metade do que se perdeu, falhar dobra a perda e custa Integridade.
  - **Missões Ocultas**: 7 desafios secretos que se revelam por comportamento (madrugar, sequências, combate…), com 48h para cumprir.
  - **Relatório semanal** ao domingo à tarde, com nota de E a S e recompensa (Estado → Relatórios).
  - **Reações a marcos**: subida de rank, sequências, vencer chefes muito acima do nível, reis de portão, níveis 50 e 75.
  - **Conversas do Sistema**: 350 diálogos curtos com 3 respostas (obedecer, desafiar, perguntar). 250 surgem por contexto: ao abrir a app, ao olhar para um chefe (sobretudo um chefe mortal), depois de vitórias, derrotas, fugas, missões, compras, baús e subidas de nível. 100 são aleatórias e surgem do nada enquanto o jogador usa a app (sobre o Sistema, os portões, disciplina, a vida real, desafios na hora e dilemas). Uma conversa respondida é uma opinião final: nunca mais volta e a resposta fica guardada. 15 conversas só aparecem por causa de uma resposta anterior. Uma conversa ignorada pode voltar ao fim de 3 dias. Moderação: probabilidade baixa, intervalo crescente entre conversas (25 min, depois mais), máximo 6 por dia (a última reservada para momentos importantes), nunca durante uma batalha ou com uma janela aberta; se o jogador ignorar, o Sistema fala cada vez menos. Definições → Conversas do Sistema: Normais / Raras / Desligadas.
  - **Lembretes no telemóvel** (só no APK): 30 min antes do prazo de cada missão, 1h antes da Diária, Zona de Penalidade, Missão Oculta a acabar, emergências e ausência (1, 3 e 7 dias). Canal próprio "Avisos do Sistema", funcionam com a app fechada e depois de reiniciar o telemóvel, e tocar no aviso abre o separador certo. Em Definições: estado das autorizações, botão para avisos à hora exata e "Testar lembrete".
- **Missões personalizadas**: nome, descrição, dificuldade (E a S), até 3 atributos que a missão treina, horário de encerramento, repetição (uma vez, todos os dias, dias da semana). Concluir a tempo dá XP, moedas e treino; falhar tira moedas e XP (nunca desce de nível).
- **Missão Diária do Sistema**: tarefas com objetivo (editáveis), sequência de dias, baús de bónus. Falhar quebra a sequência e deixa-te Exausto (-20% XP durante 12h).
- **Loja**: lazer (recompensas da vida real, incluindo as que tu crias), armas por classe, armaduras, acessórios, poções/modificadores de estado, itens de atributo permanentes, baús.
- **Combate**: 10 portões × 10 chefes (níveis 1 a 100), todos disponíveis desde o início. Ataque, habilidades com mana e recarga, itens, defender, fugir. Estados (veneno, queimadura, sangramento, atordoamento, escudos, buffs). Reis de portão com 2 fases, chefe final com 3. Pressão de nível quando lutas acima do teu nível. Chefes derrotados não voltam.
- **Segredos**: 10 habilidades secretas, 10 itens secretos, 2 chefes ocultos, conquistas secretas, Fragmentos do Sistema que se juntam num Núcleo.
- **Baús e conquistas**: 5 tipos de baú, 46 conquistas com recompensas.

## Salvamento

Cada ganho ou perda (missão, compra, turno de combate, baú, ponto de atributo) é gravado no momento:

1. A gravação tem uma assinatura; se estiver corrompida, a app usa a cópia de segurança da gravação anterior.
2. No Android é guardada também no armazenamento nativo da app (plugin Preferences), que sobrevive mesmo se a WebView for limpa.
3. Uma batalha a meio continua de onde ficou se fechares a app.
4. Ao abrir a app, os prazos dos dias em que esteve fechada (até 7 dias) são verificados e as penalidades aplicadas uma única vez.
5. **Transferir conta** (Estado → Definições): gera um código curto (cabe numa mensagem de WhatsApp) com verificação de integridade. O aparelho que o gera perde a conta no mesmo instante: só pode haver uma conta ativa num aparelho de cada vez. O código só pode ser usado uma vez em cada aparelho e nunca no que o criou.

## Gerar o APK

### Opção A — GitHub (sem instalar nada)
1. Cria um repositório no GitHub e envia esta pasta.
2. No separador **Actions**, abre **Gerar APK** (corre sozinho a cada envio, ou carrega em *Run workflow*).
3. Quando terminar, descarrega **sistema-apk** em *Artifacts*, descompacta e instala o `app-debug.apk` no telemóvel (ativa "Instalar apps desconhecidas").

### Opção B — Android Studio
1. Instala o [Node.js 20+](https://nodejs.org) e o [Android Studio](https://developer.android.com/studio).
2. Nesta pasta: `npm install` e depois `npm run build`.
3. No Android Studio: *Open* → pasta `android` → espera o Gradle → *Build* → *Build App Bundle(s) / APK(s)* → *Build APK(s)*.
4. O APK fica em `android/app/build/outputs/apk/debug/app-debug.apk`.

### Opção C — linha de comandos
Com Android SDK e JDK 21 instalados: `npm install && npm run apk`.

## Avatares evolutivos

Põe as imagens em `assets/avatars/<classe>/<nível>.png` (também aceita .jpg e .webp). Classes: `guerreiro`, `assassino`, `mago`, `guardiao`, `arqueiro`, `invocador`.

Não precisas de 100 imagens por classe: a app mostra a imagem do nível mais alto que o jogador já atingiu. Por exemplo, com `1.png`, `10.png`, `20.png` … `100.png`, um jogador no nível 17 vê a `10.png`. Sem imagens, a app desenha um avatar provisório que evolui a cada 10 níveis.

Depois de adicionar imagens, corre `npm run build` outra vez.

## Estrutura

```
src/data/        conteúdo do jogo (classes, títulos, habilidades, itens, chefes, conquistas)
src/engine/      regras (salvamento, missões e prazos, progressão, loja, combate)
src/ui/          interface, estilos e avatar
src/web/         service worker da versão web (offline)
build.js         gera index.html na raiz (GitHub Pages), www/ (Android) e dist/preview.html (pré-visualização)
index.html       a app para o GitHub Pages (gerada: usa as imagens de assets/)
.github/         workflow que gera o APK
android/         projeto Android (Capacitor 7)
tests/           testes do motor, da interface e simulação de equilíbrio
```

Para mudar valores (preços, XP, força dos chefes), edita os ficheiros em `src/data/` e corre `npm test` e `npm run build`.

## Testes

`npm test` corre 22 testes do motor (salvamento, recuperação de gravação corrompida, prazos, penalidades, loja, baús, combate, equilíbrio das 6 classes) e um percurso completo pela interface num navegador simulado. `npm run balance` mostra taxas de vitória por classe e nível.
