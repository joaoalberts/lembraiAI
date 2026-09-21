import '@testing-library/react-native/matchers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { colors } from '../../design/tokens';
import { comAreaSegura } from '../../test-utils/area-segura';
import { useNotifications } from '../../state/notifications';
import { AvisosNaTela } from '../AvisosNaTela';

jest.mock('expo-router', () => ({ router: { navigate: jest.fn() } }));
jest.mock('../../state/notifications', () => ({ useNotifications: jest.fn() }));

const dispensarAviso = jest.fn();
const abrir = async (avisosNaTela: { id: number; title: string; body?: string }[] | undefined, insets = {}) => {
  jest.mocked(useNotifications).mockReturnValue({ avisosNaTela, dispensarAviso } as unknown as ReturnType<typeof useNotifications>);
  await render(comAreaSegura(<AvisosNaTela />, insets));
};

beforeEach(() => jest.clearAllMocks());

describe('AvisosNaTela', () => {
  it('não desenha nada sem aviso (nem no celular, onde o sistema é quem avisa)', async () => {
    await abrir([]);
    expect(screen.queryByTestId('avisos-na-tela')).toBeNull();
    await screen.unmount();
    await abrir(undefined);
    expect(screen.queryByTestId('avisos-na-tela')).toBeNull();
  });

  it('mostra o título e o texto de cada aviso, como alerta para o leitor de tela', async () => {
    await abrir([{ id: 2, title: 'Você chegou: Mercado', body: 'Av. X, 10' }, { id: 1, title: 'Tomar remédio', body: 'Lembrete das 09:00' }]);
    expect(screen.getByText('Você chegou: Mercado')).toBeTruthy();
    expect(screen.getByText('Lembrete das 09:00')).toBeTruthy();
    const cartoes = screen.getAllByTestId('aviso-na-tela');
    expect(cartoes).toHaveLength(2);
    for (const c of cartoes) expect(c).toHaveProp('accessibilityRole', 'alert'); // o cartão não é "accessible": os botões de dentro continuam separados para o leitor de tela
  });

  it('aviso sem texto mostra só o título', async () => {
    await abrir([{ id: 1, title: 'Só título' }]);
    expect(screen.getByText('Só título')).toBeTruthy();
  });

  it('tocar no aviso o dispensa e abre a lista', async () => {
    await abrir([{ id: 7, title: 'Tomar remédio', body: 'Lembrete das 09:00' }]);
    await fireEvent.press(screen.getByRole('button', { name: 'Tomar remédio. Lembrete das 09:00' }));
    expect(dispensarAviso).toHaveBeenCalledWith(7);
    expect(router.navigate).toHaveBeenCalledWith('/');
  });

  it('o X só dispensa, sem navegar', async () => {
    await abrir([{ id: 7, title: 'Tomar remédio' }]);
    await fireEvent.press(screen.getByRole('button', { name: 'Dispensar aviso' }));
    expect(dispensarAviso).toHaveBeenCalledWith(7);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('desce o que a área segura do topo (entalhe, barra de status) ocupa', async () => {
    await abrir([{ id: 1, title: 'A' }], { top: 47 });
    const topo = (screen.getByTestId('avisos-na-tela').props.style as { top: number }[]).find((s) => typeof s?.top === 'number')?.top ?? 0;
    expect(topo).toBeGreaterThanOrEqual(47);
  });

  it('cartão claro com a faixa verde de aviso (não só cor: leva o ícone de sino)', async () => {
    await abrir([{ id: 1, title: 'A' }]);
    expect(screen.getByTestId('icone-bell', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByTestId('aviso-na-tela')).toHaveStyle({ backgroundColor: colors.bg.card, borderLeftColor: colors.feedback.infoBar });
  });
});
