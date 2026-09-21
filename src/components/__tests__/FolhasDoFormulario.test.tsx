import '@testing-library/react-native/matchers';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { anelDeFoco } from '../../design/foco';
import { borderWidth, colors, fontFamily, fontSize, layout, size } from '../../design/tokens';
import { comAreaSegura } from '../../test-utils/area-segura';
import { CalendarSheet, estiloDoDia } from '../CalendarSheet';
import { RepeatSheet, estiloDaLinhaDeEscolha } from '../RepeatSheet';
import { TimeSheet } from '../TimeSheet';

const ESCONDIDO = { includeHiddenElements: true };
const estilo = (el: { props: { style?: unknown } }) => StyleSheet.flatten(el.props.style as never) as Record<string, unknown>;

describe('RepeatSheet', () => {
  const abrir = async (value: 'never' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'yearly' = 'never') => {
    const acoes = { onSelect: jest.fn(), onClose: jest.fn() };
    await render(comAreaSegura(<RepeatSheet visible value={value} {...acoes} />));
    return acoes;
  };

  it('mostra o título, a explicação e as seis frequências, cada uma com a sua descrição', async () => {
    await abrir();
    expect(screen.getByText('Repetir')).toBeTruthy();
    expect(screen.getByText('Escolha com que frequência o lembrete deve se repetir.')).toBeTruthy();
    const linhas: [string, string][] = [
      ['Nunca', 'Avisa uma única vez'], ['Todos os dias', 'Repete diariamente, no mesmo horário'], ['Dias úteis', 'De segunda a sexta'],
      ['Toda semana', 'No mesmo dia da semana'], ['Todo mês', 'No mesmo dia do mês'], ['Todo ano', 'Na mesma data, todo ano'],
    ];
    for (const [nome, desc] of linhas) {
      expect(screen.getByRole('radio', { name: nome })).toBeTruthy();
      expect(screen.getByText(desc)).toBeTruthy();
    }
  });

  it('só a linha escolhida está marcada, com o selo de visto e o fundo menta; as outras têm o anel vazio', async () => {
    await abrir('weekly');
    expect(screen.getByRole('radio', { name: 'Toda semana' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Nunca' })).not.toBeChecked();
    expect(screen.getAllByTestId('repetir-selo')).toHaveLength(1);
    expect(screen.getAllByTestId('repetir-anel')).toHaveLength(5);
    expect(screen.getByRole('radio', { name: 'Toda semana' })).toHaveStyle({ backgroundColor: colors.feedback.successBg });
    expect(screen.getByTestId('repetir-selo')).toHaveStyle({ backgroundColor: colors.control.badge, width: size.form.rowBadge });
  });

  it('escolher uma linha aplica a escolha e fecha a folha, na hora', async () => {
    const { onSelect, onClose } = await abrir();
    await fireEvent.press(screen.getByRole('radio', { name: 'Dias úteis' }));
    expect(onSelect).toHaveBeenCalledWith('weekdays');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('o véu fecha sem escolher nada', async () => {
    const { onSelect, onClose } = await abrir();
    await fireEvent.press(screen.getByLabelText('Fechar', ESCONDIDO));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('é um grupo de opções para o leitor de tela e a linha tem a altura do padrão', async () => {
    await abrir();
    // a folha (diálogo) e o grupo de linhas se chamam "Repetir"; só o grupo tem o papel de grupo de opções
    expect(screen.getAllByLabelText('Repetir').filter((e) => e.props.accessibilityRole === 'radiogroup')).toHaveLength(1);
    expect(screen.getByRole('radio', { name: 'Nunca' })).toHaveStyle({ minHeight: size.form.row });
    expect(screen.getByRole('radio', { name: 'Nunca' })).not.toHaveStyle({ borderTopWidth: borderWidth.hairline });
    expect(screen.getByRole('radio', { name: 'Todos os dias' })).toHaveStyle({ borderTopWidth: borderWidth.hairline, borderTopColor: colors.border.divider });
  });

  it('estados da linha: escolhida fica menta mesmo com o ponteiro; ponteiro e pressionado nas outras; foco põe o anel', () => {
    const plano = (e: Parameters<typeof estiloDaLinhaDeEscolha>[0], escolhida = false) => StyleSheet.flatten(estiloDaLinhaDeEscolha(e, escolhida, true)) as Record<string, unknown>;
    expect(plano({ pressed: false, hovered: true }, true)).toMatchObject({ backgroundColor: colors.feedback.successBg });
    expect(plano({ pressed: false, hovered: true })).toMatchObject({ backgroundColor: colors.control.rowHover });
    expect(plano({ pressed: true })).toMatchObject({ backgroundColor: colors.control.rowPressed });
    expect(plano({ pressed: false, focused: true })).toMatchObject(anelDeFoco);
  });
});

describe('TimeSheet', () => {
  beforeEach(() => { jest.useFakeTimers(); });
  afterEach(() => { jest.useRealTimers(); });

  const abrir = async (value = '09:30') => {
    const acoes = { onChange: jest.fn(), onClose: jest.fn() };
    await render(comAreaSegura(<TimeSheet visible value={value} {...acoes} />));
    return acoes;
  };
  const rolar = async (roda: string, indice: number) => {
    await fireEvent.scroll(screen.getByTestId(`roda-${roda}`), { nativeEvent: { contentOffset: { x: 0, y: indice * size.wheel.item } } });
  };
  const esperar = async (ms: number) => { await act(async () => { jest.advanceTimersByTime(ms); }); };

  it('mostra o título, a explicação, o "Pronto" e as duas rodas com dois dígitos', async () => {
    await abrir();
    expect(screen.getByText('Horário')).toBeTruthy();
    expect(screen.getByText('Role a hora e os minutos. O horário é salvo ao escolher.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Pronto' })).toBeTruthy();
    expect(screen.getByText(':')).toBeTruthy();
    expect(screen.getAllByText('00').length).toBe(2); // hora 00 e minuto 00
    expect(screen.getAllByText('23')).toHaveLength(2); // hora 23 e minuto 23
    expect(screen.getAllByText('59')).toHaveLength(1);
  });

  it('começa no horário recebido: o número escolhido (09 e 30) é o grande e em negrito', async () => {
    await abrir('09:30');
    const grandes = screen.getAllByText(/^\d\d$/).filter((t) => estilo(t).fontSize === fontSize.wheelOn).map((t) => t.props.children);
    expect(grandes).toEqual(['09', '30']);
    expect(estilo(screen.getAllByText('09')[0])).toMatchObject({ fontFamily: fontFamily.bold, color: colors.text.primary });
  });

  it('rolar a hora e esperar o repouso avisa o novo horário, mantendo os minutos, sem fechar a folha', async () => {
    const { onChange, onClose } = await abrir('09:30');
    await rolar('Hora', 14);
    expect(onChange).not.toHaveBeenCalled(); // ainda rolando
    await esperar(100);
    expect(onChange).not.toHaveBeenCalled(); // o repouso são 120 ms parados
    await esperar(30);
    expect(onChange).toHaveBeenCalledWith('14:30');
    await esperar(2000);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('rolar os minutos avisa o novo horário e a folha fecha sozinha depois de 800 ms', async () => {
    const { onChange, onClose } = await abrir('09:30');
    await rolar('Minutos', 45);
    await esperar(150);
    expect(onChange).toHaveBeenCalledWith('09:45');
    await esperar(500);
    expect(onClose).not.toHaveBeenCalled();
    await esperar(400);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('mexer em qualquer roda antes de fechar cancela o fechamento automático', async () => {
    const { onClose } = await abrir('09:30');
    await rolar('Minutos', 45);
    await esperar(150);
    await esperar(400);
    await rolar('Hora', 10); // continuou mexendo
    await esperar(1500);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('o toque numa roda também cancela o fechamento pendente', async () => {
    const { onClose } = await abrir('09:30');
    await rolar('Minutos', 45);
    await esperar(150);
    await fireEvent(screen.getByTestId('roda-Hora'), 'touchStart');
    await esperar(1500);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('ficar no mesmo número não conta como escolha', async () => {
    const { onChange } = await abrir('09:30');
    await rolar('Hora', 9);
    await esperar(150);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('escolher hora e depois minutos junta os dois no horário final', async () => {
    const { onChange } = await abrir('09:30');
    await rolar('Hora', 20);
    await esperar(150);
    await rolar('Minutos', 5);
    await esperar(150);
    expect(onChange.mock.calls.map((c) => c[0])).toEqual(['20:30', '20:05']);
  });

  it('"Pronto" e o véu fecham a qualquer momento', async () => {
    const { onClose } = await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Pronto' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    await fireEvent.press(screen.getByLabelText('Fechar', ESCONDIDO));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('cada roda é um controle ajustável para o leitor de tela, com o número e a unidade', async () => {
    await abrir('09:30');
    const horas = screen.getByRole('adjustable', { name: 'Hora' });
    expect(horas).toHaveProp('accessibilityValue', { min: 0, max: 23, now: 9, text: '09 horas' });
    expect(screen.getByRole('adjustable', { name: 'Minutos' })).toHaveProp('accessibilityValue', { min: 0, max: 59, now: 30, text: '30 minutos' });
  });

  it('a roda mostra cinco números e a faixa da escolha tem a altura de um número', async () => {
    await abrir();
    expect(estilo(screen.getByTestId('horario-faixa'))).toMatchObject({ height: size.wheel.item, backgroundColor: colors.feedback.successBg, borderColor: colors.border.selectedBand });
    expect(size.wheel.item * layout.wheelRows).toBe(estilo(screen.getByRole('adjustable', { name: 'Hora' })).height);
  });

  it('as rodas esmaecem para o fundo da folha nas pontas', async () => {
    await abrir();
    expect(JSON.stringify(screen.getByTestId('roda-Hora-esmaecer', ESCONDIDO).props.style)).toContain('linear-gradient');
  });
});

describe('CalendarSheet', () => {
  beforeEach(() => { jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] }); jest.setSystemTime(new Date(2026, 8, 21, 10)); });
  afterEach(() => { jest.useRealTimers(); });

  const abrir = async (value = '2026-09-21') => {
    const acoes = { onSelect: jest.fn(), onClose: jest.fn() };
    await render(comAreaSegura(<CalendarSheet visible value={value} {...acoes} />));
    return acoes;
  };

  it('mostra o mês da data escolhida, as iniciais da semana e seis semanas de dias', async () => {
    await abrir();
    expect(screen.getByRole('header', { name: 'Setembro de 2026' })).toBeTruthy();
    expect(screen.getAllByText(/^[DSTQ]$/, ESCONDIDO).map((t) => t.props.children).slice(0, 7)).toEqual(['D', 'S', 'T', 'Q', 'Q', 'S', 'S']);
    expect(screen.getAllByRole('button', { name: /de 2026$/ })).toHaveLength(42);
  });

  it('o dia escolhido fica em verde-floresta e negrito, o de hoje ganha contorno e os do mês vizinho ficam claros', async () => {
    await abrir('2026-09-25');
    const escolhido = screen.getByRole('button', { name: 'Sex, 25 de set de 2026' });
    expect(escolhido).toHaveStyle({ backgroundColor: colors.control.chipOn, width: size.calendar.selected });
    expect(estilo(screen.getByText('25'))).toMatchObject({ fontFamily: fontFamily.bold, color: colors.text.onDark });
    expect(screen.getByRole('button', { name: 'Seg, 21 de set de 2026' })).toHaveStyle({ borderColor: colors.control.chipOn, borderWidth: borderWidth.hairline });
    expect(estilo(screen.getByText('31'))).toMatchObject({ color: colors.text.placeholder }); // 31 de agosto, do mês vizinho
  });

  it('escolher um dia aplica e fecha a folha', async () => {
    const { onSelect, onClose } = await abrir();
    await fireEvent.press(screen.getByRole('button', { name: 'Qua, 23 de set de 2026' }));
    expect(onSelect).toHaveBeenCalledWith('2026-09-23');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('as setas trocam de mês, virando o ano em dezembro e janeiro', async () => {
    await abrir('2026-12-10');
    expect(screen.getByRole('header', { name: 'Dezembro de 2026' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Próximo mês' }));
    expect(screen.getByRole('header', { name: 'Janeiro de 2027' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Mês anterior' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Mês anterior' }));
    expect(screen.getByRole('header', { name: 'Novembro de 2026' })).toBeTruthy();
  });

  it('o dia de outro mês também pode ser escolhido pelo toque', async () => {
    const { onSelect } = await abrir('2026-09-21');
    await fireEvent.press(screen.getByRole('button', { name: 'Seg, 31 de ago de 2026' }));
    expect(onSelect).toHaveBeenCalledWith('2026-08-31');
  });

  it('"Hoje" escolhe a data de hoje e fecha', async () => {
    const { onSelect, onClose } = await abrir('2026-01-05');
    await fireEvent.press(screen.getByRole('button', { name: 'Ir para hoje' }));
    expect(onSelect).toHaveBeenCalledWith('2026-09-21');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('o véu fecha sem escolher', async () => {
    const { onSelect, onClose } = await abrir();
    await fireEvent.press(screen.getByLabelText('Fechar', ESCONDIDO));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('estados do dia: pressionado e ponteiro em cima (menos o escolhido); foco põe o anel', () => {
    const plano = (e: Parameters<typeof estiloDoDia>[0], escolhido = false, hoje = false) => StyleSheet.flatten(estiloDoDia(e, escolhido, hoje)) as Record<string, unknown>;
    expect(plano({ pressed: false, hovered: true })).toMatchObject({ backgroundColor: colors.control.rowHover });
    expect(plano({ pressed: true })).toMatchObject({ backgroundColor: colors.control.rowPressed });
    expect(plano({ pressed: true }, true)).toMatchObject({ backgroundColor: colors.control.chipOn });
    expect(plano({ pressed: false, focused: true })).toMatchObject(anelDeFoco);
  });
});
