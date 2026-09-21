export interface LatLng { lat: number; lng: number }

const R = 6_371_000;   // raio médio da Terra, em metros
const rad = (d: number) => (d * Math.PI) / 180;

/**
 * Distância em metros entre dois pontos (fórmula de haversine). Para os raios deste app (dezenas a centenas de
 * metros) o erro de considerar a Terra uma esfera é desprezível.
 */
export function distance(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** 250 -> "250 m"; 1200 -> "1,2 km" */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}
