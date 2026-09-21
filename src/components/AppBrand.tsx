import { StyleSheet, Text, View } from 'react-native';
import { fundoEmDegrade } from '../design/efeitos';
import { colors, fontFamily, gradients, iconStroke, radius, size, space, textStyles } from '../design/tokens';

interface AppBrandProps {
  /** `lista` = nos cabeçalhos verdes (nome em serifa); `onboarding` = na abertura (nome em sans, com o "Ai" em destaque). */
  variant?: 'lista' | 'onboarding';
}
import { Icon } from './Icon';

/**
 * Marca do cabeçalho verde: tile menta com o símbolo, o nome e a frase. O nome vai em serifa negrito (o original usa um
 * peso a menos, que o app não carrega). Padrão: docs/DESIGN_SYSTEM.md, seção 11.6.
 */
export function AppBrand({ variant = 'lista' }: AppBrandProps) {
  const abertura = variant === 'onboarding';
  return (
    <View style={styles.marca} accessible accessibilityLabel="LembreiAi. Sua rotina, mais leve.">
      <View style={[styles.tile, fundoEmDegrade(gradients.marcaTile)]}>
        <Icon name="locate-fixed" size={abertura ? size.icon.lg : size.header.brandGlyph} color={colors.brand.glyph} stroke={iconStroke.ui} />
      </View>
      <View>
        {abertura ? (
          <Text style={styles.nomeDaAbertura}>Lembrei<Text style={styles.acento}>Ai</Text></Text>
        ) : (
          <Text style={styles.nome}>LembreiAi</Text>
        )}
        <Text style={abertura ? styles.fraseDaAbertura : styles.frase}>Sua rotina, mais leve.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  marca: { flexDirection: 'row', alignItems: 'center', gap: size.header.brandGap },
  tile: { width: size.header.brandTile, height: size.header.brandTile, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  nome: { ...textStyles.caption, fontFamily: fontFamily.serif, color: colors.text.onDarkWarm },
  nomeDaAbertura: { fontFamily: fontFamily.bold, fontSize: size.onboarding.brandName, lineHeight: size.onboarding.brandName + space.xs, color: colors.text.onDarkWarm },
  acento: { color: colors.text.brandAccent },
  // 17,4 du (9 dp) nas listas e 21,3 du (11 dp) na abertura, como no original
  frase: { ...textStyles.pico, color: colors.text.onDarkFaint, marginTop: space.hair },
  fraseDaAbertura: { ...textStyles.mini, color: colors.text.onDarkFaint, marginTop: space.hair },
});
