import { anelDeFoco } from '../foco';
import { borderWidth, colors, space } from '../tokens';

describe('anel de foco de teclado (web)', () => {
  it('é sólido, de 2, verde-floresta e afastado da borda por 2', () => {
    expect(anelDeFoco).toEqual({ outlineWidth: borderWidth.focus, outlineColor: colors.border.focus, outlineStyle: 'solid', outlineOffset: space.hair });
  });

  it('a cor do anel passa de 3:1 sobre a página e sobre o campo (WCAG 1.4.11)', () => {
    // conferido por pares em acessibilidade.test.ts: border.focus sobre bg.field e bg.page
    expect(anelDeFoco.outlineColor).toBe(colors.border.focus);
  });
});
