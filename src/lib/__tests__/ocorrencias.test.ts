import type { Reminder } from '../../data/reminders';
import { ocorrenciasEntre } from '../ocorrencias';

const base: Reminder = {
  id: '1', title: 't', category: 'blue', icon: 'bell', kind: 'time',
  dateISO: '2026-09-21', time: '09:00', repeat: 'never', active: true,
};
const d = (a: number, m: number, dia: number, h = 9, mi = 0) => new Date(a, m - 1, dia, h, mi, 0, 0);
const horas = (r: Reminder, de: Date, ate: Date) => ocorrenciasEntre(r, de, ate).map((x) => x.getTime());

describe('ocorrenciasEntre: quais avisos caem na janela (de, ate], sem incluir o começo e incluindo o fim', () => {
  it('sem repetição: só a data e hora do lembrete, e só se cair na janela', () => {
    expect(horas(base, d(2026, 9, 21, 8, 59), d(2026, 9, 21, 9, 0))).toEqual([d(2026, 9, 21).getTime()]);
    expect(horas(base, d(2026, 9, 21, 9, 0), d(2026, 9, 21, 9, 1))).toEqual([]); // o começo da janela não conta: já foi tratado antes
    expect(horas(base, d(2026, 9, 21, 9, 1), d(2026, 9, 22))).toEqual([]);
    expect(horas(base, d(2026, 9, 20), d(2026, 9, 21, 8, 59))).toEqual([]);
  });

  it('diário: um por dia, a partir da data de início (não antes dela)', () => {
    expect(horas({ ...base, repeat: 'daily' }, d(2026, 9, 19), d(2026, 9, 23, 23, 59))).toEqual([d(2026, 9, 21), d(2026, 9, 22), d(2026, 9, 23)].map((x) => x.getTime()));
  });

  it('dias úteis: só de segunda a sexta', () => {
    // 21/09/2026 é segunda-feira
    const r = { ...base, repeat: 'weekdays' as const };
    const dias = ocorrenciasEntre(r, d(2026, 9, 20, 0, 0), d(2026, 9, 28, 0, 0)).map((x) => x.getDate());
    expect(dias).toEqual([21, 22, 23, 24, 25]);
  });

  it('semanal: no mesmo dia da semana da data de início', () => {
    const r = { ...base, repeat: 'weekly' as const };
    expect(horas(r, d(2026, 9, 20), d(2026, 10, 12))).toEqual([d(2026, 9, 21), d(2026, 9, 28), d(2026, 10, 5), d(2026, 10, 12)].map((x) => x.getTime()));
  });

  it('mensal: mesmo dia do mês; mês sem esse dia é pulado', () => {
    const r = { ...base, dateISO: '2026-10-31', repeat: 'monthly' as const };
    expect(horas(r, d(2026, 10, 1), d(2027, 2, 28))).toEqual([d(2026, 10, 31), d(2026, 12, 31), d(2027, 1, 31)].map((x) => x.getTime()));
  });

  it('anual: mesma data todo ano', () => {
    const r = { ...base, repeat: 'yearly' as const };
    expect(horas(r, d(2026, 1, 1), d(2028, 12, 31))).toEqual([d(2026, 9, 21), d(2027, 9, 21), d(2028, 9, 21)].map((x) => x.getTime()));
  });

  it('nada para lembrete por local, pausado ou com data inválida', () => {
    const janela: [Date, Date] = [d(2026, 9, 1), d(2026, 12, 31)];
    expect(ocorrenciasEntre({ ...base, kind: 'local', lat: 1, lng: 1, radius: 100 }, ...janela)).toEqual([]);
    expect(ocorrenciasEntre({ ...base, active: false }, ...janela)).toEqual([]);
    expect(ocorrenciasEntre({ ...base, dateISO: 'lixo' }, ...janela)).toEqual([]);
  });

  it('janela vazia ou invertida não devolve nada', () => {
    expect(ocorrenciasEntre(base, d(2026, 9, 22), d(2026, 9, 21))).toEqual([]);
    expect(ocorrenciasEntre(base, d(2026, 9, 21, 9, 0), d(2026, 9, 21, 9, 0))).toEqual([]);
  });

  it('janela longa é limitada: um app aberto depois de meses não dispara uma avalanche', () => {
    const r = { ...base, repeat: 'daily' as const };
    expect(ocorrenciasEntre(r, d(2026, 9, 1), d(2027, 9, 1)).length).toBeLessThanOrEqual(40);
  });
});
