import { Share } from 'react-native';
import type { Reminder } from '../../data/reminders';
import { compartilharNaWeb, compartilharNoCelular, textoDoLembrete } from '../compartilhar';

const porHorario: Reminder = {
  id: 'r1', title: 'Comprar água no mercado', category: 'green', icon: 'cart', kind: 'time',
  dateISO: '2026-09-21', time: '09:00', repeat: 'never', active: true,
};
const porLocal: Reminder = {
  ...porHorario, kind: 'local', place: 'Supermercado Frangolândia', radius: 150, lat: -3.7, lng: -38.5, repeat: 'weekly',
};

describe('textoDoLembrete', () => {
  it('por horário: título, dia e hora, e a assinatura', () => {
    expect(textoDoLembrete(porHorario)).toBe('Comprar água no mercado\nSeg, 21 de set de 2026 às 09:00\n\nCriado no LembreiAi');
  });

  it('por local: soma o local com o raio e a repetição', () => {
    expect(textoDoLembrete(porLocal)).toBe(
      'Comprar água no mercado\nSeg, 21 de set de 2026 às 09:00\nLocal: Supermercado Frangolândia (raio de 150 m)\nRepete: Toda semana\n\nCriado no LembreiAi',
    );
  });

  it('nunca escreve "undefined" quando falta o local', () => {
    expect(textoDoLembrete({ ...porLocal, place: undefined, radius: undefined })).not.toContain('undefined');
  });
});

describe('compartilharNaWeb', () => {
  it('usa a folha do navegador e manda título e texto', async () => {
    const share = jest.fn().mockResolvedValue(undefined);
    await expect(compartilharNaWeb(porHorario, { share, clipboard: undefined as never })).resolves.toBe('compartilhado');
    expect(share).toHaveBeenCalledWith({ title: 'Comprar água no mercado', text: textoDoLembrete(porHorario) });
  });

  it('fechar a folha não é erro nem copia nada', async () => {
    const share = jest.fn().mockRejectedValue(Object.assign(new Error('x'), { name: 'AbortError' }));
    const writeText = jest.fn();
    await expect(compartilharNaWeb(porHorario, { share, clipboard: { writeText } as never })).resolves.toBe('cancelado');
    expect(writeText).not.toHaveBeenCalled();
  });

  it('sem folha de compartilhamento, copia o texto', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    await expect(compartilharNaWeb(porHorario, { share: undefined as never, clipboard: { writeText } as never })).resolves.toBe('copiado');
    expect(writeText).toHaveBeenCalledWith(textoDoLembrete(porHorario));
  });

  it('se o compartilhamento falha por outro motivo, tenta copiar', async () => {
    const share = jest.fn().mockRejectedValue(Object.assign(new Error('x'), { name: 'NotAllowedError' }));
    const writeText = jest.fn().mockResolvedValue(undefined);
    await expect(compartilharNaWeb(porHorario, { share, clipboard: { writeText } as never })).resolves.toBe('copiado');
  });

  it('sem nada disso, avisa que não dá', async () => {
    await expect(compartilharNaWeb(porHorario, { share: undefined as never, clipboard: undefined as never })).resolves.toBe('indisponivel');
    await expect(compartilharNaWeb(porHorario, undefined)).resolves.toBe('indisponivel');
  });
});

describe('compartilharNoCelular', () => {
  it('abre a folha do sistema com o texto e distingue fechar de compartilhar', async () => {
    const espiao = jest.spyOn(Share, 'share');
    espiao.mockResolvedValueOnce({ action: Share.sharedAction });
    await expect(compartilharNoCelular(porHorario)).resolves.toBe('compartilhado');
    expect(espiao).toHaveBeenCalledWith({ message: textoDoLembrete(porHorario), title: 'Comprar água no mercado' });

    espiao.mockResolvedValueOnce({ action: Share.dismissedAction });
    await expect(compartilharNoCelular(porHorario)).resolves.toBe('cancelado');
    espiao.mockRestore();
  });
});
