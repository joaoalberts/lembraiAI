import { colors } from '../design/tokens';

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
export const REPEAT_OPTIONS: { key: RepeatKey; label: string; desc: string }[] = [
  { key: 'never', label: 'Nunca', desc: 'Avisa uma única vez' },
  { key: 'daily', label: 'Todos os dias', desc: 'Repete diariamente, no mesmo horário' },
  { key: 'weekdays', label: 'Dias úteis', desc: 'De segunda a sexta' },
  { key: 'weekly', label: 'Toda semana', desc: 'No mesmo dia da semana' },
  { key: 'monthly', label: 'Todo mês', desc: 'No mesmo dia do mês' },
  { key: 'yearly', label: 'Todo ano', desc: 'Na mesma data, todo ano' },
];

export const repeatLabel = (k: RepeatKey): string => REPEAT_OPTIONS.find((o) => o.key === k)?.label ?? 'Nunca';

/** Raios oferecidos no formulário (a tabela aceita de 10 a 5000 m). */
export const RADIUS_OPTIONS = [50, 100, 150, 300, 500];
export const DEFAULT_RADIUS = 150;

/** Coordenada usada só para centrar o mapa antes de a posição chegar (a mesma do app web: Fortaleza). */
export const FALLBACK_COORD = { lat: -3.7566, lng: -38.4891 };

/** Cores de cada categoria, dos tokens do Design System: `bg` fundo do ícone, `bar` faixa do cartão, `ink` glifo, `pin` marcador no mapa. */
export const CATEGORY_COLORS: Record<Category, { bg: string; bar: string; ink: string; pin: string }> = colors.category;
