import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { anelDeFoco, type EstadoDeToque } from '../design/foco';
import { borderWidth, colors, fontFamily, opacity, radius, size, space, textStyles } from '../design/tokens';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Quantos itens o chip mostraria (filtros da lista). Vai depois do rótulo. */
  count?: number;
  disabled?: boolean;
  /** Estilo de quem usa (na lista, os chips dividem a largura). */
  style?: StyleProp<ViewStyle>;
}

/** Estilo do chip por estado. Função pura e exportada (o foco de teclado só existe na web). */
export function estiloDoChip(selected: boolean, estado: EstadoDeToque, disabled: boolean, extra?: StyleProp<ViewStyle>): StyleProp<ViewStyle> {
  return [styles.chip, selected ? styles.ligado : styles.desligado, estado.pressed ? styles.pressionado : null, estado.focused ? anelDeFoco : null, disabled ? styles.desabilitado : null, extra];
}

/** Opção de escolha rápida, com ou sem contagem. Padrão: docs/DESIGN_SYSTEM.md, seção 11.4. */
export function Chip({ label, selected, onPress, count, disabled = false, style }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={size.hitSlop}
      accessibilityRole="button"
      accessibilityLabel={count === undefined ? label : `${label}: ${count}`}
      accessibilityState={{ selected, disabled }}
      style={(estado: EstadoDeToque) => estiloDoChip(selected, estado, disabled, style)}
    >
      <Text numberOfLines={1} style={[styles.rotulo, selected ? styles.rotuloLigado : null]}>{label}</Text>
      {count !== undefined ? <Text style={[styles.contagem, selected ? styles.rotuloLigado : null]}>{count}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: size.chip,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    borderWidth: borderWidth.hairline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.lg,
  },
  ligado: { backgroundColor: colors.control.chipOn, borderColor: colors.control.chipOn },
  desligado: { backgroundColor: colors.control.chipOff, borderColor: colors.border.chip },
  pressionado: { opacity: opacity.pressed },
  desabilitado: { opacity: opacity.disabled },
  rotulo: { ...textStyles.micro, fontFamily: fontFamily.bold, color: colors.text.chip, flexShrink: 1 },
  contagem: { ...textStyles.micro, fontFamily: fontFamily.semibold, color: colors.text.chipCount },
  rotuloLigado: { color: colors.text.onDark },
});
