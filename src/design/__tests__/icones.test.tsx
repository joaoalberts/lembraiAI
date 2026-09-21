import fs from 'fs';
import path from 'path';
import { render } from '@testing-library/react-native';
import { ICONES, Icon } from '../../components/Icon';
import { GIRO_NA_LISTA, ICON_NAME, TAB_ICON, UI_ICON } from '../icons';
import { colors, iconStroke, size } from '../tokens';

const PASTA_DO_PACOTE = path.join(__dirname, '../../../node_modules/lucide-react-native/dist/esm/icons');
const registrados = new Set<string>(Object.keys(ICONES));

describe('ícones do Design System (Lucide)', () => {
  it('todo ícone de categoria, de aba e de interface está no registro do componente', () => {
    const nomes = [...Object.values(ICON_NAME), ...Object.values(TAB_ICON), ...Object.values(UI_ICON)];
    expect(nomes.filter((n) => !registrados.has(n))).toEqual([]);
  });

  it('todo ícone registrado existe no pacote (um nome errado ou renomeado só apareceria em execução)', () => {
    expect([...registrados].filter((n) => !fs.existsSync(path.join(PASTA_DO_PACOTE, `${n}.mjs`)))).toEqual([]);
  });

  it('cada categoria tem o seu ícone e os giros só existem para categorias que existem', () => {
    expect(Object.keys(ICON_NAME).sort()).toEqual(['bell', 'briefcase', 'card', 'cart', 'dumbbell', 'house', 'pill', 'pin', 'plane', 'users']);
    expect(Object.keys(GIRO_NA_LISTA).every((k) => k in ICON_NAME)).toBe(true);
  });

  it('as abas são as quatro do app: Início, Lembretes, Mapa e Configurações', () => {
    expect(Object.keys(TAB_ICON)).toEqual(['inicio', 'lembretes', 'mapa', 'config']);
  });

  it('a espessura do traço é positiva e cresce do mais fino ao mais grosso', () => {
    const valores = Object.values(iconStroke);
    expect(valores.every((v) => v > 0)).toBe(true);
    expect(iconStroke.tab).toBeLessThan(iconStroke.base);
    expect(iconStroke.dots).toBeLessThan(iconStroke.check);
  });
});

describe('Icon', () => {
  it('desenha o ícone no tamanho, na cor e na espessura pedidos', async () => {
    const { toJSON } = await render(<Icon name="bell" size={size.icon.lg} color={colors.action.primary} stroke={iconStroke.ui} />);
    const json = JSON.stringify(toJSON());
    expect(json).toContain(`"width":${size.icon.lg}`);
    expect(json).toContain(`"height":${size.icon.lg}`);
    expect(json).toContain(colors.action.primary);
    expect(json).toContain(`"strokeWidth":${iconStroke.ui}`);
  });

  it('sem pedido, usa o tamanho de ação, a cor padrão de ícone e o traço base', async () => {
    const json = JSON.stringify((await render(<Icon name="x" />)).toJSON());
    expect(json).toContain(`"width":${size.icon.md}`);
    expect(json).toContain(colors.icon.default);
    expect(json).toContain(`"strokeWidth":${iconStroke.base}`);
  });

  it('é decorativo: escondido do leitor de tela', async () => {
    const { toJSON } = await render(<Icon name="bell" />);
    const raiz = toJSON() as { props: Record<string, unknown> };
    expect(raiz.props.accessibilityElementsHidden).toBe(true);
    expect(raiz.props.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('gira o glifo quando pedido e não gira quando não', async () => {
    const girado = (await render(<Icon name="plane" giro={-45} />)).toJSON() as { props: { style?: { transform: { rotate: string }[] } } };
    expect(girado.props.style?.transform[0].rotate).toBe('-45deg');
    const reto = (await render(<Icon name="plane" />)).toJSON() as { props: { style?: unknown } };
    expect(reto.props.style).toBeUndefined();
  });
});
