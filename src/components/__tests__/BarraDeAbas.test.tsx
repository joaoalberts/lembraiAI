import '@testing-library/react-native/matchers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { StyleSheet } from 'react-native';
import { anelDeFoco } from '../../design/foco';
import { colors, fontFamily, fontSize, iconStroke, lineHeight, opacity, shadow, size } from '../../design/tokens';
import { comAreaSegura } from '../../test-utils/area-segura';
import { ABAS, BarraDeAbas, abaAtiva, estiloDaAba } from '../BarraDeAbas';

const NOMES = ['novo', 'index', 'editar', 'mapa', 'config', 'sucesso'];
const rotas = NOMES.map((name) => ({ key: `${name}-1`, name }));

function props(emFoco: string, opcoesDaTela: Record<string, unknown> = {}) {
  const navigation = { emit: jest.fn(() => ({ defaultPrevented: false })), navigate: jest.fn() };
  const descriptors = Object.fromEntries(rotas.map((r) => [r.key, { options: r.name === emFoco ? opcoesDaTela : {} }]));
  const propsDaBarra = { state: { index: NOMES.indexOf(emFoco), routes: rotas }, descriptors, navigation } as unknown as BottomTabBarProps;
  return { propsDaBarra, navigation };
}

const abrir = async (emFoco: string, insets = {}, opcoesDaTela: Record<string, unknown> = {}) => {
  const { propsDaBarra, navigation } = props(emFoco, opcoesDaTela);
  await render(comAreaSegura(<BarraDeAbas {...propsDaBarra} />, insets));
  return navigation;
};

const aba = (rotulo: string) => screen.getByRole('tab', { name: rotulo });
const estilo = (el: { props: { style?: unknown } }) => StyleSheet.flatten(el.props.style as never) as Record<string, unknown>;

describe('abaAtiva', () => {
  it('a aba de cada tela é ela mesma', () => {
    for (const { rota } of ABAS) expect(abaAtiva(rota)).toBe(rota);
  });

  it('o formulário de novo lembrete é a aba "Criar" e o de edição acende "Lembretes"', () => {
    expect(abaAtiva('novo')).toBe('novo');
    expect(abaAtiva('editar')).toBe('index');
  });

  it('a abertura ("Lembre de tudo!") não é aba: só quem ainda não entrou a vê, então nenhuma rota `inicio` acende aba', () => {
    expect(abaAtiva('inicio')).toBeNull();
  });

  it('tela que não pertence a nenhuma aba (sucesso) não acende nenhuma', () => {
    expect(abaAtiva('sucesso')).toBeNull();
  });
});

describe('BarraDeAbas', () => {
  it('o rótulo da aba tem o tamanho do original (`.tab`, 17,8 du = 9 dp)', async () => {
    await abrir('index');
    for (const nome of ['Criar', 'Lembretes', 'Mapa', 'Configurações']) {
      expect(screen.getByText(nome)).toHaveStyle({ fontSize: fontSize.pico, lineHeight: lineHeight.pico });
    }
  });

  it('mostra as quatro abas na ordem Criar, Lembretes, Mapa, Configurações', async () => {
    await abrir('index');
    expect(screen.getAllByRole('tab').map((t) => t.props.accessibilityLabel)).toEqual(['Criar', 'Lembretes', 'Mapa', 'Configurações']);
    expect(ABAS.map((a) => a.rota)).toEqual(['novo', 'index', 'mapa', 'config']);
  });

  it('a aba em foco está selecionada e as outras não; só ela leva aria-current', async () => {
    await abrir('mapa');
    expect(aba('Mapa')).toBeSelected();
    expect(aba('Mapa').props['aria-current']).toBe('page');
    for (const outra of ['Criar', 'Lembretes', 'Configurações']) {
      expect(aba(outra)).not.toBeSelected();
      expect(aba(outra).props['aria-current']).toBeUndefined();
    }
  });

  it('a aba ativa engrossa o traço, escurece o ícone e põe o rótulo em negrito; a inativa é cinza e fina', async () => {
    await abrir('index');
    const desenho = (nome: string) => JSON.stringify(screen.getByTestId(`icone-${nome}`, { includeHiddenElements: true }).children);
    expect(desenho('list')).toContain(colors.tab.activeIcon);
    expect(desenho('list')).toContain(`"strokeWidth":${iconStroke.base}`);
    expect(desenho('plus')).toContain(colors.tab.inactive);
    expect(desenho('plus')).toContain(`"strokeWidth":${iconStroke.tab}`);
    expect(estilo(screen.getByText('Lembretes'))).toMatchObject({ fontFamily: fontFamily.bold, color: colors.text.brand });
    expect(estilo(screen.getByText('Criar'))).toMatchObject({ color: colors.tab.inactive });
    expect(estilo(screen.getByText('Criar'))).not.toMatchObject({ fontFamily: fontFamily.bold });
  });

  it('no formulário de novo lembrete a aba Criar fica acesa', async () => {
    await abrir('novo');
    expect(aba('Criar')).toBeSelected();
    expect(aba('Lembretes')).not.toBeSelected();
  });

  it('na edição de um lembrete a aba Lembretes fica acesa', async () => {
    await abrir('editar');
    expect(aba('Lembretes')).toBeSelected();
    expect(aba('Criar')).not.toBeSelected();
  });

  it('tocar em Criar leva ao formulário de novo lembrete', async () => {
    const navigation = await abrir('index');
    await fireEvent.press(aba('Criar'));
    expect(navigation.navigate).toHaveBeenCalledWith('novo');
  });

  it('toque numa aba diferente avisa o navegador e navega; toque na aba atual não faz nada', async () => {
    const navigation = await abrir('index');
    await fireEvent.press(aba('Mapa'));
    expect(navigation.emit).toHaveBeenCalledWith({ type: 'tabPress', target: 'mapa-1', canPreventDefault: true });
    expect(navigation.navigate).toHaveBeenCalledWith('mapa');
    navigation.navigate.mockClear();
    await fireEvent.press(aba('Lembretes'));
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('se alguém impede o toque (tabPress cancelado) a barra não navega', async () => {
    const { propsDaBarra, navigation } = props('index');
    navigation.emit.mockReturnValue({ defaultPrevented: true });
    await render(comAreaSegura(<BarraDeAbas {...propsDaBarra} />));
    await fireEvent.press(aba('Criar'));
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  it('a tela de sucesso esconde a barra', async () => {
    await abrir('sucesso', {}, { tabBarStyle: { display: 'none' } });
    expect(screen.queryByTestId('barra-de-abas')).toBeNull();
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
  });

  it('fundo claro com sombra para cima, quatro abas iguais e a base mínima de 25', async () => {
    await abrir('index');
    expect(screen.getByTestId('barra-de-abas')).toHaveStyle({ backgroundColor: colors.tab.background, boxShadow: shadow.tabBar, paddingTop: size.tabBar.top, paddingBottom: size.tabBar.bottom, flexDirection: 'row' });
    expect(estilo(aba('Mapa'))).toMatchObject({ flex: 1, minHeight: size.tabBar.item, gap: size.tabBar.gap });
    expect(size.tabBar.item).toBeGreaterThanOrEqual(size.touch);
  });

  it('num aparelho com barra de gestos maior que o mínimo, a base a acompanha', async () => {
    await abrir('index', { bottom: 34 });
    expect(screen.getByTestId('barra-de-abas')).toHaveStyle({ paddingBottom: 34 });
  });

  it('é uma lista de abas para o leitor de tela', async () => {
    await abrir('index');
    expect(screen.getByTestId('barra-de-abas')).toHaveProp('accessibilityRole', 'tablist');
  });
});

describe('estiloDaAba', () => {
  const plano = (e: Parameters<typeof estiloDaAba>[0]) => StyleSheet.flatten(estiloDaAba(e)) as Record<string, unknown>;

  it('pressionada fica com 60% de opacidade; repouso não muda', () => {
    expect(plano({ pressed: true })).toMatchObject({ opacity: opacity.tab });
    expect(plano({ pressed: false })).not.toHaveProperty('opacity');
  });

  it('foco de teclado (web): o anel de foco de todos os controles', () => {
    expect(plano({ pressed: false, focused: true })).toMatchObject(anelDeFoco);
    expect(plano({ pressed: false })).not.toHaveProperty('outlineWidth');
  });
});
