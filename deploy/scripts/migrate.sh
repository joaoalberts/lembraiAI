#!/usr/bin/env bash
# Aplica deploy/migrations/*.sql (as mesmas do app web) no banco, uma vez cada, e registra o que já foi aplicado.
# Precisa rodar depois de o GoTrue subir: as migrations dependem das tabelas do schema auth (que o GoTrue cria).
# O controle fica no schema `ops`, que a API (só expõe `public`) não enxerga.
# No Easypanel isto roda sozinho no deploy (serviço `migrate`); use este script nos outros modos de instalação.
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/lib.sh

sql() { psql_db "$@"; }

echo "aguardando o GoTrue criar o schema auth..."
for _ in $(seq 1 90); do
  [ "$(sql -Atc "select to_regclass('auth.users') is not null" 2>/dev/null || true)" = "t" ] && break
  sleep 2
done
[ "$(sql -Atc "select to_regclass('auth.users') is not null")" = "t" ] || { echo "auth.users não apareceu: veja 'docker compose logs auth'"; exit 1; }

sql -c "create schema if not exists ops; create table if not exists ops.app_migrations (name text primary key, applied_at timestamptz not null default now());" >/dev/null

for arquivo in migrations/*.sql; do
  nome="$(basename "$arquivo")"
  if [ "$(sql -Atc "select count(*) from ops.app_migrations where name = '$nome'")" = "0" ]; then
    echo "aplicando $nome"
    sql -1 -f - < "$arquivo"
    sql -c "insert into ops.app_migrations (name) values ('$nome')" >/dev/null
  else
    echo "já aplicada: $nome"
  fi
done
echo "migrations em dia."
