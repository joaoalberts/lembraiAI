import { Platform } from 'react-native';
import { fold } from './format';
import { repeatLabel, type Reminder } from '../data/reminders';
import { formatDate } from './format';

/** Gera o nome do arquivo: lembrete-<slug>.jpg, sem acentos, até 40 letras. */
export function nomeDoArquivoDeImagem(r: Reminder): string {
  const slug = fold(r.title)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'lembrete';
  return `lembrete-${slug}.jpg`;
}

/**
 * Web: para gerar a imagem, é necessário usar html2canvas ou desenhar em canvas diretamente.
 * Isso é um trabalho significativo que requer `npm install html2canvas` ou replicar a lógica
 * de canvas do app web (src/lib/shareImage.ts). Por enquanto, retornar null indica que não
 * está implementado neste turno.
 */
export async function gerarImagemNaWeb(r: Reminder): Promise<File | null> {
  // TODO: Implementar geração de canvas com html2canvas ou réplica do app web
  return null;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
