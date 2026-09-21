/** Contraste entre duas cores segundo o WCAG 2.x (de 1 a 21). Só funções puras: roda no app, nos testes e em scripts. */

function canais(hex: string): [number, number, number] {
  const h = hex.trim().replace(/^#/, '');
  if (!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(h)) throw new Error(`A cor precisa ser hex (#RGB ou #RRGGBB): "${hex}"`);
  const c = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
  return [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16)) as [number, number, number];
}

const linear = (v: number) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

/** Luminância relativa (0 = preto, 1 = branco). */
export function luminancia(hex: string): number {
  const [r, g, b] = canais(hex);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

export function contrastRatio(a: string, b: string): number {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (escuro + 0.05);
}
