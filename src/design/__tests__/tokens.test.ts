import { borderWidth, colors, fontSize, layout, lineHeight, motion, opacity, palette, radius, shadow, size, space, textStyles } from '../tokens';

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

  it('as cores semânticas vêm da paleta; fora as categorias, as exceções são os véus translúcidos (rgba): modal, vidro e halo do raio', () => {
    const daPaleta = new Set<string>(Object.values(palette));
    const fora = folhas(colors)
      .filter(([caminho, v]) => !caminho.startsWith('category.') && typeof v === 'string' && !daPaleta.has(v))
      .map(([caminho]) => caminho)
      .sort();
    expect(fora).toEqual([
      'conta.barra', 'conta.barraAnel', 'conta.pilula', 'conta.pilulaAnel', 'control.haloHover', 'control.haloPressed', 'glass.balloon', 'glass.balloonRing', 'glass.border', 'glass.ctaCircle', 'glass.divider', 'glass.featureFill', 'glass.featureRing', 'glass.field', 'glass.fieldFocus', 'glass.fill', 'glass.fillHover', 'glass.fillPressed',
      'map.haloFill', 'map.haloLine', 'map.pinShadow', 'onboarding.pagerOff', 'overlay',
    ]);
    for (const [caminho, v] of folhas(colors)) if (fora.includes(caminho)) expect({ caminho, rgba: String(v).startsWith('rgba(') }).toEqual({ caminho, rgba: true });
  });

  it('as cinco categorias do banco existem, cada uma com fundo, barra, glifo, marcador, etiqueta, ícone da etiqueta e texto da etiqueta', () => {
    expect(Object.keys(colors.category).sort()).toEqual(['blue', 'green', 'orange', 'pink', 'purple']);
    for (const cat of Object.values(colors.category)) {
      expect(Object.keys(cat).sort()).toEqual(['bar', 'bg', 'fg', 'ink', 'pin', 'tag', 'tagInk']);
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
      for (const camada of s.split(/, (?=inset |-?\d+px)/)) expect(camada).toMatch(/^(inset )?(-?\d+px ){2,3}\d+px rgba\(\d+, \d+, \d+, [\d.]+\)$/);
    }
  });

  it('a coluna do app tem a largura das capturas de referência (430) e a medida de leitura é maior (a web mostra uma coluna de celular centralizada)', () => {
    expect(layout.columnMax).toBe(430);
    expect(layout.readingMax).toBeGreaterThan(layout.columnMax);
  });

  it('a folha inferior ocupa no máximo uma fração da tela e a curva de entrada fica entre 0 e 1', () => {
    expect(layout.sheetMaxHeight).toBeGreaterThan(0);
    expect(layout.sheetMaxHeight).toBeLessThan(1);
    expect([motion.curve.x1, motion.curve.x2].every((v) => v >= 0 && v <= 1)).toBe(true);
  });
});
