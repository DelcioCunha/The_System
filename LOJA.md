# Loja de Cristais: como pôr a funcionar

Criado por **Delcio Cunha**.

Este guia liga as três peças do Plano Mestre:

| Peça | O que é | Onde vive |
|---|---|---|
| **Servidor** (API + base de dados) | Pedidos, pagamentos confirmados, códigos únicos, auditoria. É a autoridade. | Cloudflare (gratuito), pasta `server/` |
| **Jogo** | Ala Premium → Obter Cristais: pacotes, pedido, WhatsApp, resgate do código | APK e versão web |
| **APK Administrativo** | Só para ti: pedidos pendentes, confirmar pagamento, emitir código, estatísticas | Pasta `admin/` |

O fluxo completo: **o jogador pede no jogo → fala contigo no WhatsApp → paga por MULTICAIXA Express → tu confirmas no APK Admin depois de veres o dinheiro na conta → emites o código → envias-lho → ele resgata no jogo.**

---

## 1. Criar a conta Cloudflare (uma vez)

1. Cria uma conta gratuita em [dash.cloudflare.com](https://dash.cloudflare.com/sign-up).
2. No menu da esquerda, abre **Workers & Pages**. Na primeira vez, a Cloudflare pede para escolheres um subdomínio `workers.dev` (por exemplo `delcio`). Escolhe e confirma.
3. Copia o teu **Account ID**: aparece na página **Workers & Pages** (lado direito) ou na página inicial da conta. Guarda-o.

## 2. Criar o token da Cloudflare (uma vez)

1. Canto superior direito → o teu perfil → **My Profile** → **API Tokens** → **Create Token**.
2. Escolhe o modelo **Edit Cloudflare Workers** → **Use template**.
3. Em **Permissions**, carrega em **+ Add more** e acrescenta: **Account** → **D1** → **Edit**.
4. Em **Account Resources**, escolhe a tua conta. **Continue to summary** → **Create Token**.
5. Copia o token (só aparece uma vez).

## 3. Pôr os segredos no GitHub (uma vez)

No repositório do GitHub: **Settings → Secrets and variables → Actions → New repository secret**. Cria estes 5:

| Nome | Valor |
|---|---|
| `CLOUDFLARE_API_TOKEN` | o token do passo 2 |
| `CLOUDFLARE_ACCOUNT_ID` | o Account ID do passo 1 |
| `ADMIN_USER` | o teu utilizador do painel (ex.: `delcio`) |
| `ADMIN_PASSWORD` | a palavra-passe do painel (**mínimo 10 caracteres**, forte, só tua) |
| `CODE_PEPPER` | um texto aleatório comprido (40+ caracteres). Podes gerar um num gerador de palavras-passe. **Nunca o mudes depois**: os códigos já emitidos deixavam de funcionar. |

Os segredos ficam guardados no GitHub e na Cloudflare. **Nada disto vai dentro dos APKs.** A palavra-passe só chega ao servidor como hash.

## 4. Publicar o servidor

1. Envia o projeto para o GitHub (Commit + Push no GitHub Desktop).
2. Separador **Actions** → **Publicar Loja (servidor)**. Se não arrancar sozinho, carrega em **Run workflow**.
3. Quando ficar verde, abre a execução: no resumo aparece **"Endereço do servidor: https://sistema-loja.….workers.dev"**.
4. O workflow grava esse endereço no ficheiro `loja.json` sozinho (faz um commit). No GitHub Desktop, carrega em **Fetch origin / Pull** para o receberes.

A versão web passa logo a usar a loja. Para os APKs, ver o passo 5.

## 5. Gerar os APKs com o endereço do servidor

Os commits feitos pelo próprio GitHub não arrancam outros workflows, por isso nesta primeira vez:

1. **Actions → Gerar APK → Run workflow** (o jogo).
2. **Actions → Gerar APK Admin → Run workflow** (o painel). Descarrega **sistema-admin-apk** em **Artifacts**.

Instala o **Sistema Admin** (ícone dourado) só no teu telemóvel. Não o partilhes com ninguém.

## 6. Configurar a loja no APK Admin

1. Abre o **Sistema Admin**. O endereço do servidor já vem preenchido. Entra com o `ADMIN_USER` e a `ADMIN_PASSWORD`.
2. **Segurança → Pacotes e preços**: define o preço em Kz de cada pacote e liga **Ativo**. Os pacotes sem preço nunca aparecem no jogo.
3. **Segurança → Loja e atendimento**: o WhatsApp do administrador já vem preenchido (**+244 958 313 378**). Só precisas de o mudar aqui se trocares de número. Revê também o texto das instruções de pagamento.

> No jogo, cada pacote tem o botão **Comprar** e depois **Comprar pelo WhatsApp**, que abre a conversa com +244 958 313 378 já com o pacote, o valor, o nome e o ID do jogador escritos. Isto funciona mesmo antes de o servidor estar publicado. Para **resgatar** o código, o servidor tem de estar publicado.

## 7. Testar tudo em modo de teste

O servidor começa em **modo de teste**. O jogo mostra "MODO DE TESTE: não faças pagamentos reais" e o Admin mostra a faixa "AMBIENTE DE TESTE".

1. No jogo: toca nos Cristais no topo → **Obter Cristais** → escolhe um pacote → **Abrir WhatsApp**.
2. No Admin: o pedido aparece em **Operações por tratar** → abre-o → escreve uma referência qualquer → marca o visto → **Confirmar pagamento** → **Emitir código** → **Copiar código**.
3. No jogo: cola o código em **Resgatar código**. Os Cristais entram uma única vez.
4. Experimenta também: resgatar o mesmo código outra vez (o jogo diz que já estão contigo), cancelar um pedido e substituir um código.

## 8. Passar para pagamentos reais

Antes, confirma com o teu banco as condições para receber pagamentos comerciais por MULTICAIXA Express e, com um contabilista, a parte fiscal (faturação e impostos).

1. GitHub → **Settings → Secrets and variables → Actions → separador Variables → New repository variable**: `LOJA_MODE` = `production`.
2. **Actions → Publicar Loja (servidor) → Run workflow**.

A partir daí, os pedidos feitos durante os testes deixam de aparecer no painel e nas estatísticas. Continuam guardados e consultáveis.

---

## Gerir os jogadores (APK Admin)

Quando um jogador abre o jogo com internet, o jogo regista-se no servidor com o **ID de Jogador**. A partir daí sincroniza ao abrir, ao voltar à app e de 10 em 10 minutos.

| Separador | O que podes fazer |
|---|---|
| **Jogadores** | Procurar por ID (`SIS-…`) ou nome. Filtrar por online, ativos ou suspensos. Ordenar por nível, gastos ou novos. |
| **Ficha do jogador** | Ver nível, classe, Cristais, moedas, missões, chefes, sequência, Integridade, total gasto, compras, ofertas e atividade. Escrever uma nota interna. |
| **Enviar Cristais / moedas** | **Entrega automática**: entra sozinha no jogo, com a tua mensagem, na próxima sincronização. **Código**: único, mostrado uma vez, para enviares no WhatsApp. Pode ficar preso a um jogador ou servir para qualquer um (sorteios). |
| **Suspender / desativar** | 1, 3, 7 ou 30 dias, ou permanente. O jogador vê o ecrã "Conta suspensa" com o motivo, e não pode comprar nem resgatar. O progresso não é apagado. A suspensão temporária acaba sozinha. |
| **Ofertas** | Todas as ofertas: por receber, recebidas e anuladas. Uma oferta por receber pode ser anulada. |
| **Pedidos → Entregar automaticamente** | Depois de confirmares o pagamento, os Cristais entram sozinhos no jogo, sem código. Na confirmação, a opção "Entregar automaticamente" vem ligada quando o jogador já está registado. O pedido passa a **Resgatado** quando o jogo recebe. |

Sobre a segurança destas funções:
- Cada jogo tem um segredo próprio. Outro telemóvel não consegue usar o ID de outra pessoa, nem receber os presentes dela.
- A suspensão fica gravada no telemóvel: desligar a internet não a levanta.
- Limitação: quem desinstala e começa um jogo novo recebe um ID novo. Não dá para impedir isso sem contas com login.

## Regras de operação (do Plano Mestre)

- **Nunca** confirmes um pagamento só com uma captura de ecrã enviada pelo cliente. Confirma sempre no extrato ou na app do banco.
- **Nunca** peças o PIN do banco nem códigos de confirmação (OTP) ao jogador.
- Não existe crédito manual de Cristais: só por código.
- Se a internet falhar a meio de uma ação, o Admin consulta o estado no servidor antes de deixar repetir. Repetir nunca duplica vendas nem códigos.
- O código só é mostrado no momento em que o emites. Se o jogador o perder antes de o usar, usa **Substituir código**: o antigo deixa de funcionar e o motivo fica na auditoria.
- Um pedido já resgatado não pode ser cancelado: os Cristais já foram entregues. Um reembolso nesse caso trata-se fora do sistema.
- Pedidos sem pagamento expiram sozinhos ao fim de 7 dias.

## Segurança já incluída

- Palavra-passe só como hash (PBKDF2) no servidor. 5 tentativas erradas bloqueiam o login durante 15 minutos.
- Sessões com validade de 12 horas, que expiram após 2 horas sem uso. Podes terminar as outras sessões no Admin.
- Códigos `SIS-XXXX-XXXX-XXXX` gerados com aleatoriedade criptográfica, guardados só como hash e de uso único. O resgate é atómico: duas tentativas ao mesmo tempo, só uma ganha.
- Tentativas de adivinhar códigos são limitadas (8 em 15 minutos por jogador). A resposta é igual para um código inexistente, usado ou revogado.
- No máximo 3 pedidos pendentes por jogador. A mesma referência de pagamento em dois pedidos dá um aviso.
- Auditoria de todas as ações: quem, o quê, pedido, hora, resultado.
- HTTPS obrigatório (a Cloudflare trata disso).

## Limitação conhecida

Os Cristais ficam guardados no telemóvel do jogador, que é a opção que escolheste para lançar mais depressa. Os **códigos** são à prova de fraude, mas alguém com conhecimentos técnicos poderia alterar o saldo guardado no seu próprio telemóvel. Mais tarde, a carteira pode passar para o servidor, com contas de jogador.

## Cópias de segurança

A Cloudflare guarda o histórico da base de dados D1 (Time Travel) e permite restaurá-la a um momento anterior. Para uma cópia manual, num computador com Node.js:

```
npx wrangler d1 export sistema-loja --remote --output backup.sql
```

## Se algo correr mal

| Problema | Solução |
|---|---|
| O workflow diz "Falta o segredo …" | Cria esse segredo no GitHub (passo 3). |
| Erro sobre `workers.dev` / subdomínio | Abre **Workers & Pages** na Cloudflare e escolhe o subdomínio (passo 1.2). |
| O jogo diz "a loja ainda está a ser preparada" | O `loja.json` ainda está vazio: faz o passo 4 e depois o passo 5. |
| O Admin diz "Credenciais inválidas" | Confirma o `ADMIN_USER` e a `ADMIN_PASSWORD` no GitHub e volta a correr **Publicar Loja**. |
| "Ainda não há pacotes à venda" | No Admin: define o preço e liga **Ativo** (passo 6.2). |
