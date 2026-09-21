import type { Reminder } from '../data/reminders';

export interface NotifyInput {
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  /** O mesmo identificador troca o aviso anterior em vez de empilhar outro (a chegada a um lugar não pode aparecer duas vezes). */
  identifier?: string;
}

/** Um aviso mostrado na tela do app (só na web). */
export interface AvisoNaTela { id: number; title: string; body?: string }

/**
 * O que a tela de avisos oferece. `notifications.tsx` (iOS e Android) e `notifications.web.tsx` (navegador) devolvem esta mesma
 * forma; o Metro escolhe o arquivo pela plataforma, então só este tipo em comum garante que os dois não se afastem.
 */
export interface NotificationsState {
  supported: boolean;
  /**
   * `sistema`: o sistema agenda e entrega os avisos, inclusive com o app fechado.
   * `so-com-o-app-aberto`: o navegador não agenda nada; o app confere os horários e avisa enquanto está aberto.
   */
  modo: 'sistema' | 'so-com-o-app-aberto';
  permissionGranted: boolean;
  /** Avisos por horário agendados agora (no sistema) ou que vencem nas próximas 24 h (na web). */
  scheduledCount: number;
  notifyNow: (n: NotifyInput) => Promise<void>;
  /** Deixa os avisos idênticos à lista: no sistema cancela tudo e agenda de novo; na web atualiza o que o relógio confere. */
  syncReminders: (reminders: Reminder[]) => Promise<void>;
  /** Só na web: pede a permissão dos avisos do navegador (o navegador exige um toque da pessoa). */
  requestPermission?: () => Promise<boolean>;
  /** Só na web: avisos que estão na tela agora, e como dispensar um. */
  avisosNaTela?: AvisoNaTela[];
  dispensarAviso?: (id: number) => void;
}
