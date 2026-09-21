import { quandoFoi } from '../quando';

const AGORA = 1_000_000_000_000;

describe('quandoFoi', () => {
  it('sem instante diz "nunca"', () => {
    expect(quandoFoi(null, AGORA)).toBe('nunca');
    expect(quandoFoi(undefined, AGORA)).toBe('nunca');
  });

  it('até um minuto conta em segundos', () => {
    expect(quandoFoi(AGORA - 1_000, AGORA)).toBe('há 1s');
    expect(quandoFoi(AGORA - 45_000, AGORA)).toBe('há 45s');
    expect(quandoFoi(AGORA - 59_000, AGORA)).toBe('há 59s');
  });

  it('a partir de um minuto conta em minutos, arredondando', () => {
    expect(quandoFoi(AGORA - 60_000, AGORA)).toBe('há 1 min');
    expect(quandoFoi(AGORA - 89_000, AGORA)).toBe('há 1 min');
    expect(quandoFoi(AGORA - 91_000, AGORA)).toBe('há 2 min');
    expect(quandoFoi(AGORA - 10 * 60_000, AGORA)).toBe('há 10 min');
  });

  it('agora mesmo (ou relógio adiantado) vale "há 0s", nunca um número negativo', () => {
    expect(quandoFoi(AGORA, AGORA)).toBe('há 0s');
    expect(quandoFoi(AGORA + 5_000, AGORA)).toBe('há 0s');
  });
});
