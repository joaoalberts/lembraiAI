import type { Reminder } from '../../data/reminders';
import { evaluate, fencesOf, type Fence } from '../geofence';

/** Ponto a `metros` ao norte de (0,0): 1° de latitude ≈ 111.195 m. */
const norte = (metros: number) => ({ lat: metros / 111_195, lng: 0 });
const cerca: Fence = { id: 'a', title: 'Mercado', place: '', lat: 0, lng: 0, radius: 100 };

describe('evaluate', () => {
  it('dispara ao entrar no raio com boa precisão', () => {
    const r = evaluate(norte(50), 10, [cerca], new Set());
    expect(r.entered.map((f) => f.id)).toEqual(['a']);
    expect(r.inside.has('a')).toBe(true);
  });

  it('não dispara fora do raio', () => {
    const r = evaluate(norte(150), 10, [cerca], new Set());
    expect(r.entered).toEqual([]);
    expect(r.inside.size).toBe(0);
  });

  it('não dispara de novo enquanto continua dentro', () => {
    const r = evaluate(norte(50), 10, [cerca], new Set(['a']));
    expect(r.entered).toEqual([]);
    expect(r.inside.has('a')).toBe(true);
  });

  it('histerese: a 110 m (raio 100) ainda conta como dentro; a saída é em 175 m', () => {
    expect(evaluate(norte(110), 10, [cerca], new Set(['a'])).inside.has('a')).toBe(true);
    expect(evaluate(norte(170), 10, [cerca], new Set(['a'])).inside.has('a')).toBe(true);
    expect(evaluate(norte(200), 10, [cerca], new Set(['a'])).inside.has('a')).toBe(false);
  });

  it('depois de sair, entrar de novo dispara outra vez', () => {
    const saiu = evaluate(norte(300), 10, [cerca], new Set(['a']));
    expect(saiu.inside.has('a')).toBe(false);
    expect(evaluate(norte(50), 10, [cerca], saiu.inside).entered).toHaveLength(1);
  });

  it('precisão pior que 200 m não dispara (evita alarme falso por Wi-Fi/IP)', () => {
    expect(evaluate(norte(50), 300, [cerca], new Set()).entered).toEqual([]);
    expect(evaluate(norte(50), Infinity, [cerca], new Set()).entered).toEqual([]);
    expect(evaluate(norte(50), 200, [cerca], new Set()).entered).toHaveLength(1);
  });

  it('informa o lugar mais próximo', () => {
    const b: Fence = { ...cerca, id: 'b', lat: 0.01 };
    const r = evaluate(norte(50), 10, [b, cerca], new Set());
    expect(r.nearest?.fence.id).toBe('a');
    expect(r.nearest?.meters).toBeCloseTo(50, 0);
  });

  it('sem lugares, nada acontece', () => {
    const r = evaluate(norte(10), 10, [], new Set());
    expect(r).toEqual({ entered: [], inside: new Set(), nearest: null });
  });
});

describe('fencesOf', () => {
  const base: Reminder = {
    id: '1', title: 't', category: 'blue', icon: 'bell', kind: 'time',
    dateISO: '2026-09-20', time: '09:00', repeat: 'never', active: true,
  };
  const local: Reminder = { ...base, id: '2', kind: 'local', lat: 1, lng: 2, radius: 100, place: 'Casa' };

  it('só inclui lembretes por local, ativos e com coordenadas e raio', () => {
    const lista: Reminder[] = [
      base,
      local,
      { ...local, id: '3', active: false },
      { ...local, id: '4', lat: undefined },
      { ...local, id: '5', radius: undefined },
    ];
    expect(fencesOf(lista)).toEqual([{ id: '2', title: 't', place: 'Casa', lat: 1, lng: 2, radius: 100 }]);
  });
});
