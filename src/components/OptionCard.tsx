import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { anelDeFoco, type EstadoDeToque } from '../design/foco';
import { borderWidth, colors, fontFamily, iconStroke, motion, radius, shadow, size, space, textStyles } from '../design/tokens';
import { Icon, type IconeNome } from './Icon';

interface OptionCardProps {
  icon: IconeNome;
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  /** Vale sobre o estilo do cartão: o formulário dá a cada um o seu peso de largura. */
  style?: StyleProp<ViewStyle>;
}

/** Estilo do cartão por estado. Função pura e exportada (o ponteiro em cima e o foco só existem na web). */
export function estiloDoCartaoDeModo(selecionado: boolean, estado: EstadoDeToque, extra?: StyleProp<ViewStyle>) {
  return [
    styles.cartao,
    selecionado ? styles.escolhido : estado.hovered ? styles.ponteiro : null,
    estado.pressed ? styles.pressionado : null,
    estado.focused ? anelDeFoco : null,
    extra,
  ];
}

/**
 * Cartão de escolha de modo ("Por data e horário" e "Por local"): um dos dois fica escolhido, com o anel verde e o selo de
 * visto; o outro mostra só o anel vazio de opção. Padrão: docs/DESIGN_SYSTEM.md, seção 11.11.
 */
export function OptionCard({ icon, title, description, selected, onPress, style }: OptionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={title}
      aria-checked={selected}
      style={(estado: EstadoDeToque) => estiloDoCartaoDeModo(selected, estado, style)}
    >
      <View style={styles.circulo} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Icon name={icon} size={size.form.optionIcon} color={colors.icon.default} stroke={iconStroke.base} />
      </View>
      <View style={styles.textos}>
        <Text style={styles.titulo}>{title}</Text>
        <Text style={styles.descricao}>{description}</Text>
      </View>
      {selected ? (
        <View testID="opcao-selo" style={[styles.marca, styles.selo]}>
          <Icon name="check" size={size.form.optionCheck} color={colors.text.onDark} stroke={iconStroke.check} />
        </View>
      ) : (
        <View testID="opcao-anel" style={[styles.marca, styles.anel]} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cartao: {
    flex: 1,
    minHeight: size.form.option,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingLeft: space.md,
    // o texto não corre por baixo do selo (canto de cima à direita): a folga cobre a largura dele, a distância da borda e um respiro
    paddingRight: space.sm + size.form.optionBadge + space.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.bg.card,
    boxShadow: shadow.formCard,
  },
  escolhido: { backgroundColor: colors.bg.field, boxShadow: shadow.optionOn },
  ponteiro: { backgroundColor: colors.bg.field },
  pressionado: { transform: [{ scale: motion.pressedScale }] },
  circulo: { width: size.form.optionCircle, height: size.form.optionCircle, borderRadius: radius.pill, backgroundColor: colors.bg.iconCircle, alignItems: 'center', justifyContent: 'center' },
  textos: { flexShrink: 1 },
  titulo: { ...textStyles.micro, fontFamily: fontFamily.bold, color: colors.text.primary },
  descricao: { ...textStyles.micro, color: colors.text.secondary },
  marca: { position: 'absolute', right: space.sm, borderRadius: radius.pill },
  selo: { top: space.sm, width: size.form.optionBadge, height: size.form.optionBadge, backgroundColor: colors.control.badge, alignItems: 'center', justifyContent: 'center' },
  anel: { top: space.md, width: size.form.optionRadio, height: size.form.optionRadio, borderWidth: borderWidth.hairline, borderColor: colors.border.strong },
});
