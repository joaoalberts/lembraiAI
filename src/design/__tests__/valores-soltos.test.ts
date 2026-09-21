import fs from 'fs';
import path from 'path';
import { achadosNoTexto } from '../valores-soltos';

const RAIZ = path.join(__dirname, '../../..');
const PASTAS = ['app', 'src'];
const IGNORADOS = [/^src\/design\//, /__tests__\//, /\.test\.tsx?$/, /\.d\.ts$/];

/**
 * Arquivos que ainda têm cor, tamanho ou peso solto. A lista só encolhe: ao migrar um arquivo para os tokens, tire-o
 * daqui (o teste "já migrou" abaixo cobra isso). Vazia = nenhum valor visual solto no app.
 */
const PENDENTES: string[] = [
  'app/(app)/_layout.tsx',
  'app/(app)/config.tsx',
  'app/(app)/index.tsx',
  'app/(app)/mapa.tsx',
  'app/(app)/novo.tsx',
  'app/+html.tsx',
  'app/_layout.tsx',
  'app/auth/forgot-password.tsx',
  'app/auth/login.tsx',
  'app/auth/reset-password.tsx',
  'app/auth/signup.tsx',
  'app/excluir-conta.tsx',
  'app/privacidade.tsx',
  'src/components/Button.tsx',
  'src/components/LeafletMapDom.tsx',
  'src/components/ReminderCard.tsx',
  'src/components/RemindersMap.web.tsx',
  'src/components/TextField.tsx',
  'src/data/reminders.ts',
];

function listar(pasta: string): string[] {
  return fs.readdirSync(path.join(RAIZ, pasta), { withFileTypes: true }).flatMap((e) => {
    const rel = path.posix.join(pasta, e.name);
    if (e.isDirectory()) return e.name === 'node_modules' ? [] : listar(rel);
    return /\.(ts|tsx)$/.test(e.name) ? [rel] : [];
  });
}

const arquivos = PASTAS.flatMap(listar).filter((a) => !IGNORADOS.some((r) => r.test(a))).sort();
const ler = (arquivo: string) => fs.readFileSync(path.join(RAIZ, arquivo), 'utf8');

describe('achadosNoTexto (o detector de valores soltos)', () => {
  it('acusa cor hex e rgba', () => {
    expect(achadosNoTexto("const a = { color: '#FE532A' };")).toHaveLength(1);
    expect(achadosNoTexto("backgroundColor: 'rgba(0,0,0,0.4)'")).toHaveLength(1);
  });

  it('acusa tamanho, espaçamento, raio, borda, dimensão e opacidade numéricos', () => {
    for (const linha of ['fontSize: 16', 'lineHeight: 22', 'padding: 12', 'paddingHorizontal: 8', 'marginTop: -4', 'gap: 8', 'borderRadius: 12', 'borderWidth: 1', 'width: 44', 'maxWidth: 560', 'top: 12', 'opacity: 0.55']) {
      expect({ linha, n: achadosNoTexto(linha).length }).toEqual({ linha, n: 1 });
    }
  });

  it('acusa peso de fonte escrito à mão', () => {
    expect(achadosNoTexto("fontWeight: '600'")).toHaveLength(1);
    expect(achadosNoTexto("fontWeight: 'bold'")).toHaveLength(1);
  });

  it('não acusa token, zero, porcentagem, flex nem comentário', () => {
    for (const linha of ['padding: space.md', 'fontSize: fontSize.body', 'margin: 0', 'width: \'100%\'', 'flex: 1', '// padding: 12 era assim', '/* #FFF */', 'opacity: opacity.disabled', 'borderWidth: borderWidth.hairline']) {
      expect({ linha, n: achadosNoTexto(linha).length }).toEqual({ linha, n: 0 });
    }
  });

  it('não confunde a barra dupla de uma URL com comentário', () => {
    expect(achadosNoTexto("const u = 'https://x.y'; const c = '#FFFFFF';")).toHaveLength(1);
  });
});

describe('valores visuais soltos no app', () => {
  const migrados = arquivos.filter((a) => !PENDENTES.includes(a));

  it.each(migrados)('%s usa só tokens do Design System', (arquivo) => {
    const achados = achadosNoTexto(ler(arquivo)).map((a) => `linha ${a.linha}: ${a.trecho}`);
    expect(achados).toEqual([]);
  });

  it('todo arquivo da lista PENDENTES existe e ainda tem valor solto (migrou? tire-o da lista)', () => {
    const inexistentes = PENDENTES.filter((a) => !arquivos.includes(a));
    const jaMigrados = PENDENTES.filter((a) => arquivos.includes(a) && achadosNoTexto(ler(a)).length === 0);
    expect({ inexistentes, jaMigrados }).toEqual({ inexistentes: [], jaMigrados: [] });
  });
});
