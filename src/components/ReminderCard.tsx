import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { CATEGORY_COLORS, ICON_EMOJI, repeatLabel, type Reminder } from '../data/reminders';
import { formatDate } from '../lib/format';

interface ReminderCardProps {
  reminder: Reminder;
  /** A pessoa está dentro do raio deste lembrete agora. */
  nearby?: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

export function ReminderCard({ reminder: r, nearby = false, onToggle, onDelete }: ReminderCardProps) {
  const colors = CATEGORY_COLORS[r.category];
  const meta = r.kind === 'local'
    ? `${r.place || 'Local escolhido'} · raio de ${r.radius} m`
    : `${formatDate(r.dateISO)} · ${r.time}${r.repeat !== 'never' ? ` · ${repeatLabel(r.repeat)}` : ''}`;

  return (
    <View style={[styles.card, { backgroundColor: colors.bg }, nearby && styles.nearby, !r.active && styles.inactive]}>
      <View style={[styles.icon, { backgroundColor: colors.pin }]}>
        <Text style={styles.iconText}>{ICON_EMOJI[r.icon]}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{r.title}</Text>
        <Text style={styles.meta} numberOfLines={2}>{meta}</Text>
        {nearby && <Text style={styles.nearbyTag}>📍 Você está aqui</Text>}
      </View>
      <View style={styles.actions}>
        <Switch value={r.active} onValueChange={onToggle} accessibilityLabel={`Ativar lembrete ${r.title}`} />
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteBtn}
          accessibilityRole="button"
          accessibilityLabel={`Excluir lembrete ${r.title}`}
        >
          <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  nearby: { borderColor: '#FE532A' },
  inactive: { opacity: 0.55 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: { fontSize: 22 },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: '#0A0A0A', marginBottom: 2 },
  meta: { fontSize: 13, color: '#4A4C52' },
  nearbyTag: { fontSize: 12, fontWeight: '600', color: '#FE532A', marginTop: 4 },
  actions: { alignItems: 'center', marginLeft: 8 },
  deleteBtn: { padding: 8 },
  deleteIcon: { fontSize: 16, fontWeight: 'bold', color: '#767880' },
});
