/**
 * Tokens do Design System do LembreiAi: a única fonte dos valores visuais do app.
 *
 * Uso e regras: docs/DESIGN_SYSTEM.md. As tabelas de valores desse documento são GERADAS daqui (`npm run design:docs`)
 * e um teste falha se os dois divergirem. Este arquivo não importa nada: roda no app, nos testes e em scripts.
 *
 * Origem dos valores: medidos nas referências (Aplicativos/lembreiAI/ref; o DESIGN_SYSTEM.md do app web tem a medição)
 * ou decididos aqui, com o motivo no "Registro de decisões" do documento.
 */

/**
 * Unidade de desenho do app web: 1 du = 1 px da arte de referência de 851 px de largura. As capturas de referência
 * (docs/referencias) têm 430 px de CSS de largura, então 1 du = 430/851 dp. Só este arquivo converte: as telas usam os
 * tokens (o teste de valores soltos barra `du(` fora de src/design). Nenhuma medida sai abaixo de 1.
 */
export const du = (n: number): number => Math.max(1, Math.round((n * 430) / 851));

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
  // Medidas nas capturas (docs/referencias/MEDICOES.md); valores exatos do CSS do app web
  forest950: '#0D2A1B',
  forestPin: '#054C39',
  headerTop: '#2A5B47',
  headerMid: '#184434',
  headerBottom: '#0E301F',
  mist300: '#CBE4D6',
  mist100: '#E3EEE5',
  mint200: '#C6E4D5',
  mint400: '#7FEAC6',
  toggleCardOn: '#30AB7B',
  toggleFormOn: '#256855',
  frost: '#E3E7DC',
  frostHover: '#D9DECF',
  frostPressed: '#CFD5C4',
  frostInk: '#1A2C23',
  danger: '#D43A2A',
  dangerHover: '#C63424',
  dangerPressed: '#B92F20',
  sheet: '#EFF0EA',
  alertErrorBg: '#FDF0EE',
  alertErrorInk: '#8E2418',
  alertInfoInk: '#1B4436',
  statusGreen: '#029554',
  onDark100: '#FDFAF6',
  onDark200: '#CCD8D0',
  onDark300: '#B1C3B8',
  onDark400: '#A7B9B0',
  tabInactive: '#777C8A',
  homeIndicator: '#B7B3AE',
} as const;

/** Cores por papel. É isto que as telas e os componentes usam. */
export const colors = {
  bg: {
    page: palette.cream200,
    stage: palette.sand,
    card: palette.cream100,
    field: palette.white,
    disabled: palette.cream200,
    sheet: palette.sheet,
  },
  text: {
    primary: palette.ink900,
    secondary: palette.ink700,
    placeholder: palette.ink650,
    accent: palette.textAccent,
    brand: palette.inkBrand,
    onAction: palette.white,
    onDark: palette.white,
    onDarkWarm: palette.onDark100,
    onDarkSoft: palette.onDark200,
    onDarkMuted: palette.onDark300,
    onDarkFaint: palette.onDark400,
    onFrost: palette.frostInk,
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
    danger: palette.danger,
    dangerHover: palette.dangerHover,
    dangerPressed: palette.dangerPressed,
    frost: palette.frost,
    frostHover: palette.frostHover,
    frostPressed: palette.frostPressed,
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
    onCard: palette.toggleCardOn,
    onForm: palette.toggleFormOn,
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
    errorBg: palette.alertErrorBg,
    errorInk: palette.alertErrorInk,
    infoInk: palette.alertInfoInk,
  },
  /** Selo "Ativo" do lembrete. */
  status: { active: palette.statusGreen },
  /** Barra de abas: rótulo e ícone da aba inativa, e o traço "home" do iOS por baixo. */
  tab: { inactive: palette.tabInactive, indicator: palette.homeIndicator },
  /** Vidro sobre o verde escuro dos cabeçalhos: um véu branco quase transparente com borda (o desfoque não aparece sobre um verde quase liso). */
  glass: {
    fill: 'rgba(255, 255, 255, 0.05)',
    fillHover: 'rgba(255, 255, 255, 0.1)',
    fillPressed: 'rgba(255, 255, 255, 0.16)',
    border: 'rgba(255, 255, 255, 0.2)',
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
    /** Pino do formulário (verde-floresta escuro) e o halo do raio de aviso. */
    pin: palette.forestPin,
    haloFill: 'rgba(45, 170, 120, 0.21)',
    haloLine: 'rgba(45, 170, 120, 0.32)',
  },
  /**
   * `bg` = fundo do ícone; `bar` = faixa lateral do cartão; `ink` = glifo; `pin` = marcador forte no mapa;
   * `tag` = fundo da etiqueta ("Por horário"); `fg` = ícone da etiqueta.
   */
  category: {
    green: { bg: '#DBF1E4', bar: '#39C391', ink: '#011F1A', pin: '#2F9E5B', tag: '#DAF4E6', fg: '#18714E' },
    orange: { bg: '#FDE6D6', bar: '#FD6C34', ink: '#0A0A0A', pin: '#FE532A', tag: '#FDE5D7', fg: '#F86327' },
    blue: { bg: '#D5E8F9', bar: '#51A6F6', ink: '#024381', pin: '#2F80ED', tag: '#D6E9F9', fg: '#2C91EA' },
    purple: { bg: '#EADFFB', bar: '#B287E8', ink: '#0A0A14', pin: '#7C3AED', tag: '#ECE4FB', fg: '#9265D8' },
    pink: { bg: '#FCE3E9', bar: '#F980B3', ink: '#0A0A14', pin: '#E0457B', tag: '#FCE6EC', fg: '#ED6E9E' },
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

/**
 * Fundos em degradê como texto CSS (`linear-gradient` e `radial-gradient`, medidas do CSS do app web convertidas de du para dp).
 * O React Native 0.86 aceita em `experimental_backgroundImage` e a web em `backgroundImage`: use `fundoEmDegrade` (efeitos.ts).
 */
export const gradients = {
  /** Cabeçalho verde da lista e das configurações (345 du de altura): base a 168°, luz menta e sombra de pinheiro. */
  cabecalhoVerde: [
    `radial-gradient(${du(560)}px ${du(330)}px at 90% 6%, rgba(127, 234, 198, 0.28), rgba(127, 234, 198, 0) 70%)`,
    `radial-gradient(${du(520)}px ${du(300)}px at 4% 92%, rgba(33, 105, 85, 0.6), rgba(33, 105, 85, 0) 72%)`,
    `linear-gradient(168deg, ${palette.headerTop} 0%, ${palette.headerMid} 50%, ${palette.headerBottom} 100%)`,
  ].join(', '),
  /** Fundo das telas de conta: o mesmo verde, com três luzes. */
  contas: [
    `radial-gradient(${du(560)}px ${du(400)}px at 88% 4%, rgba(127, 234, 198, 0.26), rgba(127, 234, 198, 0) 70%)`,
    `radial-gradient(${du(740)}px ${du(460)}px at 50% 100%, rgba(132, 250, 218, 0.15), rgba(132, 250, 218, 0) 70%)`,
    `radial-gradient(${du(520)}px ${du(380)}px at 6% 96%, rgba(33, 105, 85, 0.55), rgba(33, 105, 85, 0) 72%)`,
    `linear-gradient(168deg, ${palette.headerTop} 0%, ${palette.headerMid} 52%, ${palette.headerBottom} 100%)`,
  ].join(', '),
  /** Cabeçalho claro do formulário de novo lembrete: névoa menta que termina no fundo da página. */
  cabecalhoClaro: [
    `radial-gradient(${du(560)}px ${du(340)}px at 100% 0%, rgba(33, 105, 85, 0.58), rgba(33, 105, 85, 0) 72%)`,
    `radial-gradient(${du(480)}px ${du(300)}px at 0% 0%, rgba(148, 249, 205, 0.36), rgba(148, 249, 205, 0) 72%)`,
    `radial-gradient(${du(520)}px ${du(170)}px at 46% 26%, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0) 100%)`,
    `linear-gradient(180deg, ${palette.mist300} 0%, ${palette.mist100} 44%, ${palette.cream200} 100%)`,
  ].join(', '),
  /** Esmaecimento de baixo para cima atrás do botão fixo do formulário. */
  esmaecerParaPagina: `linear-gradient(to top, ${palette.cream200} 62%, rgba(245, 242, 237, 0) 100%)`,
} as const;

export const motion = {
  duration: { fast: 120, base: 200, slow: 300 },
  pressedScale: 0.98,
} as const;

export const layout = {
  columnMax: 560,
  readingMax: 720,
} as const;
