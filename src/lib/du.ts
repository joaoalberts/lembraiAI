/** 1 du = 1 px da imagem de referência (frame de 851 px). Ver vite.config.ts e tokens.css. */
export const du = (n: number) => `calc(${n} * var(--u))`;
export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ');

import type { CSSProperties } from 'react';
/** Posição (canto superior esquerdo) e tamanho, em du. */
export const box = (left: number, top: number, w?: number, h?: number): CSSProperties => ({
  position: 'absolute', left: du(left), top: du(top), ...(w !== undefined ? { width: du(w) } : {}), ...(h !== undefined ? { height: du(h) } : {}),
});
/** Âncoras de texto pelo centro vertical: use com as classes globais .at (esq.), .atc (centro), .atr (dir.). */
export const at = (x: number, cy: number, extra?: CSSProperties): CSSProperties => ({ position: 'absolute', left: du(x), top: du(cy), ...extra });
