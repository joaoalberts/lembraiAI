import '@testing-library/react-native/matchers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { colors, fontFamily, fontSize, radius, shadow, size } from '../../design/tokens';
import { TextField } from '../TextField';

const campo = () => screen.getByPlaceholderText('seu@email.com');
const caixa = () => screen.getByTestId('campo-caixa');
const base = { placeholder: 'seu@email.com', value: '', onChangeText: () => {} };
const ESCONDIDO = { includeHiddenElements: true } as const;

describe('TextField', () => {
  it('rótulo em negrito acima e placeholder na cor de placeholder', async () => {
    await render(<TextField {...base} label="E-mail" />);
    expect(screen.getByText('E-mail')).toHaveStyle({ color: colors.text.primary, fontFamily: fontFamily.bold, fontSize: fontSize.mini });
    expect(campo()).toHaveProp('placeholderTextColor', colors.text.placeholder);
  });

  it('o texto digitado usa a fonte da marca (o campo de texto não herda a fonte do Text: sem isto cai na do sistema)', async () => {
    await render(<TextField {...base} label="E-mail" />);
    expect(campo()).toHaveStyle({ fontFamily: fontFamily.regular, fontSize: fontSize.caption, color: colors.text.primary });
  });

  it('em repouso: caixa branca de 46 de altura, raio de campo e o anel cinza por dentro', async () => {
    await render(<TextField {...base} label="E-mail" />);
    expect(caixa()).toHaveStyle({ backgroundColor: colors.bg.field, height: size.campo.height, borderRadius: radius.campo, boxShadow: shadow.field });
  });

  it('em foco: anel verde e halo; ao sair, volta ao repouso', async () => {
    await render(<TextField {...base} label="E-mail" />);
    await fireEvent(campo(), 'focus');
    expect(caixa()).toHaveStyle({ boxShadow: shadow.fieldFocus });
    await fireEvent(campo(), 'blur');
    expect(caixa()).toHaveStyle({ boxShadow: shadow.field });
  });

  it('com erro: anel vermelho, o fundo continua branco e a mensagem, com ícone, é anunciada como alerta', async () => {
    await render(<TextField {...base} label="E-mail" error="Informe um e-mail válido." />);
    expect(caixa()).toHaveStyle({ boxShadow: shadow.campoErro, backgroundColor: colors.bg.field });
    const mensagem = screen.getByText('Informe um e-mail válido.');
    expect(mensagem).toHaveStyle({ color: colors.text.danger });
    expect(mensagem).toHaveProp('accessibilityRole', 'alert');
    expect(screen.getByTestId('icone-triangle-alert', ESCONDIDO)).toBeTruthy();
  });

  it('com erro e em foco: o anel vermelho ganha o halo vermelho (o verde do foco não aparece)', async () => {
    await render(<TextField {...base} label="E-mail" error="Informe um e-mail válido." />);
    await fireEvent(campo(), 'focus');
    expect(caixa()).toHaveStyle({ boxShadow: shadow.campoErroFoco });
  });

  it('a dica aparece sozinha e some quando há erro', async () => {
    const { rerender } = await render(<TextField {...base} hint="Use o e-mail do cadastro." />);
    expect(screen.getByText('Use o e-mail do cadastro.')).toHaveStyle({ color: colors.text.secondary });
    expect(screen.queryByTestId('icone-triangle-alert', ESCONDIDO)).toBeNull();
    await rerender(<TextField {...base} hint="Use o e-mail do cadastro." error="Informe um e-mail válido." />);
    expect(screen.queryByText('Use o e-mail do cadastro.')).toBeNull();
  });

  it('sem rótulo, sem dica e sem erro não sobra elemento a mais', async () => {
    await render(<TextField {...base} label="" />);
    expect(screen.queryAllByText(/./)).toHaveLength(0);
  });

  it('desabilitado: fundo e texto de desabilitado, e não aceita edição', async () => {
    await render(<TextField {...base} editable={false} />);
    expect(caixa()).toHaveStyle({ backgroundColor: colors.bg.disabled });
    expect(campo()).toHaveStyle({ color: colors.text.secondary });
    expect(campo()).toHaveProp('editable', false);
  });

  it('sem contorno do navegador: o foco é desenhado só pelo anel da caixa (senão o navegador soma um anel âmbar)', async () => {
    await render(<TextField {...base} label="E-mail" />);
    expect(campo()).toHaveStyle({ outlineWidth: 0 });
  });

  it('e-mail: teclado de e-mail sem capitalizar (comportamento preservado)', async () => {
    await render(<TextField {...base} keyboardType="email-address" />);
    expect(campo()).toHaveProp('autoCapitalize', 'none');
  });

  it('texto comum capitaliza a primeira letra e corrige; e-mail e senha não', async () => {
    const { rerender } = await render(<TextField {...base} />);
    expect(campo()).toHaveProp('autoCapitalize', 'sentences');
    expect(campo()).toHaveProp('autoCorrect', true);
    await rerender(<TextField {...base} secureTextEntry />);
    expect(campo()).toHaveProp('autoCapitalize', 'none');
    expect(campo()).toHaveProp('autoCorrect', false);
  });
});

describe('TextField de senha', () => {
  const senha = { placeholder: 'Sua senha', value: 'segredo1', onChangeText: () => {}, secureTextEntry: true };
  const olho = () => screen.getByRole('button', { name: /senha/ });

  it('começa com a senha escondida e o olho a mostra e a esconde de novo, trocando o nome do botão', async () => {
    await render(<TextField {...senha} label="Senha" />);
    expect(screen.getByPlaceholderText('Sua senha')).toHaveProp('secureTextEntry', true);
    expect(olho()).toHaveProp('accessibilityLabel', 'Mostrar senha');
    await fireEvent.press(olho());
    expect(screen.getByPlaceholderText('Sua senha')).toHaveProp('secureTextEntry', false);
    expect(olho()).toHaveProp('accessibilityLabel', 'Ocultar senha');
    await fireEvent.press(olho());
    expect(screen.getByPlaceholderText('Sua senha')).toHaveProp('secureTextEntry', true);
  });

  it('o ícone acompanha: olho aberto para mostrar, olho riscado para ocultar', async () => {
    await render(<TextField {...senha} />);
    expect(screen.getByTestId('icone-eye', ESCONDIDO)).toBeTruthy();
    await fireEvent.press(olho());
    expect(screen.getByTestId('icone-eye-off', ESCONDIDO)).toBeTruthy();
  });

  it('o olho tem a largura do original, fica fora da ordem de tab e só existe em campo de senha', async () => {
    const { rerender } = await render(<TextField {...senha} />);
    expect(olho()).toHaveStyle({ width: size.campo.eye });
    expect(olho()).toHaveProp('focusable', false);
    await rerender(<TextField {...base} />);
    expect(screen.queryByRole('button', { name: /senha/ })).toBeNull();
  });
});
