import { Platform } from 'react-native';
import { fold } from './format';
import { repeatLabel, type Reminder } from '../data/reminders';
import { formatDate } from './format';
import { palette } from '../design/tokens';

/** Gera o nome do arquivo: lembrete-<slug>.jpg, sem acentos, até 40 letras. */
export function nomeDoArquivoDeImagem(r: Reminder): string {
  const slug = fold(r.title)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'lembrete';
  return `lembrete-${slug}.jpg`;
}

const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';
const TAGLINE = 'Na hora certa. No lugar certo.';
// Sombra do cartão: 10% de opacidade sobre o escuro
const SHADOW_COLOR = 'rgba(20, 40, 30, 0.10)';
// Borda do cartão: branco a 85%
const BORDER_COLOR = 'rgba(255, 255, 255, 0.85)';

/** Desenha o cartão de resumo num canvas (inspirado no app web, simplificado para funcionar em qualquer contexto). */
async function desenharCartao(r: Reminder): Promise<Blob> {
  const W = 1080;
  const H = 900;
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;

  if (!canvas) throw new Error('Canvas não disponível');

  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext('2d');
  if (!c) throw new Error('Contexto 2D não disponível');

  // Fundo gradiente (névoa)
  c.fillStyle = palette.cream200;
  c.fillRect(0, 0, W, H);
  const haze = c.createLinearGradient(0, 0, 0, 760);
  haze.addColorStop(0, palette.mist300);
  haze.addColorStop(0.6, palette.mist100);
  haze.addColorStop(1, palette.cream200);
  c.fillStyle = haze;
  c.fillRect(0, 0, W, 760);

  // Marca (círculo + texto)
  const PAD = 72;
  const markerRadius = 52;
  c.beginPath();
  c.arc(PAD + 52, 148, markerRadius, 0, Math.PI * 2);
  c.fillStyle = palette.mint400;
  c.fill();

  c.fillStyle = palette.inkBrand;
  c.font = 'bold 46px ' + SANS;
  c.textAlign = 'left';
  c.textBaseline = 'middle';
  c.fillText('LembreiAi', PAD + 134, 132);

  c.fillStyle = palette.ink600;
  c.font = '400 30px ' + SANS;
  c.fillText('Sua rotina, mais leve.', PAD + 134, 176);

  // Cartão
  const cardPad = 72;
  const cardTop = 262;
  const cardHeight = 580;
  c.save();
  c.shadowColor = SHADOW_COLOR;
  c.shadowBlur = 60;
  c.shadowOffsetY = 20;
  c.fillStyle = palette.cream100;
  c.fillRect(cardPad, cardTop, W - cardPad * 2, cardHeight);
  c.restore();

  // Borda do cartão
  c.strokeStyle = BORDER_COLOR;
  c.lineWidth = 3;
  c.strokeRect(cardPad + 1.5, cardTop + 1.5, W - cardPad * 2 - 3, cardHeight - 3);

  // Título (cabeçalho do cartão)
  const titleX = cardPad + 56 + 132 + 36;
  const titleY = cardTop + 56 + 66;

  c.beginPath();
  c.arc(cardPad + 56 + 66, titleY, 66, 0, Math.PI * 2);
  c.fillStyle = palette.sucessoCategoria;
  c.fill();

  c.fillStyle = palette.ink900;
  c.font = 'bold 56px ' + SANS;
  c.textAlign = 'left';
  c.textBaseline = 'middle';
  const maxTitleWidth = W - titleX - 56;
  const titleText = r.title.length > 30 ? r.title.substring(0, 27) + '…' : r.title;
  c.fillText(titleText, titleX, titleY);

  // Linhas de informação
  const infoX = cardPad + 56;
  const infoLineY = titleY + 132;
  const infoRadius = 42;

  // Data
  c.beginPath();
  c.arc(infoX + infoRadius, infoLineY + infoRadius, infoRadius - 1.25, 0, Math.PI * 2);
  c.fillStyle = palette.sucessoDado;
  c.fill();
  c.strokeStyle = palette.sucessoDadoAnel;
  c.lineWidth = 2.5;
  c.stroke();

  c.fillStyle = palette.borderStrong;
  c.font = '400 27px ' + SANS;
  c.textAlign = 'left';
  c.textBaseline = 'middle';
  c.fillText('Data', infoX + infoRadius * 2 + 28, infoLineY + infoRadius);

  c.fillStyle = palette.ink900;
  c.font = '500 36px ' + SANS;
  c.fillText(formatDate(r.dateISO), infoX + infoRadius * 2 + 28, infoLineY + infoRadius + 66);

  // Divisor
  c.fillStyle = palette.divider;
  c.fillRect(infoX, infoLineY + infoRadius * 2 + 44, W - infoX * 2, 2);

  // Horário
  const timeLineY = infoLineY + infoRadius * 2 + 90;
  c.beginPath();
  c.arc(infoX + infoRadius, timeLineY + infoRadius, infoRadius - 1.25, 0, Math.PI * 2);
  c.fillStyle = palette.sucessoDado;
  c.fill();
  c.strokeStyle = palette.sucessoDadoAnel;
  c.lineWidth = 2.5;
  c.stroke();

  c.fillStyle = palette.borderStrong;
  c.font = '400 27px ' + SANS;
  c.fillText('Horário', infoX + infoRadius * 2 + 28, timeLineY + infoRadius);

  c.fillStyle = palette.ink900;
  c.font = '500 36px ' + SANS;
  c.fillText(r.time, infoX + infoRadius * 2 + 28, timeLineY + infoRadius + 66);

  // Rodapé
  c.fillStyle = palette.ink600;
  c.font = '500 28px ' + SANS;
  c.textAlign = 'center';
  c.textBaseline = 'top';
  c.fillText(TAGLINE, W / 2, cardTop + cardHeight + 64);

  return new Promise((ok, fail) => {
    canvas.toBlob((blob) => (blob ? ok(blob) : fail(new Error('canvas blob'))), 'image/jpeg', 0.94);
  });
}

/** Web: desenha o cartão em canvas e retorna como File JPEG. */
export async function gerarImagemNaWeb(r: Reminder): Promise<File | null> {
  if (typeof document === 'undefined') return null;

  try {
    const blob = await desenharCartao(r);
    return new File([blob], nomeDoArquivoDeImagem(r), { type: 'image/jpeg' });
  } catch {
    return null;
  }
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
