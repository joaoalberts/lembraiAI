import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { anelDeFoco, type EstadoDeToque } from '../design/foco';
import { colors, fontFamily, opacity, size, textStyles } from '../design/tokens';

interface LinkButtonProps {
  label: string;
  onPress: () => void;
}

/** Estilo por estado. Função pura e exportada: o ponteiro em cima e o foco de teclado só existem na web. */
export function estiloDoLink(estado: EstadoDeToque): StyleProp<ViewStyle> {
  return [styles.link, estado.pressed ? { opacity: opacity.link } : null, estado.focused ? anelDeFoco : null];
}

/** Cinza de apoio; com o ponteiro em cima escurece. */
export const corDoLink = (estado: EstadoDeToque): string => (estado.hovered ? colors.text.primary : colors.text.secondary);

/**
 * Link de texto no fim de uma tela ("Criar outro lembrete"): sem fundo, em cinza, de largura total. O texto é curto e a
 * faixa é baixa, então a área de toque é completada até 44. Padrão: docs/DESIGN_SYSTEM.md, seção 11.12.
 */
export function LinkButton({ label, onPress }: LinkButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: (size.touch - size.sucesso.link) / 2, bottom: (size.touch - size.sucesso.link) / 2 }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={(estado: EstadoDeToque) => estiloDoLink(estado)}
    >
      {(estado: EstadoDeToque) => <Text style={[styles.texto, { color: corDoLink(estado) }]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: { minHeight: size.sucesso.link, alignItems: 'center', justifyContent: 'center' },
  texto: { ...textStyles.micro, fontFamily: fontFamily.medium, textAlign: 'center' },
});
