import '@testing-library/react-native/matchers';
import { render, screen } from '@testing-library/react-native';
import { borderWidth, colors, radius, space } from '../../design/tokens';
import { Banner } from '../Banner';

const aviso = () => screen.getByTestId('banner');

describe('Banner', () => {
  it('erro: fundo e texto de erro, anunciado como alerta', async () => {
    await render(<Banner variant="error">Não foi possível entrar.</Banner>);
    expect(aviso()).toHaveStyle({ backgroundColor: colors.feedback.dangerBg, borderRadius: radius.sm, padding: space.md });
    expect(screen.getByText('Não foi possível entrar.')).toHaveStyle({ color: colors.text.danger });
    expect(aviso()).toHaveProp('accessibilityRole', 'alert');
  });

  it('sucesso: fundo e texto de sucesso, sem papel de alerta', async () => {
    await render(<Banner variant="success">Senha redefinida.</Banner>);
    expect(aviso()).toHaveStyle({ backgroundColor: colors.feedback.successBg });
    expect(screen.getByText('Senha redefinida.')).toHaveStyle({ color: colors.text.success });
    expect(aviso()).not.toHaveProp('accessibilityRole', 'alert');
  });

  it('informativo: verde-menta com faixa lateral (nunca azul, que não é da paleta)', async () => {
    await render(<Banner variant="info">Você está dentro do raio de 1 lembrete.</Banner>);
    expect(aviso()).toHaveStyle({ backgroundColor: colors.feedback.infoBg, borderLeftWidth: borderWidth.bar, borderLeftColor: colors.feedback.infoBar });
    expect(screen.getByText('Você está dentro do raio de 1 lembrete.')).toHaveStyle({ color: colors.text.primary });
  });

  it('aceita estilo de quem usa (ex.: margem)', async () => {
    await render(<Banner variant="error" style={{ marginBottom: space.lg }}>Erro</Banner>);
    expect(aviso()).toHaveStyle({ marginBottom: space.lg });
  });
});
