import { fold } from './format';
import type { Reminder } from '../data/reminders';

/** Gera o nome do arquivo: lembrete-<slug>.jpg, sem acentos, até 40 letras. */
export function nomeDoArquivoDeImagem(r: Reminder): string {
  const slug = fold(r.title)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'lembrete';
  return `lembrete-${slug}.jpg`;
}
