import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadow, size } from '../design/tokens';

/** Cartão do formulário de novo lembrete (padrão: docs/DESIGN_SYSTEM.md, seção 11.11): superfície de cartão com anel branco por dentro e sombra suave. */
export function FormCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.cartao, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  cartao: { padding: size.form.cardPadding, borderRadius: radius.form, backgroundColor: colors.bg.card, boxShadow: shadow.formCard },
});
