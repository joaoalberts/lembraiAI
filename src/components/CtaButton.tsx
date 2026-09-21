import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type EstadoDeToque } from '../design/foco';
import { colors, fontFamily, fontSize, iconStroke, radius, size } from '../design/tokens';
import { estiloDoBotao } from './Button';
import { Icon } from './Icon';

interface CtaButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * Botão principal do formulário: laranja, com o rótulo em serifa centralizado no botão inteiro e a seta num círculo claro
 * à direita. Usa as cores e os estados do `Button` primário (ponteiro, pressionado, foco, desabilitado).
 * Padrão: docs/DESIGN_SYSTEM.md, seção 11.11.
 */
export function CtaButton({ label, onPress, disabled = false }: CtaButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={(estado: EstadoDeToque) => [estiloDoBotao('primary', estado, disabled), styles.botao]}
    >
      <Text style={styles.rotulo}>{label}</Text>
      <View testID="cta-seta" style={styles.circulo}>
        <Icon name="arrow-right" size={size.icon.md} color={colors.text.onAction} stroke={iconStroke.ui} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: { minHeight: size.form.cta },
  rotulo: { fontFamily: fontFamily.serif, fontSize: fontSize.bodyLg, color: colors.text.onAction, textAlign: 'center' },
  circulo: { position: 'absolute', right: size.form.cta / 2 - size.form.ctaCircle / 2, width: size.form.ctaCircle, height: size.form.ctaCircle, borderRadius: radius.pill, backgroundColor: colors.glass.ctaCircle, alignItems: 'center', justifyContent: 'center' },
});
