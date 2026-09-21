import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, render } from '@testing-library/react-native';
import * as Location from 'expo-location';
import { Text } from 'react-native';
import type { Reminder } from '../../data/reminders';
import { useAuth } from '../auth';
import { GeoProvider, useGeo } from '../geo';
import { useReminders } from '../reminders';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-location', () => ({
  Accuracy: { High: 4 },
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));
jest.mock('../auth', () => ({ useAuth: jest.fn() }));
jest.mock('../reminders', () => ({ useReminders: jest.fn() }));

const L = jest.mocked(Location);

const porTempo = (parte: Partial<Reminder> = {}): Reminder => ({
  id: 't1', title: 'Tomar remédio', category: 'blue', icon: 'pill', kind: 'time', dateISO: '2026-09-21', time: '09:00', repeat: 'never', active: true, ...parte,
});
const porLocal = (parte: Partial<Reminder> = {}): Reminder => ({
  id: 'l1', title: 'Comprar pão', category: 'orange', icon: 'cart', kind: 'local', place: 'Padaria', lat: -3.73, lng: -38.52, radius: 150,
  dateISO: '2026-09-21', time: '09:00', repeat: 'never', active: true, ...parte,
});

let geo: ReturnType<typeof useGeo>;
const Sonda = () => { geo = useGeo(); return <Text>sonda</Text>; };
const remover = jest.fn();
let entregar: (loc: unknown) => void = () => {};

const abrir = async (reminders: Reminder[], { logado = true }: { logado?: boolean } = {}) => {
  jest.mocked(useAuth).mockReturnValue({ user: logado ? { id: 'u1' } : null } as unknown as ReturnType<typeof useAuth>);
  jest.mocked(useReminders).mockReturnValue({ reminders } as unknown as ReturnType<typeof useReminders>);
  const tela = await render(<GeoProvider><Sonda /></GeoProvider>);
  await act(async () => {});
  return tela;
};
const trocarLembretes = async (tela: Awaited<ReturnType<typeof render>>, reminders: Reminder[]) => {
  jest.mocked(useReminders).mockReturnValue({ reminders } as unknown as ReturnType<typeof useReminders>);
  await tela.rerender(<GeoProvider><Sonda /></GeoProvider>);
  await act(async () => {});
};

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  L.getForegroundPermissionsAsync.mockResolvedValue({ granted: true, canAskAgain: true } as never);
  L.requestForegroundPermissionsAsync.mockResolvedValue({ granted: true } as never);
  L.watchPositionAsync.mockImplementation((async (_opcoes: unknown, callback: (loc: unknown) => void) => { entregar = callback; return { remove: remover }; }) as never);
});

const fix = (lat: number, lng: number, accuracy = 8) => ({ coords: { latitude: lat, longitude: lng, accuracy }, timestamp: 1_700_000_000_000 });

describe('GeoProvider: quando acompanha a posição', () => {
  it('liga sozinho: com um lembrete por local ativo e a permissão dada, já acompanha (não precisa de interruptor)', async () => {
    await abrir([porLocal()]);
    expect(geo.monitoring).toBe(true);
    expect(L.watchPositionAsync).toHaveBeenCalledTimes(1);
  });

  it('o desenho é o de sempre: GPS de alta precisão, a cada 5 s ou 10 m (decisão do João)', async () => {
    await abrir([porLocal()]);
    expect(L.watchPositionAsync.mock.calls[0]?.[0]).toEqual({ accuracy: 4, timeInterval: 5000, distanceInterval: 10 });
  });

  it('sem lembrete por local não gasta bateria nem pede permissão', async () => {
    await abrir([porTempo()]);
    expect(L.watchPositionAsync).not.toHaveBeenCalled();
    expect(L.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
  });

  it('lembrete por local pausado ou sem coordenadas não conta', async () => {
    await abrir([porLocal({ active: false }), porLocal({ id: 'l2', lat: undefined, lng: undefined })]);
    expect(L.watchPositionAsync).not.toHaveBeenCalled();
  });

  it('para quando o último lembrete por local sai da lista, e a posição some', async () => {
    const tela = await abrir([porLocal()]);
    await act(async () => { entregar(fix(-3.73, -38.52)); });
    expect(geo.position).not.toBeNull();
    await trocarLembretes(tela, [porTempo()]);
    expect(remover).toHaveBeenCalled();
    expect(geo.position).toBeNull();
  });

  it('começa quando o primeiro lembrete por local aparece', async () => {
    const tela = await abrir([porTempo()]);
    expect(L.watchPositionAsync).not.toHaveBeenCalled();
    await trocarLembretes(tela, [porTempo(), porLocal()]);
    expect(L.watchPositionAsync).toHaveBeenCalledTimes(1);
  });

  it('sem login não acompanha nem pergunta nada', async () => {
    await abrir([porLocal()], { logado: false });
    expect(L.getForegroundPermissionsAsync).not.toHaveBeenCalled();
    expect(L.watchPositionAsync).not.toHaveBeenCalled();
  });

  it('a posição que chega vira lat, lng, precisão e hora', async () => {
    await abrir([porLocal()]);
    await act(async () => { entregar(fix(-3.7327, -38.4923, 12)); });
    expect(geo.position).toEqual({ lat: -3.7327, lng: -38.4923, accuracy: 12, at: 1_700_000_000_000 });
  });
});

describe('GeoProvider: a permissão de localização', () => {
  it('ainda sem resposta e com lembrete por local: pergunta uma vez e passa a acompanhar', async () => {
    L.getForegroundPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true } as never);
    await abrir([porLocal()]);
    expect(L.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(geo.permissionGranted).toBe(true);
    expect(L.watchPositionAsync).toHaveBeenCalledTimes(1);
  });

  it('não pergunta de novo a cada mudança da lista', async () => {
    L.getForegroundPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true } as never);
    L.requestForegroundPermissionsAsync.mockResolvedValue({ granted: false } as never);
    const tela = await abrir([porLocal()]);
    await trocarLembretes(tela, [porLocal(), porLocal({ id: 'l2' })]);
    expect(L.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('negada de vez (o sistema não deixa perguntar): não insiste e diz onde liberar', async () => {
    L.getForegroundPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: false } as never);
    await abrir([porLocal()]);
    expect(L.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    expect(geo.permissionGranted).toBe(false);
    expect(geo.error).toBe('Permissão de localização negada. Libere nos ajustes do aparelho.');
    expect(L.watchPositionAsync).not.toHaveBeenCalled();
  });

  it('a pessoa recusa no pedido: fica sem acompanhar e com o aviso de onde liberar', async () => {
    L.getForegroundPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true } as never);
    L.requestForegroundPermissionsAsync.mockResolvedValue({ granted: false } as never);
    await abrir([porLocal()]);
    expect(geo.permissionGranted).toBe(false);
    expect(geo.error).toBe('Permissão de localização negada. Libere nos ajustes do aparelho.');
  });
});

describe('GeoProvider: o interruptor da tela Configurações', () => {
  it('guardado como desligado, não acompanha mesmo com lembrete por local', async () => {
    await AsyncStorage.setItem('lembreiai:monitorar-local', '0');
    await abrir([porLocal()]);
    expect(geo.monitoring).toBe(false);
    expect(L.watchPositionAsync).not.toHaveBeenCalled();
  });

  it('guardado como ligado, acompanha', async () => {
    await AsyncStorage.setItem('lembreiai:monitorar-local', '1');
    await abrir([porLocal()]);
    expect(geo.monitoring).toBe(true);
    expect(L.watchPositionAsync).toHaveBeenCalledTimes(1);
  });

  it('desligar para de acompanhar, guarda a escolha e apaga a posição', async () => {
    await abrir([porLocal()]);
    await act(async () => { entregar(fix(-3.73, -38.52)); });
    await act(async () => { await geo.setMonitoring(false); });
    expect(geo.monitoring).toBe(false);
    expect(geo.position).toBeNull();
    expect(remover).toHaveBeenCalled();
    expect(await AsyncStorage.getItem('lembreiai:monitorar-local')).toBe('0');
  });

  it('religar sem a permissão pede a permissão e, se negada, continua desligado com o aviso', async () => {
    await AsyncStorage.setItem('lembreiai:monitorar-local', '0');
    L.getForegroundPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true } as never);
    L.requestForegroundPermissionsAsync.mockResolvedValue({ granted: false } as never);
    await abrir([porLocal()]);
    await act(async () => { await geo.setMonitoring(true); });
    expect(geo.monitoring).toBe(false);
    expect(geo.error).toBe('Permissão de localização negada. Libere nos ajustes do aparelho.');
  });
});

describe('GeoProvider: leitura única ("usar minha localização")', () => {
  it('devolve a posição atual, pedindo a permissão se ainda não houver', async () => {
    L.getForegroundPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true } as never);
    L.requestForegroundPermissionsAsync.mockResolvedValue({ granted: true } as never);
    L.getCurrentPositionAsync.mockResolvedValue(fix(-3.7, -38.5, 15) as never);
    await abrir([]);
    let p: Awaited<ReturnType<typeof geo.getCurrentPosition>> = null;
    await act(async () => { p = await geo.getCurrentPosition(); });
    expect(p).toEqual({ lat: -3.7, lng: -38.5, accuracy: 15, at: 1_700_000_000_000 });
  });

  it('sem permissão ou com falha do GPS devolve null', async () => {
    L.getForegroundPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: false } as never);
    await abrir([]);
    let p: Awaited<ReturnType<typeof geo.getCurrentPosition>> = { lat: 0, lng: 0, accuracy: 0, at: 0 };
    await act(async () => { p = await geo.getCurrentPosition(); });
    expect(p).toBeNull();

    L.getForegroundPermissionsAsync.mockResolvedValue({ granted: true, canAskAgain: true } as never);
    L.getCurrentPositionAsync.mockRejectedValue(new Error('sem GPS'));
    await act(async () => { p = await geo.getCurrentPosition(); });
    expect(p).toBeNull();
  });
});
