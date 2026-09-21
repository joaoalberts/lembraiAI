#!/usr/bin/env bash
# Restaura um backup do scripts/backup.sh (contas, perfis e lembretes) num stack JÁ implantado, com as migrations aplicadas.
#   scripts/restore.sh backups/lembreiai-AAAA-MM-DD.dump                 só se o banco ainda não tem contas
#   scripts/restore.sh backups/lembreiai-AAAA-MM-DD.dump --substituir    apaga as contas atuais antes
# Roda numa transação só (tudo ou nada). Todos ficam deslogados (sessões não entram no backup) e entram de novo com a mesma senha.
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/lib.sh

dump="${1:?uso: scripts/restore.sh backups/lembreiai-AAAA-MM-DD.dump [--substituir]}"
[ -s "$dump" ] || { echo "não achei $dump"; exit 1; }

existentes="$(psql_db -At -c "select count(*) from auth.users")"
if [ "$existentes" != "0" ]; then
  [ "${2:-}" = "--substituir" ] || { echo "o banco já tem $existentes conta(s). Use --substituir para apagá-las antes de restaurar."; exit 1; }
  DB_USER=supabase_admin psql_db -c "set client_min_messages = warning; truncate table auth.users, public.profiles, public.reminders cascade" >/dev/null
fi

pgrestore_db --data-only --disable-triggers --single-transaction --exit-on-error < "$dump"
echo "restaurado: $(psql_db -At -c "select count(*) from auth.users") conta(s), $(psql_db -At -c "select count(*) from public.reminders") lembrete(s)."
