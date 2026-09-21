import { act, render, screen } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { AppState, Platform, Text } from 'react-native';
import type { Reminder } from '../../data/reminders';
import { useAuth } from '../auth';
import { NotificationsProvider, useNotifications } from '../notifications';
import { ReminderScheduler } from '../reminder-scheduler';
import { useReminders } from '../reminders';

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DATE: 'date', DAILY: 'daily', WEEKLY: 'weekly', MONTHLY: 'monthly', YEARLY: 'yearly' },
  AndroidImportance: { HIGH: 4 },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => undefined),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(async () => 'id'),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => undefined),
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));
jest.mock('expo-router', () => ({ router: { navigate: jest.fn() } }));
jest.mock('../auth', () => ({ useAuth: jest.fn() }));
jest.mock('../reminders', () => ({ useReminders: jest.fn() }));

const N = jest.mocked(Notifications);
const AGORA = new Date(2026, 8, 20, 12, 0, 0);

const lembrete = (parte: Partial<Reminder> = {}): Reminder => ({
  id: 'r1', title: 'Tomar remédio', category: 'blue', icon: 'pill', kind: 'time',
  dateISO: '2026-09-21', time: '09:00', repeat: 'never', active: true, ...parte,
});

let ultimo: ReturnType<typeof useNotifications>;
const Sonda = () => { ultimo = useNotifications(); return <Text>sonda</Text>; };

const abrir = async (reminders: Reminder[] = [], { logado = true }: { logado?: boolean } = {}) => {
  jest.mocked(useAuth).mockReturnValue({ user: logado ? { id: 'u1' } : null } as unknown as ReturnType<typeof useAuth>);
  jest.mocked(useReminders).mockReturnValue({ reminders } as unknown as ReturnType<typeof useReminders>);
  await render(
    <NotificationsProvider>
      <ReminderScheduler />
      <Sonda />
    </NotificationsProvider>,
  );
  await act(async () => {});
};

const agendados = () => N.scheduleNotificationAsync.mock.calls.map(([pedido]) => pedido);

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  jest.setSystemTime(AGORA);
  N.getPermissionsAsync.mockResolvedValue({ granted: true, canAskAgain: true } as never);
  N.requestPermissionsAsync.mockResolvedValue({ granted: true } as never);
  N.getAllScheduledNotificationsAsync.mockResolvedValue([] as never);
});
afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });

describe('NotificationsProvider: permissão e canal', () => {
  it('só pede a permissão depois do login (não na tela de entrar)', async () => {
    N.getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true } as never);
    await abrir([], { logado: false });
    expect(N.getPermissionsAsync).not.toHaveBeenCalled();
    expect(N.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('logado e ainda sem resposta: pergunta uma vez e guarda a resposta', async () => {
    N.getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true } as never);
    N.requestPermissionsAsync.mockResolvedValue({ granted: true } as never);
    await abrir();
    expect(N.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(ultimo.permissionGranted).toBe(true);
  });

  it('permissão negada e sem poder perguntar de novo: não insiste e diz que não tem', async () => {
    N.getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: false } as never);
    await abrir();
    expect(N.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(ultimo.permissionGranted).toBe(false);
  });

  it('no Android cria o canal "lembretes" com importância alta antes de agendar', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    await abrir([lembrete()]);
    expect(N.setNotificationChannelAsync).toHaveBeenCalledWith('lembretes', { name: 'Lembretes', importance: 4 });
    expect(N.setNotificationChannelAsync.mock.invocationCallOrder[0]).toBeLessThan(N.scheduleNotificationAsync.mock.invocationCallOrder[0]);
  });

  it('no iOS não há canal', async () => {
    await abrir([lembrete()]);
    expect(N.setNotificationChannelAsync).not.toHaveBeenCalled();
  });
});

describe('NotificationsProvider: agenda os avisos por horário', () => {
  it('um lembrete futuro vira um aviso datado na hora certa, com título, corpo e o id do lembrete', async () => {
    await abrir([lembrete()]);
    expect(agendados()).toHaveLength(1);
    expect(agendados()[0]).toMatchObject({
      content: { title: 'Tomar remédio', body: 'Lembrete das 09:00', data: { reminderId: 'r1' } },
      trigger: { type: 'date', date: new Date(2026, 8, 21, 9, 0) },
    });
    expect(ultimo.scheduledCount).toBe(0); // o mock devolve lista vazia; o que importa é que a contagem vem do sistema
  });

  it('no Android o gatilho leva o canal (sem ele o aviso cai num canal sem importância)', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    await abrir([lembrete()]);
    expect(agendados()[0]?.trigger).toMatchObject({ type: 'date', channelId: 'lembretes' });
  });

  it('repetição que já começou usa o gatilho recorrente do sistema', async () => {
    await abrir([lembrete({ dateISO: '2026-09-10', repeat: 'daily' })]);
    expect(agendados()[0]?.trigger).toMatchObject({ type: 'daily', hour: 9, minute: 0 });
  });

  it('o corpo diz a repetição', async () => {
    await abrir([lembrete({ dateISO: '2026-09-10', repeat: 'weekly' })]);
    expect(agendados()[0]?.content).toMatchObject({ body: 'Lembrete das 09:00 · Toda semana' });
  });

  it('lembrete por local, pausado ou já vencido não agenda aviso por horário', async () => {
    await abrir([
      lembrete({ id: 'a', kind: 'local', lat: 1, lng: 1, radius: 100 }),
      lembrete({ id: 'b', active: false }),
      lembrete({ id: 'c', dateISO: '2026-09-01' }),
    ]);
    expect(agendados()).toEqual([]);
  });

  it('cancela o que havia antes de agendar (a agenda do aparelho fica idêntica à lista)', async () => {
    await abrir([lembrete()]);
    expect(N.cancelAllScheduledNotificationsAsync.mock.invocationCallOrder[0]).toBeLessThan(N.scheduleNotificationAsync.mock.invocationCallOrder[0]);
  });

  it('sem permissão cancela o que havia e não agenda nada', async () => {
    N.getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: false } as never);
    await abrir([lembrete()]);
    expect(N.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    expect(agendados()).toEqual([]);
  });

  it('respeita o limite de 60 avisos pendentes do iOS: ficam os mais próximos', async () => {
    const muitos = Array.from({ length: 70 }, (_, i) => lembrete({ id: `r${i}`, title: `T${i}`, dateISO: `2026-10-${String((i % 28) + 1).padStart(2, '0')}`, time: `${String(8 + (i % 10)).padStart(2, '0')}:00` }));
    await abrir(muitos);
    expect(agendados()).toHaveLength(60);
    const quando = agendados().map((p) => ((p.trigger as { date: Date }).date).getTime());
    const todos = muitos.map((r) => new Date(Number(r.dateISO.slice(0, 4)), Number(r.dateISO.slice(5, 7)) - 1, Number(r.dateISO.slice(8, 10)), Number(r.time.slice(0, 2)), 0).getTime()).sort((a, b) => a - b);
    expect([...quando].sort((a, b) => a - b)).toEqual(todos.slice(0, 60));
  });

  it('a contagem que a tela mostra vem do que o sistema realmente guardou', async () => {
    N.getAllScheduledNotificationsAsync.mockResolvedValue([{}, {}, {}] as never);
    await abrir([lembrete()]);
    expect(ultimo.scheduledCount).toBe(3);
  });

  it('duas mudanças seguidas na lista: só a última vale (não duplica avisos)', async () => {
    await abrir([lembrete({ id: 'a', title: 'A' })]);
    N.scheduleNotificationAsync.mockClear();
    let liberar: () => void = () => {};
    N.cancelAllScheduledNotificationsAsync.mockImplementationOnce(() => new Promise<void>((ok) => { liberar = ok; }));
    await act(async () => {
      void ultimo.syncReminders([lembrete({ id: 'b', title: 'B' })]);
      void ultimo.syncReminders([lembrete({ id: 'c', title: 'C' })]);
    });
    await act(async () => { liberar(); });
    expect(agendados().map((p) => (p.content as { title: string }).title)).toEqual(['C']);
  });
});

describe('ReminderScheduler: mantém a agenda em dia', () => {
  it('ao voltar para o app (primeiro plano) agenda de novo: a data de início de uma repetição pode ter passado com o app fechado', async () => {
    const ouvintes: ((estado: string) => void)[] = [];
    jest.spyOn(AppState, 'addEventListener').mockImplementation(((_: string, ouvinte: (estado: string) => void) => {
      ouvintes.push(ouvinte);
      return { remove: jest.fn() };
    }) as never);
    await abrir([lembrete({ dateISO: '2026-09-21', repeat: 'daily' })]);
    expect(agendados()[0]?.trigger).toMatchObject({ type: 'date' }); // ainda não começou: janela de avisos datados
    N.scheduleNotificationAsync.mockClear();

    jest.setSystemTime(new Date(2026, 8, 21, 10, 0)); // o app ficou fechado e a data de início já passou
    await act(async () => { ouvintes.forEach((o) => o('active')); });
    await act(async () => {});
    expect(agendados()[0]?.trigger).toMatchObject({ type: 'daily', hour: 9, minute: 0 }); // agora é o gatilho recorrente do sistema
  });

  it('ao ir para segundo plano não mexe na agenda', async () => {
    const ouvintes: ((estado: string) => void)[] = [];
    jest.spyOn(AppState, 'addEventListener').mockImplementation(((_: string, ouvinte: (estado: string) => void) => {
      ouvintes.push(ouvinte);
      return { remove: jest.fn() };
    }) as never);
    await abrir([lembrete()]);
    N.scheduleNotificationAsync.mockClear();
    await act(async () => { ouvintes.forEach((o) => o('background')); });
    expect(agendados()).toEqual([]);
  });
});

describe('NotificationsProvider: aviso na hora e toque no aviso', () => {
  it('iOS: aviso imediato é gatilho nulo', async () => {
    await abrir();
    await act(async () => { await ultimo.notifyNow({ title: 'Você chegou', body: 'Mercado', data: { reminderId: 'r1' } }); });
    expect(agendados()[0]).toMatchObject({ content: { title: 'Você chegou', body: 'Mercado', data: { reminderId: 'r1' } }, trigger: null });
  });

  it('Android: aviso imediato leva o canal', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    await abrir();
    await act(async () => { await ultimo.notifyNow({ title: 'Você chegou' }); });
    expect(agendados()[0]?.trigger).toEqual({ channelId: 'lembretes' });
  });

  it('sem permissão não avisa', async () => {
    N.getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: false } as never);
    await abrir();
    await act(async () => { await ultimo.notifyNow({ title: 'x' }); });
    expect(agendados()).toEqual([]);
  });

  it('um aviso repetido do mesmo lembrete troca o anterior em vez de empilhar (mesmo identificador)', async () => {
    await abrir();
    await act(async () => { await ultimo.notifyNow({ title: 'Você chegou', data: { reminderId: 'r1' }, identifier: 'chegada-r1' }); });
    expect(agendados()[0]).toMatchObject({ identifier: 'chegada-r1' });
  });

  it('tocar no aviso abre a lista', async () => {
    await abrir();
    const [ouvinte] = N.addNotificationResponseReceivedListener.mock.calls[0] as unknown as [() => void];
    ouvinte();
    expect(router.navigate).toHaveBeenCalledWith('/');
  });

  it('falha ao avisar não derruba o app', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    await abrir();
    N.scheduleNotificationAsync.mockRejectedValueOnce(new Error('sem espaço'));
    await act(async () => { await ultimo.notifyNow({ title: 'x' }); });
    expect(screen.getByText('sonda')).toBeTruthy();
  });
});
