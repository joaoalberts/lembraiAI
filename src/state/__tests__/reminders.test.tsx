import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { Row } from '../../lib/reminder-rows';
import { RemindersProvider, useReminders, type Draft } from '../reminders';

const mockUseAuth = jest.fn();
jest.mock('../auth', () => ({ useAuth: () => mockUseAuth() }));

// O Supabase real não roda aqui: cada `from('reminders')` devolve uma cadeia que se encadeia em qualquer ordem e termina
// (await ou single) no resultado que o teste combinou para aquela chamada.
jest.mock('../../lib/supabase', () => {
  const chamadas: { metodo: string; args: unknown[] }[] = [];
  const respostas: { lista: unknown; escrita: unknown } = { lista: { data: [], error: null }, escrita: { data: null, error: null } };
  const cadeia = (resposta: () => unknown): unknown =>
    new Proxy({}, {
      get: (_alvo, nome: string) => {
        if (nome === 'then') return (ok: (v: unknown) => unknown) => Promise.resolve(resposta()).then(ok);
        return (...args: unknown[]) => { chamadas.push({ metodo: nome, args }); return cadeia(resposta); };
      },
    });
  return {
    supabase: {
      from: () => ({
        select: (...args: unknown[]) => { chamadas.push({ metodo: 'select', args }); return cadeia(() => respostas.lista); },
        update: (...args: unknown[]) => { chamadas.push({ metodo: 'update', args }); return cadeia(() => respostas.escrita); },
      }),
    },
    __chamadas: chamadas,
    __respostas: respostas,
  };
});

const mock = jest.requireMock('../../lib/supabase') as {
  __chamadas: { metodo: string; args: unknown[] }[];
  __respostas: { lista: unknown; escrita: unknown };
};

const linha = (extra: Partial<Row> = {}): Row => ({
  id: 'r1', user_id: 'u1', title: 'Comprar água', kind: 'time', category: 'green', icon: 'cart',
  place: null, lat: null, lng: null, radius: null, remind_date: '2026-09-22', remind_time: '09:00:00', repeat: 'never', active: true, ...extra,
});

const rascunho = (extra: Partial<Draft> = {}): Draft => ({
  title: 'Academia', kind: 'time', dateISO: '2026-09-21', time: '18:00', repeat: 'daily', place: '', radius: 150, ...extra,
});

async function montar(linhas: Row[]) {
  mock.__respostas.lista = { data: linhas, error: null };
  const hook = await renderHook(() => useReminders(), { wrapper: RemindersProvider });
  await waitFor(() => expect(hook.result.current.reminders).toHaveLength(linhas.length));
  return hook;
}

beforeEach(() => {
  mock.__chamadas.length = 0;
  mockUseAuth.mockReturnValue({ user: { id: 'u1' } });
});

describe('RemindersProvider.update', () => {
  it('salva a edição, troca o lembrete na lista e reordena por data e hora', async () => {
    const { result } = await montar([linha({ id: 'a', title: 'Primeiro', remind_date: '2026-09-21' }), linha({ id: 'b', title: 'Segundo', remind_date: '2026-09-23' })]);
    mock.__respostas.escrita = { data: linha({ id: 'a', title: 'Academia', remind_date: '2026-09-25', remind_time: '18:00:00', repeat: 'daily', icon: 'dumbbell' }), error: null };

    let salvo: unknown = null;
    await act(async () => { salvo = await result.current.update('a', rascunho({ dateISO: '2026-09-25' })); });

    expect(salvo).toMatchObject({ id: 'a', title: 'Academia', time: '18:00', repeat: 'daily' });
    expect(result.current.reminders.map((r) => r.id)).toEqual(['b', 'a']);
    expect(result.current.reminders.find((r) => r.id === 'a')?.title).toBe('Academia');
    expect(result.current.erro).toBeNull();
  });

  it('atualiza só o lembrete pedido e nunca troca o dono', async () => {
    const { result } = await montar([linha({ id: 'a' })]);
    mock.__respostas.escrita = { data: linha({ id: 'a', title: 'Academia' }), error: null };

    await act(async () => { await result.current.update('a', rascunho()); });

    const atualizacao = mock.__chamadas.find((c) => c.metodo === 'update');
    expect(atualizacao?.args[0]).toMatchObject({ title: 'Academia', kind: 'time', remind_date: '2026-09-21', remind_time: '18:00', repeat: 'daily' });
    expect(atualizacao?.args[0]).not.toHaveProperty('user_id');
    expect(mock.__chamadas.find((c) => c.metodo === 'eq' && c.args[0] === 'id')?.args).toEqual(['id', 'a']);
  });

  it('se o banco recusar, avisa, devolve null e não mexe na lista', async () => {
    const { result } = await montar([linha({ id: 'a', title: 'Comprar água' })]);
    mock.__respostas.escrita = { data: null, error: { message: 'negado' } };

    let salvo: unknown = 'intacto';
    await act(async () => { salvo = await result.current.update('a', rascunho()); });

    expect(salvo).toBeNull();
    expect(result.current.erro).toBe('Não foi possível salvar o lembrete.');
    expect(result.current.reminders[0].title).toBe('Comprar água');
  });
});

describe('RemindersProvider: carregando', () => {
  /** Anota o `carregando` de CADA render (o `result.current` só mostra o último, depois dos efeitos). */
  async function observar() {
    const vistos: boolean[] = [];
    const hook = await renderHook(() => { const s = useReminders(); vistos.push(s.carregando); return s; }, { wrapper: RemindersProvider });
    return { ...hook, vistos };
  }

  it('já é "carregando" no primeiro render com conta, antes de a lista chegar: sem isso as telas piscam "não existe mais" ou "nenhum lembrete"', async () => {
    mock.__respostas.lista = { data: [linha()], error: null };
    const { result, vistos } = await observar();
    expect(vistos[0]).toBe(true);
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.reminders).toHaveLength(1);
  });

  it('nenhum render mostra a lista vazia e sem carregar antes de a primeira resposta chegar', async () => {
    mock.__respostas.lista = { data: [linha()], error: null };
    const { result, vistos } = await observar();
    await waitFor(() => expect(result.current.carregando).toBe(false));
    const primeiroSemCarregar = vistos.indexOf(false);
    expect(primeiroSemCarregar).toBeGreaterThan(0);
    expect(vistos.slice(0, primeiroSemCarregar).every(Boolean)).toBe(true);
  });

  it('se a primeira busca falha, também deixa de carregar (com o aviso de erro), em vez de girar para sempre', async () => {
    mock.__respostas.lista = { data: null, error: { message: 'falhou' } };
    const { result } = await observar();
    await waitFor(() => expect(result.current.carregando).toBe(false));
    expect(result.current.erro).toBe('Não foi possível carregar seus lembretes.');
    expect(result.current.reminders).toHaveLength(0);
  });

  it('sem conta não há o que carregar: nunca fica carregando', async () => {
    mockUseAuth.mockReturnValue({ user: null });
    const { result, vistos } = await observar();
    expect(vistos.every((v) => v === false)).toBe(true);
    expect(result.current.carregando).toBe(false);
  });

  it('depois de sair da conta a lista esvazia e deixa de carregar (a conta que respondeu não é mais a atual)', async () => {
    mock.__respostas.lista = { data: [linha()], error: null };
    const { result, rerender } = await observar();
    await waitFor(() => expect(result.current.carregando).toBe(false));
    mockUseAuth.mockReturnValue({ user: null });
    await rerender(undefined);
    await waitFor(() => expect(result.current.reminders).toHaveLength(0));
    expect(result.current.carregando).toBe(false);
  });

  it('recarregar depois da primeira vez volta a "carregando" enquanto busca e termina em falso', async () => {
    mock.__respostas.lista = { data: [linha()], error: null };
    const { result } = await observar();
    await waitFor(() => expect(result.current.carregando).toBe(false));
    let fim: () => void = () => {};
    const terminou = new Promise<void>((ok) => { fim = ok; });
    mock.__respostas.lista = { data: [linha(), linha({ id: 'r2' })], error: null };
    let recarga: Promise<void> = Promise.resolve();
    await act(async () => { recarga = result.current.recarregar().then(fim); });
    await terminou;
    await recarga;
    expect(result.current.carregando).toBe(false);
    expect(result.current.reminders).toHaveLength(2);
  });
});
