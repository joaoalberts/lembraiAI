import { Pressable, StyleSheet, Text, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { borderWidth, colors, motion, opacity, radius, shadow, size, space, textStyles } from '../design/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

/** O ponteiro em cima e o foco de teclado só existem na web (react-native-web); no celular chegam `undefined`. */
export interface Estado {
  pressed: boolean;
  hovered?: boolean;
  focused?: boolean;
}

interface Visual {
  repouso: string;
  ponteiro: string;
  pressionado: string;
  rotulo: string;
  contorno?: string;
  brilho?: boolean;
}

/** Padrão: docs/DESIGN_SYSTEM.md, seção 9. */
const VISUAL: Record<ButtonVariant, Visual> = {
  primary: { repouso: colors.action.primary, ponteiro: colors.action.primaryHover, pressionado: colors.action.primaryPressed, rotulo: colors.text.onAction, brilho: true },
  secondary: { repouso: colors.action.secondary, ponteiro: colors.action.secondaryHover, pressionado: colors.action.secondaryPressed, rotulo: colors.text.onDark },
  ghost: { repouso: 'transparent', ponteiro: colors.bg.field, pressionado: colors.control.chipOff, rotulo: colors.text.primary, contorno: colors.border.strong },
  danger: { repouso: 'transparent', ponteiro: colors.bg.field, pressionado: colors.control.chipOff, rotulo: colors.text.danger, contorno: colors.border.danger },
};

/** Estilo do botão por variante e estado. Função pura e exportada: o ponteiro em cima e o foco só existem na web, então os testes chamam esta função em vez de simular o toque. */
export function estiloDoBotao(variant: ButtonVariant, estado: Estado, disabled: boolean, extra?: ViewStyle): StyleProp<ViewStyle> {
  const v = VISUAL[variant];
  return [
    styles.botao,
    { backgroundColor: estado.pressed ? v.pressionado : estado.hovered ? v.ponteiro : v.repouso },
    v.contorno ? { borderWidth: borderWidth.hairline, borderColor: v.contorno } : null,
    v.brilho && !disabled ? styles.brilho : null,
    estado.pressed ? styles.pressionado : null,
    estado.focused ? styles.foco : null,
    disabled ? styles.desabilitado : null,
    extra,
  ];
}

export function Button({ label, onPress, variant = 'primary', disabled = false, style, labelStyle }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={(estado: Estado) => estiloDoBotao(variant, estado, disabled, style)}
    >
      <Text style={[styles.rotulo, { color: VISUAL[variant].rotulo }, labelStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    minHeight: size.button,
    paddingHorizontal: space.xl,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotulo: { ...textStyles.button, textAlign: 'center' },
  brilho: { boxShadow: shadow.cta },
  pressionado: { transform: [{ scale: motion.pressedScale }] },
  foco: { outlineWidth: borderWidth.focus, outlineColor: colors.border.focus, outlineStyle: 'solid', outlineOffset: space.hair },
  desabilitado: { opacity: opacity.disabled },
});
