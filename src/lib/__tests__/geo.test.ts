import { distance, formatDistance } from '../geo';

describe('distance (haversine)', () => {
  it('é zero no mesmo ponto', () => {
    expect(distance({ lat: -3.7566, lng: -38.4891 }, { lat: -3.7566, lng: -38.4891 })).toBe(0);
  });

  it('1° de longitude no equador ≈ 111,2 km', () => {
    expect(distance({ lat: 0, lng: 0 }, { lat: 0, lng: 1 })).toBeCloseTo(111_195, -3);
  });

  it('é simétrica', () => {
    const a = { lat: -3.75, lng: -38.5 };
    const b = { lat: -3.8, lng: -38.45 };
    expect(distance(a, b)).toBeCloseTo(distance(b, a), 6);
  });

  it('~100 m para 0,0009° de latitude', () => {
    expect(distance({ lat: 0, lng: 0 }, { lat: 0.0009, lng: 0 })).toBeCloseTo(100, -1);
  });
});

describe('formatDistance', () => {
  it.each([
    [0, '0 m'],
    [250.4, '250 m'],
    [999, '999 m'],
    [1000, '1,0 km'],
    [1234, '1,2 km'],
  ])('%p -> %p', (metros, texto) => {
    expect(formatDistance(metros)).toBe(texto);
  });
});
