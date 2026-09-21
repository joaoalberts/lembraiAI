import type { Reminder } from '../data/reminders';
import { toDate } from './format';

/** Quando avisar, em termos neutros; `state/notifications.tsx` converte para o gatilho do expo-notifications. */
export type Plan =
  | { type: 'date'; date: Date }
  | { type: 'daily'; hour: number; minute: number }
  | { type: 'weekly'; weekday: number; hour: number; minute: number }      // 1 = domingo … 7 = sábado
  | { type: 'monthly'; day: number; hour: number; minute: number }
  | { type: 'yearly'; month: number; day: number; hour: number; minute: number };   // month: 0–11

/**
 * Avisos que um lembrete POR HORÁRIO precisa ter agendados no aparelho. Lembretes por local não entram aqui: quem
 * avisa é o geofence. Repetições usam os gatilhos recorrentes do sistema, então continuam valendo com o app fechado.
 *
 * Limitação conhecida: uma repetição cuja 1ª data ainda não chegou agenda só essa 1ª ocorrência (um gatilho
 * recorrente dispararia antes da data de início). As repetições são agendadas na próxima vez que o app abrir
 * depois dessa data.
 */
export function planNotifications(r: Reminder, now: Date = new Date()): Plan[] {
  if (!r.active || r.kind !== 'time') return [];
  const start = toDate(r.dateISO, r.time);
  if (!start) return [];

  if (r.repeat === 'never' || start > now) return start > now ? [{ type: 'date', date: start }] : [];

  const hour = start.getHours();
  const minute = start.getMinutes();
  switch (r.repeat) {
    case 'daily': return [{ type: 'daily', hour, minute }];
    case 'weekdays': return [2, 3, 4, 5, 6].map((weekday) => ({ type: 'weekly' as const, weekday, hour, minute }));
    case 'weekly': return [{ type: 'weekly', weekday: start.getDay() + 1, hour, minute }];
    case 'monthly': return [{ type: 'monthly', day: start.getDate(), hour, minute }];
    case 'yearly': return [{ type: 'yearly', month: start.getMonth(), day: start.getDate(), hour, minute }];
    default: return [];
  }
}
