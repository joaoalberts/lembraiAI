/** Horário "HH:MM" nas rodas do formulário: separa e junta as duas partes e acha o número que a roda mostra parado. */

export const HORAS = Array.from({ length: 24 }, (_, i) => i);
export const MINUTOS = Array.from({ length: 60 }, (_, i) => i);

export const doisDigitos = (n: number): string => String(n).padStart(2, '0');

/** "09:05" -> { hora: 9, minuto: 5 }; texto inválido cai em 09:00 (o padrão do formulário). */
export function dividirHorario(horario: string): { hora: number; minuto: number } {
  const m = /^(\d{2}):(\d{2})/.exec(horario);
  const hora = m ? Number(m[1]) : 9;
  const minuto = m ? Number(m[2]) : 0;
  return hora <= 23 && minuto <= 59 ? { hora, minuto } : { hora: 9, minuto: 0 };
}

export const juntarHorario = (hora: number, minuto: number): string => `${doisDigitos(hora)}:${doisDigitos(minuto)}`;

/** O número da roda que fica no meio quando ela está rolada `y` pixels, com `altura` por número e `total` números. */
export function indiceDaRolagem(y: number, altura: number, total: number): number {
  return Math.min(total - 1, Math.max(0, Math.round(y / altura)));
}
