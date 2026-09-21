/**
 * Gera as tabelas de docs/DESIGN_SYSTEM.md a partir dos tokens, para código e documento não divergirem.
 * O teste `documentacao.test.ts` compara; `npm run design:docs` reescreve os blocos entre os marcadores
 * `<!-- tokens:ID:inicio -->` e `<!-- tokens:ID:fim -->`. Todo token novo precisa de uma descrição em DESCRICOES.
 */
import { PARES_DE_CONTRASTE, razaoDoPar } from './a11y';
import { ICON_NAME, TAB_ICON, UI_ICON } from './icons';
import { borderWidth, colors, fontFamily, fontSize, gradients, layout, lineHeight, motion, opacity, palette, radius, shadow, size, space, textStyles } from './tokens';

type Folha = { caminho: string; valor: string | number };

const achatar = (objeto: object, prefixo: string): Folha[] =>
  Object.entries(objeto).flatMap(([chave, valor]) =>
    valor !== null && typeof valor === 'object' ? achatar(valor, `${prefixo}.${chave}`) : [{ caminho: `${prefixo}.${chave}`, valor: valor as string | number }],
  );

const GRUPOS = { palette, colors, fontSize, lineHeight, fontFamily, space, radius, borderWidth, size, opacity, shadow, gradients, motion, layout };

/** Todo token existente, como "colors.text.primary". Os estilos de texto contam como um token cada (`textStyles.body`). */
export const CAMINHOS_DE_TOKEN: string[] = [
  ...Object.entries(GRUPOS).flatMap(([nome, grupo]) => achatar(grupo, nome).map((f) => f.caminho)),
  ...Object.keys(textStyles).map((nome) => `textStyles.${nome}`),
];

/** Uso de cada token. `*` vale por um trecho do caminho ("colors.category.*.bg"). */
const DESCRICOES: Record<string, string> = {
  'palette.forest900': 'Chip de filtro selecionado',
  'palette.forest800': 'Botão escuro (secundário)',
  'palette.forestHover': 'Botão escuro com o ponteiro em cima (web)',
  'palette.forestPressed': 'Botão escuro pressionado',
  'palette.forest700': 'Foco, spinner e faixa dos avisos informativos',
  'palette.forest600': 'Interruptor ligado',
  'palette.mint50': 'Fundo do aviso de sucesso',
  'palette.mint100': 'Círculo atrás do ícone do estado vazio',
  'palette.mintTint': 'Fundo do aviso informativo',
  'palette.mintBrand': 'Fundo do ícone do app, da tela de abertura e do favicon',
  'palette.mintBrandEnd': 'Fim do degradê do ícone do app',
  'palette.brandInk': 'Símbolo do ícone do app',
  'palette.orange500': 'Cor de ação (botão primário). Nunca como cor de texto sobre fundo claro',
  'palette.orangeHover': 'Botão primário com o ponteiro em cima (web)',
  'palette.orangePressed': 'Botão primário pressionado',
  'palette.orangeAA': 'Alternativa ao laranja que cumpre 4,5:1 com texto branco',
  'palette.white': 'Campos, painéis, folhas e texto sobre fundo escuro',
  'palette.cream100': 'Superfície de cartões e da barra de abas',
  'palette.cream200': 'Fundo de página',
  'palette.sand': 'Palco atrás da coluna do app (web) e trilho do controle segmentado',
  'palette.chipOff': 'Chip de filtro não selecionado',
  'palette.chipRing': 'Contorno do chip não selecionado',
  'palette.borderSubtle': 'Borda de campos de formulário',
  'palette.borderStrong': 'Contorno do botão sem fundo',
  'palette.divider': 'Divisórias',
  'palette.trackOff': 'Trilho do interruptor desligado',
  'palette.ink900': 'Texto principal',
  'palette.inkBrand': 'Rótulo da aba ativa',
  'palette.ink700': 'Texto secundário',
  'palette.ink650': 'Texto de exemplo (placeholder)',
  'palette.ink600': 'Só ícones e elementos sem texto: não serve como cor de texto',
  'palette.textAccent': 'Valor em destaque dentro do texto',
  'palette.red700': 'Texto e borda de erro',
  'palette.red200': 'Borda da zona de perigo',
  'palette.red100': 'Fundo do aviso de erro',
  'palette.red50': 'Fundo da zona de perigo',
  'palette.green700': 'Texto de sucesso',
  'palette.mapBlue': 'Posição atual da pessoa no mapa',
  'palette.mapGray': 'Marcador de lembrete pausado no mapa',
  'palette.forest950': 'Palco escuro atrás da coluna do app na web, como no app original',
  'palette.forestPin': 'Pino do mapa no formulário de novo lembrete',
  'palette.headerTop': 'Degradê verde dos cabeçalhos e das telas de conta: topo',
  'palette.headerMid': 'Degradê verde dos cabeçalhos e das telas de conta: meio',
  'palette.headerBottom': 'Degradê verde dos cabeçalhos e das telas de conta: base',
  'palette.mist300': 'Degradê claro do cabeçalho do formulário: topo',
  'palette.mist100': 'Degradê claro do cabeçalho do formulário: meio',
  'palette.mint200': 'Contorno da faixa de seleção do horário',
  'palette.mint400': 'Anel de foco sobre fundo escuro',
  'palette.toggleCardOn': 'Interruptor ligado no cartão de lembrete',
  'palette.toggleFormOn': 'Interruptor ligado nos formulários e nas configurações',
  'palette.frost': 'Botão translúcido (ações do sucesso e Cancelar)',
  'palette.frostHover': 'Botão translúcido com o ponteiro em cima (web)',
  'palette.frostPressed': 'Botão translúcido pressionado',
  'palette.frostInk': 'Texto dos botões translúcidos',
  'palette.danger': 'Botão de perigo (Excluir lembrete)',
  'palette.dangerHover': 'Botão de perigo com o ponteiro em cima (web)',
  'palette.dangerPressed': 'Botão de perigo pressionado',
  'palette.sheet': 'Folha de cantos altos da lista e das configurações',
  'palette.alertErrorBg': 'Fundo do aviso de erro nas configurações',
  'palette.alertErrorInk': 'Texto do aviso de erro nas configurações',
  'palette.alertInfoInk': 'Texto do aviso informativo',
  'palette.statusGreen': 'Ponto do selo "Ativo"',
  'palette.onDark100': 'Texto sobre verde escuro: título',
  'palette.onDark200': 'Texto sobre verde escuro: subtítulo',
  'palette.onDark300': 'Texto sobre verde escuro: apoio',
  'palette.onDark400': 'Texto sobre verde escuro: o mais suave',
  'palette.tabInactive': 'Rótulo e ícone da aba inativa (medido nas capturas)',
  'palette.homeIndicator': 'Traço "home" do iOS sob a barra de abas',

  'colors.bg.page': 'Fundo de todas as telas',
  'colors.bg.stage': 'Palco atrás da coluna do app na web (tablet e computador)',
  'colors.bg.card': 'Superfície de cartões e da barra de abas',
  'colors.bg.field': 'Campos de formulário, painéis e folhas',
  'colors.bg.disabled': 'Campo desabilitado',
  'colors.text.primary': 'Texto principal e títulos',
  'colors.text.secondary': 'Subtítulos, dicas e metadados',
  'colors.text.placeholder': 'Texto de exemplo dentro de campos vazios',
  'colors.text.accent': 'Valor em destaque dentro do texto (raio, contagens, e-mail da conta)',
  'colors.text.brand': 'Rótulo da aba ativa',
  'colors.text.onAction': 'Rótulo sobre o botão primário',
  'colors.text.onDark': 'Rótulo sobre fundo escuro (botão escuro, chip selecionado)',
  'colors.text.danger': 'Mensagens e rótulos de erro',
  'colors.text.success': 'Mensagens e rótulos de sucesso',
  'colors.icon.default': 'Ícones sobre fundo claro',
  'colors.icon.muted': 'Ícones secundários e da aba inativa (nunca para texto)',
  'colors.action.primary': 'Fundo do botão primário',
  'colors.action.primaryHover': 'Botão primário com o ponteiro em cima (web)',
  'colors.action.primaryPressed': 'Botão primário pressionado',
  'colors.action.primaryAA': 'Alternativa do botão primário que cumpre 4,5:1 com texto branco',
  'colors.action.secondary': 'Fundo do botão escuro (secundário)',
  'colors.action.secondaryHover': 'Botão escuro com o ponteiro em cima (web)',
  'colors.action.secondaryPressed': 'Botão escuro pressionado',
  'colors.border.field': 'Borda de campos de formulário',
  'colors.border.strong': 'Contorno do botão sem fundo (ghost)',
  'colors.border.divider': 'Divisórias',
  'colors.border.chip': 'Contorno do chip não selecionado',
  'colors.border.focus': 'Borda do campo em foco e anel de foco',
  'colors.border.danger': 'Borda do campo com erro e do botão de exclusão',
  'colors.border.dangerSoft': 'Borda da zona de perigo',
  'colors.control.on': 'Interruptor ligado',
  'colors.control.off': 'Interruptor desligado',
  'colors.control.thumb': 'Bolinha do interruptor',
  'colors.control.chipOn': 'Chip de filtro selecionado',
  'colors.control.chipOff': 'Chip de filtro não selecionado',
  'colors.control.segmentTrack': 'Trilho do controle segmentado',
  'colors.control.segmentThumb': 'Opção selecionada do controle segmentado',
  'colors.feedback.dangerBg': 'Fundo do aviso de erro',
  'colors.feedback.dangerWash': 'Fundo da zona de perigo',
  'colors.feedback.successBg': 'Fundo do aviso de sucesso',
  'colors.feedback.infoBg': 'Fundo do aviso informativo (ex.: "você está dentro do raio")',
  'colors.feedback.infoBar': 'Faixa lateral do aviso informativo',
  'colors.feedback.emptyCircle': 'Círculo atrás do ícone do estado vazio',
  'colors.brand.tile': 'Fundo do ícone do app, da tela de abertura e do favicon',
  'colors.brand.tileEnd': 'Fim do degradê do ícone do app',
  'colors.brand.glyph': 'Símbolo do ícone do app',
  'colors.spinner': 'Indicador de carregamento sobre fundo claro',
  'colors.overlay': 'Véu atrás de modais e folhas',
  'colors.map.me': 'Posição atual da pessoa no mapa',
  'colors.map.ring': 'Aro branco em volta dos marcadores do mapa',
  'colors.map.paused': 'Marcador de lembrete pausado no mapa',
  'colors.map.background': 'Fundo do mapa enquanto os mapas carregam',
  'colors.category.*.bg': 'Fundo do círculo do ícone da categoria',
  'colors.category.*.bar': 'Faixa lateral do cartão da categoria',
  'colors.category.*.ink': 'Glifo do ícone da categoria',
  'colors.category.*.pin': 'Marcador da categoria no mapa',
  'colors.category.*.tag': 'Fundo da etiqueta do cartão ("Por horário", "Por local")',
  'colors.category.*.fg': 'Ícone da etiqueta do cartão',
  'colors.bg.sheet': 'Folha de cantos altos da lista e das configurações',
  'colors.text.onDarkWarm': 'Título sobre verde escuro',
  'colors.text.onDarkSoft': 'Subtítulo sobre verde escuro',
  'colors.text.onDarkMuted': 'Texto de apoio sobre verde escuro',
  'colors.text.onDarkFaint': 'Texto mais suave sobre verde escuro',
  'colors.text.onFrost': 'Rótulo dos botões translúcidos',
  'colors.action.danger': 'Fundo do botão de perigo',
  'colors.action.dangerHover': 'Botão de perigo com o ponteiro em cima (web)',
  'colors.action.dangerPressed': 'Botão de perigo pressionado',
  'colors.action.frost': 'Fundo dos botões translúcidos',
  'colors.action.frostHover': 'Botão translúcido com o ponteiro em cima (web)',
  'colors.action.frostPressed': 'Botão translúcido pressionado',
  'colors.control.onCard': 'Interruptor ligado no cartão de lembrete',
  'colors.control.onForm': 'Interruptor ligado nos formulários e nas configurações',
  'colors.feedback.errorBg': 'Fundo do aviso de erro nas configurações',
  'colors.feedback.errorInk': 'Texto do aviso de erro nas configurações',
  'colors.feedback.infoInk': 'Texto do aviso informativo',
  'colors.status.active': 'Ponto do selo "Ativo"',
  'colors.tab.inactive': 'Rótulo e ícone da aba inativa',
  'colors.tab.indicator': 'Traço "home" do iOS sob a barra de abas',
  'colors.glass.fill': 'Véu do botão de vidro sobre o verde escuro',
  'colors.glass.fillHover': 'Botão de vidro com o ponteiro em cima (web)',
  'colors.glass.fillPressed': 'Botão de vidro pressionado',
  'colors.glass.border': 'Borda do botão de vidro',
  'colors.map.pin': 'Pino do mapa no formulário de novo lembrete',
  'colors.map.haloFill': 'Preenchimento do círculo do raio de aviso',
  'colors.map.haloLine': 'Contorno do círculo do raio de aviso',
  'colors.map.pinShadow': 'Sombra do pino do mapa no formulário',
  'gradients.cabecalhoVerde': 'Cabeçalho verde da lista e das configurações (345 du de altura)',
  'gradients.contas': 'Fundo das telas de conta',
  'gradients.cabecalhoClaro': 'Cabeçalho claro do formulário de novo lembrete',
  'gradients.esmaecerParaPagina': 'Esmaecimento atrás do botão fixo do formulário',

  'fontSize.micro': 'Tags e legendas: o piso de legibilidade do app',
  'fontSize.caption': 'Dicas, metadados e mensagens de campo',
  'fontSize.body': 'Texto corrente e rótulos',
  'fontSize.bodyLg': 'Texto de leitura, campos e botões',
  'fontSize.heading': 'Títulos de seção',
  'fontSize.title': 'Títulos de tela e de estados',
  'fontSize.display': 'Nome do app nas telas de conta',
  'lineHeight.*': 'Altura de linha do tamanho de mesmo nome',
  'fontFamily.regular': 'Nunito Sans 400: texto corrente',
  'fontFamily.medium': 'Nunito Sans 500: ênfase leve',
  'fontFamily.semibold': 'Nunito Sans 600: rótulos e valores',
  'fontFamily.bold': 'Nunito Sans 700: botões e destaques',
  'fontFamily.serif': 'Source Serif 4 700: títulos de tela, de seção e de cartão',
  'textStyles.display': 'Título grande: nome do app nas telas de conta e títulos das páginas públicas',
  'textStyles.title': 'Título de tela, de estado vazio e de folha',
  'textStyles.heading': 'Título de seção ("Hoje", "Amanhã") e de cabeçalho',
  'textStyles.bodyLg': 'Texto de leitura (política de privacidade) e de campos',
  'textStyles.body': 'Texto corrente',
  'textStyles.label': 'Rótulo de campo e de linha',
  'textStyles.button': 'Rótulo de botão',
  'textStyles.caption': 'Dica, metadado e mensagem de campo',
  'textStyles.micro': 'Legenda mínima',

  'space.hair': 'Ajuste fino, como título e metadado do cartão',
  'space.xs': 'Espaço mínimo entre textos',
  'space.sm': 'Entre itens próximos: chips, ícone e texto',
  'space.md': 'Padding de cartões e campos; entre cartões',
  'space.lg': 'Margem lateral das telas e padding de painéis',
  'space.xl': 'Entre grupos de conteúdo; padding das telas de conta',
  'space.xxl': 'Entre seções',
  'space.huge': 'Respiro no fim de listas rolantes',
  'space.giant': 'Respiro do estado vazio',
  'radius.xs': 'Selos pequenos',
  'radius.sm': 'Avisos e miniaturas',
  'radius.md': 'Campos, cartões e controles retangulares',
  'radius.lg': 'Painéis grandes',
  'radius.sheet': 'Topo de folhas e modais',
  'radius.pill': 'Botões, chips e círculos',
  'borderWidth.hairline': 'Borda de campo, de botão sem fundo e de chip',
  'borderWidth.focus': 'Anel de foco e cartão em destaque',
  'borderWidth.bar': 'Faixa lateral de avisos e de cartões',
  'size.touch': 'Área mínima de toque (44, o padrão do iOS)',
  'size.button': 'Altura dos botões',
  'size.tabBar': 'Altura útil da barra de abas (a área segura do sistema é somada por cima)',
  'size.iconCircle': 'Círculo do ícone de categoria',
  'size.emptyCircle': 'Círculo do ícone do estado vazio',
  'size.chip': 'Altura visível do chip (a área de toque chega a 44 com `size.hitSlop`)',
  'size.closeButton': 'Botão de fechar visível (a área de toque chega a 44 com `size.hitSlop`)',
  'size.hitSlop': 'Folga de toque ao redor de controles menores que 44',
  'size.mapPin.width': 'Largura do pino do mapa no formulário',
  'size.mapPin.height': 'Altura do pino do mapa no formulário (a ponta marca o local)',
  'size.icon.sm': 'Ícones ao lado de texto pequeno',
  'size.icon.md': 'Ícones de ação',
  'size.icon.lg': 'Ícones de aba',
  'size.icon.xl': 'Ícone do estado vazio',
  'opacity.disabled': 'Controle desabilitado',
  'opacity.inactive': 'Cartão de lembrete pausado',
  'opacity.pressed': 'Toque em elementos que não trocam de cor',
  'shadow.card': 'Cartões e painéis (quase plano)',
  'shadow.float': 'Controles flutuantes',
  'shadow.cta': 'Brilho laranja do botão primário',
  'shadow.focus': 'Halo de 3 em volta do campo em foco, sobre a borda `colors.border.focus`',
  'motion.duration.fast': 'Feedback de toque (ms)',
  'motion.duration.base': 'Troca de estado (ms)',
  'motion.duration.slow': 'Entrada de modais (ms)',
  'motion.duration.scrim': 'Entrada do véu atrás de uma folha (ms)',
  'motion.duration.sheet': 'Subida de uma folha inferior (ms)',
  'motion.curve.x1': 'Curva de entrada das folhas: cubic-bezier(x1, y1, x2, y2)',
  'motion.curve.y1': 'Curva de entrada das folhas: cubic-bezier(x1, y1, x2, y2)',
  'motion.curve.x2': 'Curva de entrada das folhas: cubic-bezier(x1, y1, x2, y2)',
  'motion.curve.y2': 'Curva de entrada das folhas: cubic-bezier(x1, y1, x2, y2)',
  'motion.pressedScale': 'Escala do botão pressionado',
  'layout.columnMax': 'Largura máxima da coluna do app na web (a das capturas de referência); no celular a coluna é a tela toda',
  'layout.readingMax': 'Largura máxima de texto corrido (política de privacidade)',
  'layout.sheetMaxHeight': 'Altura máxima de uma folha inferior, como fração da tela',
  'size.sheet.paddingTop': 'Folha inferior: espaço acima da alça',
  'size.sheet.paddingHorizontal': 'Folha inferior: margem dos lados',
  'size.sheet.paddingBottom': 'Folha inferior: espaço embaixo (a barra home do iOS)',
  'size.sheet.handleWidth': 'Alça da folha: largura (só enfeite, não arrasta)',
  'size.sheet.handleHeight': 'Alça da folha: altura',
  'size.sheet.handleGap': 'Vão entre a alça e o título da folha',
  'shadow.sheet': 'Folha inferior (sombra para cima)',
  'shadow.tabBar': 'Barra de abas: filete e sombra para cima',
  'shadow.column': 'Coluna do app sobre o palco escuro, na web (tablet e computador)',
  'palette.tabBarBg': 'Fundo da barra de abas',
  'colors.tab.background': 'Fundo da barra de abas',
};

const PADROES = Object.entries(DESCRICOES)
  .filter(([chave]) => chave.includes('*'))
  .map(([chave, texto]) => ({ regex: new RegExp(`^${chave.replace(/\./g, '\\.').replace(/\*/g, '[^.]+')}$`), texto }));

export function descricaoDoToken(caminho: string): string | undefined {
  return DESCRICOES[caminho] ?? PADROES.find((p) => p.regex.test(caminho))?.texto;
}

const cod = (v: string | number) => `\`${v}\``;
const tabela = (cabecalho: string[], linhas: (string | number)[][]) =>
  [`| ${cabecalho.join(' | ')} |`, `|${cabecalho.map(() => '---').join('|')}|`, ...linhas.map((l) => `| ${l.join(' | ')} |`)].join('\n');
const decimal = (n: number) => n.toFixed(2).replace('.', ',');
const nomeNaPaleta = new Map<string, string>(Object.entries(palette).map(([nome, hex]) => [hex, nome]));

const linhasSimples = (nome: keyof typeof GRUPOS, grupo: object) =>
  achatar(grupo, nome).map((f) => [cod(f.caminho), cod(f.valor), descricaoDoToken(f.caminho) ?? '']);

/** Cada bloco é o conteúdo entre os marcadores do documento. */
export function blocosGerados(): Record<string, string> {
  const { category, ...semCategorias } = colors;
  const categorias = Object.keys(category) as (keyof typeof category)[];
  const excecoes = [...new Set(PARES_DE_CONTRASTE.flatMap((p) => (p.excecao ? [p.excecao] : [])))];

  return {
    'cores-primitivas': tabela(['Token', 'Valor', 'Uso'], linhasSimples('palette', palette)),

    'cores-semanticas': tabela(
      ['Token', 'Valor', 'Vem da paleta', 'Uso'],
      achatar(semCategorias, 'colors').map((f) => {
        const daPaleta = nomeNaPaleta.get(String(f.valor));
        return [cod(f.caminho), cod(f.valor), daPaleta ? cod(`palette.${daPaleta}`) : '—', descricaoDoToken(f.caminho) ?? ''];
      }),
    ),

    'cores-categorias': tabela(
      ['Categoria', 'Fundo do ícone (`bg`)', 'Faixa (`bar`)', 'Glifo (`ink`)', 'Marcador no mapa (`pin`)', 'Etiqueta (`tag`)', 'Ícone da etiqueta (`fg`)'],
      categorias.map((c) => [cod(`colors.category.${c}`), cod(category[c].bg), cod(category[c].bar), cod(category[c].ink), cod(category[c].pin), cod(category[c].tag), cod(category[c].fg)]),
    ),

    contraste: [
      tabela(
        ['Frente', 'Fundo', 'Razão', 'Mínimo', 'Situação', 'Onde'],
        PARES_DE_CONTRASTE.map((p) => {
          const razao = razaoDoPar(p);
          return [cod(`colors.${p.fg}`), cod(`colors.${p.bg}`), `${decimal(razao)}:1`, `${String(p.min).replace('.', ',')}:1`, razao >= p.min ? (p.excecao ? '✓ exceção' : '✓') : '✗', p.uso];
        }),
      ),
      '',
      ...excecoes.map((e) => `- **Exceção:** ${e}`),
    ].join('\n'),

    'tipografia-estilos': tabela(
      ['Estilo', 'Tamanho', 'Altura de linha', 'Família', 'Uso'],
      Object.entries(textStyles).map(([nome, e]) => [cod(`textStyles.${nome}`), e.fontSize, e.lineHeight, cod(e.fontFamily), descricaoDoToken(`textStyles.${nome}`) ?? '']),
    ),

    'tipografia-escala': [
      tabela(['Token', 'Valor', 'Uso'], [...linhasSimples('fontSize', fontSize), ...linhasSimples('lineHeight', lineHeight), ...linhasSimples('fontFamily', fontFamily)]),
    ].join('\n'),

    espacamento: tabela(['Token', 'Valor', 'Uso'], linhasSimples('space', space)),
    raios: tabela(['Token', 'Valor', 'Uso'], linhasSimples('radius', radius)),
    bordas: tabela(['Token', 'Valor', 'Uso'], linhasSimples('borderWidth', borderWidth)),
    tamanhos: tabela(['Token', 'Valor', 'Uso'], [...linhasSimples('size', size), ...linhasSimples('layout', layout)]),
    opacidade: tabela(['Token', 'Valor', 'Uso'], linhasSimples('opacity', opacity)),
    sombras: tabela(['Token', 'Valor (`boxShadow`)', 'Uso'], linhasSimples('shadow', shadow)),
    degrades: tabela(
      ['Token', 'Receita (camadas de cima para baixo)', 'Uso'],
      Object.entries(gradients).map(([nome, receita]) => [
        cod(`gradients.${nome}`),
        receita.split(/,\s*(?=(?:radial|linear)-gradient\()/).map((camada) => cod(camada)).join('<br>'),
        descricaoDoToken(`gradients.${nome}`) ?? '',
      ]),
    ),
    movimento: tabela(['Token', 'Valor', 'Uso'], linhasSimples('motion', motion)),

    'icones-categorias': tabela(['Ícone do lembrete', 'Ionicons'], Object.entries(ICON_NAME).map(([chave, nome]) => [cod(chave), cod(nome)])),
    'icones-interface': tabela(
      ['Uso', 'Ionicons'],
      [
        ...Object.entries(TAB_ICON).map(([aba, [ativa, inativa]]) => [`Aba ${aba} (ativa · inativa)`, `${cod(ativa)} · ${cod(inativa)}`]),
        ...Object.entries(UI_ICON).map(([uso, nome]) => [uso, cod(nome)]),
      ],
    ),
  };
}

/** Reescreve só o que está entre os marcadores; o resto do texto fica intacto. */
export function aplicarBlocos(texto: string, blocos: Record<string, string>): string {
  return Object.entries(blocos).reduce((t, [id, conteudo]) => {
    const marcador = new RegExp(`(<!-- tokens:${id}:inicio -->)[\\s\\S]*?(<!-- tokens:${id}:fim -->)`);
    return t.replace(marcador, (_tudo, ini: string, fim: string) => `${ini}\n${conteudo}\n${fim}`);
  }, texto);
}

/** Tokens citados entre crases no texto ("`colors.text.primary`"). Aceita também o nome de um grupo ("`colors.category`"). */
export function tokensCitadosNoTexto(texto: string): string[] {
  const raizes = Object.keys(GRUPOS).concat('textStyles').join('|');
  const achados = [...texto.matchAll(new RegExp(`\`((?:${raizes})(?:\\.[A-Za-z0-9]+)+)\``, 'g'))].map((m) => m[1]);
  return [...new Set(achados)];
}
