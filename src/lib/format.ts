const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** "2026-09-16" -> "Qua, 16 de set de 2026" (dia da semana calculado) */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const wd = new Date(y, m - 1, d).getDay();
  return `${WEEKDAYS[wd]}, ${d} de ${MONTHS[m - 1]} de ${y}`;
}
