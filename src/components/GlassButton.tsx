import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { anelDeFocoNoEscuro, type EstadoDeToque } from '../design/foco';
import { borderWidth, colors, fontFamily, iconStroke, motion, radius, size, space, textStyles } from '../design/tokens';
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

interface GlassPillProps {
  label: string;
  /** Ícone depois do texto (a seta do "Pular"). */
  icon: IconeNome;
  onPress: () => void;
}

/** O mesmo vidro em pílula, com texto e uma seta (o "Pular" do Onboarding). */
export function GlassPill({ label, icon, onPress }: GlassPillProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={(size.touch - size.onboarding.skipHeight) / 2}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={(estado: EstadoDeToque) => [estiloDoVidro(estado), styles.pilula]}
    >
      <Text style={styles.texto}>{label}</Text>
      <Icon name={icon} size={size.icon.sm} color={colors.text.onDark} stroke={iconStroke.action} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pilula: { width: size.onboarding.skipWidth, height: size.onboarding.skipHeight, flexDirection: 'row', gap: space.sm },
  texto: { ...textStyles.micro, fontFamily: fontFamily.semibold, color: colors.text.onDark },
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
