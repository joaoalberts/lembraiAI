import { fromRow, toRow, type Draft, type Row } from '../reminder-rows';

const USER = '11111111-1111-4111-8111-111111111111';
const base: Draft = { title: 'Tomar remédio', kind: 'time', dateISO: '2026-09-20', time: '09:00', repeat: 'never', place: '', radius: 150 };
const local: Draft = { ...base, title: 'Comprar leite', kind: 'local', place: 'Mercado da esquina', lat: -3.7566, lng: -38.4891, radius: 300 };

/** Colunas de public.reminders que o app pode gravar (as demais têm default no banco). */
const COLUNAS = ['user_id', 'title', 'kind', 'category', 'icon', 'place', 'lat', 'lng', 'radius', 'remind_date', 'remind_time', 'repeat'];

/**
 * Espelha as CHECKs de supabase/migrations/20260919030124_auth_e_lembretes.sql (app web). Serve de rede de segurança
 * contra regressão no código; a conferência contra o Postgres real foi feita à parte, com os mesmos payloads.
 */
function violacoes(r: ReturnType<typeof toRow>): string[] {
  const v: string[] = [];
  if (r.title.length < 1 || r.title.length > 200) v.push('title');
  if (!['local', 'time'].includes(r.kind)) v.push('kind');
  if (!['green', 'orange', 'blue', 'purple', 'pink'].includes(r.category)) v.push('category');
  if (!['cart', 'dumbbell', 'pill', 'users', 'plane', 'pin', 'bell', 'briefcase', 'house', 'card'].includes(r.icon)) v.push('icon');
  if (r.place != null && r.place.length > 300) v.push('place');
  if (r.lat != null && !(r.lat >= -90 && r.lat <= 90)) v.push('lat');
  if (r.lng != null && !(r.lng >= -180 && r.lng <= 180)) v.push('lng');
  if (r.radius != null && !(Number.isInteger(r.radius) && r.radius >= 10 && r.radius <= 5000)) v.push('radius');
  if (!['never', 'daily', 'weekdays', 'weekly', 'monthly', 'yearly'].includes(r.repeat)) v.push('repeat');
  if (r.kind === 'local' && (r.lat == null || r.lng == null || r.radius == null)) v.push('reminders_local_precisa_de_coordenadas');
  return v;
}

describe('toRow', () => {
  it('lembrete por horário: sem lugar, coordenadas nem raio', () => {
    const r = toRow({ ...base, repeat: 'daily' }, USER);
    expect(r).toMatchObject({ user_id: USER, kind: 'time', place: null, lat: null, lng: null, radius: null, repeat: 'daily' });
    expect(violacoes(r)).toEqual([]);
  });

  it('lembrete por local: leva lugar, coordenadas e raio', () => {
    const r = toRow(local, USER);
    expect(r).toMatchObject({ kind: 'local', place: 'Mercado da esquina', lat: -3.7566, lng: -38.4891, radius: 300 });
    expect(violacoes(r)).toEqual([]);
  });

  it('por horário ignora lugar, coordenadas e raio que sobraram no rascunho', () => {
    // acontece na tela: captura a localização, volta para "Por horário" e salva
    const r = toRow({ ...local, kind: 'time' }, USER);
    expect([r.place, r.lat, r.lng, r.radius]).toEqual([null, null, null, null]);
  });

  it('detecta categoria e ícone pelo título', () => {
    expect(toRow(base, USER)).toMatchObject({ category: 'blue', icon: 'pill' });
    expect(toRow(local, USER)).toMatchObject({ category: 'green', icon: 'cart' });
  });

  it('apara o título e transforma lugar vazio ou só espaços em null', () => {
    expect(toRow({ ...base, title: '  Tomar remédio  ' }, USER).title).toBe('Tomar remédio');
    expect(toRow({ ...local, place: '   ' }, USER).place).toBeNull();
  });

  it('só grava colunas que existem na tabela', () => {
    expect(Object.keys(toRow(local, USER)).sort()).toEqual([...COLUNAS].sort());
    expect(Object.keys(toRow(base, USER)).sort()).toEqual([...COLUNAS].sort());
  });

  it('"por local" sem coordenadas é recusado pelo banco (por isso a tela não deixa salvar)', () => {
    const r = toRow({ ...base, kind: 'local' }, USER);
    expect(violacoes(r)).toContain('reminders_local_precisa_de_coordenadas');
  });

  it('todos os raios oferecidos na tela e todas as repetições passam nas CHECKs', () => {
    for (const radius of [50, 100, 150, 300, 500]) expect(violacoes(toRow({ ...local, radius }, USER))).toEqual([]);
    for (const repeat of ['never', 'daily', 'weekdays', 'weekly', 'monthly', 'yearly'] as const) {
      expect(violacoes(toRow({ ...base, repeat }, USER))).toEqual([]);
    }
  });

  it('título de 200 caracteres passa; de 201 não', () => {
    expect(violacoes(toRow({ ...base, title: 'x'.repeat(200) }, USER))).toEqual([]);
    expect(violacoes(toRow({ ...base, title: 'x'.repeat(201) }, USER))).toContain('title');
  });
});

describe('fromRow', () => {
  const linha: Row = {
    id: 'abc', user_id: USER, title: 'Comprar leite', kind: 'local', category: 'green', icon: 'cart',
    place: 'Mercado da esquina', lat: -3.7566, lng: -38.4891, radius: 300,
    remind_date: '2026-09-20', remind_time: '09:00:00', repeat: 'never', active: true,
  };

  it('converte snake_case do banco para o modelo do app', () => {
    expect(fromRow(linha)).toEqual({
      id: 'abc', title: 'Comprar leite', category: 'green', icon: 'cart', kind: 'local',
      place: 'Mercado da esquina', lat: -3.7566, lng: -38.4891, radius: 300,
      dateISO: '2026-09-20', time: '09:00', repeat: 'never', active: true,
    });
  });

  it('corta o "HH:MM:SS" do Postgres para "HH:MM"', () => {
    expect(fromRow({ ...linha, remind_time: '08:30:00' }).time).toBe('08:30');
  });

  it('null do banco vira undefined', () => {
    const r = fromRow({ ...linha, kind: 'time', place: null, lat: null, lng: null, radius: null });
    expect([r.place, r.lat, r.lng, r.radius]).toEqual([undefined, undefined, undefined, undefined]);
  });
});
