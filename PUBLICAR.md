# Publicar o Sistema

Criado por **Delcio Cunha**.

Há duas formas de ter o Sistema no telemóvel:

| | Versão web (GitHub Pages) | APK Android |
|---|---|---|
| Para quê | Testar já, atualizar a toda a hora | Versão final instalada como app |
| Instalação | Chrome → "Adicionar ao ecrã principal" | Instalar o ficheiro `.apk` |
| Atualizações | Automáticas a cada envio para o GitHub | Instalar o APK novo por cima |
| Funciona sem internet | Sim, depois da primeira abertura | Sim |

> **O progresso é guardado em cada versão separadamente.** Para passar da versão web para o APK (ou para outro telemóvel): Estado → Definições → **Copiar código** de backup, e no outro lado **Restaurar**.

---

## 1. Enviar o projeto para o GitHub (uma vez)

O projeto tem cerca de 760 ficheiros (sobretudo imagens). O site do GitHub só aceita 100 ficheiros de cada vez, por isso o mais simples é usar o **GitHub Desktop**:

1. Cria uma conta em [github.com](https://github.com) (se ainda não tiveres).
2. Instala o [GitHub Desktop](https://desktop.github.com) e entra com a tua conta.
3. Descompacta o `sistema-app.zip` numa pasta do computador.
4. No GitHub Desktop: **File → Add local repository** → escolhe a pasta `sistema-app` → aparece "this directory does not appear to be a Git repository" → carrega em **create a repository** → **Create repository**.
5. Carrega em **Publish repository**. Dá-lhe um nome (por exemplo `sistema`) e **tira o visto de "Keep this code private"** (o GitHub Pages gratuito exige repositório público).

As pastas `node_modules`, `www` e `dist` não são enviadas (não são precisas no GitHub).

**O `index.html` da app já está na raiz do projeto**, junto com `manifest.webmanifest` e `sw.js`. Usa as imagens diretamente da pasta `assets/`. Não mexas nestes três ficheiros à mão: são gerados pelo `build.js` e já vêm prontos em cada versão do projeto que te envio.

## 2. Ligar o GitHub Pages (uma vez)

1. No repositório, no site do GitHub: **Settings → Pages**.
2. Em **Build and deployment → Source**, escolhe **Deploy from a branch**.
3. Em **Branch**, escolhe **main** e a pasta **/ (root)** → **Save**.
4. Ao fim de 1 a 2 minutos (vês o progresso no separador **Actions**, em "pages build and deployment"), o endereço fica ativo:

   `https://<o-teu-utilizador>.github.io/<nome-do-repositório>/`

   Por exemplo: `https://delciocunha.github.io/sistema/`

## 3. Instalar no telemóvel (versão web)

1. No telemóvel, abre o endereço acima no **Chrome**.
2. Menu **⋮ → Adicionar ao ecrã principal → Instalar**.
3. O Sistema fica com ícone próprio, abre em ecrã inteiro e funciona sem internet.

Quando enviares alterações para o GitHub, a app atualiza-se sozinha na próxima vez que a abrires com internet. O progresso nunca é apagado pelas atualizações.

## 4. Gerar o APK

O workflow **Gerar APK** corre sozinho a cada envio:

1. Separador **Actions → Gerar APK** → abre a execução mais recente (com o visto verde).
2. Em baixo, em **Artifacts**, descarrega **sistema-apk** (vem num `.zip`).
3. Passa o `app-debug.apk` para o telemóvel e abre-o. O Android pede para autorizar **"Instalar apps desconhecidas"** para o navegador ou gestor de ficheiros: autoriza e instala.

Este APK é de testes (assinado com a chave de depuração). Para publicar na Google Play é preciso um APK/AAB assinado com a tua própria chave; isso faz-se no fim, quando o jogo estiver fechado.

## 5. Atualizar depois de mudanças

1. Substitui os ficheiros na pasta pelos da nova versão do projeto.
2. No GitHub Desktop: escreve um resumo em baixo à esquerda → **Commit to main** → **Push origin**.
3. A versão web atualiza-se e é gerado um APK novo.
