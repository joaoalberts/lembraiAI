import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { mensagemDeErro } from '../lib/validacao';
import { supabase, setLembrarMe } from '../lib/supabase';

/** Devolvido por `cadastrar` quando a conta foi criada mas falta confirmar o e-mail: não é erro. */
export const AVISO_CONFIRMAR_EMAIL = 'Conta criada. Confirme o e-mail que enviamos para entrar.';

interface AuthState {
  /** `undefined` enquanto a sessão guardada ainda está sendo lida (evita piscar a tela de login). */
  session: Session | null | undefined;
  user: User | null;
  nome: string;
  /**
   * Verdadeiro entre validar o código/link de recuperação e definir a nova senha. Nesse intervalo já existe sessão
   * (é o que autoriza o `updateUser`), mas a pessoa ainda NÃO entrou: o roteamento não pode mandá-la para dentro do app.
   */
  recuperando: boolean;
  entrar: (email: string, senha: string, lembrar: boolean) => Promise<string | null>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<string | null>;
  sair: () => Promise<void>;
  trocarSenha: (atual: string, nova: string) => Promise<string | null>;
  pedirRedefinicao: (email: string) => Promise<string | null>;
  validarTokenRecuperacao: (tokenHash: string) => Promise<string | null>;
  validarCodigoRecuperacao: (email: string, codigo: string) => Promise<string | null>;
  definirNovaSenha: (senha: string) => Promise<string | null>;
  cancelarRecuperacao: () => Promise<void>;
  /** Apaga a conta e todos os dados dela (exigência da App Store e do Google Play). Devolve mensagem de erro, ou null se deu certo. */
  excluirConta: () => Promise<string | null>;
}

const Ctx = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth deve estar dentro de AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [nome, setNome] = useState('');
  const [recuperando, setRecuperando] = useState(false);

  // Lê sessão guardada ao montar e acompanha as mudanças
  useEffect(() => {
    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    initSession();

    const { data } = supabase.auth.onAuthStateChange((evento, s) => {
      setSession(s);
      // O supabase-js avisa PASSWORD_RECOVERY antes de o verifyOtp devolver: as duas mudanças entram no mesmo render,
      // então o roteamento nunca vê "sessão sem recuperação" (o que jogaria a pessoa para dentro do app).
      if (evento === 'PASSWORD_RECOVERY') setRecuperando(true);
      else if (!s) setRecuperando(false);
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  // Carrega nome do perfil quando sessão muda
  useEffect(() => {
    const id = session?.user?.id;
    if (!id) {
      setNome('');
      return;
    }

    let vivo = true;
    const loadName = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', id)
        .maybeSingle();
      if (vivo) setNome(data?.name ?? '');
    };

    loadName();
    return () => {
      vivo = false;
    };
  }, [session?.user?.id]);

  const entrar = useCallback(async (email: string, senha: string, lembrar: boolean) => {
    setLembrarMe(lembrar);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });
      if (error) return mensagemDeErro(error);
      setRecuperando(false);
      return null;
    } catch {
      return mensagemDeErro({ message: 'network request failed' });
    }
  }, []);

  const cadastrar = useCallback(async (nomeNovo: string, email: string, senha: string) => {
    setLembrarMe(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: { data: { name: nomeNovo.trim() } },
      });
      if (error) return mensagemDeErro(error);
      if (!data.session) return AVISO_CONFIRMAR_EMAIL;
      return null;
    } catch {
      return mensagemDeErro({ message: 'network request failed' });
    }
  }, []);

  const sair = useCallback(async () => {
    await supabase.auth.signOut();
    setRecuperando(false);
    setLembrarMe(false);
  }, []);

  const trocarSenha = useCallback(async (atual: string, nova: string) => {
    const email = session?.user?.email;
    if (!email) return 'Sessão expirada. Entre de novo.';

    try {
      const { error: erroAtual } = await supabase.auth.signInWithPassword({
        email,
        password: atual,
      });
      if (erroAtual) return 'Senha atual incorreta.';

      const { error } = await supabase.auth.updateUser({ password: nova });
      if (error) return mensagemDeErro(error);
      return null;
    } catch {
      return mensagemDeErro({ message: 'network request failed' });
    }
  }, [session?.user?.email]);

  const pedirRedefinicao = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        // O e-mail traz um código de 6 números (fluxo do app) e um link (fluxo web); o link usa o Site URL do Supabase.
        redirectTo: Linking.createURL('/auth/reset-password'),
      });
      if (error) return mensagemDeErro(error);
      return null;
    } catch {
      return mensagemDeErro({ message: 'network request failed' });
    }
  }, []);

  /** Fluxo do link do e-mail (web): troca o token do link por uma sessão curta de recuperação. */
  const validarTokenRecuperacao = useCallback(async (tokenHash: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({ type: 'recovery', token_hash: tokenHash });
      if (error) return mensagemDeErro(error);
      setRecuperando(true);
      return null;
    } catch {
      return mensagemDeErro({ message: 'network request failed' });
    }
  }, []);

  /** Fluxo do app: a pessoa digita o código de 6 números do e-mail (links personalizados não abrem em todo leitor de e-mail). */
  const validarCodigoRecuperacao = useCallback(async (email: string, codigo: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({ type: 'recovery', email: email.trim(), token: codigo.trim() });
      if (error) return mensagemDeErro(error);
      setRecuperando(true);
      return null;
    } catch {
      return mensagemDeErro({ message: 'network request failed' });
    }
  }, []);

  /** Grava a nova senha e encerra a sessão de recuperação: a nova senha se prova entrando de novo. */
  const definirNovaSenha = useCallback(async (senha: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) return mensagemDeErro(error);
      await supabase.auth.signOut();
      setRecuperando(false);
      return null;
    } catch {
      return mensagemDeErro({ message: 'network request failed' });
    }
  }, []);

  /** Desiste no meio da recuperação: sem isso ficaria uma sessão aberta sem a pessoa ter definido senha nenhuma. */
  const cancelarRecuperacao = useCallback(async () => {
    await supabase.auth.signOut();
    setRecuperando(false);
  }, []);

  /**
   * Chama a função `delete_my_account` do banco (SECURITY DEFINER, só apaga quem está logado) e encerra a sessão local.
   * O encerramento é `local`: no servidor a sessão já não existe mais, e um logout global só devolveria erro.
   */
  const excluirConta = useCallback(async () => {
    try {
      const { error } = await supabase.rpc('delete_my_account');
      if (error) return mensagemDeErro(error);
      await supabase.auth.signOut({ scope: 'local' });
      setRecuperando(false);
      setLembrarMe(false);
      return null;
    } catch {
      return mensagemDeErro({ message: 'network request failed' });
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      nome,
      recuperando,
      entrar,
      cadastrar,
      sair,
      trocarSenha,
      pedirRedefinicao,
      validarTokenRecuperacao,
      validarCodigoRecuperacao,
      definirNovaSenha,
      cancelarRecuperacao,
      excluirConta,
    }),
    [
      session,
      nome,
      recuperando,
      entrar,
      cadastrar,
      sair,
      trocarSenha,
      pedirRedefinicao,
      validarTokenRecuperacao,
      validarCodigoRecuperacao,
      definirNovaSenha,
      cancelarRecuperacao,
      excluirConta,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
