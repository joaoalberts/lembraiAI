#!/usr/bin/env bash
# Redefine a senha de uma conta direto no banco. É o plano B para quando o SMTP não está configurado
# (sem SMTP o "Esqueci minha senha" do app não envia e-mail nenhum). Só quem tem acesso à VPS consegue rodar.
#   scripts/reset-password.sh pessoa@email.com
# A senha é pedida sem aparecer na tela e trafega só por entrada padrão (não fica no histórico nem na lista de processos).
# Mesmas regras do app: 8+ caracteres, com pelo menos uma letra e um número. Encerra também as sessões abertas da conta.
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/lib.sh

email="${1:?uso: scripts/reset-password.sh pessoa@email.com}"
email="$(printf '%s' "$email" | tr '[:upper:]' '[:lower:]')"
[[ "$email" =~ ^[^[:space:]@\']+@[^[:space:]@\']+\.[^[:space:]@\']+$ ]] || { echo "e-mail inválido"; exit 1; }

read -r -s -p "Nova senha: " senha; echo
read -r -s -p "Repita a senha: " repete; echo
[ "$senha" = "$repete" ] || { echo "as senhas não conferem"; exit 1; }
[ "${#senha}" -ge 8 ] || { echo "use 8 caracteres ou mais"; exit 1; }
[[ "$senha" =~ [A-Za-z] ]] && [[ "$senha" =~ [0-9] ]] || { echo "use ao menos uma letra e um número"; exit 1; }

esc="${senha//\'/\'\'}"

atualizadas="$(printf "%s\n" \
  "with alvo as (select id from auth.users where email = '$email' and deleted_at is null)," \
  "     nova as (update auth.users u set encrypted_password = crypt('$esc', gen_salt('bf', 10)), updated_at = now() from alvo where u.id = alvo.id returning u.id)," \
  "     fim  as (delete from auth.sessions s using nova where s.user_id = nova.id returning s.id)" \
  "select count(*) from nova;" | psql_db -At)"

if [ "$atualizadas" = "1" ]; then echo "senha de $email redefinida; as sessões antigas foram encerradas."
else echo "nenhuma conta com o e-mail $email"; exit 1; fi
