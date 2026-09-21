import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { borderWidth, colors, iconStroke, lineHeight, radius, size, space, textStyles } from '../design/tokens';
import { Icon, type IconeNome } from './Icon';

export type BannerVariant = 'error' | 'success' | 'info';

interface BannerProps {
  variant: BannerVariant;
  children: ReactNode;
  /** Ícone antes do texto, na cor dele (alerta no erro, visto no sucesso): o segundo sinal além da cor. */
  icon?: IconeNome;
  style?: StyleProp<ViewStyle>;
}

/** Padrão: docs/DESIGN_SYSTEM.md, seção 11.3. Sempre com texto: a cor não é o único sinal. */
const VISUAL: Record<BannerVariant, { fundo: string; texto: string }> = {
  error: { fundo: colors.feedback.errorBg, texto: colors.feedback.errorInk },
  success: { fundo: colors.feedback.successBg, texto: colors.text.success },
  info: { fundo: colors.feedback.infoBg, texto: colors.text.primary },
};

export function Banner({ variant, children, icon, style }: BannerProps) {
  const v = VISUAL[variant];
  return (
    <View
      testID="banner"
      accessibilityRole={variant === 'error' ? 'alert' : undefined}
      style={[styles.caixa, { backgroundColor: v.fundo }, variant === 'info' ? styles.faixa : null, style]}
    >
      {icon ? (
        <View style={styles.icone}>
          <Icon name={icon} size={size.icon.xs} color={v.texto} stroke={iconStroke.ui} />
        </View>
      ) : null}
      <Text style={[styles.texto, { color: v.texto }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, padding: space.md, borderRadius: radius.sm },
  faixa: { borderLeftWidth: borderWidth.bar, borderLeftColor: colors.feedback.infoBar },
  // o ícone fica alinhado ao meio da primeira linha
  icone: { marginTop: (lineHeight.body - size.icon.xs) / 2 },
  texto: { ...textStyles.body, flex: 1 },
});
