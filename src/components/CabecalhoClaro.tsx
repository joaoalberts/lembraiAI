import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { fundoEmDegrade } from '../design/efeitos';
import { colors, gradients, size } from '../design/tokens';

/** Arte do topo do formulário, em unidades da arte de 851 por 440: o centro dos anéis, os raios e a força de cada um (a máscara radial do original os esmaece de dentro para fora). */
const ANEIS = { centroX: 701, centroY: 70, largura: 851, altura: 440, raios: [67, 135, 203, 271, 339], forca: [0.28, 0.22, 0.16, 0.09, 0.03] } as const;

/**
 * Fundo do cabeçalho claro do formulário: névoa menta em degradê (`gradients.cabecalhoClaro`) com cinco anéis concêntricos
 * brancos no canto de cima à direita. `extra` é o quanto o conteúdo desceu por causa da barra de status do aparelho.
 * Só enfeite: não recebe toque nem é lido pelo leitor de tela. Padrão: docs/DESIGN_SYSTEM.md, seção 11.11.
 */
export function CabecalhoClaro({ extra = 0 }: { extra?: number }) {
  return (
    <View testID="cabecalho-claro" style={[styles.fundo, fundoEmDegrade(gradients.cabecalhoClaro), { height: size.form.header + extra }]}>
      <Svg width="100%" height={size.form.header} viewBox={`0 0 ${ANEIS.largura} ${ANEIS.altura}`} preserveAspectRatio="xMaxYMin slice" fill="none">
        {ANEIS.raios.map((r, i) => (
          <Circle key={r} cx={ANEIS.centroX} cy={ANEIS.centroY} r={r} stroke={colors.bg.field} strokeOpacity={ANEIS.forca[i]} strokeWidth={2} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  fundo: { position: 'absolute', top: 0, left: 0, right: 0, overflow: 'hidden', pointerEvents: 'none' },
});
