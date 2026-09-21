import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { anelDeFoco, type EstadoDeToque } from '../design/foco';
import { borderWidth, colors, fontFamily, opacity, radius, size, space, textStyles } from '../design/tokens';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

/** Estilo do chip por estado. Função pura e exportada (o foco de teclado só existe na web). */
export function estiloDoChip(selected: boolean, estado: EstadoDeToque, disabled: boolean): StyleProp<ViewStyle> {
  return [styles.chip, selected ? styles.ligado : styles.desligado, estado.pressed ? styles.pressionado : null, estado.focused ? anelDeFoco : null, disabled ? styles.desabilitado : null];
}

/** Opção de escolha rápida (repetição, raio). Padrão: docs/DESIGN_SYSTEM.md, seção 11.4. */
export function Chip({ label, selected, onPress, disabled = false }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={size.hitSlop}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      style={(estado: EstadoDeToque) => estiloDoChip(selected, estado, disabled)}
    >
      <Text style={[styles.rotulo, selected ? styles.rotuloLigado : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: size.chip,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: borderWidth.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ligado: { backgroundColor: colors.control.chipOn, borderColor: colors.control.chipOn },
  desligado: { backgroundColor: colors.control.chipOff, borderColor: colors.border.chip },
  pressionado: { opacity: opacity.pressed },
  desabilitado: { opacity: opacity.disabled },
  rotulo: { ...textStyles.body, color: colors.text.primary },
  rotuloLigado: { color: colors.text.onDark, fontFamily: fontFamily.semibold },
});
