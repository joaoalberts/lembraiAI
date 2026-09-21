import { repeatLabel, type Reminder, type RepeatKey } from '../data/reminders';
import { toDate } from './format';

/** Quando avisar, em termos neutros; `state/notifications.tsx` converte para o gatilho do expo-notifications. */
export type Plan =
  | { type: 'date'; date: Date }
  | { type: 'daily'; hour: number; minute: number }
  | { type: 'weekly'; weekday: number; hour: number; minute: number }      // 1 = domingo … 7 = sábado
  | { type: 'monthly'; day: number; hour: number; minute: number }
  | { type: 'yearly'; month: number; day: number; hour: number; minute: number };   // month: 0–11

/** Quantas ocorrências datadas agendar de uma repetição que ainda não começou. */
const JANELA: Record<Exclude<RepeatKey, 'never'>, number> = { daily: 14, weekdays: 10, weekly: 8, monthly: 6, yearly: 2 };

/**
 * As próximas `n` ocorrências de uma repetição, a partir da data de início, no mesmo horário de parede. Dias úteis pula o
 * fim de semana (o primeiro aviso de uma repetição que começa no sábado é na segunda). Mensal e anual pulam o mês ou o ano
 * que não tem o dia (31 de fevereiro, 29 de fevereiro fora do ano bissexto), como o gatilho recorrente do sistema faz.
 */
function ocorrencias(start: Date, repeat: Exclude<RepeatKey, 'never'>, n: number): Date[] {
  const [ano, mes, dia, h, mi] = [start.getFullYear(), start.getMonth(), start.getDate(), start.getHours(), start.getMinutes()];
  const saida: Date[] = [];
  const limite = n * 12 + 12;
  for (let k = 0; saida.length < n && k < limite; k++) {
    switch (repeat) {
      case 'daily': saida.push(new Date(ano, mes, dia + k, h, mi)); break;
      case 'weekly': saida.push(new Date(ano, mes, dia + 7 * k, h, mi)); break;
      case 'weekdays': {
        const d = new Date(ano, mes, dia + k, h, mi);
        if (d.getDay() >= 1 && d.getDay() <= 5) saida.push(d);
        break;
      }
      case 'monthly': {
        const d = new Date(ano, mes + k, dia, h, mi);
        if (d.getDate() === dia) saida.push(d);
        break;
      }
      case 'yearly': {
        const d = new Date(ano + k, mes, dia, h, mi);
        if (d.getMonth() === mes && d.getDate() === dia) saida.push(d);
        break;
      }
    }
  }
  return saida;
}

/** O texto do aviso de um lembrete por horário (o mesmo no sistema e na web). */
export const corpoDoLembrete = (r: Reminder): string =>
  r.repeat === 'never' ? `Lembrete das ${r.time}` : `Lembrete das ${r.time} · ${repeatLabel(r.repeat)}`;

/** O iOS guarda no máximo 64 avisos pendentes; ficam 4 de folga. */
export const LIMITE_DE_AVISOS = 60;

export interface ItemDeAviso { id: string; plano: Plan }

/**
 * Cabe no limite do sistema: os avisos recorrentes ficam sempre (um só cobre todas as ocorrências) e dos datados valem os mais
 * próximos. A ordem original é mantida. O resto volta a ser agendado quando o app abre e há vaga.
 */
export function orcamentoDeAvisos<T extends ItemDeAviso>(itens: T[], max: number = LIMITE_DE_AVISOS): T[] {
  const recorrentes = itens.filter((i) => i.plano.type !== 'date').slice(0, max);
  const vagas = Math.max(0, max - recorrentes.length);
  const datados = itens
    .filter((i): i is T & { plano: { type: 'date'; date: Date } } => i.plano.type === 'date')
    .sort((a, b) => a.plano.date.getTime() - b.plano.date.getTime())
    .slice(0, vagas);
  const ficam = new Set<T>([...recorrentes, ...datados]);
  return itens.filter((i) => ficam.has(i));
}

/**
 * Avisos que um lembrete POR HORÁRIO precisa ter agendados no aparelho. Lembretes por local não entram aqui: quem
 * avisa é o geofence.
 *
 * Repetição que já começou usa os gatilhos recorrentes do sistema (valem para sempre, com o app fechado). Repetição que
 * ainda não começou não pode usá-los (o gatilho dispararia antes da data de início), então agenda uma JANELA das próximas
 * ocorrências como avisos datados (`JANELA`); quando a data de início passa e o app abre, o plano vira recorrente.
 */
export function planNotifications(r: Reminder, now: Date = new Date()): Plan[] {
  if (!r.active || r.kind !== 'time') return [];
  const start = toDate(r.dateISO, r.time);
  if (!start) return [];

  if (r.repeat === 'never') return start > now ? [{ type: 'date', date: start }] : [];
  if (start > now) return ocorrencias(start, r.repeat, JANELA[r.repeat]).map((date) => ({ type: 'date' as const, date }));

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
