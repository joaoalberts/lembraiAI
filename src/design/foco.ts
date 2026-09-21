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
 * Estado que o `Pressable` informa. `hovered` (ponteiro em cima) e `focused` (foco de teclado) só chegam na web
 * (react-native-web); no celular ficam `undefined`.
 */
export interface EstadoDeToque {
  pressed: boolean;
  hovered?: boolean;
  focused?: boolean;
}
