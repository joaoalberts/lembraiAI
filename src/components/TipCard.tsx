import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, iconStroke, size, space, textStyles } from '../design/tokens';
import { Icon } from './Icon';

interface TipCardProps {
  title: string;
  text: string;
}

/**
 * "Dica para você" no fim da lista: cartão verde-menta com a lâmpada. Na lista é só informação (o original não o torna
 * tocável). Padrão: docs/DESIGN_SYSTEM.md, seção 11.1.
 */
export function TipCard({ title, text }: TipCardProps) {
  return (
    <View testID="dica" style={styles.cartao}>
      <View style={styles.circulo} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Icon name="lightbulb" size={size.icon.lg} color={colors.icon.tip} stroke={iconStroke.glyph} />
      </View>
      <View style={styles.texto}>
        <Text style={styles.titulo}>{title}</Text>
        <Text style={styles.corpo}>{text}</Text>
      </View>
      <Icon name="chevron-right" size={size.icon.md} color={colors.icon.default} stroke={iconStroke.action} />
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: { flexDirection: 'row', alignItems: 'center', gap: size.tip.gap, padding: size.tip.padding, borderRadius: size.tip.radius, backgroundColor: colors.feedback.infoBg },
  circulo: { width: size.tip.circle, height: size.tip.circle, borderRadius: size.tip.circle, backgroundColor: colors.feedback.tipCircle, alignItems: 'center', justifyContent: 'center' },
  texto: { flex: 1, gap: space.xs },
  titulo: { ...textStyles.body, fontFamily: fontFamily.bold, color: colors.text.primary },
  corpo: { ...textStyles.micro, color: colors.text.tip },
});
