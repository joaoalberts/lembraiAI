import { contrastRatio } from '../contrast';
import { PARES_DE_CONTRASTE, corDoCaminho, razaoDoPar } from '../a11y';

describe('contraste das cores do Design System (WCAG 2.x)', () => {
  it.each(PARES_DE_CONTRASTE.map((p) => [`${p.fg} sobre ${p.bg}`, p] as const))('%s atinge o mínimo declarado', (_nome, par) => {
    expect(razaoDoPar(par)).toBeGreaterThanOrEqual(par.min);
  });

  it('o mínimo é 4,5 (texto) ou 3 (texto grande e componentes de interface); nenhum par declara menos que 3', () => {
    for (const par of PARES_DE_CONTRASTE) expect([3, 4.5, 7]).toContain(par.min);
  });

  it('todo par que aceita menos de 4,5 é uma exceção justificada por escrito', () => {
    const sem = PARES_DE_CONTRASTE.filter((p) => p.min < 4.5 && !(p.excecao && p.excecao.length > 20));
    expect(sem.map((p) => `${p.fg} sobre ${p.bg}`)).toEqual([]);
  });

  it('cobre os pares que decidem a leitura: texto principal, secundário, placeholder, rótulo do botão, erro e sucesso', () => {
    const pares = PARES_DE_CONTRASTE.map((p) => `${p.fg}|${p.bg}`);
    for (const esperado of [
      'text.primary|bg.page', 'text.secondary|bg.page', 'text.secondary|bg.card', 'text.placeholder|bg.field',
      'text.onAction|action.primary', 'text.onDark|action.secondary', 'text.onDark|control.chipOn',
      'text.danger|bg.field', 'text.danger|feedback.dangerBg', 'text.success|feedback.successBg', 'text.accent|bg.page',
    ]) expect(pares).toContain(esperado);
  });

  it('cor primária de ação: o laranja da marca é exceção conhecida (3,24:1) e existe uma alternativa AA pronta', () => {
    const marca = PARES_DE_CONTRASTE.find((p) => p.fg === 'text.onAction' && p.bg === 'action.primary')!;
    expect(marca.min).toBe(3);
    expect(contrastRatio(corDoCaminho('text.onAction'), corDoCaminho('action.primaryAA'))).toBeGreaterThanOrEqual(4.5);
  });

  it('laranja nunca é cor de texto: nenhum par usa a ação primária como texto sobre fundo claro', () => {
    const laranjaComoTexto = PARES_DE_CONTRASTE.filter((p) => p.fg.startsWith('action.') && p.bg.startsWith('bg.'));
    expect(laranjaComoTexto).toEqual([]);
  });

  it('corDoCaminho recusa caminho que não existe (um erro de digitação não pode virar "passou")', () => {
    expect(() => corDoCaminho('text.inexistente')).toThrow(/inexistente/);
  });
});
