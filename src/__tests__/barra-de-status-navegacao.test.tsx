import { act } from '@testing-library/react-native';
import { router, Slot } from 'expo-router';
import { renderRouter } from 'expo-router/testing-library';
import { Text } from 'react-native';
import AppLayout from '../../app/(app)/_layout';
import { BarraDeStatus, BarraDeStatusPadrao } from '../components/BarraDeStatus';

// A `StatusBar` do RN guarda uma pilha das que estão montadas e vale a última; este dublê faz o mesmo (entra na pilha ao montar,
// sai ao desmontar). O que se prova aqui, com a navegação de verdade (Expo Router + as abas do app), é QUEM está montado em cada tela.
const mockPilha: { id: number; style: string }[] = [];
jest.mock('expo-status-bar', () => {
  const React = require('react');
  let proximo = 0;
  return {
    StatusBar: ({ style }: { style: string }) => {
      const id = React.useRef(proximo++).current;
      React.useEffect(() => {
        mockPilha.push({ id, style });
        return () => {
          const i = mockPilha.findIndex((entrada) => entrada.id === id);
          if (i >= 0) mockPilha.splice(i, 1);
        };
      }, [id, style]);
      return null;
    },
  };
});

const emVigor = () => mockPilha[mockPilha.length - 1]?.style;

// Como no app: a raiz declara o padrão; a lista e as configurações (cabeçalho verde) pedem texto claro; o formulário, o mapa e o sucesso não declaram.
const Raiz = () => (
  <>
    <BarraDeStatusPadrao />
    <Slot />
  </>
);
const escura = (nome: string) => () => (
  <>
    <BarraDeStatus sobre="escuro" />
    <Text>{nome}</Text>
  </>
);
const clara = (nome: string) => () => <Text>{nome}</Text>;
const telas = {
  _layout: Raiz,
  '(app)/_layout': AppLayout,
  '(app)/inicio': escura('inicio'),
  '(app)/index': escura('lista'),
  '(app)/novo': clara('novo'),
  '(app)/editar': clara('editar'),
  '(app)/mapa': clara('mapa'),
  '(app)/sucesso': clara('sucesso'),
  '(app)/config': escura('config'),
};

const abrir = async (initialUrl: string) => {
  const app = renderRouter(telas, { initialUrl });
  await app;
};
const ir = async (destino: Parameters<typeof router.navigate>[0]) => { await act(async () => { router.navigate(destino); }); };
const voltar = async () => { await act(async () => { router.back(); }); };

beforeEach(() => { mockPilha.length = 0; });

describe('Barra de status com a navegação de verdade (as abas ficam montadas)', () => {
  it('a lista de fundo verde pede texto claro; o formulário claro volta ao padrão escuro mesmo com a lista ainda montada', async () => {
    await abrir('/');
    expect(emVigor()).toBe('light');
    await ir('/novo');
    expect(emVigor()).toBe('dark');
    await voltar();
    expect(emVigor()).toBe('light');
  });

  it('passa de tela em tela (lista, mapa, configurações, sucesso) sempre com a cor do fundo da que está em foco', async () => {
    await abrir('/');
    expect(emVigor()).toBe('light');
    await ir('/mapa');
    expect(emVigor()).toBe('dark');
    await ir('/config');
    expect(emVigor()).toBe('light');
    await ir({ pathname: '/sucesso', params: { id: 'a1' } });
    expect(emVigor()).toBe('dark');
    await ir('/inicio');
    expect(emVigor()).toBe('light');
  });

  it('só a tela em foco fica declarando (a lista escondida, ainda montada, não fica na pilha)', async () => {
    await abrir('/');
    await ir('/novo');
    expect(mockPilha.map((entrada) => entrada.style)).toEqual(['dark']);
    await ir('/config');
    expect(mockPilha.map((entrada) => entrada.style)).toEqual(['dark', 'light']);
  });
});
