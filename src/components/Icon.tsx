import type { LucideIcon } from 'lucide-react';
import { du } from '../lib/du';

interface IconProps {
  icon: LucideIcon;
  size: number;          // em du
  stroke?: number;       // espessura no viewBox de 24
  color?: string;
  fill?: string;
  rotate?: number;       // graus (haltere/avião do Lucide são diagonais; a referência os usa retos)
  className?: string;
}

/** Ícone Lucide dimensionado em `du`. Estilo: contorno, traço uniforme, pontas arredondadas. */
export function Icon({ icon: I, size, stroke = 2, color, fill, rotate, className }: IconProps) {
  return (
    <I aria-hidden focusable={false} className={className} strokeWidth={stroke}
       {...(color ? { color } : {})} {...(fill ? { fill } : {})}
       style={{ width: du(size), height: du(size), flex: 'none', ...(rotate ? { transform: `rotate(${rotate}deg)` } : {}) }} />
  );
}

/** "Raio de X metros": ícone de radar/anéis (custom — o Lucide não tem equivalente exato). */
export function RadiusIcon({ size, color = 'currentColor' }: { size: number; color?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round"
         style={{ width: du(size), height: du(size), flex: 'none' }}>
      <circle cx="12" cy="12" r="2.2" fill={color} stroke="none" />
      <circle cx="12" cy="12" r="6" strokeDasharray="1.2 2.6" />
      <circle cx="12" cy="12" r="10" strokeDasharray="1.2 3.4" />
    </svg>
  );
}

/** Cadeado sólido (ref/1.png): corpo preenchido, argola em traço, furo na cor do fundo. */
export function LockIcon({ size, hole = '#183826' }: { size: number; hole?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" style={{ width: du(size), height: du(size), flex: 'none' }}>
      <path d="M7.6 10.6V7.6a4.4 4.4 0 0 1 8.8 0v3" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
      <rect x="4.2" y="10.4" width="15.6" height="11.6" rx="2.6" fill="currentColor" />
      <circle cx="12" cy="15.2" r="1.5" fill={hole} />
      <rect x="11.3" y="15.6" width="1.4" height="3.2" rx=".6" fill={hole} />
    </svg>
  );
}

/** Pino sólido do mapa (forest-pin com ponto branco). Medidas do 2.png: 58 × 73 du. */
export function MapPin({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg aria-hidden viewBox="0 0 58 73" className={className} style={style}>
      <path d="M29 0C13 0 0 12.6 0 28.4 0 49.6 29 73 29 73s29-23.4 29-44.6C58 12.6 45 0 29 0Z" fill="var(--pin-fill, var(--forest-pin))" />
      <circle cx="29" cy="28" r="10" fill="#fff" />
    </svg>
  );
}
