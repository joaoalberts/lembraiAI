#!/usr/bin/env bash
# Funções comuns dos scripts (use com `source`). Dois modos de falar com o banco:
#   padrão                 -> `docker compose` desta pasta (deploy/), com o .env daqui
#   DB_CONTAINER=<nome>    -> direto no contêiner do banco (Easypanel ou qualquer compose criado fora desta pasta).
#                             Ex.: DB_CONTAINER=$(docker ps -qf label=com.docker.compose.project=lembreiai_stack -f label=com.docker.compose.service=db)
# DB_USER troca o papel do psql (padrão `postgres`; `supabase_admin` é o superusuário, só para restaurar/truncar).

db_exec() {
  if [ -n "${DB_CONTAINER:-}" ]; then
    docker exec -i "$DB_CONTAINER" "$@"
  else
    docker compose --env-file .env -f docker-compose.yml exec -T db "$@"
  fi
}

psql_db() { db_exec psql -U "${DB_USER:-postgres}" -d postgres -v ON_ERROR_STOP=1 "$@"; }

# backup lógico: passe os -t/-n que quiser; sai em stdout
pgdump_db() { db_exec pg_dump -U postgres -Fc "$@" postgres; }

# restauração precisa de superusuário (--disable-triggers): no Supabase é o `supabase_admin`, que entra pelo socket local do contêiner
pgrestore_db() { db_exec pg_restore -U supabase_admin -d postgres "$@"; }
