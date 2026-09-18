import { useId, type CSSProperties } from 'react';
import { cx, du } from '../lib/du';
import s from './SuccessHero.module.css';

// Faíscas: ângulo (graus, negativo = para cima), quanto da elipse de alcance (k), tamanho (du), cor, atraso (s) e formato.
// Só sobem e vão para os lados: para baixo elas passariam por cima do título.
const SPARKS: { a: number; k: number; size: number; color: string; delay: number; star?: boolean }[] = [
  { a: -172, k: 1.0, size: 11, color: 'var(--mint-400)', delay: 0 },
  { a: -158, k: 1.1, size: 9, color: '#FFFFFF', delay: .06, star: true },
  { a: -142, k: .9, size: 12, color: 'var(--forest-600)', delay: .03 },
  { a: -126, k: 1.15, size: 10, color: 'var(--orange-500)', delay: .09 },
  { a: -110, k: .85, size: 9, color: 'var(--mint-400)', delay: .02, star: true },
  { a: -95, k: 1.1, size: 12, color: '#FFFFFF', delay: .07 },
  { a: -80, k: .95, size: 10, color: 'var(--mint-400)', delay: .04 },
  { a: -65, k: 1.15, size: 9, color: 'var(--forest-600)', delay: .1, star: true },
  { a: -50, k: .9, size: 12, color: '#FFFFFF', delay: .01 },
  { a: -36, k: 1.05, size: 10, color: 'var(--orange-500)', delay: .08 },
  { a: -22, k: .95, size: 9, color: 'var(--mint-400)', delay: .05, star: true },
  { a: -8, k: 1.1, size: 11, color: 'var(--forest-600)', delay: .02 },
  { a: 10, k: 1.0, size: 8, color: '#FFFFFF', delay: .11 },
  { a: 170, k: 1.0, size: 8, color: 'var(--mint-400)', delay: .09, star: true },
];

const spark = (p: (typeof SPARKS)[number]): CSSProperties => {
  const r = (p.a * Math.PI) / 180;
  return {
    ['--dx' as string]: du(Math.cos(r) * 300 * p.k), ['--dy' as string]: du(Math.sin(r) * 170 * p.k),
    ['--s' as string]: du(p.size * 1.8), ['--c' as string]: p.color, ['--delay' as string]: `${0.62 + p.delay}s`,
  };
};

/**
 * Marca de "lembrete criado": selo verde com check, brilho, anéis e ondas de raio, faíscas e brilho passando.
 * A animação é uma sequência de entrada (uma vez); depois só dois pontos cintilam devagar.
 * Fica centrada em (50%, 194 du), onde estava o ícone 3D da ref/4.png.
 */
export function SuccessHero() {
  const u = useId().replace(/:/g, '');
  return (
    <div className={s.hero} aria-hidden>
      <i className={s.glow} />
      <i className={s.ring} />
      <i className={s.disc} />
      <i className={s.ripple} />
      <i className={cx(s.ripple, s.late)} />
      {SPARKS.map((p) => <i key={p.a} className={cx(s.spark, p.star && s.star)} style={spark(p)} />)}
      <i className={s.twinkle} style={{ left: du(-150), top: du(-56) }} />
      <i className={cx(s.twinkle, s.twinkleB)} style={{ left: du(152), top: du(2) }} />

      <div className={s.badge}>
        <svg viewBox="0 0 142 142" width="100%" height="100%">
          <defs>
            <linearGradient id={`${u}b`} x1=".1" y1="0" x2=".9" y2="1">
              <stop offset="0" stopColor="#4B8A6C" /><stop offset=".5" stopColor="#1F5A43" /><stop offset="1" stopColor="#0B2A1B" />
            </linearGradient>
            <linearGradient id={`${u}s`} x1="0" y1=".5" x2="0" y2="1">
              <stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".3" />
            </linearGradient>
            <radialGradient id={`${u}h`} cx=".28" cy=".14" r=".8">
              <stop offset="0" stopColor="#fff" stopOpacity=".42" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <filter id={`${u}d`} x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity=".38" />
            </filter>
          </defs>
          <rect width="142" height="142" fill={`url(#${u}b)`} />
          <rect width="142" height="142" fill={`url(#${u}s)`} />
          <rect width="142" height="142" fill={`url(#${u}h)`} />
          <path className={s.check} pathLength={100} d="M42 74 L62 94 L101 50" fill="none" stroke="#F6F7F5" strokeWidth="14"
                strokeLinecap="round" strokeLinejoin="round" filter={`url(#${u}d)`} />
        </svg>
        <i className={s.shine} />
      </div>
    </div>
  );
}
