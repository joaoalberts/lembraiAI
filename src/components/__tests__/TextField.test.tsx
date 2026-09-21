import '@testing-library/react-native/matchers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { borderWidth, colors, radius, shadow } from '../../design/tokens';
import { TextField } from '../TextField';

const campo = () => screen.getByPlaceholderText('seu@email.com');
const base = { placeholder: 'seu@email.com', value: '', onChangeText: () => {} };

describe('TextField', () => {
  it('rótulo acima e placeholder na cor de placeholder', async () => {
    await render(<TextField {...base} label="E-mail" />);
    expect(screen.getByText('E-mail')).toHaveStyle({ color: colors.text.primary });
    expect(campo()).toHaveProp('placeholderTextColor', colors.text.placeholder);
  });

  it('em repouso: fundo branco, borda suave e raio de campo', async () => {
    await render(<TextField {...base} label="E-mail" />);
    expect(campo()).toHaveStyle({ backgroundColor: colors.bg.field, borderColor: colors.border.field, borderWidth: borderWidth.hairline, borderRadius: radius.md });
  });

  it('em foco: borda verde e halo; ao sair, volta ao repouso', async () => {
    await render(<TextField {...base} label="E-mail" />);
    await fireEvent(campo(), 'focus');
    expect(campo()).toHaveStyle({ borderColor: colors.border.focus, boxShadow: shadow.focus });
    await fireEvent(campo(), 'blur');
    expect(campo()).toHaveStyle({ borderColor: colors.border.field });
    expect(campo()).not.toHaveStyle({ boxShadow: shadow.focus });
  });

  it('com erro: borda de erro, o fundo continua branco e a mensagem é anunciada como alerta', async () => {
    await render(<TextField {...base} label="E-mail" error="Informe um e-mail válido." />);
    expect(campo()).toHaveStyle({ borderColor: colors.border.danger, backgroundColor: colors.bg.field });
    const mensagem = screen.getByText('Informe um e-mail válido.');
    expect(mensagem).toHaveStyle({ color: colors.text.danger });
    expect(mensagem).toHaveProp('accessibilityRole', 'alert');
  });

  it('a dica aparece sozinha e some quando há erro', async () => {
    const { rerender } = await render(<TextField {...base} hint="Use o e-mail do cadastro." />);
    expect(screen.getByText('Use o e-mail do cadastro.')).toHaveStyle({ color: colors.text.secondary });
    await rerender(<TextField {...base} hint="Use o e-mail do cadastro." error="Informe um e-mail válido." />);
    expect(screen.queryByText('Use o e-mail do cadastro.')).toBeNull();
  });

  it('desabilitado: fundo e texto de desabilitado, e não aceita edição', async () => {
    await render(<TextField {...base} editable={false} />);
    expect(campo()).toHaveStyle({ backgroundColor: colors.bg.disabled, color: colors.text.secondary });
    expect(campo()).toHaveProp('editable', false);
  });

  it('sem contorno do navegador: o foco é desenhado só pela borda verde e pelo halo (senão o navegador soma um anel âmbar)', async () => {
    await render(<TextField {...base} label="E-mail" />);
    expect(campo()).toHaveStyle({ outlineWidth: 0 });
  });

  it('e-mail: teclado de e-mail sem capitalizar (comportamento preservado)', async () => {
    await render(<TextField {...base} keyboardType="email-address" />);
    expect(campo()).toHaveProp('autoCapitalize', 'none');
  });
});
