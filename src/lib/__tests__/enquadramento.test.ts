import { criarEnquadramento } from '../enquadramento';

/** Um mapa de mentira: só o que o enquadramento pergunta (`getSize`) e faz (`fitBounds`). O tamanho pode mudar depois. */
function mapaDeMentira(x: number, y: number) {
  const tamanho = { x, y };
  return {
    mapa: { getSize: jest.fn(() => ({ ...tamanho })), fitBounds: jest.fn() },
    medir: (novoX: number, novoY: number) => { tamanho.x = novoX; tamanho.y = novoY; },
  };
}

const LIMITES = [[-3.75, -38.5], [-3.7, -38.45]] as [[number, number], [number, number]];
const OUTROS = [[-3.9, -38.6], [-3.8, -38.5]] as [[number, number], [number, number]];

describe('criarEnquadramento', () => {
  it('com o mapa já medido enquadra na hora, com o zoom máximo pedido, e diz que enquadrou', () => {
    const { mapa } = mapaDeMentira(390, 700);
    const enquadramento = criarEnquadramento(mapa, 16);
    expect(enquadramento.pedir(LIMITES)).toBe(true);
    expect(mapa.fitBounds).toHaveBeenCalledTimes(1);
    expect(mapa.fitBounds).toHaveBeenCalledWith(LIMITES, { maxZoom: 16 });
  });

  it('com o mapa ainda vazio (0 × 0, como a WebView do celular ao nascer) não enquadra: o zoom sairia para uma área sem tamanho', () => {
    const { mapa } = mapaDeMentira(0, 0);
    const enquadramento = criarEnquadramento(mapa, 16);
    expect(enquadramento.pedir(LIMITES)).toBe(false);
    expect(mapa.fitBounds).not.toHaveBeenCalled();
  });

  it('quando o tamanho chega enquadra uma vez só, no pedido que ficou esperando', () => {
    const { mapa, medir } = mapaDeMentira(0, 0);
    const enquadramento = criarEnquadramento(mapa, 16);
    enquadramento.pedir(LIMITES);
    medir(390, 700);
    expect(enquadramento.aoMedir()).toBe(true);
    expect(mapa.fitBounds).toHaveBeenCalledTimes(1);
    expect(mapa.fitBounds).toHaveBeenCalledWith(LIMITES, { maxZoom: 16 });
    expect(enquadramento.aoMedir()).toBe(false); // a próxima mudança de tamanho (girar a tela) não reenquadra
    expect(mapa.fitBounds).toHaveBeenCalledTimes(1);
  });

  it('enquanto o mapa continua sem tamanho, medir de novo não enquadra e o pedido continua esperando', () => {
    const { mapa, medir } = mapaDeMentira(0, 0);
    const enquadramento = criarEnquadramento(mapa, 16);
    enquadramento.pedir(LIMITES);
    expect(enquadramento.aoMedir()).toBe(false);
    expect(mapa.fitBounds).not.toHaveBeenCalled();
    medir(390, 700);
    expect(enquadramento.aoMedir()).toBe(true);
    expect(mapa.fitBounds).toHaveBeenCalledTimes(1);
  });

  it('largura ou altura zero contam como sem tamanho', () => {
    const { mapa, medir } = mapaDeMentira(390, 0);
    const enquadramento = criarEnquadramento(mapa, 16);
    expect(enquadramento.pedir(LIMITES)).toBe(false);
    medir(0, 700);
    expect(enquadramento.aoMedir()).toBe(false);
    expect(mapa.fitBounds).not.toHaveBeenCalled();
  });

  it('um pedido novo antes de o tamanho chegar substitui o anterior (os marcadores mudaram)', () => {
    const { mapa, medir } = mapaDeMentira(0, 0);
    const enquadramento = criarEnquadramento(mapa, 16);
    enquadramento.pedir(LIMITES);
    enquadramento.pedir(OUTROS);
    medir(390, 700);
    enquadramento.aoMedir();
    expect(mapa.fitBounds).toHaveBeenCalledTimes(1);
    expect(mapa.fitBounds).toHaveBeenCalledWith(OUTROS, { maxZoom: 16 });
  });

  it('um pedido que já cabe na hora descarta o que esperava: o pedido velho não volta depois', () => {
    const { mapa, medir } = mapaDeMentira(0, 0);
    const enquadramento = criarEnquadramento(mapa, 16);
    enquadramento.pedir(LIMITES);
    medir(390, 700);
    expect(enquadramento.pedir(OUTROS)).toBe(true);
    expect(enquadramento.aoMedir()).toBe(false);
    expect(mapa.fitBounds).toHaveBeenCalledTimes(1);
    expect(mapa.fitBounds).toHaveBeenCalledWith(OUTROS, { maxZoom: 16 });
  });

  it('cancelar descarta o pedido (a posição do aparelho chegou e já enquadrou por conta própria)', () => {
    const { mapa, medir } = mapaDeMentira(0, 0);
    const enquadramento = criarEnquadramento(mapa, 16);
    enquadramento.pedir(LIMITES);
    enquadramento.cancelar();
    medir(390, 700);
    expect(enquadramento.aoMedir()).toBe(false);
    expect(mapa.fitBounds).not.toHaveBeenCalled();
  });

  it('sem pedido nenhum, medir não faz nada', () => {
    const { mapa } = mapaDeMentira(390, 700);
    const enquadramento = criarEnquadramento(mapa, 16);
    expect(enquadramento.aoMedir()).toBe(false);
    expect(mapa.fitBounds).not.toHaveBeenCalled();
  });
});
