-- LembreiAi — exclusão de conta feita pela própria pessoa.
--
-- A App Store (guideline 5.1.1(v)) e o Google Play exigem que todo app que cria contas ofereça a exclusão DENTRO do app.
-- O app só tem a chave publicável (nunca a service_role), então quem apaga é esta função: SECURITY DEFINER, restrita ao
-- dono da sessão (auth.uid()). Apagar a linha de auth.users leva junto, por ON DELETE CASCADE, o perfil, os lembretes,
-- as identidades e as sessões — não sobra dado pessoal nenhum.

create function public.delete_my_account() returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'não autenticado' using errcode = '28000';
  end if;

  delete from auth.users where id = auth.uid();
end;
$$;

comment on function public.delete_my_account() is 'Apaga a conta de quem chamou e todos os dados ligados a ela (cascata a partir de auth.users).';

-- por padrão o Postgres libera EXECUTE para PUBLIC: fecha, e abre só para quem está logado
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
