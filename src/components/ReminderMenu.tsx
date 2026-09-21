import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import type { Reminder } from '../data/reminders';
import { anelDeFoco, type EstadoDeToque } from '../design/foco';
import { UI_ICON } from '../design/icons';
import { borderWidth, colors, fontFamily, iconStroke, radius, size, space, textStyles } from '../design/tokens';
import { legendaDoLembrete } from '../lib/lista';
import { Icon, type IconeNome } from './Icon';
import { Sheet } from './Sheet';

interface ReminderMenuProps {
  /** O lembrete do menu aberto; `null` = fechado. */
  reminder: Reminder | null;
  onClose: () => void;
  /** Sem esta ação a linha Editar não aparece. */
  onEdit?: () => void;
  onDelete: () => void;
}

interface LinhaProps {
  icon: IconeNome;
  label: string;
  perigo?: boolean;
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

function Linha({ icon, label, perigo = false, primeira = false, onPress }: LinhaProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={(estado: EstadoDeToque) => estiloDaLinha(estado, perigo, primeira)}>
      <View style={[styles.circulo, { backgroundColor: perigo ? colors.feedback.dangerCircle : colors.bg.iconCircle }]}>
        <Icon name={icon} size={size.menu.icon} color={perigo ? colors.text.danger : colors.icon.default} stroke={iconStroke.base} />
      </View>
      <Text style={[styles.texto, perigo ? { color: colors.text.danger } : null]}>{label}</Text>
    </Pressable>
  );
}

/**
 * Menu do lembrete (as reticências do cartão): uma folha com o título e a data e hora do lembrete, e as linhas Editar e
 * Excluir. Padrão: docs/DESIGN_SYSTEM.md, seção 11.5.
 */
export function ReminderMenu({ reminder, onClose, onEdit, onDelete }: ReminderMenuProps) {
  return (
    <Sheet visible={reminder !== null} onClose={onClose} title={reminder?.title ?? ''} subtitle={reminder ? legendaDoLembrete(reminder) : undefined}>
      <View style={styles.lista}>
        {onEdit ? <Linha icon="pencil" label="Editar" primeira onPress={onEdit} /> : null}
        <Linha icon={UI_ICON.excluir} label="Excluir" perigo primeira={!onEdit} onPress={onDelete} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  lista: { marginTop: size.menu.listTop, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.bg.field, borderWidth: borderWidth.hairline, borderColor: colors.border.field },
  linha: { minHeight: size.menu.row, flexDirection: 'row', alignItems: 'center', gap: size.menu.gap, paddingHorizontal: size.menu.paddingHorizontal },
  divisoria: { borderTopWidth: borderWidth.hairline, borderTopColor: colors.border.divider },
  circulo: { width: size.menu.circle, height: size.menu.circle, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  texto: { ...textStyles.body, fontFamily: fontFamily.bold, color: colors.text.primary, flexShrink: 1, marginRight: space.xs },
});
