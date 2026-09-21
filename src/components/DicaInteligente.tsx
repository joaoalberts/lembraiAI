import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { anelDeFoco, type EstadoDeToque } from '../design/foco';
import { colors, fontFamily, iconStroke, motion, radius, shadow, size, textStyles } from '../design/tokens';
import { Icon } from './Icon';

interface DicaInteligenteProps {
  onPress: () => void;
}

const TITULO = 'Dica inteligente';
const TEXTO = 'Crie lembretes recorrentes para não esquecer\ndas suas tarefas importantes.';

/** Estilo por estado. Função pura e exportada: o ponteiro em cima e o foco de teclado só existem na web. */
export function estiloDaDica(estado: EstadoDeToque): StyleProp<ViewStyle> {
  return [
    styles.cartao,
    estado.hovered ? { backgroundColor: colors.bg.field } : null,
    estado.pressed ? styles.pressionado : null,
    estado.focused ? anelDeFoco : null,
  ];
}

/**
 * Dica do fim da tela de sucesso: cartão claro que leva a criar outro lembrete (a dica é sobre lembretes recorrentes). É
 * um botão: ponteiro em cima clareia, pressionado encolhe um pouco. Não é o `TipCard` verde da lista, que só informa.
 * Padrão: docs/DESIGN_SYSTEM.md, seção 11.12.
 */
export function DicaInteligente({ onPress }: DicaInteligenteProps) {
  return (
    <Pressable testID="dica-inteligente" onPress={onPress} accessibilityRole="button" accessibilityLabel={`${TITULO}. ${TEXTO.replace('\n', ' ')}`} style={(estado: EstadoDeToque) => estiloDaDica(estado)}>
      <View style={styles.circulo} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Icon name="lightbulb" size={size.sucesso.dica.icon} color={colors.icon.default} stroke={iconStroke.glyph} />
      </View>
      <View style={styles.texto}>
        <Text style={styles.titulo}>{TITULO}</Text>
        <Text style={styles.corpo}>{TEXTO}</Text>
      </View>
      <Icon name="chevron-right" size={size.sucesso.dica.arrow} color={colors.icon.default} stroke={iconStroke.action} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cartao: {
    minHeight: size.sucesso.dica.height,
    flexDirection: 'row',
    alignItems: 'center',
    gap: size.sucesso.dica.gap,
    paddingLeft: size.sucesso.dica.left,
    paddingRight: size.sucesso.dica.right,
    borderRadius: radius.sheet,
    backgroundColor: colors.bg.card,
    boxShadow: shadow.cartaoDoSucesso,
  },
  pressionado: { transform: [{ scale: motion.pressedScale }] },
  circulo: { width: size.sucesso.dica.circle, height: size.sucesso.dica.circle, borderRadius: radius.pill, backgroundColor: colors.sucesso.dica, alignItems: 'center', justifyContent: 'center' },
  texto: { flex: 1, gap: size.sucesso.dica.textGap },
  titulo: { ...textStyles.micro, fontFamily: fontFamily.bold, color: colors.text.primary },
  corpo: { ...textStyles.micro, color: colors.text.secondary },
});
