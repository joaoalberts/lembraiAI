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
  /** Verde do interruptor do cartão na imagem (#30AB7B) escurecido 5% para dar 3:1 com o cartão (WCAG 1.4.11): a imagem dá 2,76:1. */
  toggleCardOn: '#2EA275',
  toggleThumb: '#FBFBFA',
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
  /** Subtítulo dos cabeçalhos verdes: mais claro que o `onDark200`, medido nas capturas (#E6EDE5). */
  headerSubtitle: '#E6EDE5',
  chipCount: '#395D56',
  tipCircle: '#C3DFCE',
  tipInk: '#013220',
  tipText: '#375C50',
  iconDots: '#717B88',
  iconRadius: '#8B93A0',
  mint300: '#94F9CD',
  mintIcon: '#6FF0C4',
  onboardingBg: '#12301F',
  pagerOn: '#F8F9F9',
  optionBadge: '#195A48',
  sliderThumb: '#FFFEFF',
  hint: '#717074',
  suggestionHover: '#F2F5F0',
  mapControl: '#FDFDFD',
  mapControlPressed: '#F0F0F0',
  mapControlDivider: '#E2E2E2',
  wheelItem: '#9EA1A8',
  rowHover: '#F7F8F4',
  rowPressed: '#EEF1EA',
  dangerTint: '#FBE7E4',
  dangerRowHover: '#FDF3F1',
  tabInactive: '#777C8A',
  tabActiveIcon: '#134B36',
  homeIndicator: '#B7B3AE',
  tabBarBg: '#F8F8F4',
  // Tela de sucesso (imagem 09): círculos e anéis dos cartões de resumo e de dica
  sucessoCategoria: '#D4EADE',
  sucessoDica: '#D6ECE0',
  sucessoDado: '#F7F5F3',
  sucessoDadoAnel: '#E6E5E4',
  sucessoSeloAnel: '#DCEBE2',
} as const;

/** Cores por papel. É isto que as telas e os componentes usam. */
export const colors = {
  bg: {
    page: palette.cream200,
    stage: palette.forest950,
    card: palette.cream100,
    field: palette.white,
    disabled: palette.cream200,
    sheet: palette.sheet,
    iconCircle: palette.mint100,
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
    onHeader: palette.headerSubtitle,
    chip: palette.forest900,
    onDarkAccent: palette.mint300,
    brandAccent: palette.mint400,
    chipCount: palette.chipCount,
    tip: palette.tipText,
    danger: palette.red700,
    success: palette.green700,
  },
  icon: {
    default: palette.ink900,
    muted: palette.ink600,
    dots: palette.iconDots,
    onDarkMint: palette.mintIcon,
    radius: palette.iconRadius,
    tip: palette.tipInk,
    /** Ícone dos botões de ação sobre o fundo `frost` (Editar, Excluir, Compartilhar). */
    onFrost: palette.forest900,
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
    focusOnDark: palette.mint400,
    selectedBand: palette.mint200,
    danger: palette.red700,
    dangerSoft: palette.red200,
  },
  control: {
    on: palette.forest600,
    onCard: palette.toggleCardOn,
    onForm: palette.toggleFormOn,
    off: palette.trackOff,
    thumb: palette.toggleThumb,
    chipOn: palette.forest900,
    chipOff: palette.chipOff,
    segmentTrack: palette.sand,
    segmentThumb: palette.white,
    /** Halo redondo atrás das reticências do cartão (ponteiro em cima e pressionado). */
    rowHover: palette.rowHover,
    suggestionHover: palette.suggestionHover,
    rowPressed: palette.rowPressed,
    dangerRowHover: palette.dangerRowHover,
    dangerRowPressed: palette.dangerTint,
    badge: palette.optionBadge,
    sliderThumb: palette.sliderThumb,
    haloHover: 'rgba(20, 40, 30, 0.07)',
    haloPressed: 'rgba(20, 40, 30, 0.13)',
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
    tipCircle: palette.tipCircle,
    dangerCircle: palette.dangerTint,
  },
  /** Fundo da abertura enquanto a foto carrega e o ponto da página ativa do Onboarding. */
  onboarding: { bg: palette.onboardingBg, pagerOn: palette.pagerOn, pagerOff: 'rgba(255, 255, 255, 0.26)' },
  /** Selo "Ativo" do lembrete. */
  status: { active: palette.statusGreen },
  /** Tela de sucesso do lembrete (imagem 09): círculo da categoria e da lâmpada, círculo dos dados (Data, Horário, Local, Repetir) com o anel dele, e o anel do selo "Ativo". */
  sucesso: {
    categoria: palette.sucessoCategoria,
    dica: palette.sucessoDica,
    dado: palette.sucessoDado,
    dadoAnel: palette.sucessoDadoAnel,
    seloAnel: palette.sucessoSeloAnel,
  },
  /** Barra de abas: rótulo e ícone da aba inativa, e o traço "home" do iOS por baixo. */
  tab: { background: palette.tabBarBg, inactive: palette.tabInactive, activeIcon: palette.tabActiveIcon, indicator: palette.homeIndicator },
  /** Vidro sobre o verde escuro dos cabeçalhos: um véu branco quase transparente com borda (o desfoque não aparece sobre um verde quase liso). */
  glass: {
    fill: 'rgba(255, 255, 255, 0.05)',
    fillHover: 'rgba(255, 255, 255, 0.1)',
    fillPressed: 'rgba(255, 255, 255, 0.16)',
    border: 'rgba(255, 255, 255, 0.2)',
    field: 'rgba(255, 255, 255, 0.1)',
    fieldFocus: 'rgba(255, 255, 255, 0.14)',
    balloon: 'rgba(10, 36, 26, 0.4)',
    balloonRing: 'rgba(203, 245, 224, 0.34)',
    featureFill: 'rgba(255, 255, 255, 0.04)',
    featureRing: 'rgba(150, 220, 180, 0.4)',
    divider: 'rgba(233, 255, 243, 0.22)',
    ctaCircle: 'rgba(255, 255, 255, 0.13)',
  },
  /** Identidade do ícone do app (tile em degradê e o símbolo); vale para ícone, tela de abertura e favicon. */
  brand: {
    tile: palette.mintBrand,
    tileEnd: palette.mintBrandEnd,
    glyph: palette.brandInk,
  },
  spinner: palette.forest700,
  overlay: 'rgba(13, 42, 27, 0.46)',
  map: {
    me: palette.mapBlue,
    ring: palette.white,
    paused: palette.mapGray,
    background: palette.sand,
    /** Pino do formulário (verde-floresta escuro) e o halo do raio de aviso. */
    pin: palette.forestPin,
    haloFill: 'rgba(45, 170, 120, 0.21)',
    haloLine: 'rgba(45, 170, 120, 0.32)',
    pinShadow: 'rgba(0, 0, 0, 0.18)',
    /** Botões que flutuam sobre o mapa do formulário (centralizar, zoom, "Usar minha localização"). */
    control: palette.mapControl,
    controlPressed: palette.mapControlPressed,
    controlDivider: palette.mapControlDivider,
  },
  /**
   * `bg` = fundo do ícone; `bar` = faixa lateral do cartão; `ink` = glifo; `pin` = marcador forte no mapa;
   * `tag` = fundo da etiqueta ("Por horário"); `fg` = ícone da etiqueta; `tagInk` = texto da etiqueta (o `fg` escurecido até dar 4,5:1 com o `tag`).
   */
  category: {
    green: { bg: '#DBF1E4', bar: '#39C391', ink: '#011F1A', pin: '#2F9E5B', tag: '#DAF4E6', fg: '#18714E', tagInk: '#18714E' },
    orange: { bg: '#FDE6D6', bar: '#FD6C34', ink: '#0A0A0A', pin: '#FE532A', tag: '#FDE5D7', fg: '#F86327', tagInk: '#183029' },
    blue: { bg: '#D5E8F9', bar: '#51A6F6', ink: '#024381', pin: '#2F80ED', tag: '#D6E9F9', fg: '#2C91EA', tagInk: '#1F66A4' },
    purple: { bg: '#EADFFB', bar: '#B287E8', ink: '#0A0A14', pin: '#7C3AED', tag: '#ECE4FB', fg: '#9265D8', tagInk: '#7551AD' },
    pink: { bg: '#FCE3E9', bar: '#F980B3', ink: '#0A0A14', pin: '#E0457B', tag: '#FCE6EC', fg: '#ED6E9E', tagInk: '#9A486B' },
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
  /** Título grande do Onboarding (110 du no app web); fora de `textStyles`: as duas linhas curtas pedem altura de linha 1. */
  hero: du(110),
  /** Números da roda do horário: o escolhido é maior e em negrito; a colonzinha entre as duas rodas. */
  wheel: du(46),
  wheelOn: du(56),
  colon: du(52),
  /** Título ("Lembrete criado com sucesso!", 60,5 du) e subtítulo (29 du) da tela de sucesso, fora da escala das telas comuns. O título fica fora de `textStyles`, como o do Onboarding: a altura de linha do original é 1,03 (`lineHeight.sucessoTitulo`), aceitável porque as duas linhas fixas não têm descendentes. */
  sucessoTitulo: du(60.5),
  sucessoSubtitulo: du(29),
} as const;

export const lineHeight = {
  micro: 16,
  caption: 18,
  body: 20,
  bodyLg: 24,
  heading: 24,
  title: 26,
  display: 34,
  sucessoTitulo: du(64),
  sucessoSubtitulo: du(42),
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
  sheetTitle: { fontFamily: fontFamily.serif, fontSize: fontSize.title, lineHeight: lineHeight.heading },
  bodyLg: { fontFamily: fontFamily.regular, fontSize: fontSize.bodyLg, lineHeight: lineHeight.bodyLg },
  body: { fontFamily: fontFamily.regular, fontSize: fontSize.body, lineHeight: lineHeight.body },
  label: { fontFamily: fontFamily.semibold, fontSize: fontSize.body, lineHeight: lineHeight.body },
  button: { fontFamily: fontFamily.bold, fontSize: fontSize.bodyLg, lineHeight: lineHeight.body },
  caption: { fontFamily: fontFamily.regular, fontSize: fontSize.caption, lineHeight: lineHeight.caption },
  micro: { fontFamily: fontFamily.regular, fontSize: fontSize.micro, lineHeight: lineHeight.micro },
  sucessoSubtitulo: { fontFamily: fontFamily.regular, fontSize: fontSize.sucessoSubtitulo, lineHeight: lineHeight.sucessoSubtitulo },
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
  /** Campos e seletores dentro dos cartões do formulário (30 du no app web). */
  field: du(30),
  lg: 16,
  /** Cartões do formulário (34 du no app web). */
  form: du(34),
  /** Cantos altos das folhas (38 du no original). */
  sheet: du(38),
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
  /** Barra de abas (medidas do app web em du): espaço acima das abas, altura de cada aba, o mínimo embaixo (a área segura do sistema o substitui quando é maior), vão entre ícone e rótulo e o ícone. */
  tabBar: { top: du(30), item: du(100), bottom: du(50), gap: du(12), icon: du(42) },
  iconCircle: 44,
  emptyCircle: 88,
  chip: du(68),
  closeButton: 32,
  hitSlop: 6,
  icon: { xs: du(27), sm: 16, md: 20, lg: 24, xl: 40 },
  /** Pino do mapa no formulário (58 × 73 du no original). A ponta fica no meio da base. */
  mapPin: { width: du(58), height: du(73) },
  /** Botão redondo de vidro do cabeçalho verde (busca, conta) e o botão "Novo lembrete" compacto. */
  glassButton: du(84),
  buttonCompact: du(72),
  /** Cabeçalho verde: altura da arte, topo da marca e dos botões, e onde começa a folha clara que sobe sobre ele (medidas do app web em du). */
  header: { height: du(345), contentTop: du(82), sheetTop: du(296), side: du(38), brandTile: du(75), brandGap: du(21), brandGlyph: du(44), searchHeight: du(76) },
  /**
   * Onboarding (medidas do app web em du): folga dos lados, botão "Pular", balões de vidro, círculo dos benefícios e o botão
   * grande. A arte foi medida nas capturas: os balões aparecem inclinados (-14° e 14°) e o esquerdo passa atrás do pino.
   */
  onboarding: {
    side: du(50),
    skipWidth: du(162),
    skipHeight: du(84),
    balloonLeft: { width: du(296), height: du(100) },
    balloonRight: { width: du(296), height: du(114) },
    feature: du(105),
    featureIcon: du(50),
    heroButton: du(108),
    pagerWidth: du(32),
    pagerHeight: du(11),
    pagerGap: du(14),
    brandName: du(37),
  },
  /**
   * Tela de sucesso (imagem 09; medidas do app web em du, canvas de 1848 du): botão de fechar, título e subtítulo, o cartão de
   * resumo (com a reserva `slot` da altura da variante com local, para as ações não mudarem de lugar), as três ações, a dica, o
   * botão escuro e o link. Os vãos são a diferença entre as posições medidas.
   */
  sucesso: {
    canvas: du(1848),
    fechar: du(76),
    fecharTop: du(56),
    fecharSide: du(34),
    fecharIcon: du(32),
    tituloTop: du(328),
    tituloBox: du(128),
    subtituloGap: du(16),
    subtituloBox: du(84),
    resumoGap: du(28),
    side: du(33),
    resumo: {
      slot: du(544),
      padTop: du(33),
      padLeft: du(35),
      padRight: du(34),
      padBottom: du(32),
      circle: du(102),
      circleIcon: du(54),
      circleGap: du(22),
      seloHeight: du(51),
      seloLeft: du(21),
      seloRight: du(23),
      seloGap: du(12),
      seloDot: du(17),
      linhaGap: du(33),
      dado: du(70),
      dadoIcon: du(36),
      dadoGap: du(18),
      dadoColuna: du(416),
      divisorAntes: du(25),
      divisorDepois: du(17),
      divisor: du(2),
      thumbWidth: du(164),
      thumbHeight: du(119),
      thumbRadius: du(24),
    },
    acao: { height: du(123), radius: du(32), gap: du(39), side: du(57), icon: du(40), top: du(24), iconGap: du(17) },
    dica: { height: du(157), circle: du(91), icon: du(46), arrow: du(32), left: du(35), right: du(37), gap: du(31), textGap: du(6) },
    cta: du(109),
    ctaSide: du(38),
    link: du(32),
    espaco: { acoes: du(30), dica: du(34), cta: du(41), link: du(30), fim: du(154) },
  },
  /** Sugestões da busca de endereço: altura máxima da lista, recuo das linhas e vão até o campo. */
  suggestions: { maxHeight: du(420), padding: du(6), gap: du(8) },
  /** Lista "Meus lembretes": chips, cabeçalhos de seção e vãos entre cartões e seções (medidas do app web em du). */
  list: { chipsTop: du(21), chipsGap: du(20), listTop: du(34), sectionHead: du(44), headGap: du(10), firstHeadGap: du(16), cardGap: du(16.5), sectionGap: du(29.5), tipGap: du(22), emptyTop: du(150) },
  /** Linha do menu do lembrete (Editar, Excluir): altura, círculo do ícone, ícone, vãos e a distância da lista até o título. */
  menu: { row: du(116), circle: du(68), icon: du(32), gap: du(26), paddingHorizontal: du(34), listTop: du(26) },
  /** Botões sobre o mapa do formulário: lado do botão quadrado, altura da pílula "Usar minha localização" e o desenho dos ícones. */
  mapControl: { button: du(58), pill: du(48), icon: du(30) },
  /** Etiqueta do cartão ("Por horário", "Por local"): altura, recuos, vão e ícone. */
  tag: { height: du(36), left: du(13), right: du(17), gap: du(12), icon: 12 },
  /** Cartão de dica: raio, círculo do ícone, recuos e vão. */
  tip: { radius: du(27), circle: du(97), padding: du(22), gap: du(29) },
  /**
   * Cartão de lembrete (medidas do app web em du): círculo do ícone alinhado ao topo, glifo, distância até o texto, ícone
   * da data, coluna da direita (hora e interruptor) e a miniatura do mapa nos lembretes por local.
   */
  card: {
    minHeight: du(154),
    circle: du(92),
    circleLeft: du(28),
    circleTop: du(17),
    glyph: du(50),
    textGap: du(33),
    metaIcon: du(30),
    metaGap: du(13),
    rightColumn: du(90),
    rightTop: du(26),
    localShift: du(35),
    rightInset: du(70),
    dotsWidth: du(88),
    dotsCenter: du(35),
    dotsHeight: du(66),
    thumbWidth: du(136),
    thumbHeight: du(138),
  },
  /** Formulário de novo lembrete (medidas do app web em du): recuo dos cartões, campos, cartões de modo e controle deslizante. */
  form: {
    cardPadding: du(33),
    circle: du(86),
    field: du(79),
    fieldIcon: du(32),
    option: du(120),
    optionCircle: du(76),
    optionIcon: du(34),
    optionBadge: du(38),
    optionCheck: du(24),
    optionRadio: du(30),
    sliderTrack: du(11),
    sliderThumb: du(43),
    sliderHeight: du(60),
    /** Cabeçalho claro (altura da arte, botões de voltar e conta, distância do topo e dos lados), mapa, botão de criar e a base que ele esmaece. */
    header: du(440),
    nav: du(72),
    navTop: du(110),
    navSide: du(29),
    map: du(274),
    mapRadius: du(20),
    cta: du(117),
    ctaCircle: du(80),
    dock: du(170),
    /** Linha de escolha das folhas (Repetir): altura mínima, recuos, vão e a marca de escolhida. */
    row: du(108),
    rowLeft: du(38),
    rowRight: du(34),
    rowGap: du(20),
    rowBadge: du(40),
    rowRadio: du(34),
    rowCheck: du(22),
  },
  /** Roda do horário (medidas do app web em du): largura da coluna, altura de cada número, faixa da escolha e vãos. */
  wheel: { width: du(230), item: du(88), gap: du(22), top: du(30), band: { width: du(580), radius: du(28) } },
  /** Calendário da folha de data: célula do dia, círculo do escolhido e seta de trocar de mês. */
  calendar: { day: 44, selected: 40, arrow: 40 },
  /** Interruptor do cartão de lembrete (`card`) e o dos formulários e das configurações (`form`): trilho, bolinha e folga da bolinha (21 e 26 de altura). */
  toggle: {
    card: { width: du(69), height: du(42), thumb: du(36), inset: 1.5 },
    form: { width: du(85), height: du(52), thumb: du(44), inset: du(4) },
  },
  /** Folha inferior: espaços internos, alça e o vão entre a alça e o título (medidas do CSS do app web em du). */
  sheet: { paddingTop: du(22), paddingHorizontal: du(40), paddingBottom: du(70), handleWidth: du(96), handleHeight: du(8), handleGap: du(28), actionTop: du(50), actionRight: du(34) },
} as const;

/**
 * Espessura do traço dos ícones (Lucide), nas unidades do desenho de 24 por 24: o traço visível é este valor vezes o
 * tamanho do ícone dividido por 24. Valores do app web, um por papel.
 */
export const iconStroke = {
  tab: 1.8,
  base: 2,
  glyph: 1.9,
  ui: 2.2,
  action: 2.4,
  dots: 2.6,
  check: 3.4,
} as const;

export const opacity = {
  /** Aba da barra de abas enquanto é pressionada. */
  tab: 0.6,
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
  sheet: '0px -5px 20px rgba(13, 42, 27, 0.18)',
  tabBar: '0px -1px 0px rgba(20, 40, 30, 0.05), 0px -3px 9px rgba(20, 40, 30, 0.03)',
  column: '0px 24px 70px rgba(0, 0, 0, 0.5)',
  /** Cartão do formulário: anel branco por dentro e a sombra suave de cartão. */
  formCard: '0px 1px 3px rgba(20, 40, 30, 0.05), 0px 4px 12px rgba(20, 40, 30, 0.04), inset 0px 0px 0px 1px rgba(255, 255, 255, 0.8)',
  /** Campo branco do formulário: anel cinza por dentro. Com o ponteiro em cima o anel escurece; em foco vira verde com halo. */
  field: 'inset 0px 0px 0px 1px rgba(231, 232, 234, 1), 0px 1px 2px rgba(20, 40, 30, 0.03)',
  fieldHover: 'inset 0px 0px 0px 1px rgba(214, 213, 213, 1), 0px 1px 2px rgba(20, 40, 30, 0.03)',
  fieldFocus: 'inset 0px 0px 0px 2px rgba(24, 92, 75, 1), 0px 0px 0px 4px rgba(24, 92, 75, 0.15)',
  /** Opção escolhida dos cartões de modo: só o anel verde por dentro. */
  optionOn: 'inset 0px 0px 0px 2px rgba(24, 92, 75, 1)',
  /** Bolinha do controle deslizante. */
  slider: '0px 2px 6px rgba(0, 0, 0, 0.25)',
  /** Lista de sugestões da busca de endereço: anel cinza por dentro e sombra funda por baixo. */
  suggestions: '0px 6px 16px rgba(20, 40, 30, 0.18), inset 0px 0px 0px 1px rgba(231, 232, 234, 1)',
  /** Cartões da tela de sucesso (resumo e dica): só o anel branco por dentro, sem sombra por fora. */
  cartaoDoSucesso: 'inset 0px 0px 0px 1px rgba(255, 255, 255, 0.8)',
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
  /** Tile da marca (o mesmo menta do ícone do app). */
  marcaTile: `linear-gradient(160deg, ${palette.mintBrand}, ${palette.mintBrandEnd})`,
  /** Esmaecimento das rodas do horário: os números longe do meio somem no fundo da folha (opacidade 1, 0,55 e 0,24 aos 0, 1 e 2 números do meio). */
  rodaDeHorario: `linear-gradient(to bottom, rgba(250, 249, 246, 0.92) 0%, rgba(250, 249, 246, 0.76) 10%, rgba(250, 249, 246, 0.45) 30%, rgba(250, 249, 246, 0) 40%, rgba(250, 249, 246, 0) 60%, rgba(250, 249, 246, 0.45) 70%, rgba(250, 249, 246, 0.76) 90%, rgba(250, 249, 246, 0.92) 100%)`,
  /** Divisória vertical entre os benefícios do Onboarding: some nas pontas. */
  divisorVertical: `linear-gradient(to bottom, rgba(233, 255, 243, 0), rgba(233, 255, 243, 0.22) 22%, rgba(233, 255, 243, 0.22) 78%, rgba(233, 255, 243, 0))`,
  /** Esmaecimento de baixo para cima atrás do botão fixo do formulário. */
  esmaecerParaPagina: `linear-gradient(to top, ${palette.cream200} 62%, rgba(245, 242, 237, 0) 100%)`,
} as const;

export const motion = {
  duration: { fast: 120, base: 200, slow: 300, scrim: 180, sheet: 260, toggle: 180 },
  /** `ease` do CSS (cubic-bezier(.25, .1, .25, 1)): troca de estado dos interruptores e dos botões. */
  ease: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 },
  /** Curva de entrada das folhas: cubic-bezier(.2, .8, .2, 1) do original. */
  curve: { x1: 0.2, y1: 0.8, x2: 0.2, y2: 1 },
  pressedScale: 0.98,
} as const;

export const layout = {
  /** A coluna de celular é a das capturas de referência: 430. */
  columnMax: 430,
  readingMax: 720,
  /** Altura máxima de uma folha inferior, como fração da tela (82% no original). */
  sheetMaxHeight: 0.82,
  /** Números visíveis de cada roda do horário (o do meio é o escolhido). */
  wheelRows: 5,
  /** Altura da cena do Onboarding (pino e balões) como fração da largura: 505 por 851 na arte. */
  onboardingSceneRatio: 505 / 851,
} as const;
