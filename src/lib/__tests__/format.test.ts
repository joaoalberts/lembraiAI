import { formatDate, fold, sectionOf, todayISO, toDate } from '../format';

describe('toDate', () => {
  it('lê data e hora locais', () => {
    const d = toDate('2026-09-20', '09:30');
    expect(d).not.toBeNull();
    expect([d!.getFullYear(), d!.getMonth(), d!.getDate(), d!.getHours(), d!.getMinutes()]).toEqual([2026, 8, 20, 9, 30]);
  });

  it('aceita o "HH:MM:SS" que o Postgres devolve', () => {
    expect(toDate('2026-09-20', '09:30:00')?.getMinutes()).toBe(30);
  });

  it.each([
    ['31/02 (o JS rolaria para março)', '2026-02-31', '09:00'],
    ['hora 24', '2026-09-20', '24:00'],
    ['minuto 60', '2026-09-20', '09:60'],
    ['formato de data errado', '20-09-2026', '09:00'],
    ['hora sem zero à esquerda', '2026-09-20', '9:00'],
    ['texto qualquer', 'lixo', 'lixo'],
  ])('rejeita %s', (_nome, data, hora) => {
    expect(toDate(data, hora)).toBeNull();
  });
});

describe('datas relativas a hoje', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 8, 20, 12, 0)); // domingo, 20/09/2026
  });
  afterEach(() => jest.useRealTimers());

  it('todayISO usa o dia local e aceita deslocamento', () => {
    expect(todayISO()).toBe('2026-09-20');
    expect(todayISO(1)).toBe('2026-09-21');
    expect(todayISO(11)).toBe('2026-10-01'); // vira o mês
  });

  it('sectionOf agrupa em Hoje / Amanhã / Esta semana', () => {
    expect(sectionOf('2026-09-20')).toBe('Hoje');
    expect(sectionOf('2026-09-21')).toBe('Amanhã');
    expect(sectionOf('2026-09-25')).toBe('Esta semana');
    expect(sectionOf('2000-01-01')).toBe('Esta semana');
  });
});

describe('formatDate', () => {
  it('calcula o dia da semana', () => {
    expect(formatDate('2026-09-20')).toBe('Dom, 20 de set de 2026');
    expect(formatDate('2026-01-01')).toBe('Qui, 1 de jan de 2026');
  });
});

describe('fold', () => {
  it('tira acentos e põe em minúsculas', () => {
    expect(fold('Reunião com a Ação')).toBe('reuniao com a acao');
  });
});
