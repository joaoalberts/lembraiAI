/** Cálculo do calendário do seletor de data (o original usa o popup do navegador; o app precisa de um desenho próprio). */

export interface Dia {
  /** "AAAA-MM-DD" */
  iso: string;
  dia: number;
  /** `false` nos dias que completam a primeira e a última semana e são do mês vizinho. */
  doMes: boolean;
}

export const INICIAIS_DA_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] as const;

const NOMES_DOS_MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** `mes` de 0 (janeiro) a 11 (dezembro), como o `Date` do JavaScript. */
export const isoDe = (ano: number, mes: number, dia: number): string => {
  const d = new Date(ano, mes, dia);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** "setembro de 2026" */
export const tituloDoMes = (ano: number, mes: number): string => `${NOMES_DOS_MESES[mes]} de ${ano}`;

/** Anda `delta` meses (negativo volta), virando o ano quando precisa. */
export function deslocarMes(ano: number, mes: number, delta: number): { ano: number; mes: number } {
  const d = new Date(ano, mes + delta, 1);
  return { ano: d.getFullYear(), mes: d.getMonth() };
}

/** Seis semanas de domingo a sábado (a altura do calendário nunca muda de um mês para o outro). */
export function gradeDoMes(ano: number, mes: number): Dia[][] {
  const primeiroDaSemana = new Date(ano, mes, 1).getDay();
  const semanas: Dia[][] = [];
  for (let s = 0; s < 6; s++) {
    semanas.push(
      Array.from({ length: 7 }, (_, d) => {
        const data = new Date(ano, mes, 1 - primeiroDaSemana + s * 7 + d);
        return { iso: isoDe(data.getFullYear(), data.getMonth(), data.getDate()), dia: data.getDate(), doMes: data.getMonth() === mes };
      }),
    );
  }
  return semanas;
}

/** "2026-09-21" -> { ano: 2026, mes: 8 } */
export function mesDaData(iso: string): { ano: number; mes: number } {
  const [ano, mes] = iso.split('-').map(Number);
  return { ano, mes: mes - 1 };
}
