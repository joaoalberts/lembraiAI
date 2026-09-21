'use dom';

import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DOMProps } from 'expo/dom';
import { FALLBACK_COORD } from '../data/reminders';
import { colors } from '../design/tokens';
import type { MapMarker } from './map-types';

const ZOOM = 15;

interface Props {
  /** Injetado pelo Expo no iOS/Android: configura a WebView que hospeda este componente. */
  dom?: DOMProps;
  center: { lat: number; lng: number } | null;
  markers: MapMarker[];
  /** No app nativo vira uma chamada assíncrona ao lado React Native (por isso o retorno pode ser Promise). */
  onMarkerPress: (marker: MapMarker) => Promise<void> | void;
}

/**
 * Mapa Leaflet + OpenStreetMap: gratuito, sem chave de API e sem conta. É um componente DOM do Expo (`'use dom'`):
 * na web roda direto na página; no iOS/Android roda numa WebView embutida no app. Serve de mapa da web e de reserva
 * do Android quando o build não tem a chave do Google Maps (que exige cartão de crédito no Google Cloud).
 *
 * Só pode importar coisas que rodam no navegador (nada de `react-native`). Pinos são `circleMarker` (sem imagens),
 * o que evita o problema clássico dos ícones do Leaflet quebrados em bundlers.
 */
export default function LeafletMapDom({ center, markers, onMarkerPress }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const group = useRef<L.LayerGroup | null>(null);
  const me = useRef<L.CircleMarker | null>(null);
  const centered = useRef(false);
  const onPress = useRef(onMarkerPress);
  onPress.current = onMarkerPress;
  const [ready, setReady] = useState(false);

  // Na ponte com o app nativo os objetos chegam como cópias novas a cada envio: comparar pelo conteúdo evita redesenhar à toa
  const markersKey = JSON.stringify(markers);
  const centerKey = center ? `${center.lat},${center.lng}` : '';

  useEffect(() => {
    if (!host.current) return;
    const inicio = center ?? (markers[0] ? { lat: markers[0].lat, lng: markers[0].lng } : FALLBACK_COORD);
    const m = L.map(host.current).setView([inicio.lat, inicio.lng], ZOOM);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m);
    map.current = m;
    group.current = L.layerGroup().addTo(m);
    // o layout fecha depois do mount: sem isso o Leaflet mede um contêiner vazio
    const observer = new ResizeObserver(() => m.invalidateSize());
    observer.observe(host.current);
    setReady(true);
    return () => {
      observer.disconnect();
      m.remove();
      map.current = null; group.current = null; me.current = null;
      centered.current = false;
    };
    // só no mount: posição e marcadores seguintes são tratados pelos efeitos abaixo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const m = map.current; const g = group.current;
    if (!ready || !m || !g) return;
    g.clearLayers();
    for (const mk of markers) {
      L.circle([mk.lat, mk.lng], { radius: mk.radius, color: mk.color, weight: 2, fillColor: mk.color, fillOpacity: 0.15 }).addTo(g);
      L.circleMarker([mk.lat, mk.lng], { radius: 9, color: colors.map.ring, weight: 3, fillColor: mk.color, fillOpacity: 1 })
        .bindTooltip(mk.title)
        .on('click', () => { void onPress.current(mk); })
        .addTo(g);
    }
    if (!centered.current && !center && markers.length > 0) {
      centered.current = true;
      m.fitBounds(L.latLngBounds(markers.map((x): [number, number] => [x.lat, x.lng])).pad(0.5), { maxZoom: 16 });
    }
    // `center` só decide o enquadramento inicial; recentralizar a cada posição nova brigaria com o arrastar do usuário
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, markersKey]);

  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    if (!center) { me.current?.remove(); me.current = null; return; }
    const ll: [number, number] = [center.lat, center.lng];
    if (me.current) me.current.setLatLng(ll);
    else me.current = L.circleMarker(ll, { radius: 7, color: colors.map.ring, weight: 3, fillColor: colors.map.me, fillOpacity: 1, interactive: false }).addTo(m);
    if (!centered.current) { centered.current = true; m.setView(ll, ZOOM); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, centerKey]);

  return <div ref={host} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />;
}
