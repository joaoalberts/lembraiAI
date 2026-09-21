import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { anelDeFoco, type EstadoDeToque } from '../design/foco';
import { colors, fontFamily, iconStroke, motion, size, textStyles } from '../design/tokens';
import { Icon, type IconeNome } from './Icon';

interface BotaoDeAcaoProps {
  icon: IconeNome;
  label: string;
  onPress: () => void;
}

/** Estilo por estado. Função pura e exportada: o ponteiro em cima e o foco de teclado só existem na web. */
export function estiloDaAcao(estado: EstadoDeToque): StyleProp<ViewStyle> {
  return [
    styles.botao,
    { backgroundColor: estado.pressed ? colors.action.frostPressed : estado.hovered ? colors.action.frostHover : colors.action.frost },
    estado.pressed ? styles.pressionado : null,
    estado.focused ? anelDeFoco : null,
  ];
}

/**
 * Uma das três ações da tela de sucesso (Editar, Excluir, Compartilhar): quadrado translúcido com o ícone em cima e o
 * rótulo embaixo. As três dividem a fileira em partes iguais. O rótulo é uma região viva: quando a ação responde trocando
 * o texto ("Copiado"), o leitor de tela lê. Padrão: docs/DESIGN_SYSTEM.md, seção 11.12.
 */
export function BotaoDeAcao({ icon, label, onPress }: BotaoDeAcaoProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={(estado: EstadoDeToque) => estiloDaAcao(estado)}>
      <Icon name={icon} size={size.sucesso.acao.icon} color={colors.icon.onFrost} stroke={iconStroke.base} />
      <Text accessibilityLiveRegion="polite" style={styles.rotulo}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: { flex: 1, minHeight: size.sucesso.acao.height, borderRadius: size.sucesso.acao.radius, alignItems: 'center', paddingTop: size.sucesso.acao.top, gap: size.sucesso.acao.iconGap },
  pressionado: { transform: [{ scale: motion.pressedScale }] },
  rotulo: { ...textStyles.micro, fontFamily: fontFamily.medium, color: colors.text.onFrost, textAlign: 'center' },
});
