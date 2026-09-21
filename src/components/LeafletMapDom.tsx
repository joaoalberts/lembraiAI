'use dom';

import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DOMProps } from 'expo/dom';
import { FALLBACK_COORD } from '../data/reminders';
import { colors, fontFamily, size } from '../design/tokens';
import type { MapMarker } from './map-types';

const ZOOM = 15;

/** Gota do pino do formulário (desenhada em 29 × 37) com o ponto branco: só SVG, sem arquivo de imagem. */
const iconeDoPino = () =>
  L.divIcon({
    className: 'pino-de-escolha',
    iconSize: [size.mapPin.width, size.mapPin.height],
    iconAnchor: [size.mapPin.width / 2, size.mapPin.height],
    html:
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 37" width="${size.mapPin.width}" height="${size.mapPin.height}">` +
      `<path d="M14.5 0C6.5 0 0 6.4 0 14.3 0 24.6 14.5 37 14.5 37S29 24.6 29 14.3C29 6.4 22.5 0 14.5 0Z" fill="${colors.map.pin}"/>` +
      `<circle cx="14.5" cy="14.3" r="5.5" fill="${colors.map.ring}"/></svg>`,
  });

/**
 * O Leaflet traz fonte própria (Helvetica no mapa, monoespaçada nos botões de zoom). Aqui ele fala a língua da marca.
 * Na web as fontes já foram carregadas pela página; na WebView do app cai na pilha de reserva do sistema.
 * Botões de zoom: família bold com peso normal (o Leaflet pede `bold` e somaria negrito falso sobre a regular).
 */
const CSS_DO_MAPA = `
.leaflet-container, .leaflet-tooltip { font-family: ${fontFamily.regular}; }
.leaflet-control-zoom a { font-family: ${fontFamily.bold}; font-weight: normal; }
.leaflet-tile-pane { filter: saturate(0.72) contrast(0.94) brightness(1.04); }
.pino-de-escolha { background: none; border: 0; filter: drop-shadow(0 1.5px 1.5px ${colors.map.pinShadow}); cursor: grab; }
`;

interface Props {
  /** Injetado pelo Expo no iOS/Android: configura a WebView que hospeda este componente. */
  dom?: DOMProps;
  center: { lat: number; lng: number } | null;
  markers: MapMarker[];
  /** No app nativo vira uma chamada assíncrona ao lado React Native (por isso o retorno pode ser Promise). */
  onMarkerPress: (marker: MapMarker) => Promise<void> | void;
  /**
   * Modo de escolha (formulário de novo lembrete): um pino com o círculo do raio de aviso, que a pessoa põe tocando no
   * mapa ou arrastando. Sem `aoEscolher` o mapa não reage ao toque. `raio` em metros.
   */
  escolha?: { lat: number; lng: number; raio: number } | null;
  aoEscolher?: (lat: number, lng: number) => Promise<void> | void;
  /** Cada valor novo reenquadra o mapa no pino (busca de endereço, "Usar minha localização"). */
  enquadrar?: number;
}

/**
 * Mapa Leaflet + OpenStreetMap: gratuito, sem chave de API e sem conta. É um componente DOM do Expo (`'use dom'`):
 * na web roda direto na página; no iOS/Android roda numa WebView embutida no app. Serve de mapa da web e de reserva
 * do Android quando o build não tem a chave do Google Maps (que exige cartão de crédito no Google Cloud).
 *
 * Só pode importar coisas que rodam no navegador (nada de `react-native`). Pinos são `circleMarker` (sem imagens),
 * o que evita o problema clássico dos ícones do Leaflet quebrados em bundlers.
 */
export default function LeafletMapDom({ center, markers, onMarkerPress, escolha = null, aoEscolher, enquadrar }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const group = useRef<L.LayerGroup | null>(null);
  const me = useRef<L.CircleMarker | null>(null);
  const pino = useRef<L.Marker | null>(null);
  const halo = useRef<L.Circle | null>(null);
  const centered = useRef(false);
  const onPress = useRef(onMarkerPress);
  onPress.current = onMarkerPress;
  const escolher = useRef(aoEscolher);
  escolher.current = aoEscolher;
  const [ready, setReady] = useState(false);
  const escolhendo = aoEscolher !== undefined;

  // Na ponte com o app nativo os objetos chegam como cópias novas a cada envio: comparar pelo conteúdo evita redesenhar à toa
  const markersKey = JSON.stringify(markers);
  const centerKey = center ? `${center.lat},${center.lng}` : '';

  useEffect(() => {
    if (!host.current) return;
    const inicio = escolha ?? center ?? (markers[0] ? { lat: markers[0].lat, lng: markers[0].lng } : FALLBACK_COORD);
    // com um pino já escolhido (edição), a posição da pessoa que chega depois não puxa o mapa para longe dele
    if (escolha) centered.current = true;
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
      map.current = null; group.current = null; me.current = null; pino.current = null; halo.current = null;
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

  // Modo de escolha: tocar no mapa põe o pino ali
  useEffect(() => {
    const m = map.current;
    if (!ready || !m || !escolhendo) return;
    const aoTocar = (e: L.LeafletMouseEvent) => { void escolher.current?.(e.latlng.lat, e.latlng.lng); };
    m.on('click', aoTocar);
    return () => { m.off('click', aoTocar); };
  }, [ready, escolhendo]);

  // Modo de escolha: o pino (arrastável) e o círculo do raio acompanham o valor recebido
  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    if (!escolha) {
      pino.current?.remove(); halo.current?.remove();
      pino.current = null; halo.current = null;
      return;
    }
    const ll: [number, number] = [escolha.lat, escolha.lng];
    if (pino.current) pino.current.setLatLng(ll);
    else {
      pino.current = L.marker(ll, { icon: iconeDoPino(), draggable: true, keyboard: false }).addTo(m);
      pino.current.on('dragend', () => {
        const p = pino.current?.getLatLng();
        if (p) void escolher.current?.(p.lat, p.lng);
      });
    }
    if (halo.current) { halo.current.setLatLng(ll); halo.current.setRadius(escolha.raio); }
    else halo.current = L.circle(ll, { radius: escolha.raio, color: colors.map.haloLine, weight: 2, fillColor: colors.map.haloFill, fillOpacity: 1, interactive: false }).addTo(m);
  }, [ready, escolha?.lat, escolha?.lng, escolha?.raio]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reenquadrar no pino a pedido (busca de endereço e "Usar minha localização")
  useEffect(() => {
    const m = map.current;
    if (!ready || !m || !escolha || enquadrar === undefined) return;
    m.setView([escolha.lat, escolha.lng], ZOOM);
  }, [ready, enquadrar]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <style>{CSS_DO_MAPA}</style>
      <div ref={host} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
    </>
  );
}
