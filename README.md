# Sistema — app Android e web

Criado por **Delcio Cunha** · [Portfólio](https://delciocunha.github.io/Meu-Portfolio/)

> Para pôr a app no telemóvel (GitHub Pages ou APK), segue o guia **[PUBLICAR.md](PUBLICAR.md)**.

App de evolução pessoal ao estilo de um "Sistema" de RPG: cumpres missões da vida real antes do horário de encerramento, ganhas XP e moedas, sobes de nível (1 a 100), compras itens e enfrentas 100 chefes num combate por turnos.

## O que tem

- **Personagem**: nome, 6 classes (Guerreiro, Assassino, Mago, Guardião, Arqueiro, Invocador), cada uma com atributos iniciais e crescimento próprios. 5 atributos: Força, Agilidade, Vitalidade, Inteligência, Percepção. +3 pontos livres por nível.
- **Níveis**: 1 a 100, cada um com o seu título (de "Despertado" a "O Absoluto") e rank (E, D, C, B, A, S, SS, SSS, Ω).
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
5. Em Estado → Definições há um código de backup para copiar e restaurar noutro telemóvel.

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
