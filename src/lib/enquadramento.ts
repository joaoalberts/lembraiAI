import type { LatLngBoundsExpression } from 'leaflet';

/** O que o enquadramento pergunta e faz no mapa Leaflet (o mínimo, para os testes usarem um mapa de mentira). */
export interface MapaParaEnquadrar {
  getSize(): { x: number; y: number };
  fitBounds(limites: LatLngBoundsExpression, opcoes: { maxZoom: number }): unknown;
}

/**
 * Enquadra todos os marcadores no mapa, mas só quando o mapa já tem tamanho. Na WebView do celular o contêiner nasce
 * com 0 × 0 e o `fitBounds` calcularia o zoom para uma área sem tamanho (o mapa ficava no zoom máximo, longe dos pinos).
 * Sem tamanho o pedido espera; `aoMedir` (chamado a cada mudança de tamanho) o cumpre uma vez só, com o último pedido.
 */
export function criarEnquadramento(mapa: MapaParaEnquadrar, zoomMaximo: number) {
  let esperando: LatLngBoundsExpression | null = null;

  const enquadrar = (limites: LatLngBoundsExpression): boolean => {
    const { x, y } = mapa.getSize();
    if (x <= 0 || y <= 0) return false;
    mapa.fitBounds(limites, { maxZoom: zoomMaximo });
    return true;
  };

  return {
    /** Enquadra agora, se o mapa já tem tamanho; senão guarda o pedido. Diz se enquadrou. */
    pedir(limites: LatLngBoundsExpression): boolean {
      if (enquadrar(limites)) {
        esperando = null;
        return true;
      }
      esperando = limites;
      return false;
    },
    /** O mapa mudou de tamanho: cumpre o pedido que esperava, se agora dá. Diz se enquadrou. */
    aoMedir(): boolean {
      if (!esperando || !enquadrar(esperando)) return false;
      esperando = null;
      return true;
    },
    /** Descarta o pedido que esperava (a posição do aparelho chegou e enquadrou por conta própria). */
    cancelar(): void {
      esperando = null;
    },
  };
}
