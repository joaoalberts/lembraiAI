import { Fragment, useEffect, useRef } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import MapView, { Circle, Marker } from 'react-native-maps';
import { FALLBACK_COORD } from '../data/reminders';
import { nativeMapUnavailable } from '../lib/map-availability';
import LeafletMapDom from './LeafletMapDom';
import type { RemindersMapProps } from './map-types';

const DELTA = 0.02;   // ~2 km de largura na abertura

export function RemindersMap(props: RemindersMapProps) {
  const configured = Boolean(Constants.expoConfig?.extra?.googleMapsConfigured);
  // Android sem a chave do Google Maps derrubaria o app ao criar o MapView: usa o mapa Leaflet (grátis, sem chave, numa WebView)
  if (nativeMapUnavailable(Platform.OS, Constants.executionEnvironment, configured)) {
    return (
      <LeafletMapDom
        dom={{ style: styles.map }}
        center={props.center}
        markers={props.markers}
        onMarkerPress={async (marker) => { props.onMarkerPress(marker); }}
      />
    );
  }
  return <NativeMap {...props} />;
}

function NativeMap({ center, markers, onMarkerPress }: RemindersMapProps) {
  const ref = useRef<MapView>(null);
  const centrado = useRef(false);
  const inicio = center ?? (markers[0] ? { lat: markers[0].lat, lng: markers[0].lng } : FALLBACK_COORD);

  // centra uma única vez, quando a posição chega; depois disso o mapa é do usuário (pan e zoom livres)
  useEffect(() => {
    if (!center || centrado.current) return;
    centrado.current = true;
    ref.current?.animateToRegion(
      { latitude: center.lat, longitude: center.lng, latitudeDelta: DELTA, longitudeDelta: DELTA },
      500,
    );
  }, [center]);

  return (
    <MapView
      ref={ref}
      style={styles.map}
      initialRegion={{ latitude: inicio.lat, longitude: inicio.lng, latitudeDelta: DELTA, longitudeDelta: DELTA }}
      showsUserLocation={center != null}
      showsMyLocationButton
      pitchEnabled={false}
      rotateEnabled={false}
    >
      {markers.map((m) => (
        <Fragment key={m.id}>
          <Circle
            center={{ latitude: m.lat, longitude: m.lng }}
            radius={m.radius}
            strokeColor={m.color}
            strokeWidth={2}
            fillColor={`${m.color}33`}
          />
          <Marker
            coordinate={{ latitude: m.lat, longitude: m.lng }}
            title={m.title}
            description={m.place}
            pinColor={m.color}
            onPress={() => onMarkerPress(m)}
          />
        </Fragment>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
