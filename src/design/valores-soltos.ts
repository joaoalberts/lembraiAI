/**
 * Detector de valor visual solto (cor, tamanho, espaçamento, raio, família e peso de fonte escritos à mão), usado pelo
 * teste `valores-soltos.test.ts` para manter as telas falando só a língua dos tokens (src/design/tokens.ts).
 */
export interface Achado {
  linha: number;
  trecho: string;
  tipo: string;
}

const PROPRIEDADES_NUMERICAS = [
  'fontSize', 'lineHeight', 'letterSpacing',
  'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius',
  'borderWidth', 'borderLeftWidth', 'borderRightWidth', 'borderTopWidth', 'borderBottomWidth',
  'padding', 'paddingHorizontal', 'paddingVertical', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
  'margin', 'marginHorizontal', 'marginVertical', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
  'gap', 'rowGap', 'columnGap',
  'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight',
  'top', 'bottom', 'left', 'right', 'opacity',
];

const NUMERICA = new RegExp(`\\b(${PROPRIEDADES_NUMERICAS.join('|')})\\s*:\\s*(-?\\d+(?:\\.\\d+)?)`, 'g');
const COR_HEX = /#[0-9A-Fa-f]{3,8}\b/g;
const COR_FUNCAO = /\brgba?\(/g;
/** Fonte própria ignora `fontWeight` e soma negrito falso: o peso vem da família (`fontFamily.*`), então o próprio `fontWeight` é proibido. */
const PESO_ESCRITO = /\bfontWeight\s*:/g;
const FAMILIA_ESCRITA = /\bfontFamily\s*:\s*['"`]/g;
/** `du(` só converte dentro dos tokens; a tela usa o token nomeado. */
const DU_SOLTO = /\bdu\(/g;
/** Degradê só por `fundoEmDegrade(gradients.x)`: cada plataforma quer uma propriedade diferente. */
const DEGRADE_ESCRITO = /\b(?:experimental_)?backgroundImage\s*:/g;

/** Tira comentários sem mexer nos números de linha (a barra dupla de uma URL, como em "https://", não conta). */
function semComentarios(texto: string): string {
  return texto
    .replace(/\/\*[\s\S]*?\*\//g, (bloco) => bloco.replace(/[^\n]/g, ' '))
    .split('\n')
    .map((linha) => linha.replace(/(?<!:)\/\/.*$/, ''))
    .join('\n');
}

export function achadosNoTexto(texto: string): Achado[] {
  const achados: Achado[] = [];
  semComentarios(texto).split('\n').forEach((linha, i) => {
    for (const m of linha.matchAll(COR_HEX)) achados.push({ linha: i + 1, trecho: m[0], tipo: 'cor hex' });
    for (const m of linha.matchAll(COR_FUNCAO)) achados.push({ linha: i + 1, trecho: m[0], tipo: 'cor rgb/rgba' });
    for (const m of linha.matchAll(NUMERICA)) if (parseFloat(m[2]) !== 0) achados.push({ linha: i + 1, trecho: m[0], tipo: 'medida numérica' });
    for (const m of linha.matchAll(PESO_ESCRITO)) achados.push({ linha: i + 1, trecho: m[0], tipo: 'peso de fonte escrito' });
    for (const m of linha.matchAll(FAMILIA_ESCRITA)) achados.push({ linha: i + 1, trecho: m[0], tipo: 'família de fonte escrita' });
    for (const m of linha.matchAll(DU_SOLTO)) achados.push({ linha: i + 1, trecho: m[0], tipo: 'medida em du fora dos tokens' });
    for (const m of linha.matchAll(DEGRADE_ESCRITO)) achados.push({ linha: i + 1, trecho: m[0], tipo: 'degradê escrito à mão (use fundoEmDegrade)' });
  });
  return achados;
}
