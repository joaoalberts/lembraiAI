import { INICIAIS_DA_SEMANA, deslocarMes, gradeDoMes, isoDe, mesDaData, tituloDoMes } from '../calendario';

const numeros = (semana: { dia: number }[]) => semana.map((d) => d.dia);

describe('gradeDoMes', () => {
  it('setembro de 2026 é igual ao da imagem 12: começa em 30 e 31 de agosto e termina em 10 de outubro', () => {
    const grade = gradeDoMes(2026, 8);
    expect(grade.map(numeros)).toEqual([
      [30, 31, 1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10, 11, 12],
      [13, 14, 15, 16, 17, 18, 19],
      [20, 21, 22, 23, 24, 25, 26],
      [27, 28, 29, 30, 1, 2, 3],
      [4, 5, 6, 7, 8, 9, 10],
    ]);
  });

  it('só os dias do mês contam como do mês; os vizinhos completam as semanas', () => {
    const grade = gradeDoMes(2026, 8);
    expect(grade[0].map((d) => d.doMes)).toEqual([false, false, true, true, true, true, true]);
    expect(grade[4].map((d) => d.doMes)).toEqual([true, true, true, true, false, false, false]);
    expect(grade.flat().filter((d) => d.doMes)).toHaveLength(30);
  });

  it('tem sempre seis semanas de sete dias, também num mês que cabe em cinco', () => {
    for (const [ano, mes] of [[2026, 1], [2026, 8], [2027, 0], [2028, 1]]) {
      const grade = gradeDoMes(ano, mes);
      expect({ ano, mes, semanas: grade.length, dias: grade.every((s) => s.length === 7) }).toEqual({ ano, mes, semanas: 6, dias: true });
    }
  });

  it('cada dia traz a data ISO certa, atravessando a virada do ano', () => {
    const janeiro = gradeDoMes(2027, 0);
    expect(janeiro[0][0]).toEqual({ iso: '2026-12-27', dia: 27, doMes: false });
    expect(janeiro[0][5]).toEqual({ iso: '2027-01-01', dia: 1, doMes: true });
  });

  it('fevereiro bissexto tem 29 dias', () => {
    expect(gradeDoMes(2028, 1).flat().filter((d) => d.doMes)).toHaveLength(29);
    expect(gradeDoMes(2027, 1).flat().filter((d) => d.doMes)).toHaveLength(28);
  });
});

describe('navegação e títulos', () => {
  it('deslocarMes vira o ano nas duas direções', () => {
    expect(deslocarMes(2026, 11, 1)).toEqual({ ano: 2027, mes: 0 });
    expect(deslocarMes(2026, 0, -1)).toEqual({ ano: 2025, mes: 11 });
    expect(deslocarMes(2026, 8, 0)).toEqual({ ano: 2026, mes: 8 });
  });

  it('o título é o mês por extenso e o ano', () => {
    expect(tituloDoMes(2026, 8)).toBe('setembro de 2026');
    expect(tituloDoMes(2026, 2)).toBe('março de 2026');
  });

  it('as iniciais da semana começam no domingo, como na imagem', () => {
    expect(INICIAIS_DA_SEMANA.join(' ')).toBe('D S T Q Q S S');
  });

  it('isoDe e mesDaData são inversos', () => {
    expect(isoDe(2026, 8, 21)).toBe('2026-09-21');
    expect(mesDaData('2026-09-21')).toEqual({ ano: 2026, mes: 8 });
  });
});
