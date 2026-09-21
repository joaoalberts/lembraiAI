import { anelDeFoco, focoDeTeclado } from '../foco';
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

describe('focoDeTeclado (quando o anel aparece)', () => {
  it('foco de teclado (`:focus-visible`) desenha o anel; clique ou toque, não', () => {
    const alvo = (visivel: boolean) => ({ matches: (seletor: string) => seletor === ':focus-visible' && visivel });
    expect(focoDeTeclado(alvo(true))).toBe(true);
    expect(focoDeTeclado(alvo(false))).toBe(false);
  });

  it('sem `matches` (celular, Jest) ou com o seletor desconhecido (Safari antigo) vale como teclado: melhor um anel a mais do que nenhum', () => {
    expect(focoDeTeclado({})).toBe(true);
    expect(focoDeTeclado(undefined)).toBe(true);
    expect(focoDeTeclado({ matches: () => { throw new SyntaxError("':focus-visible' is not a valid selector"); } })).toBe(true);
  });
});
