import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, size, space, textStyles } from '../design/tokens';
import { forcaDaSenha } from '../lib/validacao';

const COR_DO_NIVEL = { 1: colors.conta.medidorFraco, 2: colors.conta.medidorMedio, 3: colors.conta.medidorForte } as const;

/**
 * Medidor de força da senha do cadastro e da redefinição (imagem 02): três barras finas, que acendem uma (vermelha), duas
 * (âmbar) ou três (verdes) conforme o que a senha já cumpre, e o rótulo em cinza. Só aparece com a senha digitada. É enfeite
 * para quem enxerga: o leitor de tela lê só o rótulo. Padrão: docs/DESIGN_SYSTEM.md, seção 11.15.
 */
export function MedidorDeSenha({ senha }: { senha: string }) {
  const { nivel, rotulo } = forcaDaSenha(senha);
  if (nivel === 0) return null;
  return (
    <View testID="medidor" accessible accessibilityLabel={rotulo} style={styles.linha}>
      <View style={styles.barras} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {[1, 2, 3].map((n) => (
          <View key={n} testID={`medidor-barra-${n}`} style={[styles.barra, { backgroundColor: n <= nivel ? COR_DO_NIVEL[nivel] : colors.control.off }]} />
        ))}
      </View>
      <Text style={styles.rotulo}>{rotulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: size.auth.medidorRotuloGap, marginTop: size.auth.medidorTop },
  barras: { flexDirection: 'row', gap: size.auth.medidorGap },
  barra: { width: space.xl, height: size.auth.medidorBarra, borderRadius: radius.pill },
  rotulo: { ...textStyles.micro, color: colors.text.secondary },
});
