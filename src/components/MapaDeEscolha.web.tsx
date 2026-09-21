import { lazy, Suspense, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../design/tokens';
import type { MapaDeEscolhaProps } from './map-types';

// O Leaflet toca em `window` ao ser importado: a renderização estática roda em Node e não pode carregá-lo (ver RemindersMap.web.tsx).
const LeafletMapDom = lazy(() => import('./LeafletMapDom'));

/** Mapa de escolha da web (Leaflet + OpenStreetMap). A versão iOS/Android está em MapaDeEscolha.native.tsx. */
export function MapaDeEscolha({ escolha, aoEscolher, enquadrar, aoUsarLocalizacao, localizando }: MapaDeEscolhaProps) {
  const [cliente, setCliente] = useState(false);
  useEffect(() => setCliente(true), []);
  return (
    <View style={styles.area}>
      {cliente && (
        <Suspense fallback={null}>
          <LeafletMapDom
            center={null}
            markers={[]}
            onMarkerPress={() => {}}
            escolha={escolha}
            aoEscolher={aoEscolher}
            enquadrar={enquadrar}
            aoUsarLocalizacao={aoUsarLocalizacao}
            localizando={localizando}
          />
        </Suspense>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  area: { flex: 1, backgroundColor: colors.map.background },
});
