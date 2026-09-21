import type { ComponentProps } from 'react';
import { useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Banner } from '../../src/components/Banner';
import { Button } from '../../src/components/Button';
import { Chip } from '../../src/components/Chip';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { TextField } from '../../src/components/TextField';
import { DEFAULT_RADIUS, RADIUS_OPTIONS, REPEAT_OPTIONS, type RepeatKey } from '../../src/data/reminders';
import { UI_ICON } from '../../src/design/icons';
import { borderWidth, colors, radius as raios, size, space, textStyles } from '../../src/design/tokens';
import { formatDistance } from '../../src/lib/geo';
import { todayISO, toDate } from '../../src/lib/format';
import { useGeo } from '../../src/state/geo';
import { useReminders } from '../../src/state/reminders';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type Kind = 'time' | 'local';
interface Coord { lat: number; lng: number; accuracy: number | null }

const TIPOS = [{ key: 'time', label: 'Por horário' }, { key: 'local', label: 'Por local' }] as const;

export default function NovoLembreteScreen() {
  const { create } = useReminders();
  const { getCurrentPosition } = useGeo();
  const [kind, setKind] = useState<Kind>('time');
  const [title, setTitle] = useState('');
  const [dateISO, setDateISO] = useState(todayISO());
  const [time, setTime] = useState('09:00');
  const [repeat, setRepeat] = useState<RepeatKey>('never');
  const [place, setPlace] = useState('');
  const [coord, setCoord] = useState<Coord | null>(null);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const busy = saving || locating;

  const reset = () => {
    setKind('time'); setTitle(''); setDateISO(todayISO()); setTime('09:00'); setRepeat('never');
    setPlace(''); setCoord(null); setRadius(DEFAULT_RADIUS); setError('');
  };

  const useMyLocation = async () => {
    setLocating(true);
    setError('');
    const p = await getCurrentPosition();
    setLocating(false);
    if (!p) {
      setError('Não consegui ler sua localização. Verifique a permissão nos ajustes do aparelho.');
      return;
    }
    setCoord({ lat: p.lat, lng: p.lng, accuracy: p.accuracy });
  };

  const save = async () => {
    const t = title.trim();
    if (!t) { setError('Dê um título ao lembrete.'); return; }
    if (t.length > 200) { setError('O título pode ter no máximo 200 caracteres.'); return; }
    if (!toDate(dateISO, time)) { setError('Data ou hora inválida. Use AAAA-MM-DD e HH:MM.'); return; }
    if (kind === 'local' && !coord) { setError('Defina o local: toque em "Usar minha localização".'); return; }

    setSaving(true);
    setError('');
    const novo = await create({
      title: t,
      kind,
      dateISO,
      time,
      repeat: kind === 'time' ? repeat : 'never',
      place,
      lat: coord?.lat,
      lng: coord?.lng,
      radius,
    });
    setSaving(false);
    if (!novo) { setError('Não foi possível criar o lembrete. Tente de novo.'); return; }
    reset();
    router.navigate('/');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {error !== '' && <Banner variant="error" style={styles.aviso}>{error}</Banner>}

      <TextField label="Título *" placeholder="O que você quer lembrar?" value={title} onChangeText={setTitle} editable={!busy} />

      <Text style={styles.label}>Avisar</Text>
      <SegmentedControl options={TIPOS} value={kind} onChange={setKind} disabled={busy} />

      <TextField label="Data (AAAA-MM-DD)" placeholder="2026-09-20" value={dateISO} onChangeText={setDateISO} editable={!busy} />
      <TextField label="Hora (HH:MM)" placeholder="09:00" value={time} onChangeText={setTime} editable={!busy} />

      {kind === 'time' ? (
        <View style={styles.block}>
          <Text style={styles.label}>Repetir</Text>
          <View style={styles.chips}>
            {REPEAT_OPTIONS.map((o) => (
              <Chip key={o.key} label={o.label} selected={repeat === o.key} onPress={() => setRepeat(o.key)} disabled={busy} />
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.block}>
          <TextField label="Nome do local (opcional)" placeholder="Ex.: Mercado da esquina" value={place} onChangeText={setPlace} editable={!busy} />

          {coord ? (
            <View style={styles.coordCard}>
              <View style={styles.coordTitleRow}>
                <Ionicons name={UI_ICON.definido as IoniconName} size={size.icon.md} color={colors.text.accent} />
                <Text style={styles.coordTitle}>Local definido</Text>
              </View>
              <Text style={styles.coordText}>
                {coord.lat.toFixed(5)}, {coord.lng.toFixed(5)}
                {coord.accuracy != null ? ` · precisão de ${formatDistance(coord.accuracy)}` : ''}
              </Text>
              <Button label="Usar minha localização de novo" onPress={useMyLocation} variant="ghost" disabled={busy} />
            </View>
          ) : (
            <Button label={locating ? 'Buscando...' : 'Usar minha localização'} onPress={useMyLocation} variant="secondary" disabled={busy} />
          )}

          <Text style={[styles.label, styles.radiusLabel]}>Raio de aviso</Text>
          <View style={styles.chips}>
            {RADIUS_OPTIONS.map((r) => (
              <Chip key={r} label={`${r} m`} selected={radius === r} onPress={() => setRadius(r)} disabled={busy} />
            ))}
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <Button label={saving ? 'Criando...' : 'Criar lembrete'} onPress={save} disabled={busy} />
        <Button label="Cancelar" onPress={() => { reset(); router.navigate('/'); }} variant="ghost" disabled={busy} />
      </View>

      {busy && (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.spinner} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.page },
  content: { padding: space.lg, paddingBottom: space.huge },
  aviso: { marginBottom: space.lg },
  label: { ...textStyles.label, color: colors.text.primary, marginBottom: space.sm },
  radiusLabel: { marginTop: space.lg },
  block: { marginTop: space.xs, marginBottom: space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  coordCard: {
    backgroundColor: colors.feedback.infoBg,
    borderRadius: raios.sm,
    padding: space.md,
    borderLeftWidth: borderWidth.bar,
    borderLeftColor: colors.feedback.infoBar,
  },
  coordTitleRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginBottom: space.xs },
  coordTitle: { ...textStyles.label, color: colors.text.primary },
  coordText: { ...textStyles.caption, color: colors.text.secondary, marginBottom: space.sm },
  actions: { marginTop: space.xl, gap: space.md },
  loading: { alignItems: 'center', marginTop: space.lg },
});
