/**
 * Ícones do app: Ionicons em contorno (`@expo/vector-icons`), a mesma família das abas. O app web usa Lucide; o Ionicons é a
 * opção grátis e multiplataforma do Expo com o mesmo traço. Nomes conferidos contra a fonte em `__tests__/icones.test.ts`.
 * Este arquivo só tem texto (roda em scripts); o componente faz o cast para o tipo do Ionicons.
 */
import type { IconKey } from '../data/reminders';

/** Ícone de cada lembrete, escolhido pela descrição (lib/categorize.ts). */
export const ICON_NAME: Record<IconKey, string> = {
  cart: 'cart-outline',
  dumbbell: 'barbell-outline',
  pill: 'medical-outline',
  users: 'people-outline',
  plane: 'airplane-outline',
  pin: 'location-outline',
  bell: 'notifications-outline',
  briefcase: 'briefcase-outline',
  house: 'home-outline',
  card: 'card-outline',
};

/** Abas: [ativa (preenchido), inativa (contorno)]. */
export const TAB_ICON = {
  lembretes: ['list', 'list-outline'],
  novo: ['add-circle', 'add-circle-outline'],
  mapa: ['map', 'map-outline'],
  config: ['settings', 'settings-outline'],
} as const;

/** Ícones de interface fora das categorias. */
export const UI_ICON = {
  fechar: 'close',
  excluir: 'trash-outline',
  aqui: 'location',
  definido: 'checkmark-circle',
  vazio: 'notifications-outline',
  email: 'mail-outline',
} as const;
