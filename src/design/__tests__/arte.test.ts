import fs from 'fs';
import path from 'path';
import { du, size } from '../tokens';

/** Largura e altura de um .webp com alfa (contêiner VP8X: cada medida é o valor menos 1, em 3 bytes little-endian). */
function dimensoesDoWebp(nome: string): [number, number] {
  const b = fs.readFileSync(path.join(__dirname, '../../../assets/art', nome));
  expect(b.toString('ascii', 0, 4)).toBe('RIFF');
  expect(b.toString('ascii', 8, 12)).toBe('WEBP');
  expect(b.toString('ascii', 12, 16)).toBe('VP8X');
  return [b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1];
}

describe('arte gerada (assets/art, por scripts/arte/gerar-topo.sh)', () => {
  it('o horizonte das contas tem 1702 × 880 (2 px por du: 851 × 440) e o token da faixa é a mesma altura em dp', () => {
    expect(dimensoesDoWebp('horizonte-contas.webp')).toEqual([1702, 880]);
    expect(size.auth.horizonteAltura).toBe(du(880 / 2));
  });
});
