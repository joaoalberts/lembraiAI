import type { ComponentProps } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_COLORS } from '../../src/data/reminders';
import { RemindersMap } from '../../src/components/RemindersMap';
import type { MapMarker } from '../../src/components/map-types';
import { UI_ICON } from '../../src/design/icons';
import { colors, layout, radius, shadow, size, space, textStyles } from '../../src/design/tokens';
import { distance, formatDistance, type LatLng } from '../../src/lib/geo';
import { useGeo } from '../../src/state/geo';
import { useGeofences } from '../../src/state/geofences';
import { useReminders } from '../../src/state/reminders';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

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
      <RemindersMap center={center} markers={markers} onMarkerPress={setSelecionado} />

      {markers.length === 0 && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>Nenhum lembrete por local. Crie um em Novo → Por local.</Text>
        </View>
      )}

      <Modal visible={selecionado !== null} transparent animationType="slide" onRequestClose={() => setSelecionado(null)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Pressable
              style={styles.close}
              onPress={() => setSelecionado(null)}
              hitSlop={size.hitSlop}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
            >
              <Ionicons name={UI_ICON.fechar as IoniconName} size={size.icon.md} color={colors.icon.default} />
            </Pressable>
            {selecionado && (
              <>
                <Text style={styles.sheetTitle}>{selecionado.title}</Text>
                {selecionado.place ? <Text style={styles.sheetPlace}>{selecionado.place}</Text> : null}
                <Text style={styles.sheetRow}>Raio de aviso: {selecionado.radius} m</Text>
                {center && <Text style={styles.sheetRow}>Distância de você: {formatDistance(distance(center, selecionado))}</Text>}
                <Text style={styles.sheetRow}>
                  {!selecionado.active ? 'Lembrete pausado' : insideIds.includes(selecionado.id) ? 'Você está dentro do raio' : 'Monitorando'}
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
  container: { flex: 1, backgroundColor: colors.bg.page },
  hint: { position: 'absolute', top: space.md, left: space.lg, right: space.lg, backgroundColor: colors.bg.field, borderRadius: radius.md, padding: space.md, boxShadow: shadow.float, pointerEvents: 'none' },
  hintText: { ...textStyles.body, color: colors.text.primary, textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end', alignItems: 'center' },
  // o Modal da web sai da coluna do app: sem o maxWidth o painel viraria uma faixa da largura da janela
  sheet: { width: '100%', maxWidth: layout.columnMax, backgroundColor: colors.bg.field, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, padding: space.xl, paddingBottom: space.xxl },
  close: { position: 'absolute', top: space.md, right: space.md, width: size.closeButton, height: size.closeButton, borderRadius: radius.pill, backgroundColor: colors.bg.page, alignItems: 'center', justifyContent: 'center' },
  sheetTitle: { ...textStyles.title, color: colors.text.primary, marginRight: size.closeButton + space.sm, marginBottom: space.xs },
  sheetPlace: { ...textStyles.body, color: colors.text.secondary, marginBottom: space.md },
  sheetRow: { ...textStyles.body, color: colors.text.primary, marginTop: space.sm },
});
