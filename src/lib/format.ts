import type { Section } from '../data/reminders';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** Texto para comparação em buscas: sem acentos e em minúsculas ("Reunião" -> "reuniao"). */
export const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Data de hoje no fuso local, "AAAA-MM-DD"; `offset` = dias a partir de hoje (1 = amanhã). */
export function todayISO(offset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** "2026-09-16" -> "Qua, 16 de set de 2026" (dia da semana calculado) */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const wd = new Date(y, m - 1, d).getDay();
  return `${WEEKDAYS[wd]}, ${d} de ${MONTHS[m - 1]} de ${y}`;
}

/** Seção da lista pela data real de hoje. */
export function sectionOf(iso: string): Section {
  if (iso === todayISO()) return 'Hoje';
  if (iso === todayISO(1)) return 'Amanhã';
  return 'Esta semana';
}

/**
 * "AAAA-MM-DD" + "HH:MM" -> Date local, ou null se o texto for inválido. Rejeita datas que o JS "rolaria" sozinho
 * (2026-02-31 viraria março) e horas fora de 00:00–23:59.
 */
export function toDate(dateISO: string, time: string): Date | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateISO);
  const t = /^(\d{2}):(\d{2})/.exec(time);
  if (!d || !t) return null;
  const [y, mo, day, h, mi] = [+d[1], +d[2], +d[3], +t[1], +t[2]];
  if (h > 23 || mi > 59) return null;
  const date = new Date(y, mo - 1, day, h, mi, 0, 0);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== day) return null;
  return date;
}
