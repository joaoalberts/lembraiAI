-- LembreiAi — perfis e lembretes por usuário.
--
-- O Supabase Auth cuida de e-mail, hash de senha (bcrypt), tokens de recuperação e sessão; por isso aqui não há
-- tabela de usuários nem de tokens. O que falta é o que é nosso: o nome do cadastro e os lembretes, cada um
-- amarrado ao dono pelo RLS.

create schema if not exists private;
revoke all on schema private from anon, authenticated;

-- ─────────────────────────── perfis ───────────────────────────
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text not null default '' check (char_length(name) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Dados do usuário que não cabem em auth.users (hoje, o nome do cadastro).';

-- ─────────────────────────── lembretes ───────────────────────────
create table public.reminders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 200),
  kind        text not null check (kind in ('local', 'time')),
  -- cor e ícone são derivados da descrição (src/lib/categorize.ts), mas ficam gravados para o histórico não mudar
  -- sozinho quando as regras de detecção evoluírem
  category    text not null check (category in ('green', 'orange', 'blue', 'purple', 'pink')),
  icon        text not null check (icon in ('cart', 'dumbbell', 'pill', 'users', 'plane', 'pin', 'bell', 'briefcase', 'house', 'card')),
  place       text check (char_length(place) <= 300),
  lat         double precision check (lat between -90 and 90),
  lng         double precision check (lng between -180 and 180),
  radius      integer check (radius between 10 and 5000),
  remind_date date not null,
  remind_time time not null,
  -- chave, não o rótulo: o texto em português vive na interface (REPEAT_OPTIONS)
  repeat      text not null default 'never' check (repeat in ('never', 'daily', 'weekdays', 'weekly', 'monthly', 'yearly')),
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- sem coordenadas e raio não existe geofence: o banco recusa um "por local" pela metade
  constraint reminders_local_precisa_de_coordenadas check (
    kind <> 'local' or (lat is not null and lng is not null and radius is not null)
  )
);

comment on table public.reminders is 'Lembretes por horário ou por local (geofence), sempre de um único dono.';

-- a coluna do RLS precisa de índice: sem ele, toda leitura vira varredura da tabela inteira
create index reminders_user_id_idx on public.reminders (user_id);
-- o monitoramento de geofence só carrega os ativos por local
create index reminders_geofence_idx on public.reminders (user_id) where active and kind = 'local';

-- ─────────────────────────── updated_at ───────────────────────────
create function private.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();
create trigger reminders_set_updated_at before update on public.reminders
  for each row execute function private.set_updated_at();

-- ─────────────────────────── perfil no cadastro ───────────────────────────
-- Roda no INSERT em auth.users, quando ainda não existe sessão — por isso precisa de SECURITY DEFINER.
-- Fica no schema `private` (não exposto) para não virar endpoint público, com search_path travado.
create function private.handle_new_user() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- ─────────────────────────── RLS ───────────────────────────
-- Cada um só enxerga e altera o que é seu. `TO authenticated` sozinho não basta (seria autenticação sem
-- autorização): o filtro de dono vai no USING. UPDATE leva WITH CHECK também, senão daria para transferir
-- um lembrete para outra conta.
alter table public.profiles  enable row level security;
alter table public.reminders enable row level security;

create policy "perfil: ler o próprio" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "perfil: criar o próprio" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
create policy "perfil: editar o próprio" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "lembrete: ler os próprios" on public.reminders
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "lembrete: criar os próprios" on public.reminders
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "lembrete: editar os próprios" on public.reminders
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "lembrete: apagar os próprios" on public.reminders
  for delete to authenticated using ((select auth.uid()) = user_id);
