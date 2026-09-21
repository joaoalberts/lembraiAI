# Backend do LembreiAi na sua VPS, sem mensalidade

O app conversa com dois endereços: `<URL>/auth/v1` (cadastro e login) e `<URL>/rest/v1` (lembretes). Este pacote sobe os dois no **seu** servidor, junto com o site (versão web) e o APK do Android.

**Por que não o Supabase hospedado?** O plano gratuito dá 2 projetos ativos por conta (os seus já estão em uso), pausa projeto parado por 7 dias e só entrega o e-mail embutido para a própria equipe do projeto. Aqui nada disso existe, e o app não muda: é o mesmo `supabase-js` falando com o mesmo tipo de API.

## O que roda

| Contêiner | Imagem | Função |
|---|---|---|
| `db` | `supabase/postgres:17.6.1.167` | banco (a mesma imagem do Supabase) |
| `auth` | `supabase/gotrue:v2.196.0` | cadastro, login, recuperação de senha |
| `rest` | `supabase/postgrest:v16.2` | API dos lembretes, protegida por RLS |
| `templates` | `nginx:1.27-alpine` | entrega o modelo do e-mail de recuperação ao `auth` |
| `web` | `nginx:1.27-alpine` | o site e o APK (arquivos no volume `site-data`) |
| `gateway` | `caddy:2.10-alpine` | separa `/auth/v1`, `/rest/v1` e o site num único endereço |
| `migrate` | `supabase/postgres` | roda a cada deploy, aplica o banco e termina (só no Easypanel) |

As três primeiras são as versões do Supabase CLI local em que o app foi testado. Consumo medido: **~135 MB de RAM em repouso**. O banco não publica porta e **não existe chave `service_role`** (o app nunca precisa dela).

## Escolha o caminho

| A sua VPS… | Use |
|---|---|
| tem **Easypanel** (painel na porta 3000, como a Hostinger com esse modelo) | **Caminho A** |
| tem só Docker e outro Traefik nas portas 80/443 | Caminho B |
| tem as portas 80/443 livres | Caminho C |

Veja quem usa 80/443 e se há painel: `sudo ss -ltnp | grep -E ':(80|443|3000)\b'`.

---

## Caminho A: Easypanel

O Easypanel gerencia o Traefik e o HTTPS, então o stack **não publica porta nenhuma**: o domínio é configurado no painel e aponta para o serviço `gateway`. O arquivo do Easypanel é um **compose único e autocontido** (a origem "Inline" só guarda o YAML), gerado a partir dos mesmos arquivos-fonte.

**1. Gerar os segredos e o compose** (no seu Mac, na pasta `deploy/`):

```bash
scripts/gen-env.sh SEU-HOST            # cria .env com senha do banco e segredo JWT aleatórios; imprime a ANON_KEY
node scripts/build-easypanel.mjs       # cria dist/docker-compose.easypanel.yml
```

**2. No Easypanel:** crie um projeto e, nele, **New Service → Compose → Inline**. Cole o conteúdo de `dist/docker-compose.easypanel.yml`. Na aba **Environment**, cole o conteúdo do `.env` e ative *Create .env file*. Clique em **Deploy** (o `migrate` aplica o banco sozinho).

**3. Domínio:** na aba **Domains**, adicione o host (ex.: `srv….hstgr.cloud`), serviço interno **`gateway`**, porta **`80`**, HTTPS ligado. O Easypanel emite o certificado. Não aponte domínio para `db`, `auth` ou `rest`.

**4. Conferir:**

```bash
curl -s https://SEU-HOST/auth/v1/health        # {"...","name":"GoTrue"}
curl -s -H "apikey: <ANON_KEY>" https://SEU-HOST/rest/v1/ | head -c 200
```

**5. Publicar o site e o APK** (no Mac, na raiz do projeto Expo). O `EXPO_PUBLIC_*` é embutido no build: use a URL `https://` final e a `ANON_KEY` do passo 1.

```bash
export EXPO_PUBLIC_SUPABASE_URL=https://SEU-HOST
export EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<ANON_KEY>
# opcional: e-mail de contato nas páginas de privacidade e exclusão de conta
# export EXPO_PUBLIC_CONTACT_EMAIL=contato@seu-dominio

npx expo export --platform web --output-dir deploy/site
scripts/build-android.sh && cp dist-android/lembreiai.apk deploy/site/lembreiai.apk
deploy/scripts/publish-site.sh root@SEU-HOST      # envia por SSH para o volume site-data
```

O site fica em `https://SEU-HOST/`, o APK em `/lembreiai.apk` e as páginas exigidas pelas lojas em `/privacidade` e `/excluir-conta`.

**6. Backup diário** (na VPS; envie antes a pasta `scripts/`: `rsync -az deploy/scripts/ root@SEU-HOST:/opt/lembreiai/scripts/`). Guarda 14 dias em `backups/`. Descubra o nome do contêiner do banco com `docker ps --format '{{.Names}}' | grep db`:

```bash
mkdir -p /opt/lembreiai/backups
(crontab -l 2>/dev/null; echo "17 3 * * * cd /opt/lembreiai && DB_CONTAINER=NOME-DO-CONTEINER-DO-BANCO scripts/backup.sh >> backups/backup.log 2>&1") | crontab -
```

**Atualizar o banco:** copie a migration nova de `supabase/migrations/` do projeto web para `deploy/migrations/`, rode `node scripts/build-easypanel.mjs`, cole o YAML de novo no Easypanel e faça **Deploy**. O `migrate` aplica só o que falta.

Requisitos na VPS: Docker Compose **2.23.1 ou mais novo** (`docker compose version`), porque o YAML usa `configs` com `content`.

---

## Caminho B: outra VPS com Traefik nas portas 80/443

Não mexe no Traefik: só registra os serviços por rótulos (`docker-compose.traefik.yml`). Testado com Traefik 3.

```bash
rsync -az --exclude .env --exclude site --exclude backups deploy/ usuario@SEU-HOST:/opt/lembreiai/
cd /opt/lembreiai && scripts/gen-env.sh SEU-HOST
# preencha TRAEFIK_NETWORK, TRAEFIK_ENTRYPOINT e TRAEFIK_CERTRESOLVER no .env (veja com `docker inspect <contêiner do Traefik>`)
alias dc='docker compose --env-file .env -f docker-compose.yml -f docker-compose.traefik.yml'
mkdir -p site && dc up -d && scripts/migrate.sh
```

## Caminho C: portas 80/443 livres

Igual ao B, trocando o overlay por `docker-compose.caddy.yml`: o Caddy emite e renova o certificado sozinho.

---

## E-mail (recuperação de senha)

Sem SMTP o cadastro entra direto (`MAILER_AUTOCONFIRM=true`), mas **o "Esqueci minha senha" do app diz que enviou e nada chega** (a tela agora orienta a pedir ao administrador se o e-mail não vier): o GoTrue usa um cliente de e-mail "vazio". Duas saídas gratuitas:

1. **Configurar um SMTP** (recomendado antes de divulgar o app). Preencha as variáveis `SMTP_*` (aba Environment no Easypanel, ou `.env`) e faça o deploy de novo:
   - **Gmail** (conta com verificação em duas etapas + "senha de app"): `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER` e `SMTP_ADMIN_EMAIL` = o endereço do Gmail, `SMTP_PASS` = a senha de app. O remetente será sempre esse Gmail e o Google limita o envio diário.
   - Caixa de e-mail da hospedagem (veja host e porta no painel) ou um serviço com plano gratuito (Brevo, Resend…). Confira os limites atuais antes de escolher.
   - Digite a senha você mesmo, no painel ou no `.env` da VPS; ela não precisa passar por mais ninguém.
   - O modelo do e-mail está em `templates/recovery.html` (código de 6 números + botão para a web). Com `MAILER_AUTOCONFIRM=false` o cadastro passa a exigir a confirmação do e-mail, que sai no modelo padrão do GoTrue (em inglês).
2. **Plano B sem e-mail:** quem administra a VPS redefine a senha de uma conta (a pessoa entra depois com a senha nova):

```bash
DB_CONTAINER=NOME-DO-CONTEINER-DO-BANCO scripts/reset-password.sh pessoa@email.com      # Easypanel
scripts/reset-password.sh pessoa@email.com                                             # caminhos B e C
```

## Backup e restauração

O `scripts/backup.sh` guarda só o que é insubstituível: **contas** (`auth.users`, `auth.identities`), **perfis** e **lembretes**. O esquema vem das migrations e as sessões se recriam no login, então o arquivo é pequeno e restaura em qualquer deploy novo. Copie `backups/` para fora da VPS de vez em quando: uma VPS que morre leva os backups junto. **A política de privacidade do app promete que as cópias somem em até 14 dias** (o `backup.sh` já apaga as da VPS depois disso); apague as cópias de fora no mesmo prazo. Faça também backup do **`.env`** (senha do banco e segredo JWT).

**Restaurar** num stack novo (deploy feito, migrations aplicadas, banco sem contas). Todos ficam deslogados e entram de novo com a mesma senha:

```bash
DB_CONTAINER=NOME-DO-CONTEINER-DO-BANCO scripts/restore.sh backups/lembreiai-AAAA-MM-DD.dump
# banco que já tem contas: acrescente --substituir (apaga as atuais antes)
```

Não use `pg_restore --clean` no banco inteiro: o schema `auth` pertence ao GoTrue e o papel `postgres` não consegue recriá-lo (foi testado e falha).

## Segurança: o que está e o que não está exposto

- No Easypanel só o Traefik dele escuta na internet; nos caminhos B e C, só o proxy. Banco, `auth`, `rest`, `templates` e `web` ficam numa rede interna do Docker.
- A `ANON_KEY` é pública por natureza (vai dentro do app). Quem protege os dados é o RLS: cada conta só lê e altera o que é dela.
- O `JWT_SECRET` e a senha do banco ficam só no ambiente do serviço/`.env` da VPS. **Não troque `POSTGRES_PASSWORD` depois do primeiro deploy** (os papéis do banco guardam a senha antiga).
- O painel do Easypanel na porta 3000 é HTTP puro: considere fechá-la no firewall (acessar por túnel SSH) ou dar um domínio HTTPS a ele.
- Firewall: deixe abertas só 22 (SSH), 80 e 443.
- Não há Studio. Para mexer no banco: `docker exec -it NOME-DO-CONTEINER-DO-BANCO psql -U postgres`.

## O que foi verificado

Tudo numa stack descartável no Docker do Mac (segredos aleatórios, apagada ao final), com o `supabase-js` do app:

- **67 checagens** de ponta a ponta, nos três formatos (overlay Caddy, overlay Traefik 3 e o compose gerado para o Easypanel): roteamento de `/`, `/auth/v1` e `/rest/v1` no mesmo endereço; anônimo sem acesso a dados e sem poder chamar `delete_my_account`; JWT forjado e `service_role` forjado recusados; senhas fracas recusadas pelo servidor; cadastro criando o perfil por gatilho; isolamento entre duas contas (ler, alterar, apagar, criar em nome do outro, transferir); login, senha errada, renovação e rotação de refresh token; recuperação por código de 6 números recebido por e-mail (SMTP falso) e uso único do código; exclusão de conta apagando tudo em cascata.
- **24 checagens de operação** no formato Easypanel: o `migrate` roda de novo sem mudar nada; o IP real do cliente atravessa o gateway; **desastre completo** (backup → apagar todos os volumes → reimplantar do zero → restaurar, com várias contas: mesmo UUID, login com a senha original, RLS pela API); `restore.sh` recusa sobrescrever sem `--substituir`; `reset-password.sh`; `publish-site.sh` (site, APK com o tipo MIME certo, página 404, remoção de arquivos velhos).
- O app Android de release (APK assinado) rodou num emulador Android 16 contra um servidor de teste: login, lista, mapa, notificação exata, exclusão de conta.

**Não foi verificado:** HTTPS com certificado real (Let's Encrypt) e o Easypanel de verdade (o compose segue a documentação dele, mas nunca rodou num painel real), a VPS (versão do Docker/Compose, o que já roda nela), envio de e-mail por um SMTP real e carga com muitos usuários.
