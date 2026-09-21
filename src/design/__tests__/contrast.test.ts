import { contrastRatio } from '../contrast';

describe('contrastRatio (WCAG 2.x)', () => {
  it('preto sobre branco é 21:1', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
  });

  it('não depende de qual cor vem primeiro', () => {
    expect(contrastRatio('#FE532A', '#FFFFFF')).toBeCloseTo(contrastRatio('#FFFFFF', '#FE532A'), 6);
  });

  it('acerta o caso que o Design System web marcou como abaixo de 4,5: cinza #767880 sobre branco = 4,40', () => {
    expect(contrastRatio('#767880', '#FFFFFF')).toBeCloseTo(4.4, 2);
  });

  it('acerta o laranja da marca com texto branco = 3,24 (só passa como texto grande)', () => {
    expect(contrastRatio('#FFFFFF', '#FE532A')).toBeCloseTo(3.24, 2);
  });

  it('aceita hex em minúsculas e de 3 dígitos', () => {
    expect(contrastRatio('#fff', '#000')).toBeCloseTo(21, 1);
    expect(contrastRatio('#0a0a0a', '#ffffff')).toBeCloseTo(contrastRatio('#0A0A0A', '#FFFFFF'), 6);
  });

  it('recusa cor que não é hex (para um erro de digitação não virar "passou")', () => {
    expect(() => contrastRatio('laranja', '#FFFFFF')).toThrow(/hex/i);
  });
});
