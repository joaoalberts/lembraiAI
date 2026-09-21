import type { Reminder } from '../../data/reminders';
import { orcamentoDeAvisos, planNotifications, type ItemDeAviso } from '../schedule';

const agora = new Date(2026, 8, 20, 12, 0); // domingo, 20/09/2026 12:00
const base: Reminder = {
  id: '1', title: 't', category: 'blue', icon: 'bell', kind: 'time',
  dateISO: '2026-09-20', time: '09:00', repeat: 'never', active: true,
};
const tipos = (r: Reminder) => planNotifications(r, agora).map((p) => p.type);

describe('planNotifications — sem repetição', () => {
  it('agenda um aviso para uma data futura', () => {
    const [p] = planNotifications({ ...base, dateISO: '2026-09-21' }, agora);
    expect(p.type).toBe('date');
    expect(p.type === 'date' && p.date.getTime()).toBe(new Date(2026, 8, 21, 9, 0).getTime());
  });

  it('agenda para hoje se a hora ainda vai chegar', () => {
    expect(tipos({ ...base, time: '13:00' })).toEqual(['date']);
  });

  it('não agenda o que já passou', () => {
    expect(tipos({ ...base, time: '08:00' })).toEqual([]);
    expect(tipos({ ...base, dateISO: '2026-09-19' })).toEqual([]);
  });
});

describe('planNotifications — repetições (data de início no passado)', () => {
  const passado = { ...base, dateISO: '2026-09-13' }; // domingo

  it('diário', () => {
    expect(planNotifications({ ...passado, repeat: 'daily' }, agora)).toEqual([{ type: 'daily', hour: 9, minute: 0 }]);
  });

  it('dias úteis = 5 gatilhos semanais, segunda a sexta (1 = domingo)', () => {
    const plan = planNotifications({ ...passado, repeat: 'weekdays', time: '08:30' }, agora);
    expect(plan.map((p) => (p.type === 'weekly' ? p.weekday : -1))).toEqual([2, 3, 4, 5, 6]);
    expect(plan.every((p) => p.type === 'weekly' && p.hour === 8 && p.minute === 30)).toBe(true);
  });

  it('semanal usa o dia da semana da data de início', () => {
    expect(planNotifications({ ...passado, repeat: 'weekly' }, agora)).toEqual([{ type: 'weekly', weekday: 1, hour: 9, minute: 0 }]);
  });

  it('mensal usa o dia do mês', () => {
    expect(planNotifications({ ...passado, dateISO: '2026-08-20', repeat: 'monthly' }, agora)).toEqual([
      { type: 'monthly', day: 20, hour: 9, minute: 0 },
    ]);
  });

  it('anual usa mês 0–11 (setembro = 8)', () => {
    expect(planNotifications({ ...passado, dateISO: '2025-09-20', repeat: 'yearly' }, agora)).toEqual([
      { type: 'yearly', month: 8, day: 20, hour: 9, minute: 0 },
    ]);
  });

  it('repetição que ainda não começou não usa o gatilho recorrente do sistema (ele dispararia antes da data de início)', () => {
    for (const repeat of ['daily', 'weekdays', 'weekly', 'monthly', 'yearly'] as const) {
      expect(tipos({ ...base, dateISO: '2026-09-25', repeat }).every((t) => t === 'date')).toBe(true);
    }
  });
});

describe('planNotifications — repetição que ainda não começou: janela de avisos datados (o app fechado segue avisando)', () => {
  const futuro = { ...base, dateISO: '2026-09-25' }; // sexta-feira, 09:00
  const datas = (r: Reminder) => planNotifications(r, agora).map((p) => (p.type === 'date' ? p.date : null));
  const dia = (a: number, m: number, d: number, h = 9, mi = 0) => new Date(a, m - 1, d, h, mi).getTime();

  it('diário: a 1ª ocorrência e mais 13, dia a dia, no mesmo horário', () => {
    const d = datas({ ...futuro, repeat: 'daily' });
    expect(d).toHaveLength(14);
    expect(d[0]?.getTime()).toBe(dia(2026, 9, 25));
    expect(d[1]?.getTime()).toBe(dia(2026, 9, 26));
    expect(d[13]?.getTime()).toBe(dia(2026, 10, 8));
  });

  it('dias úteis: pula sábado e domingo', () => {
    const d = datas({ ...futuro, repeat: 'weekdays' });
    expect(d).toHaveLength(10);
    expect(d.slice(0, 6).map((x) => x?.getTime())).toEqual([dia(2026, 9, 25), dia(2026, 9, 28), dia(2026, 9, 29), dia(2026, 9, 30), dia(2026, 10, 1), dia(2026, 10, 2)]);
    expect(d.every((x) => x !== null && x.getDay() >= 1 && x.getDay() <= 5)).toBe(true);
  });

  it('dias úteis com início no sábado: a primeira é a segunda-feira', () => {
    const d = datas({ ...futuro, dateISO: '2026-09-26', repeat: 'weekdays' });
    expect(d[0]?.getTime()).toBe(dia(2026, 9, 28));
  });

  it('semanal: de 7 em 7 dias, 8 ocorrências', () => {
    const d = datas({ ...futuro, repeat: 'weekly' });
    expect(d).toHaveLength(8);
    expect(d[1]?.getTime()).toBe(dia(2026, 10, 2));
    expect(d[7]?.getTime()).toBe(dia(2026, 11, 13));
  });

  it('mensal: mesmo dia do mês, 6 ocorrências; mês sem esse dia é pulado (como o gatilho do sistema)', () => {
    const d = datas({ ...futuro, dateISO: '2026-10-31', repeat: 'monthly' });
    expect(d.map((x) => x?.getTime())).toEqual([dia(2026, 10, 31), dia(2026, 12, 31), dia(2027, 1, 31), dia(2027, 3, 31), dia(2027, 5, 31), dia(2027, 7, 31)]);
  });

  it('anual: 2 ocorrências; 29 de fevereiro só nos anos bissextos', () => {
    expect(datas({ ...futuro, repeat: 'yearly' }).map((x) => x?.getTime())).toEqual([dia(2026, 9, 25), dia(2027, 9, 25)]);
    expect(datas({ ...futuro, dateISO: '2028-02-29', repeat: 'yearly' }).map((x) => x?.getTime())).toEqual([dia(2028, 2, 29), dia(2032, 2, 29)]);
  });

  it('a janela nunca inclui hora que já passou', () => {
    expect(datas({ ...futuro, repeat: 'daily' }).every((x) => x !== null && x.getTime() > agora.getTime())).toBe(true);
  });
});

describe('orcamentoDeAvisos — o iOS guarda no máximo 64 avisos pendentes', () => {
  const recorrente = (id: string): ItemDeAviso => ({ id, plano: { type: 'daily', hour: 9, minute: 0 } });
  const datado = (id: string, dia: number): ItemDeAviso => ({ id, plano: { type: 'date', date: new Date(2026, 9, dia, 9, 0) } });

  it('cabendo tudo, não corta nada e mantém a ordem', () => {
    const itens = [datado('a', 3), recorrente('b'), datado('c', 1)];
    expect(orcamentoDeAvisos(itens, 10)).toEqual(itens);
  });

  it('os recorrentes ficam sempre; dos datados, valem os mais próximos', () => {
    const itens = [datado('a', 9), datado('b', 2), recorrente('r'), datado('c', 5), datado('d', 1)];
    const kept = orcamentoDeAvisos(itens, 3);
    expect(kept.map((i) => i.id).sort()).toEqual(['b', 'd', 'r']);
  });

  it('se só os recorrentes já passam do limite, guarda os que couberem', () => {
    const itens = [recorrente('1'), recorrente('2'), recorrente('3')];
    expect(orcamentoDeAvisos(itens, 2)).toHaveLength(2);
  });
});

describe('planNotifications — o que nunca agenda', () => {
  it('lembrete por local (quem avisa é o geofence)', () => {
    expect(tipos({ ...base, kind: 'local', lat: 1, lng: 1, radius: 100 })).toEqual([]);
  });

  it('lembrete pausado', () => {
    expect(tipos({ ...base, dateISO: '2026-09-25', active: false })).toEqual([]);
  });

  it('data ou hora inválida', () => {
    expect(tipos({ ...base, dateISO: 'lixo' })).toEqual([]);
    expect(tipos({ ...base, dateISO: '2026-09-25', time: '99:99' })).toEqual([]);
  });
});
