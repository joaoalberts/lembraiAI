import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import fs from 'fs';
import path from 'path';
import { Platform } from 'react-native';
import { GeofencingEventType } from 'expo-location';
import { lembrarCercas } from '../lib/chegadas';
import { ENTROU, SAIU, TAREFA_DE_GEOFENCE } from '../lib/geofence-background';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));
jest.mock('expo-task-manager', () => ({ defineTask: jest.fn() }));
jest.mock('expo-notifications', () => ({
  AndroidImportance: { HIGH: 4 },
  setNotificationChannelAsync: jest.fn(async () => undefined),
  scheduleNotificationAsync: jest.fn(async () => 'id'),
}));

const RAIZ = path.join(__dirname, '../..');
// `isolateModules` carrega o react-native de novo: a plataforma tem de ser trocada no registro isolado, não no do teste
const carregar = (os: string = 'ios') => {
  jest.isolateModules(() => {
    const { Platform: plataforma } = require('react-native');
    jest.replaceProperty(plataforma, 'OS', os);
    require('../tarefas');
  });
};
const executor = () => jest.mocked(TaskManager.defineTask).mock.calls[0]?.[1] as unknown as (corpo: { data: unknown; error: { message: string } | null }) => Promise<void>;

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
});
afterEach(() => jest.restoreAllMocks());

describe('tarefas.ts: a tarefa que o sistema acorda com o app fechado', () => {
  it('define a tarefa de geofence com o nome combinado', () => {
    carregar();
    expect(TaskManager.defineTask).toHaveBeenCalledTimes(1);
    expect(TaskManager.defineTask).toHaveBeenCalledWith(TAREFA_DE_GEOFENCE, expect.any(Function));
  });

  it('na web não define nada (lá não há tarefa em segundo plano)', () => {
    carregar('web');
    expect(TaskManager.defineTask).not.toHaveBeenCalled();
  });

  it('as constantes de evento são as do expo-location', () => {
    expect(ENTROU).toBe(GeofencingEventType.Enter);
    expect(SAIU).toBe(GeofencingEventType.Exit);
  });

  it('um evento de entrada avisa na hora, pelo sistema, com o que o app guardou do lugar (iOS)', async () => {
    await lembrarCercas([{ id: 'm1', title: 'Comprar pão', place: 'Padaria da Rua A', lat: -3.7, lng: -38.5, radius: 150 }], AsyncStorage);
    carregar();
    await executor()({ data: { eventType: GeofencingEventType.Enter, region: { identifier: 'm1' } }, error: null });
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      identifier: 'chegada-m1',
      content: { title: 'Você chegou: Comprar pão', body: 'Padaria da Rua A', data: { reminderId: 'm1' } },
      trigger: null,
    });
  });

  it('no Android garante o canal e leva o canal no gatilho (o app pode estar sem nunca ter aberto o canal)', async () => {
    await lembrarCercas([{ id: 'm1', title: 'Comprar pão', place: '', lat: -3.7, lng: -38.5, radius: 150 }], AsyncStorage);
    carregar('android');
    jest.replaceProperty(Platform, 'OS', 'android'); // o aviso do sistema (já carregado no registro do teste) lê a plataforma daqui
    await executor()({ data: { eventType: GeofencingEventType.Enter, region: { identifier: 'm1' } }, error: null });
    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith('lembretes', { name: 'Lembretes', importance: 4 });
    expect(jest.mocked(Notifications.scheduleNotificationAsync).mock.calls[0]?.[0]).toMatchObject({ trigger: { channelId: 'lembretes' } });
  });

  it('erro do sistema ou falha ao mostrar o aviso não derruba a tarefa', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    await lembrarCercas([{ id: 'm1', title: 'x', place: '', lat: 0, lng: 0, radius: 150 }], AsyncStorage);
    carregar();
    await expect(executor()({ data: null, error: { message: 'falhou' } })).resolves.toBeUndefined();
    jest.mocked(Notifications.scheduleNotificationAsync).mockRejectedValueOnce(new Error('sem permissão'));
    await expect(executor()({ data: { eventType: GeofencingEventType.Enter, region: { identifier: 'm1' } }, error: null })).resolves.toBeUndefined();
  });
});

describe('ponto de entrada do app (index.js)', () => {
  const pacote = JSON.parse(fs.readFileSync(path.join(RAIZ, 'package.json'), 'utf8')) as { main: string };
  const linhas = () => fs.readFileSync(path.join(RAIZ, 'index.js'), 'utf8').split('\n').filter((l) => /^import /.test(l));

  it('o app começa por index.js, não direto pelo Expo Router', () => {
    expect(pacote.main).toBe('index.js');
  });

  it('as tarefas em segundo plano são importadas ANTES do Expo Router: o sistema acorda o app sem tela e a tarefa precisa já existir', () => {
    expect(linhas()).toEqual(["import './src/tarefas';", "import 'expo-router/entry';"]);
  });
});
