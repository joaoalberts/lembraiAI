import type { Reminder } from '../data/reminders';
import { distance, type LatLng } from './geo';

export interface Fence { id: string; title: string; place: string; lat: number; lng: number; radius: number }

/**
 * Histerese: entra ao alcançar o raio, mas só "sai" bem depois dele. Sem isso, andar na borda do círculo dispararia
 * a notificação várias vezes seguidas (o GPS oscila alguns metros parado).
 */
const EXIT_FACTOR = 1.25;
const EXIT_MARGIN = 50;      // metros somados ao raio para considerar que a pessoa saiu

/**
 * Precisão mínima aceita para DISPARAR um alerta. Posições vindas de Wi-Fi/IP chegam com centenas ou milhares de
 * metros de erro; confiar nelas geraria alarme falso a quilômetros do lugar. Sair da área não tem esse cuidado:
 * na dúvida, é melhor rearmar o lembrete do que deixá-lo travado como "dentro".
 */
const MAX_ACCURACY = 200;

export const fencesOf = (reminders: Reminder[]): Fence[] => reminders
  .filter((r) => r.active && r.kind === 'local' && r.lat != null && r.lng != null && r.radius != null)
  .map((r) => ({ id: r.id, title: r.title, place: r.place ?? '', lat: r.lat!, lng: r.lng!, radius: r.radius! }));

export interface Evaluation { entered: Fence[]; inside: Set<string>; nearest: { fence: Fence; meters: number } | null }

/**
 * Decide quem acabou de entrar no raio. Função pura: recebe a posição e o conjunto de lembretes já "dentro",
 * devolve o novo conjunto e os que dispararam agora.
 */
export function evaluate(pos: LatLng, accuracy: number, fences: Fence[], wasInside: Set<string>): Evaluation {
  const inside = new Set<string>();
  const entered: Fence[] = [];
  let nearest: Evaluation['nearest'] = null;
  const confiavel = accuracy <= MAX_ACCURACY;

  for (const f of fences) {
    const d = distance(pos, f);
    if (!nearest || d < nearest.meters) nearest = { fence: f, meters: d };

    if (wasInside.has(f.id)) {
      if (d <= f.radius * EXIT_FACTOR + EXIT_MARGIN) inside.add(f.id);   // continua dentro (zona de saída maior)
    } else if (d <= f.radius && confiavel) {
      inside.add(f.id);
      entered.push(f);                                                    // cruzou a borda agora
    }
  }
  return { entered, inside, nearest };
}
