import { lazy, Suspense, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../design/tokens';
import type { RemindersMapProps } from './map-types';

// O Leaflet toca em `window` ao ser importado: a renderização estática do export roda em Node e não pode carregá-lo.
// Por isso o componente só é importado no cliente, depois do primeiro render (e vira um chunk separado do bundle).
const LeafletMapDom = lazy(() => import('./LeafletMapDom'));

/** Mapa da web (Leaflet + OpenStreetMap). A versão iOS/Android está em RemindersMap.native.tsx. */
export function RemindersMap({ center, markers, onMarkerPress }: RemindersMapProps) {
  const [cliente, setCliente] = useState(false);
  useEffect(() => setCliente(true), []);

  return (
    <View style={styles.container}>
      {cliente && (
        <Suspense fallback={null}>
          <LeafletMapDom center={center} markers={markers} onMarkerPress={onMarkerPress} />
        </Suspense>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.map.background },
});
