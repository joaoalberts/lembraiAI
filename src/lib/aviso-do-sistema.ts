import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/** O canal do Android por onde saem todos os avisos do app (a importância é fixada na criação do canal). */
export const CANAL_DE_AVISOS = 'lembretes';

export interface AvisoImediato { title: string; body?: string; data?: Record<string, unknown>; identifier?: string }

/**
 * Mostra um aviso na hora pelo sistema. Funciona também na tarefa em segundo plano, sem o app ter aberto nenhuma tela: por isso
 * garante o canal do Android aqui (criar de novo é inofensivo) em vez de contar com o que o app aberto já fez.
 */
export async function avisarNoSistema({ title, body, data, identifier }: AvisoImediato): Promise<void> {
  const android = Platform.OS === 'android';
  if (android) {
    await Notifications.setNotificationChannelAsync(CANAL_DE_AVISOS, { name: 'Lembretes', importance: Notifications.AndroidImportance.HIGH });
  }
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title, body, data },
    trigger: android ? { channelId: CANAL_DE_AVISOS } : null,
  });
}
