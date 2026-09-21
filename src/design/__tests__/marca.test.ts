import fs from 'fs';
import path from 'path';
import { colors } from '../tokens';

const RAIZ = path.join(__dirname, '../../..');
const ler = (arquivo: string) => fs.readFileSync(path.join(RAIZ, arquivo), 'utf8');
const json = (arquivo: string) => JSON.parse(ler(arquivo));

/** Cores que vivem em arquivos de configuração (JSON, SVG) e por isso não podem importar os tokens: o teste garante que não divergem. */
describe('cores de marca fora do código batem com os tokens', () => {
  const plugins = json('app.json').expo.plugins as unknown[];
  const opcoes = (nome: string) => (plugins.find((p) => Array.isArray(p) && p[0] === nome) as [string, Record<string, string>])[1];

  it('a tela de abertura usa o fundo do ícone do app', () => {
    expect(opcoes('expo-splash-screen').backgroundColor).toBe(colors.brand.tile);
  });

  it('o ícone de notificação do Android é tingido com a cor de ação', () => {
    expect(opcoes('expo-notifications').color).toBe(colors.action.primary);
  });

  it('o manifesto do PWA usa o fundo de página na abertura e o verde da marca na faixa do topo', () => {
    const manifesto = json('public/manifest.webmanifest');
    expect(manifesto.background_color).toBe(colors.bg.page);
    expect(manifesto.theme_color).toBe(colors.bg.stage);
  });

  it('a faixa do topo do Safari (metatag theme-color) é o verde da marca, a mesma do manifesto (o creme aparecia como tarja branca)', () => {
    expect(ler('app/+html.tsx')).toContain('<meta name="theme-color" content={colors.bg.stage} />');
  });

  it('o favicon usa as cores do ícone do app', () => {
    const svg = ler('public/favicon.svg').toUpperCase();
    for (const cor of [colors.brand.tile, colors.brand.tileEnd, colors.brand.glyph]) expect(svg).toContain(cor);
  });

  it('o app é só claro (as referências não têm modo escuro); mudar isto pede tokens novos', () => {
    expect(json('app.json').expo.userInterfaceStyle).toBe('light');
  });
});
