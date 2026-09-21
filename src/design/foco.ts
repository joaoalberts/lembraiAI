/**
 * Foco de teclado (web). O mesmo anel vale para todo controle que se toca: botão, chip, opção do segmentado,
 * lixeira do cartão e fechar da folha. Padrão: docs/DESIGN_SYSTEM.md, seção 16. Sem imports de React Native.
 */
import { borderWidth, colors, space } from './tokens';

/** Anel sólido de 2, verde-floresta, afastado 2 da borda (o padrão do navegador é âmbar e fino). */
export const anelDeFoco = {
  outlineWidth: borderWidth.focus,
  outlineColor: colors.border.focus,
  outlineStyle: 'solid',
  outlineOffset: space.hair,
} as const;

/**
 * Campo de texto que desenha o próprio foco (borda e halo): tira o anel do navegador. Na web `outline-style: auto` ignora
 * a largura zero e o anel âmbar do navegador apareceria por cima; o `none` só vale na web (no celular o valor é inválido).
 */
export const semAnelDoNavegador: { outlineWidth: number } = {
  outlineWidth: 0,
  ...(process.env.EXPO_OS === 'web' ? ({ outlineStyle: 'none' } as unknown as object) : null),
};

/** O mesmo anel para controles sobre o verde escuro, onde o verde-floresta some: menta. */
export const anelDeFocoNoEscuro = {
  ...anelDeFoco,
  outlineColor: colors.border.focusOnDark,
} as const;

/**
 * Estado que o `Pressable` informa. `hovered` (ponteiro em cima) e `focused` (foco de teclado) só chegam na web
 * (react-native-web); no celular ficam `undefined`.
 */
export interface EstadoDeToque {
  pressed: boolean;
  hovered?: boolean;
  focused?: boolean;
}
