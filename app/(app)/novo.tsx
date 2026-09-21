import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../src/components/Button';
import { TextField } from '../../src/components/TextField';
import { DEFAULT_RADIUS, RADIUS_OPTIONS, REPEAT_OPTIONS, type RepeatKey } from '../../src/data/reminders';
import { formatDistance } from '../../src/lib/geo';
import { todayISO, toDate } from '../../src/lib/format';
import { useGeo } from '../../src/state/geo';
import { useReminders } from '../../src/state/reminders';

type Kind = 'time' | 'local';
interface Coord { lat: number; lng: number; accuracy: number | null }

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
      {error !== '' && <Text style={styles.errorBanner}>{error}</Text>}

      <TextField label="Título *" placeholder="O que você quer lembrar?" value={title} onChangeText={setTitle} editable={!busy} />

      <Text style={styles.label}>Avisar</Text>
      <View style={styles.segment}>
        {([['time', 'Por horário'], ['local', 'Por local']] as const).map(([k, rotulo]) => (
          <TouchableOpacity
            key={k}
            style={[styles.segmentItem, kind === k && styles.segmentActive]}
            onPress={() => setKind(k)}
            disabled={busy}
            accessibilityRole="button"
            accessibilityState={{ selected: kind === k }}
          >
            <Text style={[styles.segmentText, kind === k && styles.segmentTextActive]}>{rotulo}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextField label="Data (AAAA-MM-DD)" placeholder="2026-09-20" value={dateISO} onChangeText={setDateISO} editable={!busy} />
      <TextField label="Hora (HH:MM)" placeholder="09:00" value={time} onChangeText={setTime} editable={!busy} />

      {kind === 'time' ? (
        <View style={styles.block}>
          <Text style={styles.label}>Repetir</Text>
          <View style={styles.chips}>
            {REPEAT_OPTIONS.map((o) => (
              <TouchableOpacity
                key={o.key}
                style={[styles.chip, repeat === o.key && styles.chipActive]}
                onPress={() => setRepeat(o.key)}
                disabled={busy}
              >
                <Text style={[styles.chipText, repeat === o.key && styles.chipTextActive]}>{o.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.block}>
          <TextField label="Nome do local (opcional)" placeholder="Ex.: Mercado da esquina" value={place} onChangeText={setPlace} editable={!busy} />

          {coord ? (
            <View style={styles.coordCard}>
              <Text style={styles.coordTitle}>✓ Local definido</Text>
              <Text style={styles.coordText}>
                {coord.lat.toFixed(5)}, {coord.lng.toFixed(5)}
                {coord.accuracy != null ? ` · precisão de ${formatDistance(coord.accuracy)}` : ''}
              </Text>
              <Button label="Usar minha localização de novo" onPress={useMyLocation} variant="ghost" disabled={busy} />
            </View>
          ) : (
            <Button label={locating ? 'Buscando...' : '📍 Usar minha localização'} onPress={useMyLocation} variant="secondary" disabled={busy} />
          )}

          <Text style={[styles.label, styles.radiusLabel]}>Raio de aviso</Text>
          <View style={styles.chips}>
            {RADIUS_OPTIONS.map((r) => (
              <TouchableOpacity key={r} style={[styles.chip, radius === r && styles.chipActive]} onPress={() => setRadius(r)} disabled={busy}>
                <Text style={[styles.chipText, radius === r && styles.chipTextActive]}>{r} m</Text>
              </TouchableOpacity>
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
          <ActivityIndicator color="#FE532A" />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  content: { padding: 16, paddingBottom: 48 },
  errorBanner: { backgroundColor: '#FFE6E6', color: '#FF4444', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#0A0A0A', marginBottom: 8 },
  radiusLabel: { marginTop: 16 },
  block: { marginTop: 4, marginBottom: 8 },
  segment: { flexDirection: 'row', backgroundColor: '#E8E4DC', borderRadius: 10, padding: 3, marginBottom: 16 },
  segmentItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  segmentActive: { backgroundColor: '#FFFFFF' },
  segmentText: { fontSize: 14, fontWeight: '500', color: '#767880' },
  segmentTextActive: { color: '#0A0A0A', fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0DCD3' },
  chipActive: { backgroundColor: '#FE532A', borderColor: '#FE532A' },
  chipText: { fontSize: 14, color: '#0A0A0A' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '600' },
  coordCard: { backgroundColor: '#E6F3FF', borderRadius: 8, padding: 12, borderLeftWidth: 4, borderLeftColor: '#0066CC' },
  coordTitle: { fontSize: 14, fontWeight: '600', color: '#0A0A0A', marginBottom: 4 },
  coordText: { fontSize: 12, color: '#4A4C52', marginBottom: 8 },
  actions: { marginTop: 24, gap: 12 },
  loading: { alignItems: 'center', marginTop: 16 },
});
