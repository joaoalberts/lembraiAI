export type Category = 'green' | 'orange' | 'blue' | 'purple' | 'pink';
export type IconKey = 'cart' | 'dumbbell' | 'pill' | 'users' | 'plane' | 'pin' | 'bell' | 'briefcase' | 'house' | 'card';
export type Section = 'Hoje' | 'Amanhã' | 'Esta semana';
export type RepeatKey = 'never' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'yearly';

export interface Reminder {
  id: string;
  title: string;
  category: Category;
  icon: IconKey;
  kind: 'local' | 'time';
  place?: string;
  /** Coordenadas do local (geofencing). Sem elas, o lembrete por local não pode ser monitorado. */
  lat?: number;
  lng?: number;
  radius?: number;
  dateISO: string;
  /** "HH:MM" */
  time: string;
  repeat: RepeatKey;
  active: boolean;
}

export const SECTIONS: Section[] = ['Hoje', 'Amanhã', 'Esta semana'];

/** O banco guarda a CHAVE (`never`, `weekly`…); o rótulo em português vive só na interface. */
export const REPEAT_OPTIONS: { key: RepeatKey; label: string }[] = [
  { key: 'never', label: 'Nunca' },
  { key: 'daily', label: 'Todos os dias' },
  { key: 'weekdays', label: 'Dias úteis' },
  { key: 'weekly', label: 'Toda semana' },
  { key: 'monthly', label: 'Todo mês' },
  { key: 'yearly', label: 'Todo ano' },
];

export const repeatLabel = (k: RepeatKey): string => REPEAT_OPTIONS.find((o) => o.key === k)?.label ?? 'Nunca';

/** Raios oferecidos no formulário (a tabela aceita de 10 a 5000 m). */
export const RADIUS_OPTIONS = [50, 100, 150, 300, 500];
export const DEFAULT_RADIUS = 150;

/** Coordenada usada só para centrar o mapa antes de a posição chegar (a mesma do app web: Fortaleza). */
export const FALLBACK_COORD = { lat: -3.7566, lng: -38.4891 };

/** `bg` = fundo do cartão; `pin` = cor forte para marcadores no mapa. */
export const CATEGORY_COLORS: Record<Category, { bg: string; pin: string }> = {
  green: { bg: '#DBF1E4', pin: '#2F9E5B' },
  orange: { bg: '#FDE6D6', pin: '#FE532A' },
  blue: { bg: '#D5E8F9', pin: '#2F80ED' },
  purple: { bg: '#EADFFB', pin: '#7C3AED' },
  pink: { bg: '#FCE0EA', pin: '#E0457B' },
};

export const ICON_EMOJI: Record<IconKey, string> = {
  cart: '🛒',
  dumbbell: '🏋️',
  pill: '💊',
  users: '👥',
  plane: '✈️',
  pin: '📍',
  bell: '🔔',
  briefcase: '💼',
  house: '🏠',
  card: '💳',
};
