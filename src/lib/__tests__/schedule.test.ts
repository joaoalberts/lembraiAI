import type { Reminder } from '../../data/reminders';
import { planNotifications } from '../schedule';

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

  it('repetição que ainda não começou agenda só a 1ª ocorrência', () => {
    expect(tipos({ ...base, dateISO: '2026-09-25', repeat: 'daily' })).toEqual(['date']);
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
