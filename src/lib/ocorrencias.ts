import type { Reminder } from '../data/reminders';
import { toDate } from './format';

/** Mais que isso numa janela só é sinal de janela absurda (app aberto meses depois): não vira avalanche de avisos. */
const LIMITE_DE_OCORRENCIAS = 40;
/** Dias examinados no máximo (cerca de dois anos). */
const LIMITE_DE_DIAS = 800;

/**
 * Os avisos de um lembrete POR HORÁRIO que caem em (`de`, `ate`]: o começo da janela não conta (já foi tratado na vez anterior)
 * e o fim conta. É o relógio de quem avisa com o app aberto (a web), onde não há agenda do sistema. Repetição só vale a partir
 * da data de início; dias úteis pula o fim de semana; mensal e anual só caem em datas que existem.
 */
export function ocorrenciasEntre(r: Reminder, de: Date, ate: Date): Date[] {
  if (!r.active || r.kind !== 'time' || ate.getTime() <= de.getTime()) return [];
  const inicio = toDate(r.dateISO, r.time);
  if (!inicio) return [];
  const dentro = (d: Date) => d.getTime() > de.getTime() && d.getTime() <= ate.getTime();
  if (r.repeat === 'never') return dentro(inicio) ? [inicio] : [];

  const [h, mi] = [inicio.getHours(), inicio.getMinutes()];
  const primeiroDia = new Date(Math.max(new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate()).getTime(), new Date(de.getFullYear(), de.getMonth(), de.getDate()).getTime()));
  const saida: Date[] = [];
  for (let k = 0; k < LIMITE_DE_DIAS && saida.length < LIMITE_DE_OCORRENCIAS; k++) {
    const candidato = new Date(primeiroDia.getFullYear(), primeiroDia.getMonth(), primeiroDia.getDate() + k, h, mi, 0, 0);
    if (candidato.getTime() > ate.getTime()) break;
    if (candidato.getTime() < inicio.getTime() || !dentro(candidato)) continue;
    const cai =
      r.repeat === 'daily' ||
      (r.repeat === 'weekdays' && candidato.getDay() >= 1 && candidato.getDay() <= 5) ||
      (r.repeat === 'weekly' && candidato.getDay() === inicio.getDay()) ||
      (r.repeat === 'monthly' && candidato.getDate() === inicio.getDate()) ||
      (r.repeat === 'yearly' && candidato.getDate() === inicio.getDate() && candidato.getMonth() === inicio.getMonth());
    if (cai) saida.push(candidato);
  }
  return saida;
}
