import { useEffect, useMemo, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CATEGORY_COLORS } from '../../src/data/reminders';
import { RemindersMap } from '../../src/components/RemindersMap';
import type { MapMarker } from '../../src/components/map-types';
import { distance, formatDistance, type LatLng } from '../../src/lib/geo';
import { useGeo } from '../../src/state/geo';
import { useGeofences } from '../../src/state/geofences';
import { useReminders } from '../../src/state/reminders';

const PAUSADO = '#9AA0A6';

export default function MapaScreen() {
  const { reminders } = useReminders();
  const { position, getCurrentPosition } = useGeo();
  const { insideIds } = useGeofences();
  const [lida, setLida] = useState<LatLng | null>(null);
  const [selecionado, setSelecionado] = useState<MapMarker | null>(null);

  // ao abrir o mapa, uma leitura única centra a tela mesmo com o monitoramento desligado
  useEffect(() => {
    let vivo = true;
    void getCurrentPosition().then((p) => { if (vivo && p) setLida({ lat: p.lat, lng: p.lng }); });
    return () => { vivo = false; };
  }, [getCurrentPosition]);

  const center = useMemo<LatLng | null>(() => (position ? { lat: position.lat, lng: position.lng } : lida), [position, lida]);

  const markers = useMemo<MapMarker[]>(
    () => reminders
      .filter((r) => r.kind === 'local' && r.lat != null && r.lng != null && r.radius != null)
      .map((r) => ({
        id: r.id,
        lat: r.lat!,
        lng: r.lng!,
        radius: r.radius!,
        title: r.title,
        place: r.place,
        color: r.active ? CATEGORY_COLORS[r.category].pin : PAUSADO,
        active: r.active,
      })),
    [reminders],
  );

  return (
    <View style={styles.container}>
      <RemindersMap center={center} markers={markers} onMarkerPress={setSelecionado} />

      {markers.length === 0 && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>Nenhum lembrete por local. Crie um em Novo → Por local.</Text>
        </View>
      )}

      <Modal visible={selecionado !== null} transparent animationType="slide" onRequestClose={() => setSelecionado(null)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <TouchableOpacity style={styles.close} onPress={() => setSelecionado(null)} accessibilityRole="button" accessibilityLabel="Fechar">
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            {selecionado && (
              <>
                <Text style={styles.sheetTitle}>{selecionado.title}</Text>
                {selecionado.place ? <Text style={styles.sheetPlace}>{selecionado.place}</Text> : null}
                <Text style={styles.sheetRow}>Raio de aviso: {selecionado.radius} m</Text>
                {center && <Text style={styles.sheetRow}>Distância de você: {formatDistance(distance(center, selecionado))}</Text>}
                <Text style={styles.sheetRow}>
                  {!selecionado.active ? 'Lembrete pausado' : insideIds.includes(selecionado.id) ? '📍 Você está dentro do raio' : 'Monitorando'}
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  hint: { position: 'absolute', top: 12, left: 16, right: 16, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, pointerEvents: 'none' },
  hintText: { fontSize: 13, color: '#0A0A0A', textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', alignItems: 'center' },
  // o Modal da web sai da coluna do app: sem o maxWidth o painel viraria uma faixa da largura da janela
  sheet: { width: '100%', maxWidth: 560, backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 36 },
  close: { position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: '#F5F2ED', alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 16, fontWeight: 'bold', color: '#0A0A0A' },
  sheetTitle: { fontSize: 20, fontWeight: 'bold', color: '#0A0A0A', marginRight: 40, marginBottom: 4 },
  sheetPlace: { fontSize: 14, color: '#767880', marginBottom: 12 },
  sheetRow: { fontSize: 14, color: '#0A0A0A', marginTop: 8 },
});
