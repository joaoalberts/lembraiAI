import fs from 'fs';
import path from 'path';

/**
 * Todo controle do app passa por `Toque` (src/components/Toque.tsx), que completa o alvo de toque até 44 no celular e na web.
 * O `Pressable` cru não faz isso (o react-native-web 0.21 nem tem `hitSlop`), então nenhum arquivo o importa, salvo o próprio Toque.
 */
const RAIZ = path.join(__dirname, '../..');
const PASTAS = ['app', 'src'];
const IGNORADOS = [/__tests__\//, /\.test\.tsx?$/, /\.d\.ts$/, /^src\/test-utils\//, /^src\/components\/Toque\.tsx$/];

function listar(pasta: string): string[] {
  return fs.readdirSync(path.join(RAIZ, pasta), { withFileTypes: true }).flatMap((e) => {
    const rel = path.posix.join(pasta, e.name);
    if (e.isDirectory()) return e.name === 'node_modules' ? [] : listar(rel);
    return /\.tsx$/.test(e.name) ? [rel] : [];
  });
}

const arquivos = PASTAS.flatMap(listar).filter((a) => !IGNORADOS.some((r) => r.test(a))).sort();
const ler = (arquivo: string) => fs.readFileSync(path.join(RAIZ, arquivo), 'utf8');
/** `import { ..., Pressable, ... } from 'react-native'` (várias linhas também). */
const IMPORTA_PRESSABLE = /import\s*\{[^}]*\bPressable\b[^}]*\}\s*from\s*['"]react-native['"]/;

describe('alvos de toque de 44', () => {
  it('há componentes para varrer', () => {
    expect(arquivos.length).toBeGreaterThan(30);
  });

  it('nenhum componente importa o Pressable do react-native: todo controle usa o Toque', () => {
    expect(arquivos.filter((a) => IMPORTA_PRESSABLE.test(ler(a)))).toEqual([]);
  });

  it('o detector enxerga o padrão que barra', () => {
    expect(IMPORTA_PRESSABLE.test("import { View, Pressable, Text } from 'react-native';")).toBe(true);
    expect(IMPORTA_PRESSABLE.test("import {\n  StyleSheet,\n  Pressable,\n} from 'react-native';")).toBe(true);
    expect(IMPORTA_PRESSABLE.test("import { View, Text } from 'react-native';")).toBe(false);
    expect(IMPORTA_PRESSABLE.test("import { Toque } from './Toque';")).toBe(false);
  });

  it('ninguém desliga o alvo mínimo (alvoMinimo) de um controle: o 44 vale para todos', () => {
    expect(arquivos.filter((a) => /\balvoMinimo\s*=/.test(ler(a)))).toEqual([]);
  });

  it('ninguém passa hitSlop a mão: o Toque completa o alvo sozinho (o hitSlop escrito à mão só vale no celular e se afasta do 44)', () => {
    expect(arquivos.filter((a) => /\bhitSlop\s*=/.test(ler(a)))).toEqual([]);
  });
});
