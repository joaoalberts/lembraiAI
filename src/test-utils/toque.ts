import { fireEvent } from '@testing-library/react-native';
import type { Insets } from 'react-native';

/** O elemento que o RNTL devolve (o que `getByRole` acha): só o que o auxiliar lê e dispara. */
type Elemento = Parameters<typeof fireEvent>[0];

/**
 * Mede o controle com o tamanho visual dado (o que o layout do aparelho informaria) e devolve o alvo de toque efetivo: o
 * tamanho visual somado à folga que o `Toque` pôs. Só existe em testes. Uso: `expect((await alvoDeToque(botao, 36, 36)).altura).toBeGreaterThanOrEqual(size.touch)`.
 */
export async function alvoDeToque(elemento: Elemento & { props: { hitSlop?: Insets | number | null } }, largura: number, altura: number) {
  await fireEvent(elemento, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: largura, height: altura } } });
  const bruta = elemento.props.hitSlop;
  const f: Insets = typeof bruta === 'number' ? { top: bruta, bottom: bruta, left: bruta, right: bruta } : (bruta ?? {});
  return { largura: largura + (f.left ?? 0) + (f.right ?? 0), altura: altura + (f.top ?? 0) + (f.bottom ?? 0) };
}
