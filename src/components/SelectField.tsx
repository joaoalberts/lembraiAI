import { StyleSheet, Text, View } from 'react-native';
import { anelDeFoco, type EstadoDeToque } from '../design/foco';
import { colors, fontFamily, iconStroke, motion, opacity, radius, shadow, size, space, textStyles } from '../design/tokens';
import { Icon, type IconeNome } from './Icon';

import { Toque } from './Toque';
interface SelectFieldProps {
  /** Ícone à esquerda (calendário, relógio). Sem ícone o campo vira uma linha de duas linhas (o "Repetir"). */
  icon?: IconeNome;
  /** Rótulo pequeno em cima do valor: só no formato de duas linhas. */
  label?: string;
  value: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
  /** Seta do fim: para baixo (data e horário) ou para o lado (repetir). */
  chevron?: 'down' | 'right';
  /** Ícone grande à esquerda do formato de duas linhas. */
  leading?: IconeNome;
  /** O valor em destaque (o "Repetir" escolhido): negrito verde. */
  highlight?: boolean;
}

/** Estilo do campo por estado. Função pura e exportada (o ponteiro em cima e o foco só existem na web). */
export function estiloDoSeletor(estado: EstadoDeToque, desabilitado: boolean, duasLinhas: boolean) {
  return [
    styles.campo,
    duasLinhas ? styles.duasLinhas : null,
    estado.hovered && !desabilitado ? { boxShadow: shadow.fieldHover } : null,
    estado.pressed ? styles.pressionado : null,
    estado.focused ? anelDeFoco : null,
    desabilitado ? styles.desabilitado : null,
  ];
}

/**
 * Seletor do formulário: campo branco que abre uma folha (data, horário, repetição). Uma linha com ícone, valor e seta,
 * ou duas linhas (rótulo e valor) quando tem `label`. Desabilitado, esmaece e não responde ao toque.
 * Padrão: docs/DESIGN_SYSTEM.md, seção 11.11.
 */
export function SelectField({ icon, label, value, onPress, disabled = false, accessibilityLabel, chevron = 'down', leading, highlight = false }: SelectFieldProps) {
  const duasLinhas = label !== undefined;
  return (
    <Toque
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={(estado: EstadoDeToque) => estiloDoSeletor(estado, disabled, duasLinhas)}
    >
      {leading ? <Icon name={leading} size={size.icon.md} color={colors.icon.default} stroke={iconStroke.base} /> : null}
      {icon ? <Icon name={icon} size={size.form.fieldIcon} color={colors.icon.default} stroke={iconStroke.base} /> : null}
      {duasLinhas ? (
        <View style={styles.textos}>
          <Text style={styles.rotulo}>{label}</Text>
          <Text style={[styles.valorSuave, highlight ? styles.destaque : null]}>{value}</Text>
        </View>
      ) : (
        <Text style={styles.valor} numberOfLines={1}>{value}</Text>
      )}
      <Icon name={chevron === 'down' ? 'chevron-down' : 'chevron-right'} size={size.icon.sm} color={colors.icon.default} stroke={iconStroke.action} />
    </Toque>
  );
}

const styles = StyleSheet.create({
  campo: {
    height: size.form.field,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.field,
    backgroundColor: colors.bg.field,
    boxShadow: shadow.field,
  },
  duasLinhas: { height: undefined, minHeight: size.form.field, paddingVertical: space.sm },
  pressionado: { transform: [{ scale: motion.pressedScale }] },
  desabilitado: { opacity: opacity.disabled },
  valor: { ...textStyles.micro, fontFamily: fontFamily.medium, color: colors.text.primary, flex: 1 },
  textos: { flex: 1 },
  rotulo: { ...textStyles.micro, fontFamily: fontFamily.bold, color: colors.text.primary },
  valorSuave: { ...textStyles.micro, color: colors.text.secondary },
  destaque: { fontFamily: fontFamily.bold, color: colors.text.accent },
});
