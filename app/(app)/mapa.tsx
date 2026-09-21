import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppBrand } from '../../src/components/AppBrand';
import { CATEGORY_COLORS } from '../../src/data/reminders';
import { MapHeader } from '../../src/components/MapHeader';
import { RemindersMap } from '../../src/components/RemindersMap';
import { Sheet } from '../../src/components/Sheet';
import type { MapMarker } from '../../src/components/map-types';
import { colors, radius, shadow, size, space, textStyles } from '../../src/design/tokens';
import { folhaSobreOCabecalho } from '../../src/components/GreenHeader';
import { distance, formatDistance, type LatLng } from '../../src/lib/geo';
import { useGeo } from '../../src/state/geo';
import { useGeofences } from '../../src/state/geofences';
import { useReminders } from '../../src/state/reminders';

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
        color: r.active ? CATEGORY_COLORS[r.category].pin : colors.map.paused,
        active: r.active,
      })),
    [reminders],
  );

  return (
    <View style={styles.container}>
      <MapHeader>
        <View style={styles.topo}>
          <AppBrand />
        </View>
        <View style={styles.titulos}>
          <Text accessibilityRole="header" style={styles.titulo}>Mapa</Text>
        </View>
      </MapHeader>

      <View style={styles.folha}>
        <RemindersMap center={center} markers={markers} onMarkerPress={setSelecionado} />

        {markers.length === 0 && (
          <View style={styles.hint}>
            <Text style={styles.hintText}>Nenhum lembrete por local. Crie um na aba Criar → Por local.</Text>
          </View>
        )}

        <Sheet visible={selecionado !== null} onClose={() => setSelecionado(null)} title={selecionado?.title ?? ''} subtitle={selecionado?.place || undefined}>
          {selecionado && (
            <>
              <Text style={styles.sheetRow}>Raio de aviso: {selecionado.radius} m</Text>
              {center && <Text style={styles.sheetRow}>Distância de você: {formatDistance(distance(center, selecionado))}</Text>}
              <Text style={styles.sheetRow}>
                {!selecionado.active ? 'Lembrete pausado' : insideIds.includes(selecionado.id) ? 'Você está dentro do raio' : 'Monitorando'}
              </Text>
            </>
          )}
        </Sheet>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.page },
  topo: { marginTop: space.sm },
  titulos: { marginTop: space.sm },
  titulo: { ...textStyles.display, color: colors.text.primary },
  folha: folhaSobreOCabecalho,
  hint: { position: 'absolute', top: space.md, left: space.lg, right: space.lg, backgroundColor: colors.bg.field, borderRadius: radius.md, padding: space.md, boxShadow: shadow.float, pointerEvents: 'none' },
  hintText: { ...textStyles.body, color: colors.text.primary, textAlign: 'center' },
  sheetRow: { ...textStyles.body, color: colors.text.primary, marginTop: space.sm },
});
