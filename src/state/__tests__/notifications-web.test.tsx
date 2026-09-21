import { act, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import type { Reminder } from '../../data/reminders';
import { useAuth } from '../auth';
import { NotificationsProvider, useNotifications } from '../notifications.web';

jest.mock('../auth', () => ({ useAuth: jest.fn() }));

const lembrete = (parte: Partial<Reminder> = {}): Reminder => ({
  id: 'r1', title: 'Tomar remédio', category: 'blue', icon: 'pill', kind: 'time',
  dateISO: '2026-09-21', time: '09:00', repeat: 'never', active: true, ...parte,
});
const hora = (h: number, m = 0, s = 0) => new Date(2026, 8, 21, h, m, s);
const CHAVE_GUARDADA = 'lembreiai:avisos-web';

let ultimo: ReturnType<typeof useNotifications>;
const Sonda = () => { ultimo = useNotifications(); return <Text>sonda</Text>; };

// o ambiente do Jest não tem navegador: o mínimo que o provedor toca
const armazenamento = new Map<string, string>();
const showNotification = jest.fn(async () => undefined);
const NotificationDeMentira = jest.fn();
const configurarNavegador = ({ permissao = 'default', comServiceWorker = true }: { permissao?: string; comServiceWorker?: boolean } = {}) => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: (k: string) => armazenamento.get(k) ?? null, setItem: (k: string, v: string) => { armazenamento.set(k, v); }, removeItem: (k: string) => { armazenamento.delete(k); } },
  });
  const N = NotificationDeMentira as unknown as { permission: string; requestPermission: () => Promise<string> };
  N.permission = permissao;
  N.requestPermission = jest.fn(async () => { N.permission = 'granted'; return 'granted'; });
  Object.defineProperty(globalThis, 'Notification', { configurable: true, value: NotificationDeMentira });
  Object.defineProperty(globalThis.navigator, 'serviceWorker', {
    configurable: true,
    value: comServiceWorker ? { getRegistration: async () => ({ showNotification }) } : undefined,
  });
};

const abrir = async (reminders: Reminder[], { logado = true }: { logado?: boolean } = {}) => {
  jest.mocked(useAuth).mockReturnValue({ user: logado ? { id: 'u1' } : null } as unknown as ReturnType<typeof useAuth>);
  await render(<NotificationsProvider><Sonda /></NotificationsProvider>);
  await act(async () => { await ultimo.syncReminders(reminders); });
};
const passar = async (ms: number) => { await act(async () => { jest.advanceTimersByTime(ms); }); };

beforeEach(() => {
  jest.clearAllMocks();
  armazenamento.clear();
  configurarNavegador();
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  jest.setSystemTime(hora(8, 59, 50));
});
afterEach(() => { jest.useRealTimers(); });

describe('avisos na web: o que o app diz de si', () => {
  it('está disponível, mas só com o app aberto (o navegador não agenda nada)', async () => {
    await abrir([]);
    expect(ultimo.supported).toBe(true);
    expect(ultimo.modo).toBe('so-com-o-app-aberto');
  });
});

describe('avisos na web: o relógio', () => {
  it('avisa na tela na hora do lembrete, com título e o corpo de sempre', async () => {
    await abrir([lembrete()]);
    expect(ultimo.avisosNaTela).toEqual([]);
    await passar(15_000); // 09:00:05
    expect(ultimo.avisosNaTela).toHaveLength(1);
    expect(ultimo.avisosNaTela?.[0]).toMatchObject({ title: 'Tomar remédio', body: 'Lembrete das 09:00' });
  });

  it('não avisa duas vezes o mesmo horário (o aviso da tela some sozinho; o do navegador conta as entregas)', async () => {
    configurarNavegador({ permissao: 'granted' });
    await abrir([lembrete()]);
    await passar(15_000);
    await passar(60_000);
    expect(showNotification).toHaveBeenCalledTimes(1);
  });

  it('recarregar a página não repete o aviso: o que já foi avisado fica guardado, mesmo se a conferência recomeçar de antes', async () => {
    await abrir([lembrete()]);
    await passar(15_000);
    expect(ultimo.avisosNaTela).toHaveLength(1);

    const guardado = JSON.parse(armazenamento.get(CHAVE_GUARDADA) ?? '{}');
    expect(guardado.avisados).toHaveLength(1);
    armazenamento.set(CHAVE_GUARDADA, JSON.stringify({ ...guardado, ultimo: hora(8, 59, 50).getTime() })); // a conferência recomeça antes do horário
    jest.setSystemTime(hora(9, 0, 30));
    await abrir([lembrete()]); // outra montagem do app, mesmo armazenamento
    await passar(15_000);
    expect(ultimo.avisosNaTela).toEqual([]);
  });

  it('a primeira vez começa de agora: não dispara o que passou antes do app abrir', async () => {
    jest.setSystemTime(hora(9, 20));
    await abrir([lembrete()]);
    await passar(15_000);
    expect(ultimo.avisosNaTela).toEqual([]);
  });

  it('a aba dormiu e acordou pouco depois do horário (até 30 min): ainda avisa', async () => {
    await abrir([lembrete()]);
    await passar(1_000); // a conferência parou em 08:59:51
    jest.setSystemTime(hora(9, 10));
    await passar(6_000);
    expect(ultimo.avisosNaTela).toHaveLength(1);
  });

  it('app aberto muito depois do horário (mais de 30 min): deixa passar, em vez de avisar de algo velho', async () => {
    armazenamento.set(CHAVE_GUARDADA, JSON.stringify({ ultimo: hora(8, 0).getTime(), avisados: [] }));
    jest.setSystemTime(hora(9, 10));
    await abrir([lembrete({ time: '08:10' })]);
    await passar(6_000);
    expect(ultimo.avisosNaTela).toEqual([]);
  });

  it('repetição diária avisa de novo no dia seguinte', async () => {
    configurarNavegador({ permissao: 'granted' });
    await abrir([lembrete({ dateISO: '2026-09-01', repeat: 'daily' })]);
    await passar(15_000);
    expect(showNotification).toHaveBeenCalledTimes(1);
    jest.setSystemTime(new Date(2026, 8, 22, 8, 59, 55));
    await passar(10_000);
    expect(showNotification).toHaveBeenCalledTimes(2);
    expect(ultimo.avisosNaTela?.[0]?.body).toBe('Lembrete das 09:00 · Todos os dias');
  });

  it('sem login o relógio não roda', async () => {
    await abrir([lembrete()], { logado: false });
    await passar(15_000);
    expect(ultimo.avisosNaTela).toEqual([]);
  });

  it('lembrete por local e pausado não avisam por horário', async () => {
    await abrir([lembrete({ id: 'a', kind: 'local', lat: 1, lng: 1, radius: 100 }), lembrete({ id: 'b', active: false })]);
    await passar(15_000);
    expect(ultimo.avisosNaTela).toEqual([]);
  });

  it('a lista que muda vale já no próximo passo', async () => {
    await abrir([]);
    await act(async () => { await ultimo.syncReminders([lembrete({ time: '09:00' })]); });
    await passar(15_000);
    expect(ultimo.avisosNaTela).toHaveLength(1);
  });

  it('a contagem que a tela mostra são os avisos das próximas 24 horas', async () => {
    await abrir([lembrete({ dateISO: '2026-09-21', time: '10:00' }), lembrete({ id: 'b', dateISO: '2026-09-23', time: '10:00' }), lembrete({ id: 'c', dateISO: '2026-09-01', repeat: 'daily', time: '12:00' })]);
    expect(ultimo.scheduledCount).toBe(2);
  });
});

describe('avisos na web: o aviso do navegador', () => {
  it('sem permissão, só na tela', async () => {
    await abrir([lembrete()]);
    await passar(15_000);
    expect(showNotification).not.toHaveBeenCalled();
    expect(NotificationDeMentira).not.toHaveBeenCalled();
    expect(ultimo.permissionGranted).toBe(false);
  });

  it('com permissão, também pelo service worker (aparece mesmo com outra aba na frente), com a mesma marca para não empilhar', async () => {
    configurarNavegador({ permissao: 'granted' });
    await abrir([lembrete()]);
    await passar(15_000);
    expect(showNotification).toHaveBeenCalledTimes(1);
    expect(showNotification).toHaveBeenCalledWith('Tomar remédio', expect.objectContaining({ body: 'Lembrete das 09:00', tag: expect.stringContaining('r1@'), data: expect.objectContaining({ url: '/', reminderId: 'r1' }) }));
    expect(ultimo.permissionGranted).toBe(true);
  });

  it('sem service worker (página sem HTTPS) usa o aviso comum do navegador', async () => {
    configurarNavegador({ permissao: 'granted', comServiceWorker: false });
    await abrir([lembrete()]);
    await passar(15_000);
    expect(showNotification).not.toHaveBeenCalled();
    expect(NotificationDeMentira).toHaveBeenCalledWith('Tomar remédio', expect.objectContaining({ body: 'Lembrete das 09:00' }));
  });

  it('pedir a permissão pergunta ao navegador e guarda a resposta', async () => {
    await abrir([]);
    expect(ultimo.permissionGranted).toBe(false);
    let ok = false;
    await act(async () => { ok = (await ultimo.requestPermission?.()) ?? false; });
    expect(ok).toBe(true);
    expect(ultimo.permissionGranted).toBe(true);
  });

  it('navegador sem a API de avisos (Safari do iPhone fora do app instalado): pedir devolve falso e a tela segue funcionando', async () => {
    Object.defineProperty(globalThis, 'Notification', { configurable: true, value: undefined });
    await abrir([lembrete()]);
    let ok = true;
    await act(async () => { ok = (await ultimo.requestPermission?.()) ?? true; });
    expect(ok).toBe(false);
    await passar(15_000);
    expect(ultimo.avisosNaTela).toHaveLength(1);
  });

  it('falha do navegador ao mostrar não derruba o aviso na tela', async () => {
    configurarNavegador({ permissao: 'granted' });
    showNotification.mockRejectedValueOnce(new Error('bloqueado'));
    await abrir([lembrete()]);
    await passar(15_000);
    expect(ultimo.avisosNaTela).toHaveLength(1);
  });
});

describe('avisos na web: aviso na hora (chegada a um lugar) e a tela', () => {
  it('notifyNow mostra na tela e no navegador', async () => {
    configurarNavegador({ permissao: 'granted' });
    await abrir([]);
    await act(async () => { await ultimo.notifyNow({ title: 'Você chegou: Mercado', body: 'Av. X', data: { reminderId: 'm1' }, identifier: 'chegada-m1' }); });
    expect(ultimo.avisosNaTela?.[0]).toMatchObject({ title: 'Você chegou: Mercado', body: 'Av. X' });
    expect(showNotification).toHaveBeenCalledWith('Você chegou: Mercado', expect.objectContaining({ tag: 'chegada-m1' }));
  });

  it('o mesmo aviso repetido troca o anterior na tela em vez de empilhar', async () => {
    await abrir([]);
    await act(async () => { await ultimo.notifyNow({ title: 'Você chegou', identifier: 'chegada-m1' }); });
    await act(async () => { await ultimo.notifyNow({ title: 'Você chegou', identifier: 'chegada-m1' }); });
    expect(ultimo.avisosNaTela).toHaveLength(1);
  });

  it('dá para dispensar, e some sozinho depois de 12 segundos', async () => {
    await abrir([]);
    await act(async () => { await ultimo.notifyNow({ title: 'A' }); });
    await act(async () => { await ultimo.notifyNow({ title: 'B' }); });
    expect(ultimo.avisosNaTela).toHaveLength(2);
    const [primeiro] = ultimo.avisosNaTela ?? [];
    await act(async () => { ultimo.dispensarAviso?.(primeiro.id); });
    expect(ultimo.avisosNaTela).toHaveLength(1);
    await passar(12_000);
    expect(ultimo.avisosNaTela).toEqual([]);
  });

  it('só os três avisos mais novos ficam na tela', async () => {
    await abrir([]);
    for (const t of ['1', '2', '3', '4']) await act(async () => { await ultimo.notifyNow({ title: t }); });
    expect(ultimo.avisosNaTela?.map((a) => a.title)).toEqual(['4', '3', '2']);
  });
});
