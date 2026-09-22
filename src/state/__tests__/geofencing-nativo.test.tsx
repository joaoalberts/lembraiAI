import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, render } from '@testing-library/react-native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { Platform, Text } from 'react-native';
import type { Fence } from '../../lib/geofence';
import { useSegundoPlano } from '../geofencing-nativo';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-constants', () => ({ __esModule: true, default: { executionEnvironment: 'standalone' } }));
jest.mock('expo-location', () => ({
  getBackgroundPermissionsAsync: jest.fn(),
  requestBackgroundPermissionsAsync: jest.fn(),
  startGeofencingAsync: jest.fn(async () => undefined),
  stopGeofencingAsync: jest.fn(async () => undefined),
  hasStartedGeofencingAsync: jest.fn(async () => false),
}));

const L = jest.mocked(Location);
const cerca = (id: string, radius = 150): Fence => ({ id, title: `Lugar ${id}`, place: `Rua ${id}`, lat: -3.73, lng: -38.52, radius });

let saida: ReturnType<typeof useSegundoPlano>;
type Entrada = Parameters<typeof useSegundoPlano>[0];
const Sonda = (props: Entrada) => { saida = useSegundoPlano(props); return <Text>sonda</Text>; };
const abrir = async (props: Partial<Entrada> = {}) => {
  const base: Entrada = { ativo: true, cercas: [cerca('m1')], perto: null, ...props };
  const tela = await render(<Sonda {...base} />);
  await act(async () => {});
  const trocar = async (novo: Partial<Entrada>) => { await tela.rerender(<Sonda {...base} {...novo} />); await act(async () => {}); };
  return { trocar };
};

const concedida = { granted: true, canAskAgain: true } as never;
const pendente = { granted: false, canAskAgain: true } as never;
const negada = { granted: false, canAskAgain: false } as never;

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  (Constants as { executionEnvironment: string }).executionEnvironment = 'standalone';
  L.getBackgroundPermissionsAsync.mockResolvedValue(concedida);
  L.hasStartedGeofencingAsync.mockResolvedValue(false);
});
afterEach(() => jest.restoreAllMocks());

describe('useSegundoPlano: onde existe', () => {
  it('na web não há geofence do sistema: indisponível e nenhuma chamada', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    await abrir();
    expect(saida.estado).toBe('indisponivel');
    expect(L.getBackgroundPermissionsAsync).not.toHaveBeenCalled();
    expect(L.startGeofencingAsync).not.toHaveBeenCalled();
  });

  it('no Expo Go também não (segundo plano só em build próprio): indisponível', async () => {
    (Constants as { executionEnvironment: string }).executionEnvironment = 'storeClient';
    await abrir();
    expect(saida.estado).toBe('indisponivel');
    expect(L.startGeofencingAsync).not.toHaveBeenCalled();
  });
});

describe('useSegundoPlano: registrar as regiões no sistema', () => {
  it('com lugares, monitoramento ativo e a permissão de segundo plano: guarda os lugares e só então registra', async () => {
    await abrir({ cercas: [cerca('m1', 200), cerca('f1', 50)] });
    expect(saida.estado).toBe('ativo');
    expect(L.startGeofencingAsync).toHaveBeenCalledTimes(1);
    expect(L.startGeofencingAsync).toHaveBeenCalledWith('lembreiai-geofence', [
      { identifier: 'm1', latitude: -3.73, longitude: -38.52, radius: 200, notifyOnEnter: true, notifyOnExit: true },
      { identifier: 'f1', latitude: -3.73, longitude: -38.52, radius: 100, notifyOnEnter: true, notifyOnExit: true }, // 50 sobe para o mínimo do sistema
    ]);
    // com o app fechado o evento só traz o id: o título e o endereço já estavam guardados
    expect(JSON.parse((await AsyncStorage.getItem('lembreiai:cercas:v1')) ?? '{}')).toEqual({ m1: { title: 'Lugar m1', place: 'Rua m1' }, f1: { title: 'Lugar f1', place: 'Rua f1' } });
  });

  it('a ordem importa: os lugares são guardados antes de o sistema poder acordar o app', async () => {
    const ordem: string[] = [];
    jest.spyOn(AsyncStorage, 'setItem').mockImplementation(async () => { ordem.push('guardou'); });
    L.startGeofencingAsync.mockImplementation(async () => { ordem.push('registrou'); });
    await abrir();
    expect(ordem.indexOf('guardou')).toBeGreaterThanOrEqual(0);
    expect(ordem.indexOf('guardou')).toBeLessThan(ordem.indexOf('registrou'));
  });

  it('o iOS recebe no máximo 20 regiões; o Android, todas até 100', async () => {
    const muitas = Array.from({ length: 30 }, (_, i) => cerca(`c${i}`));
    await abrir({ cercas: muitas });
    expect((L.startGeofencingAsync.mock.calls[0]?.[1] as unknown[]).length).toBe(20);
    jest.clearAllMocks();
    jest.replaceProperty(Platform, 'OS', 'android');
    await abrir({ cercas: muitas });
    expect((L.startGeofencingAsync.mock.calls[0]?.[1] as unknown[]).length).toBe(30);
  });

  it('as mesmas regiões de novo não registram outra vez (o sistema reenviaria "entrou" a cada registro)', async () => {
    const { trocar } = await abrir({ cercas: [cerca('m1')] });
    await trocar({ cercas: [cerca('m1')] }); // outra lista, mesmo conteúdo
    expect(L.startGeofencingAsync).toHaveBeenCalledTimes(1);
  });

  it('lista que mudou registra de novo com o que valia', async () => {
    const { trocar } = await abrir({ cercas: [cerca('m1')] });
    await trocar({ cercas: [cerca('m1'), cerca('f1')] });
    expect(L.startGeofencingAsync).toHaveBeenCalledTimes(2);
    expect((L.startGeofencingAsync.mock.calls[1]?.[1] as { identifier: string }[]).map((r) => r.identifier)).toEqual(['m1', 'f1']);
  });
});

describe('useSegundoPlano: quando não registra', () => {
  it('sem permissão de segundo plano: diz que falta, não registra e mostra a permissão', async () => {
    L.getBackgroundPermissionsAsync.mockResolvedValue(pendente);
    await abrir();
    expect(saida.estado).toBe('sem-permissao');
    expect(saida.permissao).toBe('pendente');
    expect(L.startGeofencingAsync).not.toHaveBeenCalled();
  });

  it('permissão negada de vez: fica "negada" (só os ajustes do aparelho resolvem)', async () => {
    L.getBackgroundPermissionsAsync.mockResolvedValue(negada);
    await abrir();
    expect(saida.permissao).toBe('negada');
    expect(saida.estado).toBe('sem-permissao');
  });

  it('sem lugares (nenhum lembrete por local): "sem lugares" e nada registrado (o sistema recusa começar sem região)', async () => {
    await abrir({ cercas: [] });
    expect(saida.estado).toBe('sem-lugares');
    expect(L.startGeofencingAsync).not.toHaveBeenCalled();
  });

  it('monitoramento desligado ou pessoa sem login: desligado', async () => {
    await abrir({ ativo: false });
    expect(saida.estado).toBe('desligado');
    expect(L.startGeofencingAsync).not.toHaveBeenCalled();
  });

  it('falha do sistema ao registrar vira "erro", sem derrubar nada', async () => {
    L.startGeofencingAsync.mockRejectedValueOnce(new Error('Play Services indisponível'));
    await abrir();
    expect(saida.estado).toBe('erro');
  });
});

describe('useSegundoPlano: parar', () => {
  it('desligar o monitoramento para o geofence do sistema (não fica vigiando escondido)', async () => {
    const { trocar } = await abrir();
    L.hasStartedGeofencingAsync.mockResolvedValue(true);
    await trocar({ ativo: false });
    expect(L.stopGeofencingAsync).toHaveBeenCalledWith('lembreiai-geofence');
    expect(saida.estado).toBe('desligado');
  });

  it('o último lugar apagado para o geofence', async () => {
    const { trocar } = await abrir();
    L.hasStartedGeofencingAsync.mockResolvedValue(true);
    await trocar({ cercas: [] });
    expect(L.stopGeofencingAsync).toHaveBeenCalledTimes(1);
    expect(saida.estado).toBe('sem-lugares');
  });

  it('um geofence que sobrou de outra sessão (app reaberto) é parado se não deve mais existir', async () => {
    L.hasStartedGeofencingAsync.mockResolvedValue(true);
    await abrir({ ativo: false });
    expect(L.stopGeofencingAsync).toHaveBeenCalledTimes(1);
  });

  it('não chama parar à toa quando não havia nada registrado', async () => {
    await abrir({ ativo: false });
    expect(L.stopGeofencingAsync).not.toHaveBeenCalled();
  });
});

describe('useSegundoPlano: pedir a permissão', () => {
  it('a pessoa aceita: passa a registrar as regiões', async () => {
    L.getBackgroundPermissionsAsync.mockResolvedValue(pendente);
    L.requestBackgroundPermissionsAsync.mockResolvedValue(concedida);
    await abrir();
    expect(L.startGeofencingAsync).not.toHaveBeenCalled();
    let ok = false;
    await act(async () => { ok = await saida.pedirPermissao(); });
    expect(ok).toBe(true);
    expect(saida.permissao).toBe('concedida');
    expect(saida.estado).toBe('ativo');
    expect(L.startGeofencingAsync).toHaveBeenCalledTimes(1);
  });

  it('a pessoa recusa: continua sem permissão', async () => {
    L.getBackgroundPermissionsAsync.mockResolvedValue(pendente);
    L.requestBackgroundPermissionsAsync.mockResolvedValue(negada);
    await abrir();
    let ok = true;
    await act(async () => { ok = await saida.pedirPermissao(); });
    expect(ok).toBe(false);
    expect(saida.permissao).toBe('negada');
    expect(saida.estado).toBe('sem-permissao');
  });

  it('erro ao pedir devolve falso', async () => {
    L.requestBackgroundPermissionsAsync.mockRejectedValue(new Error('x'));
    await abrir();
    let ok = true;
    await act(async () => { ok = await saida.pedirPermissao(); });
    expect(ok).toBe(false);
  });

  it('onde não existe (web) pedir devolve falso sem chamar nada', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    await abrir();
    let ok = true;
    await act(async () => { ok = await saida.pedirPermissao(); });
    expect(ok).toBe(false);
    expect(L.requestBackgroundPermissionsAsync).not.toHaveBeenCalled();
  });
});
