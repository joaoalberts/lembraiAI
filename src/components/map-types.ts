import type { LatLng } from '../lib/geo';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  title: string;
  place?: string;
  color: string;
  active: boolean;
}

export interface RemindersMapProps {
  /** Posição da pessoa, quando conhecida (centra o mapa e mostra o ponto azul). */
  center: LatLng | null;
  markers: MapMarker[];
  onMarkerPress: (marker: MapMarker) => void;
}
