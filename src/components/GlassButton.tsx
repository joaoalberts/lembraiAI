import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { anelDeFocoNoEscuro, type EstadoDeToque } from '../design/foco';
import { borderWidth, colors, iconStroke, motion, radius, size } from '../design/tokens';
import { Icon, type IconeNome } from './Icon';

interface GlassButtonProps {
  icon: IconeNome;
  /** Nome do botão para o leitor de tela (o ícone sozinho não diz nada). */
  label: string;
  onPress: () => void;
}

/** Estilo por estado. Função pura e exportada: o ponteiro em cima e o foco de teclado só existem na web. */
export function estiloDoVidro(estado: EstadoDeToque): StyleProp<ViewStyle> {
  return [
    styles.botao,
    { backgroundColor: estado.pressed ? colors.glass.fillPressed : estado.hovered ? colors.glass.fillHover : colors.glass.fill },
    estado.pressed ? styles.pressionado : null,
    estado.focused ? anelDeFocoNoEscuro : null,
  ];
}

/**
 * Botão redondo de vidro sobre o cabeçalho verde (busca e conta). O véu é quase transparente, então o que se vê é o
 * contorno claro; o desfoque do original não aparece sobre um verde quase liso e não é reproduzido.
 * Padrão: docs/DESIGN_SYSTEM.md, seção 9.
 */
export function GlassButton({ icon, label, onPress }: GlassButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={(size.touch - size.glassButton) / 2}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={(estado: EstadoDeToque) => estiloDoVidro(estado)}
    >
      <Icon name={icon} size={size.icon.md} color={colors.text.onDark} stroke={iconStroke.ui} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    width: size.glassButton,
    height: size.glassButton,
    borderRadius: radius.pill,
    borderWidth: borderWidth.hairline,
    borderColor: colors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressionado: { transform: [{ scale: motion.pressedScale }] },
});
