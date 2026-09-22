import AsyncStorage from '@react-native-async-storage/async-storage';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { avisarNoSistema } from './lib/aviso-do-sistema';
import { TAREFA_DE_GEOFENCE, tratarEventoDeGeofence, type EventoDeGeofence } from './lib/geofence-background';

/**
 * Tarefas em segundo plano. `index.js` importa este arquivo ANTES do Expo Router: quando o sistema acorda o app por um evento de
 * geofence não há tela nenhuma, só o JavaScript, e a tarefa precisa já estar definida (se não estiver, o TaskManager a
 * desregistra sozinho). Na web não existe tarefa em segundo plano.
 */
if (Platform.OS !== 'web') {
  TaskManager.defineTask<EventoDeGeofence>(TAREFA_DE_GEOFENCE, async ({ data, error }) => {
    if (error) {
      console.warn('Geofence: erro do sistema', error.message);
      return;
    }
    try {
      await tratarEventoDeGeofence(data, { armazenamento: AsyncStorage, avisar: avisarNoSistema, agora: Date.now });
    } catch (e) {
      console.warn('Geofence: não foi possível avisar a chegada', e);
    }
  });
}
