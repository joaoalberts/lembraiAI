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

/** Mapa do formulário: um pino arrastável com o círculo do raio de aviso, que a pessoa põe tocando no mapa. */
export interface MapaDeEscolhaProps {
  /** O ponto escolhido e o raio (metros); `null` = ainda não escolheu (o mapa abre no padrão). */
  escolha: { lat: number; lng: number; raio: number } | null;
  aoEscolher: (lat: number, lng: number) => void;
  /** Cada valor novo reenquadra o mapa no pino (busca de endereço, "Usar minha localização"). */
  enquadrar?: number;
  /** Toque na pílula "Usar minha localização" que flutua sobre o mapa. */
  aoUsarLocalizacao: () => void;
  localizando: boolean;
}
