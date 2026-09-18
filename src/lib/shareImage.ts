import { createElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { CalendarDays, Clock, LocateFixed, MapPin, RefreshCw, type LucideIcon } from 'lucide-react';
import { REMINDER_ICONS } from '../components/ReminderIcon';
import type { Reminder } from '../data/reminders';
import { APP_NAME } from './brand';
import { fold } from './format';

type Ctx = CanvasRenderingContext2D;

const SANS = '"Nunito Sans Variable", "Nunito Sans", system-ui, sans-serif';
const SERIF = '"Source Serif 4 Variable", "Source Serif 4", Georgia, serif';

// Layout em px (canvas de 1080 de largura). O cartão espelha o resumo da tela de sucesso.
const W = 1080, PAD = 72, IN = 56;
const LEFT = PAD + IN, RIGHT = W - PAD - IN;   // bordas internas do cartão
const ICON = 84;                                // círculo de ícone das linhas de informação
const TEXT_X = LEFT + ICON + 28;                // início do texto das linhas
const COL2 = 650;                               // 2ª coluna (Horário)
const COL2_TEXT_X = COL2 + ICON + 28;
const TAGLINE = 'Na hora certa. No lugar certo.';

function roundRect(c: Ctx, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

/** Quebra o texto em até `maxLines` linhas de largura ≤ `maxW`, com reticências se sobrar. */
function wrap(c: Ctx, text: string, maxW: number, maxLines: number): string[] {
  const lines: string[] = [];
  let cur = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = cur ? `${cur} ${word}` : word;
    if (!cur || c.measureText(next).width <= maxW) cur = next;
    else { lines.push(cur); cur = word; }
  }
  if (cur) lines.push(cur);
  const kept = lines.slice(0, maxLines);
  if (lines.length > maxLines) kept[maxLines - 1] += '…';
  return kept.map((l) => {
    while (l.length > 1 && c.measureText(l).width > maxW) l = `${l.slice(0, -2).trimEnd()}…`;
    return l;
  });
}

/** Maior tamanho (entre `min` e `size`) em que o texto cabe em `maxW`. */
function fit(c: Ctx, text: string, weight: number, size: number, min: number, maxW: number): number {
  let s = size;
  for (; s > min; s--) { c.font = `${weight} ${s}px ${SANS}`; if (c.measureText(text).width <= maxW) break; }
  return s;
}

/** Ícone Lucide -> imagem (via SVG), para desenhar no canvas. */
async function iconImage(icon: LucideIcon, size: number, color: string, strokeWidth: number): Promise<HTMLImageElement> {
  const host = document.createElement('div');
  const root = createRoot(host);
  flushSync(() => root.render(createElement(icon, { size, color, strokeWidth })));
  const markup = host.innerHTML;
  root.unmount();
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }));
  try {
    return await new Promise<HTMLImageElement>((ok, fail) => {
      const img = new Image();
      img.onload = () => ok(img);
      img.onerror = () => fail(new Error('ícone'));
      img.src = url;
    });
  } finally { URL.revokeObjectURL(url); }
}

/** Garante que as fontes do app (com os glifos usados) estejam prontas antes de medir e desenhar. */
async function loadFonts(text: string) {
  await Promise.all([`700 56px ${SERIF}`, `700 46px ${SERIF}`, `400 27px ${SANS}`, `500 36px ${SANS}`].map((f) => document.fonts.load(f, text)));
}

function glow(c: Ctx, x: number, y: number, r: number, rgb: string, alpha: number) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb}, ${alpha})`);
  g.addColorStop(1, `rgba(${rgb}, 0)`);
  c.fillStyle = g;
  c.fillRect(0, 0, W, 900);
}

/** Desenha o lembrete como uma imagem JPEG (cartão de resumo + marca), pronta para compartilhar. */
export async function reminderImage(r: Reminder): Promise<File> {
  const place = r.place?.trim() || undefined;
  const radiusText = `Raio de ${r.radius} metros`;
  await loadFonts([r.title, r.dateLabel, r.time, place ?? '', r.repeat, radiusText, TAGLINE, `${APP_NAME} Sua rotina, mais leve. Data Horário Local Repetir`].join(' '));
  const [tileIc, catIc, calIc, clockIc, pinIc, repIc] = await Promise.all([
    iconImage(LocateFixed, 56, '#043525', 2.2), iconImage(REMINDER_ICONS[r.icon], 72, '#0A0A0A', 1.9),
    iconImage(CalendarDays, 40, '#0A0A0A', 2), iconImage(Clock, 40, '#0A0A0A', 2),
    iconImage(MapPin, 40, '#0A0A0A', 2), iconImage(RefreshCw, 40, '#0A0A0A', 2),
  ]);

  // 1) medir (só depois se sabe a altura)
  const canvas = document.createElement('canvas');
  canvas.width = W;
  const c = canvas.getContext('2d')!;
  const TITLE_X = LEFT + 132 + 36;
  c.font = `700 56px ${SERIF}`;
  const titleLines = wrap(c, r.title, RIGHT - TITLE_X, 2);
  c.font = `500 34px ${SANS}`;
  const placeLines = place ? wrap(c, place, RIGHT - TEXT_X, 2) : [];

  const cardTop = 262;
  const dateTop = cardTop + IN + 132 + 52;
  const div1 = dateTop + ICON + 44;
  let y = div1 + 2 + 44;
  const placeTop = y;
  const placeRadiusY = placeTop + 66 + (placeLines.length - 1) * 46 + 46;
  if (place) y += Math.max(ICON, placeRadiusY + 22 - placeTop) + 44;
  const div2 = y;
  if (place) y += 2 + 44;
  const repeatTop = y;
  const cardBottom = repeatTop + ICON + IN;
  const H = cardBottom + 128;

  // 2) desenhar (redimensionar o canvas reinicia o contexto)
  canvas.height = H;
  c.textBaseline = 'middle';
  c.fillStyle = '#F5F2ED';
  c.fillRect(0, 0, W, H);
  const haze = c.createLinearGradient(0, 0, 0, 760);
  haze.addColorStop(0, '#CBE4D6'); haze.addColorStop(.6, '#E3EEE5'); haze.addColorStop(1, '#F5F2ED');
  c.fillStyle = haze; c.fillRect(0, 0, W, 760);
  glow(c, W, 0, 760, '33, 105, 85', .55);
  glow(c, 0, 0, 640, '148, 249, 205', .36);

  // marca
  roundRect(c, PAD, 96, 104, 104, 32); c.fillStyle = '#7FEAC6'; c.fill();
  c.drawImage(tileIc, PAD + 24, 96 + 24);
  c.fillStyle = '#0A3924'; c.font = `700 46px ${SERIF}`; c.fillText(APP_NAME, PAD + 134, 132);
  c.fillStyle = '#767880'; c.font = `400 30px ${SANS}`; c.fillText('Sua rotina, mais leve.', PAD + 134, 176);

  // cartão
  c.save();
  c.shadowColor = 'rgba(20, 40, 30, .10)'; c.shadowBlur = 60; c.shadowOffsetY = 20;
  roundRect(c, PAD, cardTop, W - PAD * 2, cardBottom - cardTop, 56); c.fillStyle = '#FAF9F6'; c.fill();
  c.restore();
  roundRect(c, PAD + 1.5, cardTop + 1.5, W - PAD * 2 - 3, cardBottom - cardTop - 3, 55); c.strokeStyle = 'rgba(255, 255, 255, .85)'; c.lineWidth = 3; c.stroke();

  // cabeçalho: ícone da categoria + título
  const hy = cardTop + IN + 66;
  c.beginPath(); c.arc(LEFT + 66, hy, 66, 0, Math.PI * 2); c.fillStyle = '#D4EADE'; c.fill();
  c.drawImage(catIc, LEFT + 66 - 36, hy - 36);
  c.fillStyle = '#0A0A0A'; c.font = `700 56px ${SERIF}`;
  titleLines.forEach((line, i) => c.fillText(line, TITLE_X, hy - ((titleLines.length - 1) * 66) / 2 + i * 66));

  const info = (x: number, top: number, icon: HTMLImageElement, label: string) => {
    c.beginPath(); c.arc(x + ICON / 2, top + ICON / 2, ICON / 2 - 1.25, 0, Math.PI * 2);
    c.fillStyle = '#F7F5F3'; c.fill(); c.strokeStyle = '#E6E5E4'; c.lineWidth = 2.5; c.stroke();
    c.drawImage(icon, x + (ICON - 40) / 2, top + (ICON - 40) / 2);
    c.fillStyle = '#84848A'; c.font = `400 27px ${SANS}`; c.fillText(label, x + ICON + 28, top + 24);
  };
  const value = (x: number, top: number, text: string, maxW: number) => {
    c.fillStyle = '#0A0A0A'; c.font = `500 ${fit(c, text, 500, 36, 28, maxW)}px ${SANS}`; c.fillText(text, x, top + 66);
  };
  const divider = (at: number) => { c.fillStyle = '#E8E7E6'; c.fillRect(LEFT, at, RIGHT - LEFT, 2); };

  info(LEFT, dateTop, calIc, 'Data');
  value(TEXT_X, dateTop, r.dateLabel, COL2 - TEXT_X - 28);
  info(COL2, dateTop, clockIc, 'Horário');
  value(COL2_TEXT_X, dateTop, r.time, RIGHT - COL2_TEXT_X);
  divider(div1);

  if (place) {
    info(LEFT, placeTop, pinIc, 'Local');
    c.fillStyle = '#0A0A0A'; c.font = `500 34px ${SANS}`;
    placeLines.forEach((line, i) => c.fillText(line, TEXT_X, placeTop + 66 + i * 46));
    c.fillStyle = '#767880'; c.font = `400 28px ${SANS}`; c.fillText(radiusText, TEXT_X, placeRadiusY);
    divider(div2);
  }

  info(LEFT, repeatTop, repIc, 'Repetir');
  value(TEXT_X, repeatTop, r.repeat, RIGHT - TEXT_X);

  c.textAlign = 'center'; c.fillStyle = '#767880'; c.font = `500 28px ${SANS}`;
  c.fillText(TAGLINE, W / 2, cardBottom + 64);

  const blob = await new Promise<Blob>((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail(new Error('imagem'))), 'image/jpeg', 0.94));
  const slug = fold(r.title).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'lembrete';
  return new File([blob], `lembrete-${slug}.jpg`, { type: 'image/jpeg' });
}

export type ShareResult = 'shared' | 'saved' | 'canceled';

/** Abre a folha de compartilhamento do sistema com a imagem; sem suporte a arquivos, baixa a imagem. */
export async function shareImageFile(file: File): Promise<ShareResult> {
  const data: ShareData = { files: [file], title: APP_NAME };
  if (navigator.canShare?.(data)) {
    try { await navigator.share(data); return 'shared'; }
    catch (e) { if ((e as DOMException).name === 'AbortError') return 'canceled'; /* outra falha: cai no download */ }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url; a.download = file.name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return 'saved';
}
