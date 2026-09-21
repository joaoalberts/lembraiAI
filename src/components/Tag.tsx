import { StyleSheet, Text, View } from 'react-native';
import type { Category } from '../data/reminders';
import { colors, fontFamily, iconStroke, radius, size, textStyles } from '../design/tokens';
import { Icon } from './Icon';

interface TagProps {
  kind: 'time' | 'local';
  category: Category;
}

/**
 * Etiqueta do cartão de lembrete: "Por horário" ou "Por local", na cor da categoria. O ícone é o pino nas duas (como no
 * original); o texto usa o `tagInk`, que dá 4,5:1 com o fundo. Padrão: docs/DESIGN_SYSTEM.md, seção 11.1.
 */
export function Tag({ kind, category }: TagProps) {
  const cor = colors.category[category];
  return (
    <View testID="tag" style={[styles.etiqueta, { backgroundColor: cor.tag }]}>
      <Icon name="map-pin" size={size.tag.icon} color={cor.fg} stroke={iconStroke.action} />
      <Text style={[styles.texto, { color: cor.tagInk }]}>{kind === 'local' ? 'Por local' : 'Por horário'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  etiqueta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: size.tag.height,
    paddingLeft: size.tag.left,
    paddingRight: size.tag.right,
    gap: size.tag.gap,
    borderRadius: radius.pill,
  },
  texto: { ...textStyles.micro, fontFamily: fontFamily.bold },
});
