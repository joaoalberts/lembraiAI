import { CSS_DO_MAPA } from '../mapa-css';
import { size } from '../tokens';

/** O bloco do CSS que só vale em tela de toque (celular e WebView do app). */
const bloco = (() => {
  const inicio = CSS_DO_MAPA.indexOf('@media (pointer: coarse)');
  if (inicio < 0) return '';
  let fundo = 0;
  for (let i = CSS_DO_MAPA.indexOf('{', inicio); i < CSS_DO_MAPA.length; i++) {
    if (CSS_DO_MAPA[i] === '{') fundo++;
    if (CSS_DO_MAPA[i] === '}' && --fundo === 0) return CSS_DO_MAPA.slice(inicio, i + 1);
  }
  return '';
})();
const fora = CSS_DO_MAPA.replace(bloco, '');

describe('CSS do mapa: controles no dedo (alvo de 44)', () => {
  it('em tela de toque os botões do mapa (centralizar e zoom) têm o tamanho do alvo de toque, sem tocar no visual do computador', () => {
    expect(bloco).toContain('@media (pointer: coarse)');
    expect(bloco).toMatch(new RegExp(`\\.controle-do-mapa a, \\.leaflet-control-zoom a \\{[^}]*width: ${size.touch}px !important; height: ${size.touch}px !important`));
    // fora do bloco continuam as medidas das imagens de referência (feitas no computador)
    expect(fora).toContain(`width: ${size.mapControl.button}px !important; height: ${size.mapControl.button + 1}px !important`);
  });

  it('em tela de toque a pílula "Usar minha localização" chega a 44 de altura', () => {
    expect(bloco).toMatch(new RegExp(`\\.pilula-do-mapa button \\{[^}]*height: ${size.touch}px`));
    expect(fora).toContain(`height: ${size.mapControl.pill}px`);
  });

  it('no mapa de escolha (o pequeno do formulário) o zoom some em tela de toque: 44 + 88 não cabem, e o gesto de pinça faz o mesmo', () => {
    expect(bloco).toMatch(/\.mapa-de-escolha \.leaflet-control-zoom \{[^}]*display: none/);
    // no computador o zoom continua (e a aba Mapa, que é alta, mantém os botões de 44)
    expect(fora).not.toContain('.mapa-de-escolha .leaflet-control-zoom { display: none');
  });

  it('o alvo de toque vem do token size.touch (44)', () => {
    expect(size.touch).toBe(44);
  });
});
