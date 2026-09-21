import { borderWidth, colors, fontSize, fontWeight, layout, lineHeight, opacity, palette, radius, shadow, size, space, textStyles } from '../tokens';

const HEX = /^#[0-9A-F]{6}$/;

/** Todas as folhas de um objeto aninhado, com o caminho ("bg.page"). */
function folhas(objeto: object, prefixo = ''): [string, unknown][] {
  return Object.entries(objeto).flatMap(([chave, valor]) =>
    valor !== null && typeof valor === 'object' ? folhas(valor, `${prefixo}${chave}.`) : [[`${prefixo}${chave}`, valor] as [string, unknown]],
  );
}

describe('cores', () => {
  it('toda cor da paleta é hex de 6 dígitos em maiúsculas (uma grafia só, fácil de buscar no código)', () => {
    const erradas = Object.entries(palette).filter(([, v]) => !HEX.test(v));
    expect(erradas).toEqual([]);
  });

  it('as cores semânticas vêm da paleta; fora as categorias, a única exceção é o véu do modal (rgba)', () => {
    const daPaleta = new Set<string>(Object.values(palette));
    const fora = folhas(colors)
      .filter(([caminho, v]) => !caminho.startsWith('category.') && typeof v === 'string' && !daPaleta.has(v))
      .map(([caminho]) => caminho)
      .sort();
    expect(fora).toEqual(['overlay']);
  });

  it('as cinco categorias do banco existem, cada uma com fundo, barra, glifo e marcador', () => {
    expect(Object.keys(colors.category).sort()).toEqual(['blue', 'green', 'orange', 'pink', 'purple']);
    for (const cat of Object.values(colors.category)) {
      expect(Object.keys(cat).sort()).toEqual(['bar', 'bg', 'ink', 'pin']);
      for (const cor of Object.values(cat)) expect(cor).toMatch(HEX);
    }
  });
});

describe('espaçamento e formas', () => {
  it('a escala de espaçamento segue a grade de 4 (com o meio-passo de 2) e é crescente', () => {
    const valores = Object.values(space);
    expect(valores.every((v) => v % 4 === 0 || v === 2)).toBe(true);
    expect([...valores].sort((a, b) => a - b)).toEqual(valores);
  });

  it('os raios crescem e a pílula é grande o bastante para qualquer altura', () => {
    const { pill, ...resto } = radius;
    const valores = Object.values(resto);
    expect([...valores].sort((a, b) => a - b)).toEqual(valores);
    expect(pill).toBeGreaterThanOrEqual(999);
  });

  it('alvo de toque mínimo é 44 (iOS) e os botões não ficam abaixo dele', () => {
    expect(size.touch).toBeGreaterThanOrEqual(44);
    expect(size.button).toBeGreaterThanOrEqual(size.touch);
  });

  it('controles menores que 44 (chip, botão de fechar) chegam a 44 com a folga de toque', () => {
    expect(size.chip + 2 * size.hitSlop).toBeGreaterThanOrEqual(size.touch);
    expect(size.closeButton + 2 * size.hitSlop).toBeGreaterThanOrEqual(size.touch);
  });

  it('a espessura de borda é inteira (linha nítida em telas de densidade baixa)', () => {
    expect(Object.values(borderWidth).every(Number.isInteger)).toBe(true);
  });

  it('opacidades ficam entre 0 e 1', () => {
    expect(Object.values(opacity).every((v) => v > 0 && v < 1)).toBe(true);
  });
});

describe('tipografia', () => {
  it('nenhum texto tem menos de 12 (piso de legibilidade; o app web chegou a 6 px e ficou ilegível)', () => {
    expect(Math.min(...Object.values(fontSize))).toBeGreaterThanOrEqual(12);
  });

  it('a altura de linha nunca é menor que 1,2 vezes o tamanho, senão acentos e descendentes se cortam', () => {
    for (const [nome, estilo] of Object.entries(textStyles)) {
      expect({ nome, razao: estilo.lineHeight / estilo.fontSize >= 1.2 }).toEqual({ nome, razao: true });
    }
  });

  it('só há quatro pesos (400, 500, 600, 700) e cada estilo usa um deles', () => {
    const permitidos = Object.values(fontWeight);
    expect(permitidos).toEqual(['400', '500', '600', '700']);
    for (const estilo of Object.values(textStyles)) expect(permitidos).toContain(estilo.fontWeight);
  });

  it('cada estilo de texto usa tamanho e altura de linha da escala', () => {
    const tamanhos = new Set<number>(Object.values(fontSize));
    const alturas = new Set<number>(Object.values(lineHeight));
    for (const estilo of Object.values(textStyles)) {
      expect(tamanhos.has(estilo.fontSize)).toBe(true);
      expect(alturas.has(estilo.lineHeight)).toBe(true);
    }
  });
});

describe('sombras e layout', () => {
  it('toda sombra é uma string boxShadow do CSS (x y desfoque [espalhamento] cor), aceita pelo React Native na New Architecture', () => {
    for (const s of Object.values(shadow)) {
      for (const camada of s.split(/(?<=\)), /)) expect(camada).toMatch(/^(-?\d+px ){2,3}\d+px rgba\(\d+, \d+, \d+, [\d.]+\)$/);
    }
  });

  it('a coluna do app e a medida de leitura têm teto (a web mostra uma coluna de celular centralizada)', () => {
    expect(layout.columnMax).toBe(560);
    expect(layout.readingMax).toBeGreaterThan(layout.columnMax);
  });
});
