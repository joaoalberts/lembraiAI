import { render } from '@testing-library/react-native';
import { useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { BarraDeStatus, BarraDeStatusPadrao } from '../BarraDeStatus';

jest.mock('expo-status-bar', () => ({ StatusBar: jest.fn(() => null) }));
jest.mock('expo-router', () => ({ useIsFocused: jest.fn() }));

const declaradas = () => jest.mocked(StatusBar).mock.calls.map(([props]) => props);

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useIsFocused).mockReturnValue(true);
});

describe('BarraDeStatus (a cor do relógio e da bateria)', () => {
  it('sobre fundo escuro o texto da barra é claro', async () => {
    await render(<BarraDeStatus sobre="escuro" />);
    expect(declaradas()).toEqual([{ style: 'light' }]);
  });

  it('sobre fundo claro o texto da barra é escuro', async () => {
    await render(<BarraDeStatus sobre="claro" />);
    expect(declaradas()).toEqual([{ style: 'dark' }]);
  });

  it('fora de foco não declara nada: as abas ficam montadas e a última montada venceria', async () => {
    jest.mocked(useIsFocused).mockReturnValue(false);
    await render(<BarraDeStatus sobre="escuro" />);
    expect(declaradas()).toEqual([]);
  });

  it('ao ganhar o foco declara, e ao perdê-lo deixa de declarar (a barra volta ao padrão de baixo)', async () => {
    jest.mocked(useIsFocused).mockReturnValue(false);
    const { rerender } = await render(<BarraDeStatus sobre="escuro" />);
    expect(declaradas()).toEqual([]);
    jest.mocked(useIsFocused).mockReturnValue(true);
    await rerender(<BarraDeStatus sobre="escuro" />);
    expect(declaradas()).toEqual([{ style: 'light' }]);
  });

  it('sem navegação por perto (a peça solta em teste) vale como em foco, em vez de quebrar', async () => {
    jest.mocked(useIsFocused).mockImplementation(() => { throw new Error("Couldn't find a navigation object"); });
    await render(<BarraDeStatus sobre="escuro" />);
    expect(declaradas()).toEqual([{ style: 'light' }]);
  });
});

describe('BarraDeStatusPadrao (o padrão da raiz)', () => {
  it('declara texto escuro: as telas claras (formulário, mapa, sucesso, páginas públicas) não precisam declarar nada', async () => {
    await render(<BarraDeStatusPadrao />);
    expect(declaradas()).toEqual([{ style: 'dark' }]);
  });
});
