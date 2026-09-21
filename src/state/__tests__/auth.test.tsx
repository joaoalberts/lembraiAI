import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AVISO_CONFIRMAR_EMAIL, AuthProvider, useAuth } from '../auth';

// O supabase-js real não roda aqui: este mock imita o que importa para o roteamento — a ORDEM dos eventos de auth.
jest.mock('../../lib/supabase', () => {
  const listeners: Array<(evento: string, sessao: unknown) => void> = [];
  const auth = {
    getSession: jest.fn(async () => ({ data: { session: null } })),
    onAuthStateChange: jest.fn((cb: (evento: string, sessao: unknown) => void) => {
      listeners.push(cb);
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    }),
    verifyOtp: jest.fn(),
    updateUser: jest.fn(),
    signOut: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    resetPasswordForEmail: jest.fn(),
  };
  const from = () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) });
  return { supabase: { auth, from, rpc: jest.fn() }, setLembrarMe: jest.fn(), __listeners: listeners };
});

const mock = jest.requireMock('../../lib/supabase') as {
  supabase: { auth: Record<string, jest.Mock>; rpc: jest.Mock };
  setLembrarMe: jest.Mock;
  __listeners: Array<(evento: string, sessao: unknown) => void>;
};
const auth = mock.supabase.auth;
const emitir = (evento: string, sessao: unknown) => mock.__listeners.forEach((l) => l(evento, sessao));

const SESSAO = { access_token: 't', user: { id: 'u1', email: 'a@b.co' } };

async function montar() {
  const hook = await renderHook(() => useAuth(), { wrapper: AuthProvider });
  await waitFor(() => expect(hook.result.current.session).toBeNull());
  return hook;
}

/** Como o supabase-js: em recovery, avisa PASSWORD_RECOVERY antes de devolver; signOut avisa SIGNED_OUT. */
beforeEach(() => {
  mock.__listeners.length = 0;
  mock.supabase.rpc.mockReset();
  Object.values(auth).forEach((fn) => fn.mockReset());
  auth.getSession.mockResolvedValue({ data: { session: null } });
  auth.onAuthStateChange.mockImplementation((cb: (evento: string, sessao: unknown) => void) => {
    mock.__listeners.push(cb);
    return { data: { subscription: { unsubscribe: jest.fn() } } };
  });
  auth.verifyOtp.mockImplementation(async () => {
    emitir('PASSWORD_RECOVERY', SESSAO);
    return { data: { session: SESSAO }, error: null };
  });
  auth.updateUser.mockResolvedValue({ error: null });
  auth.signOut.mockImplementation(async () => {
    emitir('SIGNED_OUT', null);
    return { error: null };
  });
  auth.signInWithPassword.mockImplementation(async () => {
    emitir('SIGNED_IN', SESSAO);
    return { data: { session: SESSAO }, error: null };
  });
});

describe('recuperação de senha', () => {
  it('validar o código cria a sessão E marca "recuperando"', async () => {
    const { result } = await montar();

    let erro: string | null = 'x';
    await act(async () => { erro = await result.current.validarCodigoRecuperacao(' a@b.co ', ' 123456 '); });

    expect(erro).toBeNull();
    expect(auth.verifyOtp).toHaveBeenCalledWith({ type: 'recovery', email: 'a@b.co', token: '123456' });
    expect(result.current.session).toBeTruthy();
    expect(result.current.recuperando).toBe(true);
  });

  // Limite conhecido: o `act` do teste junta os updates, então isto NÃO prova a ordem dos renders num app real
  // (a ordem foi conferida à parte, no navegador, sem act). Aqui vale como rede contra esquecer o flag.
  it('o layout raiz nunca consideraria a pessoa autenticada durante a recuperação (histórico de renders do teste)', async () => {
    const historico: boolean[] = [];   // o que o layout raiz enxergaria a cada render: autenticado?
    const { result } = await renderHook(
      () => {
        const a = useAuth();
        historico.push(!!a.session && !a.recuperando);
        return a;
      },
      { wrapper: AuthProvider },
    );
    await waitFor(() => expect(result.current.session).toBeNull());

    await act(async () => { await result.current.validarCodigoRecuperacao('a@b.co', '123456'); });

    expect(result.current.session).toBeTruthy();
    expect(historico.every((autenticado) => autenticado === false)).toBe(true);   // se algum render virasse true, a pessoa cairia dentro do app
  });

  it('código errado devolve mensagem em português e não abre recuperação', async () => {
    auth.verifyOtp.mockResolvedValue({ data: {}, error: { code: 'otp_expired', message: 'Token has expired or is invalid' } });
    const { result } = await montar();

    let erro: string | null = null;
    await act(async () => { erro = await result.current.validarCodigoRecuperacao('a@b.co', '000000'); });

    expect(erro).toMatch(/expirou, está incorreto ou já foi usado/);
    expect(result.current.recuperando).toBe(false);
    expect(result.current.session).toBeNull();
  });

  it('o link do e-mail (token_hash, web) também abre a recuperação', async () => {
    const { result } = await montar();
    await act(async () => { await result.current.validarTokenRecuperacao('hash123'); });

    expect(auth.verifyOtp).toHaveBeenCalledWith({ type: 'recovery', token_hash: 'hash123' });
    expect(result.current.recuperando).toBe(true);
  });

  it('nova senha: grava, encerra a sessão de recuperação e libera o login', async () => {
    const { result } = await montar();
    await act(async () => { await result.current.validarCodigoRecuperacao('a@b.co', '123456'); });

    let erro: string | null = 'x';
    await act(async () => { erro = await result.current.definirNovaSenha('senhaboa1'); });

    expect(erro).toBeNull();
    expect(auth.updateUser).toHaveBeenCalledWith({ password: 'senhaboa1' });
    expect(auth.signOut).toHaveBeenCalled();
    expect(result.current.recuperando).toBe(false);
    expect(result.current.session).toBeNull();
  });

  it('senha recusada pelo servidor: mensagem em português e a recuperação continua aberta', async () => {
    auth.updateUser.mockResolvedValue({ error: { code: 'weak_password', message: 'Password should be at least 8 characters' } });
    const { result } = await montar();
    await act(async () => { await result.current.validarCodigoRecuperacao('a@b.co', '123456'); });

    let erro: string | null = null;
    await act(async () => { erro = await result.current.definirNovaSenha('abc'); });

    expect(erro).toMatch(/Senha fraca/);
    expect(auth.signOut).not.toHaveBeenCalled();
    expect(result.current.recuperando).toBe(true);
  });

  it('cancelar no meio encerra a sessão em vez de deixá-la aberta sem senha nova', async () => {
    const { result } = await montar();
    await act(async () => { await result.current.validarCodigoRecuperacao('a@b.co', '123456'); });

    await act(async () => { await result.current.cancelarRecuperacao(); });

    expect(auth.signOut).toHaveBeenCalled();
    expect(result.current.recuperando).toBe(false);
    expect(result.current.session).toBeNull();
  });
});

describe('exclusão de conta (exigência das lojas)', () => {
  it('chama a função do banco e encerra só a sessão local (a do servidor já não existe mais)', async () => {
    mock.supabase.rpc.mockResolvedValue({ data: null, error: null });
    const { result } = await montar();
    await act(async () => { await result.current.entrar('a@b.co', 'senhaboa1', true); });
    expect(result.current.session).toBeTruthy();

    let erro: string | null = 'x';
    await act(async () => { erro = await result.current.excluirConta(); });

    expect(erro).toBeNull();
    expect(mock.supabase.rpc).toHaveBeenCalledWith('delete_my_account');
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(mock.setLembrarMe).toHaveBeenLastCalledWith(false);
    expect(result.current.session).toBeNull();
  });

  it('se o banco recusar, mostra o erro em português e mantém a pessoa logada', async () => {
    mock.supabase.rpc.mockResolvedValue({ data: null, error: { message: 'Failed to fetch' } });
    const { result } = await montar();
    await act(async () => { await result.current.entrar('a@b.co', 'senhaboa1', true); });

    let erro: string | null = null;
    await act(async () => { erro = await result.current.excluirConta(); });

    expect(erro).toBe('Sem conexão com o servidor. Verifique sua internet.');
    expect(auth.signOut).not.toHaveBeenCalled();
    expect(result.current.session).toBeTruthy();
  });

  it('falha de rede no meio também vira mensagem, sem estourar', async () => {
    mock.supabase.rpc.mockRejectedValue(new TypeError('Network request failed'));
    const { result } = await montar();

    let erro: string | null = null;
    await act(async () => { erro = await result.current.excluirConta(); });

    expect(erro).toBe('Sem conexão com o servidor. Verifique sua internet.');
  });
});

describe('login e cadastro', () => {
  it('login normal não fica preso em "recuperando"', async () => {
    const { result } = await montar();
    let erro: string | null = 'x';
    await act(async () => { erro = await result.current.entrar('a@b.co', 'senhaboa1', true); });

    expect(erro).toBeNull();
    expect(mock.setLembrarMe).toHaveBeenCalledWith(true);
    expect(result.current.session).toBeTruthy();
    expect(result.current.recuperando).toBe(false);
  });

  it('login recusado devolve a mensagem em português (igual para senha errada e e-mail inexistente)', async () => {
    auth.signInWithPassword.mockResolvedValue({ data: {}, error: { code: 'invalid_credentials', message: 'Invalid login credentials' } });
    const { result } = await montar();

    let erro: string | null = null;
    await act(async () => { erro = await result.current.entrar('a@b.co', 'errada123', true); });

    expect(erro).toBe('E-mail ou senha incorretos.');
  });

  it('cadastro sem sessão (e-mail precisa ser confirmado) devolve o aviso, não um erro', async () => {
    auth.signUp.mockResolvedValue({ data: { session: null }, error: null });
    const { result } = await montar();

    let retorno: string | null = null;
    await act(async () => { retorno = await result.current.cadastrar('Ana', 'a@b.co', 'senhaboa1'); });

    expect(retorno).toBe(AVISO_CONFIRMAR_EMAIL);
  });

  it('sair encerra a sessão e o modo de recuperação', async () => {
    const { result } = await montar();
    await act(async () => { await result.current.validarCodigoRecuperacao('a@b.co', '123456'); });

    await act(async () => { await result.current.sair(); });

    expect(result.current.recuperando).toBe(false);
    expect(result.current.session).toBeNull();
  });
});
