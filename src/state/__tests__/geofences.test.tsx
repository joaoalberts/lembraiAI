import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import type { Reminder } from '../../data/reminders';
import { GeofencesProvider, useGeofences } from '../geofences';
import { useGeo } from '../geo';
import { useNotifications } from '../notifications';
import { useReminders } from '../reminders';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('../geo', () => ({ useGeo: jest.fn() }));
jest.mock('../notifications', () => ({ useNotifications: jest.fn() }));
jest.mock('../reminders', () => ({ useReminders: jest.fn() }));

const mercado: Reminder = {
  id: 'm1', title: 'Comprar pão', category: 'orange', icon: 'cart', kind: 'local', place: 'Padaria da Rua A, 10', lat: -3.7300, lng: -38.5200, radius: 150,
  dateISO: '2026-09-21', time: '09:00', repeat: 'never', active: true,
};
const farmacia: Reminder = { ...mercado, id: 'f1', title: 'Remédio', place: 'Farmácia', lat: -3.7400, lng: -38.5300, radius: 100 };

// 1 grau de latitude ≈ 111,2 km: deslocamentos em metros ao norte do ponto
const aoNorte = (lembrete: Reminder, metros: number) => ({ lat: (lembrete.lat as number) + metros / 111_195, lng: lembrete.lng as number });
const notifyNow = jest.fn(async () => undefined);
let estado: ReturnType<typeof useGeofences>;
const Sonda = () => { estado = useGeofences(); return <Text>sonda</Text>; };

const montar = async (reminders: Reminder[], { carregando = false }: { carregando?: boolean } = {}) => {
  jest.mocked(useReminders).mockReturnValue({ reminders, carregando } as unknown as ReturnType<typeof useReminders>);
  jest.mocked(useNotifications).mockReturnValue({ notifyNow } as unknown as ReturnType<typeof useNotifications>);
  const posicao = (p: { lat: number; lng: number; accuracy?: number | null } | null) =>
    jest.mocked(useGeo).mockReturnValue({ position: p ? { lat: p.lat, lng: p.lng, accuracy: p.accuracy === undefined ? 10 : p.accuracy, at: 1 } : null } as unknown as ReturnType<typeof useGeo>);
  posicao(null);
  const tela = await render(<GeofencesProvider><Sonda /></GeofencesProvider>);
  const mover = async (p: { lat: number; lng: number; accuracy?: number | null } | null) => {
    posicao(p);
    await act(async () => { tela.rerender(<GeofencesProvider><Sonda /></GeofencesProvider>); });
  };
  return { mover };
};

beforeEach(async () => { jest.clearAllMocks(); await AsyncStorage.clear(); });

describe('GeofencesProvider: entrada no raio (com o app aberto)', () => {
  it('ao entrar no raio avisa uma vez, com título, endereço e o id do lembrete', async () => {
    const { mover } = await montar([mercado]);
    await mover(aoNorte(mercado, 500));
    expect(notifyNow).not.toHaveBeenCalled();
    await mover(aoNorte(mercado, 100));
    expect(notifyNow).toHaveBeenCalledTimes(1);
    expect(notifyNow).toHaveBeenCalledWith(expect.objectContaining({ title: 'Você chegou: Comprar pão', body: 'Padaria da Rua A, 10', data: { reminderId: 'm1' } }));
    expect(estado.insideIds).toEqual(['m1']);
    expect(estado.arrivals[0]).toMatchObject({ id: 'm1', title: 'Comprar pão', place: 'Padaria da Rua A, 10' });
  });

  it('o aviso leva um identificador por lembrete: se o sistema avisar também (segundo plano), um troca o outro', async () => {
    const { mover } = await montar([mercado]);
    await mover(aoNorte(mercado, 100));
    expect(notifyNow).toHaveBeenCalledWith(expect.objectContaining({ identifier: 'chegada-m1' }));
  });

  it('continuar dentro não avisa de novo', async () => {
    const { mover } = await montar([mercado]);
    await mover(aoNorte(mercado, 100));
    await mover(aoNorte(mercado, 60));
    await mover(aoNorte(mercado, 140));
    expect(notifyNow).toHaveBeenCalledTimes(1);
  });

  it('andar na borda do círculo não repete (a histerese: só "sai" depois de 1,25 vezes o raio mais 50 m)', async () => {
    const { mover } = await montar([mercado]);
    await mover(aoNorte(mercado, 140));
    await mover(aoNorte(mercado, 160)); // passou do raio, mas dentro da zona de saída
    await mover(aoNorte(mercado, 145));
    expect(notifyNow).toHaveBeenCalledTimes(1);
    expect(estado.insideIds).toEqual(['m1']);
  });

  it('saiu de verdade e voltou: avisa de novo', async () => {
    const { mover } = await montar([mercado]);
    await mover(aoNorte(mercado, 100));
    await mover(aoNorte(mercado, 400)); // 150 × 1,25 + 50 = 237,5
    expect(estado.insideIds).toEqual([]);
    await mover(aoNorte(mercado, 100));
    expect(notifyNow).toHaveBeenCalledTimes(2);
  });

  it('posição pouco precisa (mais de 200 m de erro) não dispara: na dúvida, sem alarme falso', async () => {
    const { mover } = await montar([mercado]);
    await mover({ ...aoNorte(mercado, 50), accuracy: 350 });
    expect(notifyNow).not.toHaveBeenCalled();
    await mover({ ...aoNorte(mercado, 50), accuracy: 15 });
    expect(notifyNow).toHaveBeenCalledTimes(1);
  });

  it('precisão desconhecida também não dispara', async () => {
    const { mover } = await montar([mercado]);
    await mover({ ...aoNorte(mercado, 50), accuracy: null });
    expect(notifyNow).not.toHaveBeenCalled();
  });

  it('cada lembrete por local tem o seu raio e o seu aviso', async () => {
    const { mover } = await montar([mercado, farmacia]);
    await mover(aoNorte(farmacia, 50));
    expect(notifyNow).toHaveBeenCalledTimes(1);
    expect(notifyNow).toHaveBeenCalledWith(expect.objectContaining({ title: 'Você chegou: Remédio', identifier: 'chegada-f1' }));
    expect(estado.insideIds).toEqual(['f1']);
  });

  it('só entram os lembretes por local ativos e com coordenadas', async () => {
    const { mover } = await montar([mercado, { ...farmacia, active: false }, { ...mercado, id: 'x', kind: 'time' }, { ...mercado, id: 'y', lat: undefined }]);
    expect(estado.fences.map((f) => f.id)).toEqual(['m1']);
    await mover(aoNorte(mercado, 50));
    expect(notifyNow).toHaveBeenCalledTimes(1);
  });

  it('sem posição (acompanhamento desligado) zera o que estava dentro', async () => {
    const { mover } = await montar([mercado]);
    await mover(aoNorte(mercado, 50));
    expect(estado.insideIds).toEqual(['m1']);
    await mover(null);
    expect(estado.insideIds).toEqual([]);
    expect(estado.nearest).toBeNull();
    await mover(aoNorte(mercado, 50)); // a próxima leitura dentro conta como chegada
    expect(notifyNow).toHaveBeenCalledTimes(2);
  });

  it('diz qual é o lembrete mais próximo e a que distância', async () => {
    const { mover } = await montar([mercado, farmacia]);
    await mover(aoNorte(mercado, 300));
    expect(estado.nearest?.fence.id).toBe('m1');
    expect(Math.round(estado.nearest?.meters ?? 0)).toBe(300);
  });

  it('guarda só as 20 últimas chegadas', async () => {
    const { mover } = await montar([mercado]);
    for (let i = 0; i < 25; i++) { await mover(aoNorte(mercado, 50)); await mover(aoNorte(mercado, 500)); }
    expect(estado.arrivals).toHaveLength(20);
  });
});

describe('GeofencesProvider: a memória das chegadas (o app aberto e o sistema não se repetem)', () => {
  it('abrir o app de novo já dentro do raio não avisa outra vez', async () => {
    const primeira = await montar([mercado]);
    await primeira.mover(aoNorte(mercado, 100));
    expect(notifyNow).toHaveBeenCalledTimes(1);

    const segunda = await montar([mercado]); // outra montagem do app: o estado em memória é novo, o do aparelho continua
    await segunda.mover(aoNorte(mercado, 100));
    expect(notifyNow).toHaveBeenCalledTimes(1);
    expect(estado.insideIds).toEqual(['m1']); // mas ele sabe que está dentro
  });

  it('a chegada que o sistema já avisou (registrada no aparelho) não é avisada de novo pelo app aberto', async () => {
    await AsyncStorage.setItem('lembreiai:dentro:v1', JSON.stringify({ m1: Date.now() - 30_000 }));
    const { mover } = await montar([mercado]);
    await mover(aoNorte(mercado, 100));
    expect(notifyNow).not.toHaveBeenCalled();
    expect(estado.arrivals).toEqual([]); // "último aviso" só mostra o que realmente avisou
  });

  it('sair limpa a marca: voltar depois avisa', async () => {
    const { mover } = await montar([mercado]);
    await mover(aoNorte(mercado, 100));
    await mover(aoNorte(mercado, 500));
    expect(JSON.parse((await AsyncStorage.getItem('lembreiai:dentro:v1')) ?? '{}')).toEqual({});
    await mover(aoNorte(mercado, 100));
    expect(notifyNow).toHaveBeenCalledTimes(2);
  });

  it('guarda título e endereço de cada lugar para o sistema avisar com o app fechado', async () => {
    await montar([mercado, farmacia]);
    await act(async () => {});
    expect(JSON.parse((await AsyncStorage.getItem('lembreiai:cercas:v1')) ?? '{}')).toEqual({
      m1: { title: 'Comprar pão', place: 'Padaria da Rua A, 10' },
      f1: { title: 'Remédio', place: 'Farmácia' },
    });
  });

  it('enquanto os lembretes carregam não mexe no que está guardado (lista vazia de passagem apagaria as marcas)', async () => {
    await AsyncStorage.setItem('lembreiai:cercas:v1', JSON.stringify({ m1: { title: 'Comprar pão', place: '' } }));
    await AsyncStorage.setItem('lembreiai:dentro:v1', JSON.stringify({ m1: Date.now() }));
    await montar([], { carregando: true });
    await act(async () => {});
    expect(JSON.parse((await AsyncStorage.getItem('lembreiai:cercas:v1')) ?? '{}')).toHaveProperty('m1');
    expect(JSON.parse((await AsyncStorage.getItem('lembreiai:dentro:v1')) ?? '{}')).toHaveProperty('m1');
  });
});
