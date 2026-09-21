#!/bin/sh
# Serviço `migrate` do stack: aplica /migrations/*.sql (as mesmas do app web) uma vez cada e registra em ops.app_migrations.
# Roda a cada deploy e termina; sem migration nova, não altera nada. Conecta pelas variáveis PG* do serviço.
set -eu
q() { psql -v ON_ERROR_STOP=1 -At "$@"; }

i=0
until [ "$(q -c "select to_regclass('auth.users') is not null" 2>/dev/null || true)" = "t" ]; do
  i=$((i + 1))
  [ "$i" -gt 60 ] && { echo "auth.users não apareceu: veja os logs do serviço auth"; exit 1; }
  sleep 2
done

q -c "create schema if not exists ops; create table if not exists ops.app_migrations (name text primary key, applied_at timestamptz not null default now());" >/dev/null

for f in /migrations/*.sql; do
  n="$(basename "$f")"
  if [ "$(q -c "select count(*) from ops.app_migrations where name = '$n'")" = "0" ]; then
    echo "aplicando $n"
    q -1 -f "$f" >/dev/null
    q -c "insert into ops.app_migrations (name) values ('$n')" >/dev/null
  else
    echo "já aplicada: $n"
  fi
done
echo "migrations em dia."
