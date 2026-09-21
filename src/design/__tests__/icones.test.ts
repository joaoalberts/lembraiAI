import Ionicons from '@expo/vector-icons/Ionicons';
import { ICON_NAME, TAB_ICON, UI_ICON } from '../icons';

const existe = (nome: string) => nome in Ionicons.glyphMap;

describe('ícones do Design System (Ionicons, contorno)', () => {
  it('todo ícone de categoria existe na fonte Ionicons', () => {
    const inexistentes = Object.entries(ICON_NAME).filter(([, nome]) => !existe(nome)).map(([chave]) => chave);
    expect(inexistentes).toEqual([]);
  });

  it('todo ícone de aba e de interface existe na fonte', () => {
    const nomes = [...Object.values(TAB_ICON).flat(), ...Object.values(UI_ICON)];
    expect(nomes.filter((n) => !existe(n))).toEqual([]);
  });

  it('as categorias usam a versão em contorno (identidade da marca), nunca a preenchida', () => {
    expect(Object.values(ICON_NAME).every((n) => n.endsWith('-outline'))).toBe(true);
  });

  it('cada aba tem o par [ativa, inativa] e a inativa é o contorno da ativa', () => {
    for (const [ativa, inativa] of Object.values(TAB_ICON)) expect(inativa).toBe(`${ativa}-outline`);
  });
});
