import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { borderWidth, colors, radius, space, textStyles } from '../design/tokens';

export type BannerVariant = 'error' | 'success' | 'info';

interface BannerProps {
  variant: BannerVariant;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Padrão: docs/DESIGN_SYSTEM.md, seção 11.3. Sempre com texto: a cor não é o único sinal. */
const VISUAL: Record<BannerVariant, { fundo: string; texto: string }> = {
  error: { fundo: colors.feedback.dangerBg, texto: colors.text.danger },
  success: { fundo: colors.feedback.successBg, texto: colors.text.success },
  info: { fundo: colors.feedback.infoBg, texto: colors.text.primary },
};

export function Banner({ variant, children, style }: BannerProps) {
  const v = VISUAL[variant];
  return (
    <View
      testID="banner"
      accessibilityRole={variant === 'error' ? 'alert' : undefined}
      style={[styles.caixa, { backgroundColor: v.fundo }, variant === 'info' ? styles.faixa : null, style]}
    >
      <Text style={[styles.texto, { color: v.texto }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: { padding: space.md, borderRadius: radius.sm },
  faixa: { borderLeftWidth: borderWidth.bar, borderLeftColor: colors.feedback.infoBar },
  texto: { ...textStyles.body },
});
