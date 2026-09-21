/**
 * Tokens do Design System do LembreiAi: a única fonte dos valores visuais do app.
 *
 * Uso e regras: docs/DESIGN_SYSTEM.md. As tabelas de valores desse documento são GERADAS daqui (`npm run design:docs`)
 * e um teste falha se os dois divergirem. Este arquivo não importa nada: roda no app, nos testes e em scripts.
 *
 * Origem dos valores: medidos nas referências (Aplicativos/lembreiAI/ref; o DESIGN_SYSTEM.md do app web tem a medição)
 * ou decididos aqui, com o motivo no "Registro de decisões" do documento.
 */

/** Cores primitivas. Nas telas use `colors` (papéis), não estas. Nomes iguais aos do app web quando o valor é o mesmo. */
export const palette = {
  forest900: '#12432F',
  forest800: '#254233',
  forestHover: '#1F382B',
  forestPressed: '#1B3025',
  forest700: '#185C4B',
  forest600: '#216955',
  mint50: '#E7F4EB',
  mint100: '#DBF1E5',
  mintTint: '#DDE8DD',
  mintBrand: '#84FADA',
  mintBrandEnd: '#78E4C4',
  brandInk: '#043525',
  orange500: '#FE532A',
  orangeHover: '#EF4E28',
  orangePressed: '#DF4925',
  orangeAA: '#D53B14',
  white: '#FFFFFF',
  cream100: '#FAF9F6',
  cream200: '#F5F2ED',
  sand: '#E8E4DC',
  chipOff: '#F3F4EF',
  chipRing: '#DFE1DB',
  borderSubtle: '#E7E8EA',
  borderStrong: '#B9B8BB',
  divider: '#E8E7E6',
  trackOff: '#D6D5D5',
  ink900: '#0A0A0A',
  inkBrand: '#0A3924',
  ink700: '#5B5D64',
  ink650: '#6B6E76',
  ink600: '#767880',
  textAccent: '#086952',
  red700: '#C62828',
  red200: '#F3B8B8',
  red100: '#FFE6E6',
  red50: '#FFF5F5',
  green700: '#0B7A3B',
  mapBlue: '#2F80ED',
  mapGray: '#828890',
} as const;

/** Cores por papel. É isto que as telas e os componentes usam. */
export const colors = {
  bg: {
    page: palette.cream200,
    stage: palette.sand,
    card: palette.cream100,
    field: palette.white,
    disabled: palette.cream200,
  },
  text: {
    primary: palette.ink900,
    secondary: palette.ink700,
    placeholder: palette.ink650,
    accent: palette.textAccent,
    brand: palette.inkBrand,
    onAction: palette.white,
    onDark: palette.white,
    danger: palette.red700,
    success: palette.green700,
  },
  icon: {
    default: palette.ink900,
    muted: palette.ink600,
  },
  action: {
    primary: palette.orange500,
    primaryHover: palette.orangeHover,
    primaryPressed: palette.orangePressed,
    primaryAA: palette.orangeAA,
    secondary: palette.forest800,
    secondaryHover: palette.forestHover,
    secondaryPressed: palette.forestPressed,
  },
  border: {
    field: palette.borderSubtle,
    strong: palette.borderStrong,
    divider: palette.divider,
    chip: palette.chipRing,
    focus: palette.forest700,
    danger: palette.red700,
    dangerSoft: palette.red200,
  },
  control: {
    on: palette.forest600,
    off: palette.trackOff,
    thumb: palette.white,
    chipOn: palette.forest900,
    chipOff: palette.chipOff,
    segmentTrack: palette.sand,
    segmentThumb: palette.white,
  },
  feedback: {
    dangerBg: palette.red100,
    dangerWash: palette.red50,
    successBg: palette.mint50,
    infoBg: palette.mintTint,
    infoBar: palette.forest700,
    emptyCircle: palette.mint100,
  },
  /** Identidade do ícone do app (tile em degradê e o símbolo); vale para ícone, tela de abertura e favicon. */
  brand: {
    tile: palette.mintBrand,
    tileEnd: palette.mintBrandEnd,
    glyph: palette.brandInk,
  },
  spinner: palette.forest700,
  overlay: 'rgba(0, 0, 0, 0.4)',
  map: {
    me: palette.mapBlue,
    ring: palette.white,
    paused: palette.mapGray,
    background: palette.sand,
  },
  /** `bg` = fundo do ícone; `bar` = faixa lateral do cartão; `ink` = glifo; `pin` = marcador forte no mapa. */
  category: {
    green: { bg: '#DBF1E4', bar: '#39C391', ink: '#011F1A', pin: '#2F9E5B' },
    orange: { bg: '#FDE6D6', bar: '#FD6C34', ink: '#0A0A0A', pin: '#FE532A' },
    blue: { bg: '#D5E8F9', bar: '#51A6F6', ink: '#024381', pin: '#2F80ED' },
    purple: { bg: '#EADFFB', bar: '#B287E8', ink: '#0A0A14', pin: '#7C3AED' },
    pink: { bg: '#FCE3E9', bar: '#F980B3', ink: '#0A0A14', pin: '#E0457B' },
  },
} as const;

export const fontSize = {
  micro: 12,
  caption: 13,
  body: 14,
  bodyLg: 16,
  heading: 18,
  title: 20,
  display: 28,
} as const;

export const lineHeight = {
  micro: 16,
  caption: 18,
  body: 20,
  bodyLg: 24,
  heading: 24,
  title: 26,
  display: 34,
} as const;

/** Reserva da web: o texto aparece na fonte do sistema (e não em Times) enquanto a fonte da marca chega. */
export const pilhaDeReserva = {
  sans: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
} as const;

/** Monta o `fontFamily` de um estilo: só o nome no iOS e no Android; o nome mais a reserva na web. */
export function nomeDeFamilia(nome: string, reserva: string, web: boolean): string {
  return web ? `${nome}, ${reserva}` : nome;
}

/** `process.env.EXPO_OS` vira 'ios', 'android' ou 'web' na compilação (babel-preset-expo); em Node puro fica indefinido. */
const NA_WEB = process.env.EXPO_OS === 'web';

/**
 * Famílias da marca: Nunito Sans na interface e Source Serif 4 em negrito nos títulos, como nas referências.
 * Fonte própria ignora `fontWeight` no iOS e no Android: cada peso é uma família, registrada com este mesmo nome em
 * `src/design/fonts.ts`. Por isso não há token de peso e `fontWeight` nunca se escreve junto (soma negrito falso).
 */
export const fontFamily = {
  regular: nomeDeFamilia('NunitoSans_400Regular', pilhaDeReserva.sans, NA_WEB),
  medium: nomeDeFamilia('NunitoSans_500Medium', pilhaDeReserva.sans, NA_WEB),
  semibold: nomeDeFamilia('NunitoSans_600SemiBold', pilhaDeReserva.sans, NA_WEB),
  bold: nomeDeFamilia('NunitoSans_700Bold', pilhaDeReserva.sans, NA_WEB),
  serif: nomeDeFamilia('SourceSerif4_700Bold', pilhaDeReserva.serif, NA_WEB),
} as const;

/** Estilos de texto prontos: `...textStyles.body`. Cor fica por conta de quem usa (`colors.text.*`). Títulos em serifa, o resto em sans. */
export const textStyles = {
  display: { fontFamily: fontFamily.serif, fontSize: fontSize.display, lineHeight: lineHeight.display },
  title: { fontFamily: fontFamily.serif, fontSize: fontSize.title, lineHeight: lineHeight.title },
  heading: { fontFamily: fontFamily.serif, fontSize: fontSize.heading, lineHeight: lineHeight.heading },
  bodyLg: { fontFamily: fontFamily.regular, fontSize: fontSize.bodyLg, lineHeight: lineHeight.bodyLg },
  body: { fontFamily: fontFamily.regular, fontSize: fontSize.body, lineHeight: lineHeight.body },
  label: { fontFamily: fontFamily.semibold, fontSize: fontSize.body, lineHeight: lineHeight.body },
  button: { fontFamily: fontFamily.bold, fontSize: fontSize.bodyLg, lineHeight: lineHeight.body },
  caption: { fontFamily: fontFamily.regular, fontSize: fontSize.caption, lineHeight: lineHeight.caption },
  micro: { fontFamily: fontFamily.regular, fontSize: fontSize.micro, lineHeight: lineHeight.micro },
} as const;

/** Grade de 4 (com o meio-passo de 2). */
export const space = {
  hair: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  huge: 48,
  giant: 64,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  sheet: 20,
  pill: 999,
} as const;

export const borderWidth = {
  hairline: 1,
  focus: 2,
  bar: 4,
} as const;

export const size = {
  touch: 44,
  button: 52,
  tabBar: 56,
  iconCircle: 44,
  emptyCircle: 88,
  chip: 36,
  closeButton: 32,
  hitSlop: 6,
  icon: { sm: 16, md: 20, lg: 24, xl: 40 },
} as const;

export const opacity = {
  disabled: 0.45,
  inactive: 0.55,
  pressed: 0.85,
} as const;

/** `boxShadow` em texto CSS: aceito pelo React Native (New Architecture, SDK 57) e pela web. */
export const shadow = {
  card: '0px 1px 3px rgba(20, 40, 30, 0.05), 0px 4px 12px rgba(20, 40, 30, 0.04)',
  float: '0px 1px 4px rgba(0, 0, 0, 0.16)',
  cta: '0px 8px 24px rgba(254, 83, 42, 0.3)',
  focus: '0px 0px 0px 3px rgba(24, 92, 75, 0.15)',
} as const;

export const motion = {
  duration: { fast: 120, base: 200, slow: 300 },
  pressedScale: 0.98,
} as const;

export const layout = {
  columnMax: 560,
  readingMax: 720,
} as const;
