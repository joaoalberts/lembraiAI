import '@testing-library/react-native/matchers';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { colors, space, textStyles } from '../../design/tokens';
import { AuthLayout } from '../AuthLayout';

describe('AuthLayout (base das telas de conta)', () => {
  it('mostra o título como cabeçalho, no estilo de exibição, e o subtítulo em texto secundário', async () => {
    await render(<AuthLayout title="LembreiAi" subtitle="Entre na sua conta"><Text>corpo</Text></AuthLayout>);
    expect(screen.getByRole('header', { name: 'LembreiAi' })).toHaveStyle({ ...textStyles.display, color: colors.text.primary });
    expect(screen.getByText('Entre na sua conta')).toHaveStyle({ color: colors.text.secondary });
    expect(screen.getByText('corpo')).toBeTruthy();
  });

  it('sem título não desenha cabeçalho (a tela de "confira seu e-mail" usa o próprio bloco)', async () => {
    await render(<AuthLayout><Text>só o corpo</Text></AuthLayout>);
    expect(screen.queryByRole('header')).toBeNull();
    expect(screen.getByText('só o corpo')).toBeTruthy();
  });

  it('fundo de página e respiro das telas de conta em volta do conteúdo', async () => {
    await render(<AuthLayout title="Entrar"><Text>corpo</Text></AuthLayout>);
    expect(screen.getByTestId('auth-layout')).toHaveStyle({ backgroundColor: colors.bg.page });
    expect(screen.getByTestId('auth-layout')).toHaveProp('contentContainerStyle', { padding: space.xl, justifyContent: 'center', minHeight: '100%' });
  });

  it('repassa keyboardShouldPersistTaps (a etapa do código precisa que o toque no botão não feche o teclado antes)', async () => {
    await render(<AuthLayout title="Redefinir" keyboardShouldPersistTaps="handled"><Text>corpo</Text></AuthLayout>);
    expect(screen.getByTestId('auth-layout')).toHaveProp('keyboardShouldPersistTaps', 'handled');
  });
});
