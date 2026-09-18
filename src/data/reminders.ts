export type Category = 'green' | 'orange' | 'blue' | 'purple' | 'pink';
export type IconKey = 'cart' | 'dumbbell' | 'pill' | 'users' | 'plane' | 'pin' | 'bell';
export type Section = 'Hoje' | 'Amanhã' | 'Esta semana';

export interface Reminder {
  id: string;
  title: string;
  category: Category;
  icon: IconKey;
  kind: 'local' | 'time';
  place?: string;
  radius?: number;
  dateISO?: string;
  dateLabel: string;
  time: string;
  repeat: string;
  section: Section;
  active: boolean;
  thumb?: string;
}

/** Datas de exemplo exatamente como aparecem em ./ref/ (dados ilustrativos). */
export const SECTION_DATES: Record<Section, string | undefined> = {
  Hoje: 'Ter, 16 de set de 2026',
  Amanhã: 'Qua, 17 de set de 2026',
  'Esta semana': undefined,
};
export const SECTIONS: Section[] = ['Hoje', 'Amanhã', 'Esta semana'];

/** Opções do seletor "Repetir"; o valor escolhido é o texto exibido no resumo do lembrete. */
export const REPEAT_OPTIONS: { value: string; desc: string }[] = [
  { value: 'Nunca', desc: 'Avisa uma única vez' },
  { value: 'Todos os dias', desc: 'Repete diariamente, no mesmo horário' },
  { value: 'Dias úteis', desc: 'De segunda a sexta' },
  { value: 'Toda semana', desc: 'No mesmo dia da semana' },
  { value: 'Todo mês', desc: 'No mesmo dia do mês' },
  { value: 'Todo ano', desc: 'Na mesma data, todo ano' },
];

export const DEFAULT_DATE_ISO = '2026-09-16';
export const DEFAULT_DATE_LABEL = 'Ter, 16 de set de 2026';
export const DEFAULT_PLACE = 'Av. Vieira de Moraes, 320 – Fortaleza, CE';

export const SEED: Reminder[] = [
  { id: 'r1', title: 'Comprar água no mercado', category: 'green', icon: 'cart', kind: 'local',
    place: 'Supermercado Frangolândia', radius: 150, dateISO: '2026-09-16', dateLabel: 'Ter, 16 de set de 2026', time: '09:00',
    repeat: 'Nunca', section: 'Hoje', active: true, thumb: '/assets/thumb-mercado.jpg' },
  { id: 'r2', title: 'Academia', category: 'orange', icon: 'dumbbell', kind: 'local',
    place: 'Smart Fit – Iguatemi', radius: 100, dateISO: '2026-09-16', dateLabel: 'Ter, 16 de set de 2026', time: '18:00',
    repeat: 'Nunca', section: 'Hoje', active: true, thumb: '/assets/thumb-academia.jpg' },
  { id: 'r3', title: 'Tomar vitamina', category: 'blue', icon: 'pill', kind: 'time',
    dateISO: '2026-09-17', dateLabel: 'Qua, 17 de set de 2026', time: '08:00', repeat: 'Nunca', section: 'Amanhã', active: true },
  { id: 'r4', title: 'Reunião com fornecedor', category: 'purple', icon: 'users', kind: 'time',
    dateISO: '2026-09-19', dateLabel: 'Sex, 19 de set de 2026', time: '14:00', repeat: 'Nunca', section: 'Esta semana', active: true },
  { id: 'r5', title: 'Passaporte – verificar validade', category: 'pink', icon: 'plane', kind: 'time',
    dateISO: '2026-09-20', dateLabel: 'Sáb, 20 de set de 2026', time: '10:00', repeat: 'Nunca', section: 'Esta semana', active: true },
];
