#!/usr/bin/env bash
# Backup diário do que é insubstituível: contas (auth.users, auth.identities), perfis e lembretes. O esquema vem das migrations e as
# sessões se recriam no login, então ficam de fora: o arquivo é pequeno e restaura em qualquer deploy novo (scripts/restore.sh).
#   crontab -e  ->  17 3 * * * cd /caminho/deploy && scripts/backup.sh >> backups/backup.log 2>&1
# Guarda 14 dias. Copie a pasta backups/ para FORA da VPS de vez em quando (uma VPS que morre leva os backups junto).
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/lib.sh
mkdir -p backups
arquivo="backups/lembreiai-$(date +%F).dump"
pgdump_db --data-only -t auth.users -t auth.identities -t public.profiles -t public.reminders > "$arquivo.tmp"
mv "$arquivo.tmp" "$arquivo"
find backups -name 'lembreiai-*.dump' -mtime +14 -delete
echo "$(date '+%F %T') backup ok: $arquivo ($(du -h "$arquivo" | cut -f1))"
