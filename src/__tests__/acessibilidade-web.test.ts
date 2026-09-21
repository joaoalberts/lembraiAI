import fs from 'fs';
import path from 'path';

/**
 * O react-native-web 0.21 (o app na web) não repassa tudo o que o React Native repassa. Estes testes leem os fontes e barram
 * os padrões que funcionam no celular e somem no navegador; a conferência do DOM de verdade é feita no navegador.
 */
const RAIZ = path.join(__dirname, '../..');
const PASTAS = ['app', 'src'];
const IGNORADOS = [/__tests__\//, /\.test\.tsx?$/, /\.d\.ts$/, /^src\/test-utils\//];

function listar(pasta: string): string[] {
  return fs.readdirSync(path.join(RAIZ, pasta), { withFileTypes: true }).flatMap((e) => {
    const rel = path.posix.join(pasta, e.name);
    if (e.isDirectory()) return e.name === 'node_modules' ? [] : listar(rel);
    return /\.tsx$/.test(e.name) ? [rel] : [];
  });
}

const arquivos = PASTAS.flatMap(listar).filter((a) => !IGNORADOS.some((r) => r.test(a))).sort();
const ler = (arquivo: string) => fs.readFileSync(path.join(RAIZ, arquivo), 'utf8');

describe('acessibilidade na web (react-native-web 0.21)', () => {
  it('há componentes para varrer', () => {
    expect(arquivos.length).toBeGreaterThan(30);
  });

  it('ninguém usa accessibilityState: o react-native-web não o repassa ao DOM. Use aria-checked, aria-selected e aria-disabled (ou a prop disabled do Pressable)', () => {
    const usam = arquivos.filter((a) => /\baccessibilityState\s*=/.test(ler(a)));
    expect(usam).toEqual([]);
  });

  it('todo focusable={false} vem com tabIndex={-1} no mesmo arquivo: o Pressable do react-native-web só lê o tabIndex', () => {
    const semTabIndex = arquivos.filter((a) => /focusable=\{false\}/.test(ler(a)) && !/tabIndex=\{-1\}/.test(ler(a)));
    expect(semTabIndex).toEqual([]);
  });

  it('o detector enxerga o padrão que barra (não passa por não achar nada)', () => {
    expect(/\baccessibilityState\s*=/.test('<Pressable accessibilityState={{ checked }} />')).toBe(true);
    expect(/\baccessibilityState\s*=/.test('<Pressable aria-checked={checked} />')).toBe(false);
    expect(/focusable=\{false\}/.test('<Pressable focusable={false} />')).toBe(true);
  });
});
