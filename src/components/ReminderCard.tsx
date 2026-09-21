import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_COLORS, repeatLabel, type Reminder } from '../data/reminders';
import { anelDeFoco, type EstadoDeToque } from '../design/foco';
import { ICON_NAME, UI_ICON } from '../design/icons';
import { borderWidth, colors, fontFamily, opacity, radius, shadow, size, space, textStyles } from '../design/tokens';
import { formatDate } from '../lib/format';
import { Toggle } from './Toggle';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

interface ReminderCardProps {
  reminder: Reminder;
  /** A pessoa está dentro do raio deste lembrete agora. */
  nearby?: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

/** Padrão: docs/DESIGN_SYSTEM.md, seção 11.1. */
export function ReminderCard({ reminder: r, nearby = false, onToggle, onDelete }: ReminderCardProps) {
  const cor = CATEGORY_COLORS[r.category];
  const meta = r.kind === 'local'
    ? `${r.place || 'Local escolhido'} · raio de ${r.radius} m`
    : `${formatDate(r.dateISO)} · ${r.time}${r.repeat !== 'never' ? ` · ${repeatLabel(r.repeat)}` : ''}`;

  return (
    <View
      testID="reminder-card"
      style={[styles.card, { borderLeftColor: cor.bar }, nearby && styles.nearby, !r.active && styles.inactive]}
    >
      {/* o ícone é decorativo: o título já diz tudo ao leitor de tela */}
      <View
        testID="reminder-icon"
        style={[styles.icon, { backgroundColor: cor.bg }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Ionicons name={ICON_NAME[r.icon] as IoniconName} size={size.icon.md} color={cor.ink} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{r.title}</Text>
        <Text style={styles.meta} numberOfLines={2}>{meta}</Text>
        {nearby && (
          <View style={styles.nearbyRow}>
            <Ionicons name={UI_ICON.aqui as IoniconName} size={size.icon.sm} color={colors.text.accent} />
            <Text style={styles.nearbyTag}>Você está aqui</Text>
          </View>
        )}
      </View>
      <View style={styles.actions}>
        <Toggle value={r.active} onValueChange={onToggle} accessibilityLabel={`Ativar lembrete ${r.title}`} />
        <Pressable
          onPress={onDelete}
          hitSlop={size.hitSlop}
          style={(estado: EstadoDeToque) => [styles.deleteBtn, estado.pressed && styles.deletePressed, estado.focused && anelDeFoco]}
          accessibilityRole="button"
          accessibilityLabel={`Excluir lembrete ${r.title}`}
        >
          <Ionicons name={UI_ICON.excluir as IoniconName} size={size.icon.md} color={colors.icon.muted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.md,
    borderRadius: radius.md,
    marginBottom: space.md,
    backgroundColor: colors.bg.card,
    borderLeftWidth: borderWidth.bar,
    boxShadow: shadow.card,
  },
  nearby: { outlineWidth: borderWidth.focus, outlineColor: colors.border.focus, outlineStyle: 'solid' },
  inactive: { opacity: opacity.inactive },
  icon: {
    width: size.iconCircle,
    height: size.iconCircle,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.md,
  },
  content: { flex: 1 },
  title: { ...textStyles.bodyLg, fontFamily: fontFamily.serif, color: colors.text.primary, marginBottom: space.hair },
  meta: { ...textStyles.caption, color: colors.text.secondary },
  nearbyRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginTop: space.xs },
  nearbyTag: { ...textStyles.caption, fontFamily: fontFamily.semibold, color: colors.text.accent },
  actions: { alignItems: 'center', marginLeft: space.sm, gap: space.xs },
  deleteBtn: { padding: space.sm, borderRadius: radius.pill },
  deletePressed: { backgroundColor: colors.control.chipOff },
});
