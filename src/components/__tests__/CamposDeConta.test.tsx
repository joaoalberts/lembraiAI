import '@testing-library/react-native/matchers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { anelDeFoco } from '../../design/foco';
import { colors, fontFamily, radius, size } from '../../design/tokens';
import { CaixaDeMarcar, estiloDaCaixa } from '../CaixaDeMarcar';
import { MedidorDeSenha } from '../MedidorDeSenha';

const ESCONDIDO = { includeHiddenElements: true } as const;
const plano = (estilo: unknown) => StyleSheet.flatten(estilo as never) as Record<string, unknown>;

describe('CaixaDeMarcar', () => {
  it('é uma caixinha marcável com o texto ao lado; o toque troca o valor', async () => {
    const trocar = jest.fn();
    await render(<CaixaDeMarcar label="Lembrar-me" value={false} onValueChange={trocar} />);
    const caixa = screen.getByRole('checkbox', { name: 'Lembrar-me' });
    expect(caixa).not.toBeChecked();
    await fireEvent.press(caixa);
    expect(trocar).toHaveBeenCalledWith(true);
    expect(screen.getByText('Lembrar-me')).toHaveStyle({ color: colors.text.primary });
  });

  it('marcada: fundo verde-floresta com o visto branco; desmarcada: branca com o anel cinza e sem visto', async () => {
    const { rerender } = await render(<CaixaDeMarcar label="Lembrar-me" value={false} onValueChange={jest.fn()} />);
    expect(screen.getByTestId('caixa')).toHaveStyle({ width: size.auth.check, height: size.auth.check, borderRadius: size.auth.checkRadius, backgroundColor: colors.bg.field, borderColor: colors.border.strong });
    expect(screen.queryByTestId('icone-check', ESCONDIDO)).toBeNull();
    await rerender(<CaixaDeMarcar label="Lembrar-me" value onValueChange={jest.fn()} />);
    expect(screen.getByRole('checkbox', { name: 'Lembrar-me' })).toBeChecked();
    expect(screen.getByTestId('caixa')).toHaveStyle({ backgroundColor: colors.border.focus, borderColor: colors.border.focus });
    expect(JSON.stringify(screen.getByTestId('icone-check', ESCONDIDO).children)).toContain(colors.text.onDark);
  });

  it('desabilitada não troca o valor', async () => {
    const trocar = jest.fn();
    await render(<CaixaDeMarcar label="Lembrar-me" value={false} onValueChange={trocar} disabled />);
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Lembrar-me' }));
    expect(trocar).not.toHaveBeenCalled();
    expect(screen.getByRole('checkbox', { name: 'Lembrar-me' })).toBeDisabled();
  });

  it('a área de toque chega a 44 e o foco de teclado põe o anel', async () => {
    await render(<CaixaDeMarcar label="Lembrar-me" value={false} onValueChange={jest.fn()} />);
    const { top, bottom } = screen.getByRole('checkbox', { name: 'Lembrar-me' }).props.hitSlop as { top: number; bottom: number };
    expect(size.auth.check + top + bottom).toBeGreaterThanOrEqual(size.touch);
    expect(plano(estiloDaCaixa({ pressed: false, focused: true }))).toMatchObject(anelDeFoco);
    expect(plano(estiloDaCaixa({ pressed: false }))).not.toHaveProperty('outlineColor');
  });
});

describe('MedidorDeSenha', () => {
  // 12 caracteres, com letra, número e símbolo: os quatro pontos da regra de força (exemplo, não uma credencial)
  const FORTE = 'Abcdefghij1!';
  const barras = () => screen.getAllByTestId(/^medidor-barra-/, ESCONDIDO);
  const cores = () => barras().map((b) => plano(b.props.style).backgroundColor);

  it('sem senha digitada não aparece', async () => {
    await render(<MedidorDeSenha senha="" />);
    expect(screen.queryByTestId('medidor')).toBeNull();
  });

  it('fraca: uma barra vermelha e o rótulo', async () => {
    await render(<MedidorDeSenha senha="abc" />);
    expect(screen.getByText('Senha fraca')).toHaveStyle({ color: colors.text.secondary });
    expect(cores()).toEqual([colors.conta.medidorFraco, colors.control.off, colors.control.off]);
  });

  it('razoável: duas barras âmbar', async () => {
    await render(<MedidorDeSenha senha="abcdefgh1" />);
    expect(screen.getByText('Senha razoável')).toBeTruthy();
    expect(cores()).toEqual([colors.conta.medidorMedio, colors.conta.medidorMedio, colors.control.off]);
  });

  it('forte: três barras verdes', async () => {
    await render(<MedidorDeSenha senha={FORTE} />);
    expect(screen.getByText('Senha forte')).toBeTruthy();
    expect(cores()).toEqual([colors.conta.medidorForte, colors.conta.medidorForte, colors.conta.medidorForte]);
  });

  it('as barras são finas e redondas, e o leitor de tela lê só o rótulo (o medidor é enfeite)', async () => {
    await render(<MedidorDeSenha senha="abc" />);
    expect(barras()[0]).toHaveStyle({ height: size.auth.medidorBarra, borderRadius: radius.pill });
    expect(screen.getByTestId('medidor')).toHaveProp('accessibilityLabel', 'Senha fraca');
    expect(fontFamily.regular).toBeTruthy();
  });
});
