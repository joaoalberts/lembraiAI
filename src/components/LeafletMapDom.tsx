'use dom';

import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DOMProps } from 'expo/dom';
import { FALLBACK_COORD } from '../data/reminders';
import { CSS_DO_MAPA } from '../design/mapa-css';
import { colors, iconStroke, size } from '../design/tokens';
import { criarEnquadramento } from '../lib/enquadramento';
import type { MapMarker } from './map-types';

const ZOOM = 15;
/** Zoom mais próximo que o enquadramento dos marcadores aceita (um lembrete sozinho não vira um mapa de rua). */
const ZOOM_MAXIMO_DO_ENQUADRAMENTO = 16;

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

/** Ícones dos botões sobre o mapa (do Lucide, embutidos porque este arquivo roda no navegador e não importa nada do React Native). */
const icone = (corpo: string, lado: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${iconStroke.ui}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${corpo}</svg>`;
const ICONE_CENTRALIZAR = icone('<polygon points="3 11 22 2 13 21 11 13 3 11"/>', size.mapControl.icon);
const ICONE_LOCALIZACAO = icone('<line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/>', size.mapControl.icon);
const TEXTO_DA_PILULA = 'Usar minha localização';
const TEXTO_DA_PILULA_OCUPADA = 'Localizando…';

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
  /** Modo de escolha: toque na pílula "Usar minha localização" (o pedido de posição fica do lado do app). */
  aoUsarLocalizacao?: () => Promise<void> | void;
  /** Enquanto a posição é lida, a pílula mostra "Localizando…" e não aceita toque. */
  localizando?: boolean;
}

/**
 * Mapa Leaflet + OpenStreetMap: gratuito, sem chave de API e sem conta. É um componente DOM do Expo (`'use dom'`):
 * na web roda direto na página; no iOS/Android roda numa WebView embutida no app. Serve de mapa da web e de reserva
 * do Android quando o build não tem a chave do Google Maps (que exige cartão de crédito no Google Cloud).
 *
 * Só pode importar coisas que rodam no navegador (nada de `react-native`). Pinos são `circleMarker` (sem imagens),
 * o que evita o problema clássico dos ícones do Leaflet quebrados em bundlers.
 */
export default function LeafletMapDom({ center, markers, onMarkerPress, escolha = null, aoEscolher, enquadrar, aoUsarLocalizacao, localizando = false }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const group = useRef<L.LayerGroup | null>(null);
  const me = useRef<L.CircleMarker | null>(null);
  const pino = useRef<L.Marker | null>(null);
  const halo = useRef<L.Circle | null>(null);
  const centered = useRef(false);
  // enquadra os marcadores quando o mapa tem tamanho (a WebView do celular o cria com 0 × 0)
  const enquadramento = useRef<ReturnType<typeof criarEnquadramento> | null>(null);
  const onPress = useRef(onMarkerPress);
  onPress.current = onMarkerPress;
  const escolher = useRef(aoEscolher);
  escolher.current = aoEscolher;
  const usarLocalizacao = useRef(aoUsarLocalizacao);
  usarLocalizacao.current = aoUsarLocalizacao;
  const botaoDaPilula = useRef<HTMLButtonElement | null>(null);
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
    // no modo de escolha o zoom é um dos botões do canto (mais abaixo), no lugar do padrão do Leaflet
    // O mapa do formulário fica dentro de uma página que rola: a roda do mouse só dá zoom nele depois de um clique (e para ao sair),
    // senão rolar a página com o cursor em cima do mapa a faria dar zoom sozinha.
    const escolhendoAgora = aoEscolher !== undefined;
    const m = L.map(host.current, { zoomControl: !escolhendoAgora, scrollWheelZoom: !escolhendoAgora }).setView([inicio.lat, inicio.lng], ZOOM);
    if (escolhendoAgora) {
      m.on('click focus', () => m.scrollWheelZoom.enable());
      m.on('mouseout blur', () => m.scrollWheelZoom.disable());
    }
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m);
    map.current = m;
    group.current = L.layerGroup().addTo(m);
    enquadramento.current = criarEnquadramento(m, ZOOM_MAXIMO_DO_ENQUADRAMENTO);
    // o layout fecha depois do mount: sem isso o Leaflet mede um contêiner vazio; e o enquadramento que esperava o tamanho acontece agora
    const observer = new ResizeObserver(() => {
      m.invalidateSize();
      if (enquadramento.current?.aoMedir()) centered.current = true;
    });
    observer.observe(host.current);
    setReady(true);
    return () => {
      observer.disconnect();
      m.remove();
      map.current = null; group.current = null; me.current = null; pino.current = null; halo.current = null; enquadramento.current = null;
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
    if (markers.length === 0) enquadramento.current?.cancelar();
    else if (!centered.current && !center) {
      // sem tamanho ainda, o pedido espera e o `ResizeObserver` o cumpre
      const limites = L.latLngBounds(markers.map((x): [number, number] => [x.lat, x.lng])).pad(0.5);
      if (enquadramento.current?.pedir(limites)) centered.current = true;
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
    if (!centered.current) { centered.current = true; enquadramento.current?.cancelar(); m.setView(ll, ZOOM); }
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

  // Modo de escolha: botões que flutuam sobre o mapa (centralizar e zoom no canto de cima, "Usar minha localização" embaixo)
  useEffect(() => {
    const m = map.current;
    if (!ready || !m || !escolhendo) return;
    const centralizar = new L.Control({ position: 'topright' });
    centralizar.onAdd = () => {
      const barra = L.DomUtil.create('div', 'controle-do-mapa');
      const botao = L.DomUtil.create('a', '', barra);
      botao.setAttribute('role', 'button');
      botao.setAttribute('href', '#');
      botao.setAttribute('aria-label', 'Centralizar no lembrete');
      botao.innerHTML = ICONE_CENTRALIZAR;
      L.DomEvent.disableClickPropagation(barra);
      L.DomEvent.on(botao, 'click', (e) => {
        L.DomEvent.preventDefault(e);
        const p = pino.current?.getLatLng();
        if (p) m.setView(p, m.getZoom(), { animate: true });
      });
      return barra;
    };
    centralizar.addTo(m);
    const zoom = L.control.zoom({ position: 'topright', zoomInTitle: 'Aproximar', zoomOutTitle: 'Afastar' }).addTo(m);
    const pilula = new L.Control({ position: 'bottomleft' });
    pilula.onAdd = () => {
      const barra = L.DomUtil.create('div', 'pilula-do-mapa');
      const botao = L.DomUtil.create('button', '', barra);
      botao.type = 'button';
      botao.innerHTML = `${ICONE_LOCALIZACAO}<span>${TEXTO_DA_PILULA}</span>`;
      L.DomEvent.disableClickPropagation(barra);
      L.DomEvent.on(botao, 'click', () => { void usarLocalizacao.current?.(); });
      botaoDaPilula.current = botao;
      return barra;
    };
    pilula.addTo(m);
    return () => { centralizar.remove(); zoom.remove(); pilula.remove(); botaoDaPilula.current = null; };
  }, [ready, escolhendo]);

  // a pílula acompanha o pedido de posição em andamento
  useEffect(() => {
    const botao = botaoDaPilula.current;
    if (!botao) return;
    botao.disabled = localizando;
    const texto = botao.querySelector('span');
    if (texto) texto.textContent = localizando ? TEXTO_DA_PILULA_OCUPADA : TEXTO_DA_PILULA;
  }, [ready, escolhendo, localizando]);

  // Reenquadrar no pino a pedido (busca de endereço e "Usar minha localização")
  useEffect(() => {
    const m = map.current;
    if (!ready || !m || !escolha || enquadrar === undefined) return;
    m.setView([escolha.lat, escolha.lng], ZOOM);
  }, [ready, enquadrar]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <style>{CSS_DO_MAPA}</style>
      <div ref={host} className={escolhendo ? 'mapa-de-escolha' : undefined} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
    </>
  );
}
