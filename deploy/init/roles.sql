-- Roda uma única vez, na criação do banco (imagem supabase/postgres). O GoTrue e o PostgREST entram com estes dois papéis.
\set pgpass `echo "$POSTGRES_PASSWORD"`

ALTER USER authenticator WITH PASSWORD :'pgpass';
ALTER USER supabase_auth_admin WITH PASSWORD :'pgpass';
