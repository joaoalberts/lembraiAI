/**
 * CSS do mapa Leaflet (leaflet.css é o do pacote; este é o da marca por cima). Fica aqui, com os tokens, porque é o único
 * lugar onde valor visual pode ser escrito à mão: o arquivo do mapa roda no navegador e não importa `react-native`.
 *
 * O Leaflet traz fonte própria (Helvetica no mapa, monoespaçada nos botões de zoom). Aqui ele fala a língua da marca.
 * Na web as fontes já foram carregadas pela página; na WebView do app cai na pilha de reserva do sistema.
 * Botões de zoom: família bold com peso normal (o Leaflet pede `bold` e somaria negrito falso sobre a regular).
 * Alvo de toque: o bloco `@media (pointer: coarse)` leva os botões a 44 (docs/DESIGN_SYSTEM.md, seção 16.2).
 */
import { colors, fontFamily, fontSize, shadow, size } from './tokens';

export const CSS_DO_MAPA = `
.leaflet-container, .leaflet-tooltip { font-family: ${fontFamily.regular}; }
.leaflet-control-zoom a { font-family: ${fontFamily.bold}; font-weight: normal; }
.leaflet-tile-pane { filter: saturate(0.72) contrast(0.94) brightness(1.04); }
.pino-de-escolha { background: none; border: 0; filter: drop-shadow(0 1.5px 1.5px ${colors.map.pinShadow}); cursor: grab; }
.controle-do-mapa, .leaflet-control-zoom { border: 0 !important; border-radius: 8px; box-shadow: ${shadow.float} !important; overflow: hidden; margin: 10px 10px 0 0 !important; }
.controle-do-mapa a, .leaflet-control-zoom a { display: flex; align-items: center; justify-content: center; width: ${size.mapControl.button}px !important; height: ${size.mapControl.button + 1}px !important; line-height: 1 !important; background: ${colors.map.control}; color: ${colors.text.primary}; border-radius: 0 !important; }
.controle-do-mapa a:hover, .leaflet-control-zoom a:hover, .controle-do-mapa a:active, .leaflet-control-zoom a:active { background: ${colors.map.controlPressed}; }
.leaflet-control-zoom a + a { border-top: 1px solid ${colors.map.controlDivider} !important; }
.pilula-do-mapa { margin: 0 0 6px 6px !important; }
.pilula-do-mapa button { display: flex; align-items: center; gap: 7px; height: ${size.mapControl.pill}px; padding: 0 12px 0 10px; border: 0; border-radius: 999px; background: ${colors.map.control}; box-shadow: ${shadow.float}; color: ${colors.text.primary}; font: ${fontSize.micro}px ${fontFamily.medium}; line-height: 1; white-space: nowrap; cursor: pointer; }
.pilula-do-mapa button:active { background: ${colors.map.controlPressed}; }
.pilula-do-mapa button:disabled { opacity: 0.75; cursor: default; }
.pilula-do-mapa svg { width: ${size.icon.sm}px; height: ${size.icon.sm}px; }
/* Em tela de toque (celular e WebView do app) os botões chegam ao alvo de 44; no computador ficam as medidas das imagens de referência. */
@media (pointer: coarse) {
  .controle-do-mapa a, .leaflet-control-zoom a { width: ${size.touch}px !important; height: ${size.touch}px !important; }
  .pilula-do-mapa button { height: ${size.touch}px; }
  /* o mapa pequeno do formulário não comporta 44 + 88 de botões: a pinça dá o zoom */
  .mapa-de-escolha .leaflet-control-zoom { display: none !important; }
}
`;
