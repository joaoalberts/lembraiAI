import { contrastRatio } from './contrast';
import { colors } from './tokens';

export interface ParDeContraste {
  /** Caminho em `colors` da cor da frente (texto, ícone, borda). */
  fg: string;
  /** Caminho em `colors` do fundo. */
  bg: string;
  /** 4,5 = texto normal; 3 = texto grande ou componente de interface (WCAG 1.4.3 e 1.4.11); 7 = nível AAA. */
  min: 3 | 4.5 | 7;
  uso: string;
  /** Obrigatória quando `min` é menor que 4,5: por que esse par aceita menos. */
  excecao?: string;
}

/** Cor pelo caminho em `colors` ("text.primary"). Recusa caminho inexistente, para erro de digitação não virar "passou". */
export function corDoCaminho(caminho: string): string {
  const valor = caminho.split('.').reduce<unknown>((o, chave) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[chave] : undefined), colors);
  if (typeof valor !== 'string' || !valor.startsWith('#')) throw new Error(`Cor inexistente no Design System: "${caminho}"`);
  return valor;
}

export const razaoDoPar = (par: Pick<ParDeContraste, 'fg' | 'bg'>): number => contrastRatio(corDoCaminho(par.fg), corDoCaminho(par.bg));

const INTERFACE = 'Componente de interface ou ícone sem texto: o mínimo do WCAG 1.4.11 é 3:1.';
const MARCA = 'Exceção conhecida: o laranja da marca (aprovado nas referências) dá menos de 4,5:1 com texto branco. Só passa como texto grande ou componente. Mitigação: rótulo 16/700 em botão de 52 de altura; alternativa AA pronta em `colors.action.primaryAA`.';

const categorias = Object.keys(colors.category) as (keyof typeof colors.category)[];

/** Pares de cor que o app realmente usa. O teste de acessibilidade exige que cada um atinja o mínimo; a tabela do documento sai daqui. */
export const PARES_DE_CONTRASTE: ParDeContraste[] = [
  { fg: 'text.primary', bg: 'bg.page', min: 7, uso: 'Texto principal nas telas' },
  { fg: 'text.primary', bg: 'bg.card', min: 7, uso: 'Texto principal nos cartões' },
  { fg: 'text.primary', bg: 'bg.field', min: 7, uso: 'Texto digitado nos campos' },
  { fg: 'text.primary', bg: 'feedback.infoBg', min: 4.5, uso: 'Texto em avisos informativos' },
  { fg: 'text.primary', bg: 'feedback.successBg', min: 4.5, uso: 'Texto em avisos de sucesso' },
  { fg: 'feedback.errorInk', bg: 'feedback.errorBg', min: 7, uso: 'Texto do aviso de erro' },
  { fg: 'icon.default', bg: 'bg.page', min: 4.5, uso: 'Ícones em tinta principal' },

  { fg: 'text.secondary', bg: 'bg.page', min: 4.5, uso: 'Subtítulos, dicas e metadados nas telas' },
  { fg: 'text.secondary', bg: 'bg.card', min: 4.5, uso: 'Metadados nos cartões' },
  { fg: 'text.secondary', bg: 'bg.field', min: 4.5, uso: 'Dicas dentro de painéis brancos' },
  { fg: 'text.secondary', bg: 'feedback.infoBg', min: 4.5, uso: 'Texto de apoio em avisos informativos' },
  { fg: 'text.secondary', bg: 'feedback.successBg', min: 4.5, uso: 'Texto de apoio da tela "Confira seu e-mail"' },
  { fg: 'text.placeholder', bg: 'bg.field', min: 4.5, uso: 'Placeholder dos campos' },
  { fg: 'text.placeholder', bg: 'bg.card', min: 4.5, uso: 'Nomes dos dados no cartão de resumo (Data, Horário, Local e Repetir)' },

  { fg: 'text.accent', bg: 'bg.page', min: 4.5, uso: 'Valores em destaque nas telas' },
  { fg: 'text.accent', bg: 'bg.card', min: 4.5, uso: 'Valores em destaque nos cartões' },
  { fg: 'text.accent', bg: 'bg.field', min: 4.5, uso: 'Valores em destaque em painéis brancos' },
  { fg: 'text.accent', bg: 'feedback.infoBg', min: 4.5, uso: 'Destaque em avisos informativos' },
  { fg: 'text.brand', bg: 'bg.card', min: 4.5, uso: 'Rótulo da aba ativa' },

  { fg: 'text.onAction', bg: 'action.primary', min: 3, uso: 'Rótulo do botão primário', excecao: MARCA },
  { fg: 'text.onAction', bg: 'action.primaryHover', min: 3, uso: 'Botão primário com o ponteiro em cima (web)', excecao: MARCA },
  { fg: 'text.onAction', bg: 'action.primaryPressed', min: 3, uso: 'Botão primário pressionado', excecao: MARCA },
  { fg: 'text.onAction', bg: 'action.primaryAA', min: 4.5, uso: 'Alternativa AA do botão primário' },
  { fg: 'text.onDark', bg: 'action.secondary', min: 4.5, uso: 'Rótulo do botão escuro' },
  { fg: 'text.onDark', bg: 'action.secondaryHover', min: 4.5, uso: 'Botão escuro com o ponteiro em cima (web)' },
  { fg: 'text.onDark', bg: 'action.secondaryPressed', min: 4.5, uso: 'Botão escuro pressionado' },
  { fg: 'text.onDark', bg: 'control.chipOn', min: 4.5, uso: 'Chip de filtro ativo' },
  { fg: 'text.onFrost', bg: 'action.frost', min: 4.5, uso: 'Rótulo dos botões Editar, Excluir e Compartilhar' },
  { fg: 'text.onFrost', bg: 'action.frostHover', min: 4.5, uso: 'Rótulo dos botões de ação com o ponteiro em cima (web)' },
  { fg: 'text.onFrost', bg: 'action.frostPressed', min: 4.5, uso: 'Rótulo dos botões de ação pressionados' },

  { fg: 'text.danger', bg: 'bg.page', min: 4.5, uso: 'Erro solto na tela' },
  { fg: 'text.danger', bg: 'bg.card', min: 4.5, uso: 'Erro em cartão' },
  { fg: 'text.danger', bg: 'bg.field', min: 4.5, uso: 'Erro em painel branco e mensagem de campo' },
  { fg: 'text.danger', bg: 'feedback.dangerWash', min: 4.5, uso: 'Zona de perigo' },
  { fg: 'text.success', bg: 'feedback.successBg', min: 4.5, uso: 'Aviso de sucesso e selo "Liberada"' },
  { fg: 'text.success', bg: 'bg.field', min: 4.5, uso: 'Sucesso em painel branco' },
  { fg: 'text.success', bg: 'bg.page', min: 4.5, uso: 'Sucesso solto na tela' },

  { fg: 'icon.muted', bg: 'bg.card', min: 3, uso: 'Ícone da aba inativa', excecao: INTERFACE },
  { fg: 'icon.muted', bg: 'bg.page', min: 3, uso: 'Ícones secundários nas telas', excecao: INTERFACE },
  { fg: 'border.focus', bg: 'bg.field', min: 3, uso: 'Borda de foco do campo', excecao: INTERFACE },
  { fg: 'border.focus', bg: 'bg.page', min: 3, uso: 'Anel de foco sobre a página', excecao: INTERFACE },
  { fg: 'control.onCard', bg: 'bg.card', min: 3, uso: 'Interruptor ligado no cartão', excecao: INTERFACE },
  { fg: 'control.thumb', bg: 'control.onCard', min: 3, uso: 'Bolinha do interruptor do cartão sobre o trilho ligado', excecao: INTERFACE },
  { fg: 'control.onForm', bg: 'bg.card', min: 3, uso: 'Interruptor ligado nos formulários e nas configurações', excecao: INTERFACE },
  { fg: 'control.thumb', bg: 'control.onForm', min: 3, uso: 'Bolinha do interruptor do formulário sobre o trilho ligado', excecao: INTERFACE },
  { fg: 'control.on', bg: 'bg.card', min: 3, uso: 'Preenchimento do controle deslizante do raio', excecao: INTERFACE },
  { fg: 'feedback.infoBar', bg: 'feedback.infoBg', min: 3, uso: 'Faixa lateral do aviso informativo', excecao: INTERFACE },
  { fg: 'border.strong', bg: 'bg.field', min: 3, uso: 'Anel da caixinha e dos cartões e linhas de opção não escolhidos; contorno do botão sem fundo com o ponteiro em cima', excecao: INTERFACE },
  { fg: 'border.strong', bg: 'bg.card', min: 3, uso: 'Anel da caixinha e do cartão de modo sobre o cartão; contorno do botão sem fundo no cartão de conta', excecao: INTERFACE },
  { fg: 'border.strong', bg: 'bg.page', min: 3, uso: 'Contorno do botão sem fundo sobre a página', excecao: INTERFACE },
  { fg: 'border.strong', bg: 'control.chipOff', min: 3, uso: 'Contorno do botão sem fundo pressionado', excecao: INTERFACE },
  { fg: 'border.strong', bg: 'bg.sheet', min: 3, uso: 'Anel de opção sobre o fundo da folha', excecao: INTERFACE },
  { fg: 'conta.medidorFraco', bg: 'bg.card', min: 3, uso: 'Barra do medidor de força da senha: senha fraca', excecao: INTERFACE },
  { fg: 'conta.medidorMedio', bg: 'bg.card', min: 3, uso: 'Barra do medidor de força da senha: senha razoável', excecao: INTERFACE },
  { fg: 'conta.medidorForte', bg: 'bg.card', min: 3, uso: 'Barra do medidor de força da senha: senha forte', excecao: INTERFACE },

  ...categorias.map((c): ParDeContraste => ({ fg: `category.${c}.ink`, bg: `category.${c}.bg`, min: 3, uso: `Glifo do ícone da categoria ${c}`, excecao: INTERFACE })),
  ...categorias.map((c): ParDeContraste => ({ fg: `category.${c}.tagInk`, bg: `category.${c}.tag`, min: 4.5, uso: `Texto da etiqueta "Por horário" da categoria ${c}` })),
  ...categorias.map((c): ParDeContraste => ({ fg: `category.${c}.pin`, bg: 'bg.field', min: 3, uso: `Marcador da categoria ${c} sobre o mapa claro`, excecao: INTERFACE })),
  { fg: 'map.me', bg: 'bg.field', min: 3, uso: 'Posição da pessoa sobre o mapa claro', excecao: INTERFACE },
  { fg: 'map.paused', bg: 'bg.field', min: 3, uso: 'Marcador de lembrete pausado sobre o mapa claro', excecao: INTERFACE },
];
