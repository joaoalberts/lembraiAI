import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { anelDeFocoNoEscuro, type EstadoDeToque } from '../design/foco';
import { borderWidth, colors, fontFamily, iconStroke, motion, radius, size, space, textStyles } from '../design/tokens';
import { Icon, type IconeNome } from './Icon';

/** `cabecalho` = os botões do cabeçalho verde (busca, conta); `fechar` = o X menor, mais grosso, da tela de sucesso; `voltar` = a seta das telas de conta. */
type TamanhoDoVidro = 'cabecalho' | 'fechar' | 'voltar';

const MEDIDAS: Record<TamanhoDoVidro, { lado: number; icone: number; traco: number }> = {
  cabecalho: { lado: size.glassButton, icone: size.icon.md, traco: iconStroke.ui },
  fechar: { lado: size.sucesso.fechar, icone: size.sucesso.fecharIcon, traco: iconStroke.action },
  voltar: { lado: size.auth.voltar, icone: size.auth.voltarIcon, traco: iconStroke.action },
};

interface GlassButtonProps {
  icon: IconeNome;
  /** Nome do botão para o leitor de tela (o ícone sozinho não diz nada). */
  label: string;
  onPress: () => void;
  tamanho?: TamanhoDoVidro;
}

/** Estilo por estado. Função pura e exportada: o ponteiro em cima e o foco de teclado só existem na web. */
export function estiloDoVidro(estado: EstadoDeToque, lado: number = size.glassButton): StyleProp<ViewStyle> {
  return [
    styles.botao,
    { width: lado, height: lado },
    { backgroundColor: estado.pressed ? colors.glass.fillPressed : estado.hovered ? colors.glass.fillHover : colors.glass.fill },
    estado.pressed ? styles.pressionado : null,
    estado.focused ? anelDeFocoNoEscuro : null,
  ];
}

/**
 * Botão redondo de vidro sobre o cabeçalho verde (busca e conta). O véu é quase transparente, então o que se vê é o
 * contorno claro; o desfoque do original não aparece sobre um verde quase liso e não é reproduzido.
 * Padrão: docs/DESIGN_SYSTEM.md, seção 9.
 */
export function GlassButton({ icon, label, onPress, tamanho = 'cabecalho' }: GlassButtonProps) {
  const { lado, icone, traco } = MEDIDAS[tamanho];
  return (
    <Pressable
      onPress={onPress}
      hitSlop={(size.touch - lado) / 2}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={(estado: EstadoDeToque) => estiloDoVidro(estado, lado)}
    >
      <Icon name={icon} size={icone} color={colors.text.onDark} stroke={traco} />
    </Pressable>
  );
}

interface GlassPillProps {
  label: string;
  /** Ícone depois do texto (a seta do "Pular"). */
  icon: IconeNome;
  onPress: () => void;
}

/** O mesmo vidro em pílula, com texto e uma seta (o "Pular" do Onboarding). */
export function GlassPill({ label, icon, onPress }: GlassPillProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={(size.touch - size.onboarding.skipHeight) / 2}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={(estado: EstadoDeToque) => [estiloDoVidro(estado), styles.pilula]}
    >
      <Text style={styles.texto}>{label}</Text>
      <Icon name={icon} size={size.icon.sm} color={colors.text.onDark} stroke={iconStroke.action} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pilula: { width: size.onboarding.skipWidth, height: size.onboarding.skipHeight, flexDirection: 'row', gap: space.sm },
  texto: { ...textStyles.micro, fontFamily: fontFamily.semibold, color: colors.text.onDark },
  botao: {
    width: size.glassButton,
    height: size.glassButton,
    borderRadius: radius.pill,
    borderWidth: borderWidth.hairline,
    borderColor: colors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressionado: { transform: [{ scale: motion.pressedScale }] },
});
