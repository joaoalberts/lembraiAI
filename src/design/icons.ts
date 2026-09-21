/**
 * Ícones do app: Lucide (`lucide-react-native`), a mesma família do app web e das capturas de referência. Cada nome aqui é o
 * do arquivo do ícone no pacote (`lucide-react-native/icons/<nome>`); `src/components/Icon.tsx` registra os componentes e
 * `__tests__/icones.test.ts` confere que todo nome existe no pacote e no registro.
 * Este arquivo só tem texto (roda em scripts). A espessura do traço vem de `iconStroke` (tokens.ts).
 */
import type { IconeNome } from '../components/Icon';
import type { IconKey } from '../data/reminders';

/** Ícone de cada lembrete, escolhido pela descrição (lib/categorize.ts). */
export const ICON_NAME: Record<IconKey, IconeNome> = {
  cart: 'shopping-cart',
  dumbbell: 'dumbbell',
  pill: 'pill',
  users: 'users',
  plane: 'plane',
  pin: 'map-pin',
  bell: 'bell',
  briefcase: 'briefcase',
  house: 'house',
  card: 'credit-card',
};

/** Glifos que o Lucide desenha na diagonal e a lista de lembretes usa em pé: giro em graus (só no cartão da lista). */
export const GIRO_NA_LISTA: Partial<Record<IconKey, number>> = {
  dumbbell: 45,
  plane: -45,
};

/** Abas da barra inferior: o mesmo ícone ativo e inativo (muda o traço e a cor). */
export const TAB_ICON = {
  criar: 'plus',
  lembretes: 'list',
  mapa: 'map-pin',
  config: 'settings',
} as const satisfies Record<string, IconeNome>;

/** Ícones de interface que se repetem em mais de uma tela. */
export const UI_ICON = {
  fechar: 'x',
  excluir: 'trash',
  aqui: 'map-pin',
  definido: 'circle-check',
  vazio: 'bell',
  email: 'mail',
} as const satisfies Record<string, IconeNome>;
