import { StyleSheet, Text, View } from 'react-native';
import { fundoEmDegrade } from '../design/efeitos';
import { colors, fontFamily, gradients, iconStroke, radius, size, space, textStyles } from '../design/tokens';
import { Icon } from './Icon';

/**
 * Marca do cabeçalho verde: tile menta com o símbolo, o nome e a frase. O nome vai em serifa negrito (o original usa um
 * peso a menos, que o app não carrega). Padrão: docs/DESIGN_SYSTEM.md, seção 11.6.
 */
export function AppBrand() {
  return (
    <View style={styles.marca} accessible accessibilityLabel="LembreiAi. Sua rotina, mais leve.">
      <View style={[styles.tile, fundoEmDegrade(gradients.marcaTile)]}>
        <Icon name="locate-fixed" size={size.header.brandGlyph} color={colors.brand.glyph} stroke={iconStroke.ui} />
      </View>
      <View>
        <Text style={styles.nome}>LembreiAi</Text>
        <Text style={styles.frase}>Sua rotina, mais leve.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  marca: { flexDirection: 'row', alignItems: 'center', gap: size.header.brandGap },
  tile: { width: size.header.brandTile, height: size.header.brandTile, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  nome: { ...textStyles.caption, fontFamily: fontFamily.serif, color: colors.text.onDarkWarm },
  frase: { ...textStyles.micro, color: colors.text.onDarkFaint, marginTop: space.hair },
});
