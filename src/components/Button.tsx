import { Pressable, StyleSheet, Text, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { anelDeFoco, type EstadoDeToque } from '../design/foco';
import { borderWidth, colors, fontFamily, fontSize, iconStroke, lineHeight, motion, opacity, radius, shadow, size, space, textStyles } from '../design/tokens';
import { Icon, type IconeNome } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  /** Versão baixa e sem brilho, para caber num cabeçalho ("Novo lembrete"). */
  compact?: boolean;
  /** Ícone à esquerda do rótulo, na mesma cor dele. */
  icon?: IconeNome;
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
export function estiloDoBotao(variant: ButtonVariant, estado: EstadoDeToque, disabled: boolean, extra?: ViewStyle, compact = false): StyleProp<ViewStyle> {
  const v = VISUAL[variant];
  return [
    styles.botao,
    compact ? styles.compacto : null,
    { backgroundColor: estado.pressed ? v.pressionado : estado.hovered ? v.ponteiro : v.repouso },
    v.contorno ? { borderWidth: borderWidth.hairline, borderColor: v.contorno } : null,
    v.brilho && !disabled && !compact ? styles.brilho : null,
    estado.pressed ? styles.pressionado : null,
    estado.focused ? styles.foco : null,
    disabled ? styles.desabilitado : null,
    extra,
  ];
}

export function Button({ label, onPress, variant = 'primary', disabled = false, style, labelStyle, compact = false, icon }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={(estado: EstadoDeToque) => estiloDoBotao(variant, estado, disabled, style, compact)}
    >
      {icon ? <Icon name={icon} size={size.icon.xs} color={VISUAL[variant].rotulo} stroke={iconStroke.action} /> : null}
      <Text style={[styles.rotulo, compact ? styles.rotuloCompacto : null, { color: VISUAL[variant].rotulo }, labelStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    minHeight: size.button,
    paddingHorizontal: space.xl,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  compacto: { minHeight: size.buttonCompact, paddingHorizontal: space.lg },
  rotuloCompacto: { fontFamily: fontFamily.bold, fontSize: fontSize.micro, lineHeight: lineHeight.micro },
  rotulo: { ...textStyles.button, textAlign: 'center' },
  brilho: { boxShadow: shadow.cta },
  pressionado: { transform: [{ scale: motion.pressedScale }] },
  foco: anelDeFoco,
  desabilitado: { opacity: opacity.disabled },
});
