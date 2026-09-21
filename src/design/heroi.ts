/**
 * Herói animado da tela de sucesso (imagem 09): o selo verde com o visto, o brilho atrás dele, os anéis, as ondas, as 14
 * faíscas e os dois pontos que cintilam. Geometria, cores e tempos do CSS do app web (`SuccessHero`), convertidos de du para
 * dp. Fica aqui (e não em `tokens.ts`) porque é uma ilustração com desenho próprio, como `mapa-css.ts`; o componente é
 * `src/components/SucessoHeroi.tsx` e a descrição está em docs/DESIGN_SYSTEM.md, seção 11.12.
 *
 * Todos os tempos são em segundos a partir da montagem da tela. Curvas são `cubic-bezier` (x1, y1, x2, y2).
 */
import { palette } from './tokens';

/** du → dp sem arredondar nem travar em 1 (`du()` faz as duas coisas): aqui há deslocamentos negativos e meios-pontos. */
const dp = (n: number): number => (n * 430) / 851;
/** O mesmo em texto CSS, com no máximo duas casas: "1.01px" em vez de "1.0105757931844888px". */
const px = (n: number): string => `${Math.round(dp(n) * 100) / 100}px`;

export type Curva = readonly [number, number, number, number];
export type Janela = readonly [inicio: number, fim: number];

/** As curvas usadas, com o nome que o CSS dava. */
export const CURVAS = {
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
  assentar: [0.2, 0.8, 0.2, 1],
  estourar: [0.2, 1.1, 0.3, 1],
  desenhar: [0.4, 0, 0.2, 1],
  onda: [0.2, 0.6, 0.3, 1],
  faisca: [0.15, 0.7, 0.3, 1],
} as const satisfies Record<string, Curva>;

export const HEROI = {
  /** Distância do centro do herói até o topo do canvas. */
  centroY: dp(194),
  /** Duração da sequência inteira (a última onda termina aos 2,58 s). Depois disso só os dois pontos cintilam. */
  duracao: 2.6,

  /** Brilho: círculo de 620 du com degradê radial (`circle`, canto mais distante = 70,7% do lado). */
  brilho: {
    tamanho: dp(620),
    raio: 0.7071,
    paradas: [
      { posicao: 0, cor: 'rgba(226, 246, 234, 0.95)' },
      { posicao: 0.34, cor: 'rgba(170, 238, 205, 0.42)' },
      { posicao: 0.66, cor: 'rgba(170, 238, 205, 0)' },
    ],
    janela: [0, 1] as Janela,
    escalaInicial: 0.7,
    curva: CURVAS.easeOut,
  },

  /** Anel fino de fora: contorno de 1,5 du. */
  anel: { tamanho: dp(316), espessura: dp(1.5), cor: 'rgba(255, 255, 255, 0.45)', janela: [0.12, 1.12] as Janela, escalaInicial: 0.55, curva: CURVAS.assentar },

  /** Disco: degradê radial com centro a 36% da altura, anel interno branco e halo menta por fora. */
  disco: {
    tamanho: dp(236),
    centroY: 0.36,
    raio: 0.812,
    paradas: [
      { posicao: 0, cor: 'rgba(255, 255, 255, 0.6)' },
      { posicao: 0.66, cor: 'rgba(178, 238, 210, 0.3)' },
      { posicao: 1, cor: 'rgba(178, 238, 210, 0.12)' },
    ],
    sombra: `inset 0px 0px 0px ${px(2)} rgba(255, 255, 255, 0.7), 0px 0px ${px(50)} rgba(148, 249, 205, 0.35)`,
    janela: [0.05, 0.95] as Janela,
    escalaInicial: 0.55,
    curva: CURVAS.assentar,
  },

  /** Ondas: dois anéis menta que crescem de 0,7 a 2,15 vez o disco enquanto somem. */
  onda: {
    tamanho: dp(236),
    espessura: dp(3),
    cor: 'rgba(148, 249, 205, 0.95)',
    janelas: [[0.6, 2.2], [0.98, 2.58]] as readonly Janela[],
    opacidadeInicial: 0.85,
    escalaInicial: 0.7,
    escalaFinal: 2.15,
    curva: CURVAS.onda,
  },

  /**
   * Selo: quadrado de cantos redondos com o degradê verde, o visto que se desenha, o brilho que passa e o filete de luz.
   * `visto` está no sistema de 142 por 142 do desenho (não em dp).
   */
  selo: {
    tamanho: dp(142),
    raio: dp(40),
    sombra: `0px ${px(24)} ${px(44)} rgba(6, 32, 20, 0.34), 0px ${px(6)} ${px(12)} rgba(6, 32, 20, 0.24)`,
    filete: `inset 0px 0px 0px ${px(2)} rgba(255, 255, 255, 0.16), inset 0px ${px(3)} 0px rgba(255, 255, 255, 0.24)`,
    desenho: 142,
    degradeDeFundo: { x1: 0.1, y1: 0, x2: 0.9, y2: 1, paradas: [{ posicao: 0, cor: '#4B8A6C' }, { posicao: 0.5, cor: '#1F5A43' }, { posicao: 1, cor: '#0B2A1B' }] },
    degradeDeSombra: { x1: 0, y1: 0.5, x2: 0, y2: 1, corDe: 'rgba(0, 0, 0, 0)', corAte: 'rgba(0, 0, 0, 0.3)' },
    degradeDeLuz: { cx: 0.28, cy: 0.14, r: 0.8, corDe: 'rgba(255, 255, 255, 0.42)', corAte: 'rgba(255, 255, 255, 0)' },
    /** Aparece com um "estouro": 0,35 → 1,09 → 1 de escala, girando de -10° a 2° a 0°. */
    entrada: { janela: [0.1, 0.85] as Janela, meio: 0.55, escalaInicial: 0.35, escalaMeio: 1.09, giroInicial: -10, giroMeio: 2, curva: CURVAS.estourar },
    visto: {
      caminho: 'M42 74 L62 94 L101 50',
      comprimento: 87.08,
      espessura: 14,
      cor: '#F6F7F5',
      sombra: { deslocamento: 4, espessura: 15, cor: 'rgba(0, 0, 0, 0.38)' },
      janela: [0.55, 1.1] as Janela,
      curva: CURVAS.desenhar,
    },
    /** Brilho diagonal: faixa de 42% da largura que cruza o selo da esquerda para a direita, inclinada -18°. */
    brilho: {
      largura: 0.42,
      altura: 1.4,
      inclinacao: -18,
      de: -1.8,
      ate: 4.6,
      degrade: 'linear-gradient(100deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0))',
      janela: [1.15, 2.05] as Janela,
      curva: CURVAS.easeInOut,
    },
  },

  /** Faíscas: cada uma sai do centro, sobe até 0,85 do tamanho e some. Todas duram 1,25 s. */
  faisca: { duracao: 1.25, escalaInicial: 0.3, escalaFinal: 0.85, apareceAte: 0.12, somePor: 0.62, curva: CURVAS.faisca, brilho: dp(12) },

  /** Pontos que cintilam: aparecem aos poucos e depois pulsam para sempre (opacidade 1 → 0,35 e escala 1 → 0,7, ciclo de 2,8 s). */
  cintilacao: {
    tamanho: dp(9),
    cor: palette.white,
    brilho: `0px 0px ${px(14)} ${px(4)} rgba(148, 249, 205, 0.9)`,
    ciclo: 2.8,
    opacidadeMinima: 0.35,
    escalaMinima: 0.7,
    pontos: [
      { x: dp(-150), y: dp(-56), aparece: [1.1, 1.7] as Janela, comecaEm: 1.7 },
      { x: dp(152), y: dp(2), aparece: [1.3, 1.9] as Janela, comecaEm: 2.6 },
    ],
  },

  /** Título e subtítulo entram subindo 22 du. */
  subida: { distancia: dp(22), titulo: [0.6, 1.4] as Janela, subtitulo: [0.8, 1.6] as Janela, curva: CURVAS.assentar },
} as const;

export type FormaDaFaisca = 'circulo' | 'estrela';

export interface Faisca {
  /** Deslocamento final a partir do centro, em dp. */
  dx: number;
  dy: number;
  tamanho: number;
  cor: string;
  atraso: number;
  forma: FormaDaFaisca;
}

/** Tabela do CSS: ângulo (graus), alcance relativo (k), tamanho em du, cor, atraso em s e forma. */
const TABELA: readonly { angulo: number; k: number; tamanho: number; cor: string; atraso: number; forma: FormaDaFaisca }[] = [
  { angulo: -172, k: 1.0, tamanho: 19.8, cor: palette.mint400, atraso: 0.62, forma: 'circulo' },
  { angulo: -158, k: 1.1, tamanho: 16.2, cor: palette.white, atraso: 0.68, forma: 'estrela' },
  { angulo: -142, k: 0.9, tamanho: 21.6, cor: palette.forest600, atraso: 0.65, forma: 'circulo' },
  { angulo: -126, k: 1.15, tamanho: 18.0, cor: palette.orange500, atraso: 0.71, forma: 'circulo' },
  { angulo: -110, k: 0.85, tamanho: 16.2, cor: palette.mint400, atraso: 0.64, forma: 'estrela' },
  { angulo: -95, k: 1.1, tamanho: 21.6, cor: palette.white, atraso: 0.69, forma: 'circulo' },
  { angulo: -80, k: 0.95, tamanho: 18.0, cor: palette.mint400, atraso: 0.66, forma: 'circulo' },
  { angulo: -65, k: 1.15, tamanho: 16.2, cor: palette.forest600, atraso: 0.72, forma: 'estrela' },
  { angulo: -50, k: 0.9, tamanho: 21.6, cor: palette.white, atraso: 0.63, forma: 'circulo' },
  { angulo: -36, k: 1.05, tamanho: 18.0, cor: palette.orange500, atraso: 0.7, forma: 'circulo' },
  { angulo: -22, k: 0.95, tamanho: 16.2, cor: palette.mint400, atraso: 0.67, forma: 'estrela' },
  { angulo: -8, k: 1.1, tamanho: 19.8, cor: palette.forest600, atraso: 0.64, forma: 'circulo' },
  { angulo: 10, k: 1.0, tamanho: 14.4, cor: palette.white, atraso: 0.73, forma: 'circulo' },
  { angulo: 170, k: 1.0, tamanho: 14.4, cor: palette.mint400, atraso: 0.71, forma: 'estrela' },
];

const graus = (a: number): number => (a * Math.PI) / 180;

/** As 14 faíscas: o alcance vai até 300 du na horizontal e 170 du na vertical (uma elipse), vezes `k`. */
export const FAISCAS: readonly Faisca[] = TABELA.map((f) => ({
  dx: dp(Math.cos(graus(f.angulo)) * 300 * f.k),
  dy: dp(Math.sin(graus(f.angulo)) * 170 * f.k),
  tamanho: dp(f.tamanho),
  cor: f.cor,
  atraso: f.atraso,
  forma: f.forma,
}));

/** Pontos da estrela de quatro pontas no quadrado de 100 por 100 (o `clip-path` do CSS). */
export const ESTRELA = '50,0 62,38 100,50 62,62 50,100 38,62 0,50 38,38';

/** As paradas de degradê do SVG querem a cor e a opacidade separadas: "rgba(226, 246, 234, 0.95)" → { cor: "rgb(226, 246, 234)", alfa: 0.95 }. */
export function separarCor(rgba: string): { cor: string; alfa: number } {
  const partes = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/.exec(rgba);
  if (!partes) throw new Error(`cor rgb/rgba esperada, veio: ${rgba}`);
  return { cor: `rgb(${partes[1]}, ${partes[2]}, ${partes[3]})`, alfa: partes[4] === undefined ? 1 : Number(partes[4]) };
}
