import { StyleSheet } from 'react-native';
import LeafletMapDom from './LeafletMapDom';
import type { MapaDeEscolhaProps } from './map-types';

/**
 * Mapa de escolha do iOS e do Android: o mesmo Leaflet, numa WebView (componente DOM do Expo). O mapa do Google não serve
 * aqui: precisa de chave e cartão de crédito, e o pino arrastável com o círculo do raio já existe no Leaflet.
 * As funções chegam à WebView como chamadas assíncronas.
 */
export function MapaDeEscolha({ escolha, aoEscolher, enquadrar, aoUsarLocalizacao, localizando }: MapaDeEscolhaProps) {
  return (
    <LeafletMapDom
      dom={{ style: styles.mapa }}
      center={null}
      markers={[]}
      onMarkerPress={async () => {}}
      escolha={escolha}
      aoEscolher={async (lat, lng) => { aoEscolher(lat, lng); }}
      enquadrar={enquadrar}
      aoUsarLocalizacao={async () => { aoUsarLocalizacao(); }}
      localizando={localizando}
    />
  );
}

const styles = StyleSheet.create({
  mapa: { flex: 1 },
});
