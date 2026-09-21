#!/usr/bin/env bash
# Cria deploy/.env com segredos aleatórios. Não sobrescreve um .env existente (trocar o segredo do JWT desloga todo mundo).
#   scripts/gen-env.sh <host-público>      ex.: scripts/gen-env.sh srv1974100.hstgr.cloud
# A chave "anon" que o app usa é um JWT com role=anon assinado com o JWT_SECRET; ela é pública por natureza (o RLS protege os dados).
# A chave de serviço (service_role) NÃO é gerada: o app não precisa dela, e sem ela a API administrativa do login fica inacessível.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -e .env ]; then echo ".env já existe: não sobrescrevi."; exit 0; fi
PUBLIC_HOST="${1:?uso: scripts/gen-env.sh <host-público>}"

rand()   { openssl rand -base64 64 | tr -d '/+=\n' | cut -c1-"$1"; }
b64url() { openssl base64 -A | tr '+/' '-_' | tr -d '='; }

JWT_SECRET="$(rand 48)"
POSTGRES_PASSWORD="$(rand 32)"
now="$(date +%s)"; exp=$((now + 10 * 365 * 24 * 3600))
header="$(printf '{"alg":"HS256","typ":"JWT"}' | b64url)"
payload="$(printf '{"role":"anon","iss":"lembreiai","iat":%s,"exp":%s}' "$now" "$exp" | b64url)"
signature="$(printf '%s.%s' "$header" "$payload" | openssl dgst -binary -sha256 -hmac "$JWT_SECRET" | b64url)"
ANON_KEY="$header.$payload.$signature"

umask 077
cat > .env <<EOF
# Gerado por scripts/gen-env.sh em $(date -u +%F). NÃO commite e faça backup deste arquivo (sem ele o banco não abre).
PUBLIC_HOST=$PUBLIC_HOST
SITE_URL=https://$PUBLIC_HOST
# o app não usa link de e-mail com redirecionamento personalizado; deixe vazio a menos que precise
URI_ALLOW_LIST=

POSTGRES_PASSWORD=$POSTGRES_PASSWORD
JWT_SECRET=$JWT_SECRET
# é ESTA a chave que vai em EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY (pública por natureza)
ANON_KEY=$ANON_KEY

# E-mail. Sem SMTP o cadastro entra direto (true) e "esqueci minha senha" não envia nada.
# Com SMTP (ver README), coloque MAILER_AUTOCONFIRM=false para exigir a confirmação do e-mail.
MAILER_AUTOCONFIRM=true
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_ADMIN_EMAIL=
SMTP_SENDER_NAME=LembreiAi

# Só para o overlay do Traefik (docker-compose.traefik.yml)
TRAEFIK_NETWORK=
TRAEFIK_ENTRYPOINT=websecure
TRAEFIK_CERTRESOLVER=
EOF
echo ".env criado (permissão 600). Chave anon do app:"
echo "$ANON_KEY"
