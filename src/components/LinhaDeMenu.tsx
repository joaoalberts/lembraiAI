import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { anelDeFoco, type EstadoDeToque } from '../design/foco';
import { borderWidth, colors, fontFamily, iconStroke, radius, size, space, textStyles } from '../design/tokens';
import { Icon, type IconeNome } from './Icon';

import { Toque } from './Toque';
interface LinhaDeMenuProps {
  icon: IconeNome;
  label: string;
  /** Linha de apoio embaixo do título, em cinza (a folha "Minha conta" tem; o menu do lembrete não). */
  descricao?: string;
  /** Ação sem volta (Excluir, Sair): círculo, ícone e título em vermelho. */
  perigo?: boolean;
  /** A primeira linha da lista não leva divisória em cima. */
  primeira?: boolean;
  onPress: () => void;
}

/** Estilo da linha por estado. Função pura e exportada: o ponteiro em cima e o foco só existem na web. */
export function estiloDaLinha(estado: EstadoDeToque, perigo: boolean, primeira: boolean): StyleProp<ViewStyle> {
  return [
    styles.linha,
    primeira ? null : styles.divisoria,
    estado.pressed ? { backgroundColor: perigo ? colors.control.dangerRowPressed : colors.control.rowPressed } : estado.hovered ? { backgroundColor: perigo ? colors.control.dangerRowHover : colors.control.rowHover } : null,
    estado.focused ? anelDeFoco : null,
  ];
}

/**
 * Linha de uma lista dentro de uma folha (menu do lembrete, folha "Minha conta"): círculo com o ícone, o título em negrito e,
 * se houver, a linha de apoio. Ícone e círculo ficam centrados (a captura da folha de conta os mostra no alto por um efeito
 * de CSS; o menu do lembrete, na imagem 11, os mostra no meio). Padrão: docs/DESIGN_SYSTEM.md, seção 11.5.
 */
export function LinhaDeMenu({ icon, label, descricao, perigo = false, primeira = false, onPress }: LinhaDeMenuProps) {
  return (
    <Toque
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={descricao ? `${label}. ${descricao}` : label}
      style={(estado: EstadoDeToque) => estiloDaLinha(estado, perigo, primeira)}
    >
      <View style={[styles.circulo, { backgroundColor: perigo ? colors.feedback.dangerCircle : colors.bg.iconCircle }]}>
        <Icon name={icon} size={size.menu.icon} color={perigo ? colors.text.danger : colors.icon.default} stroke={iconStroke.base} />
      </View>
      <View style={styles.textos}>
        <Text style={[styles.titulo, perigo ? { color: colors.text.danger } : null]}>{label}</Text>
        {descricao ? <Text style={styles.descricao}>{descricao}</Text> : null}
      </View>
    </Toque>
  );
}

/** A lista branca com o anel de campo que reúne as linhas (o `marginTop` é o vão até o título da folha). */
export const estiloDaListaDeLinhas = {
  marginTop: size.menu.listTop,
  borderRadius: radius.lg,
  overflow: 'hidden',
  backgroundColor: colors.bg.field,
  borderWidth: borderWidth.hairline,
  borderColor: colors.border.field,
} as const;

const styles = StyleSheet.create({
  linha: { minHeight: size.menu.row, flexDirection: 'row', alignItems: 'center', gap: size.menu.gap, paddingHorizontal: size.menu.paddingHorizontal },
  divisoria: { borderTopWidth: borderWidth.hairline, borderTopColor: colors.border.divider },
  circulo: { width: size.menu.circle, height: size.menu.circle, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  textos: { flex: 1, gap: space.hair },
  titulo: { ...textStyles.body, fontFamily: fontFamily.bold, color: colors.text.primary },
  descricao: { ...textStyles.micro, color: colors.text.secondary },
});
