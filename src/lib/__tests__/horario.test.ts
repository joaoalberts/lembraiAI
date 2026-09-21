import { HORAS, MINUTOS, dividirHorario, doisDigitos, indiceDaRolagem, juntarHorario } from '../horario';

describe('horário nas rodas', () => {
  it('as rodas têm 24 horas (0 a 23) e 60 minutos (0 a 59)', () => {
    expect([HORAS[0], HORAS[HORAS.length - 1], HORAS.length]).toEqual([0, 23, 24]);
    expect([MINUTOS[0], MINUTOS[MINUTOS.length - 1], MINUTOS.length]).toEqual([0, 59, 60]);
  });

  it('todo número tem dois dígitos', () => {
    expect([doisDigitos(0), doisDigitos(7), doisDigitos(23)]).toEqual(['00', '07', '23']);
  });

  it('separa e junta o horário sem perder nada', () => {
    expect(dividirHorario('09:05')).toEqual({ hora: 9, minuto: 5 });
    expect(dividirHorario('23:59')).toEqual({ hora: 23, minuto: 59 });
    expect(dividirHorario('00:00')).toEqual({ hora: 0, minuto: 0 });
    expect(juntarHorario(9, 5)).toBe('09:05');
    expect(juntarHorario(0, 0)).toBe('00:00');
  });

  it('o banco devolve segundos ("09:05:00"): só hora e minuto contam', () => {
    expect(dividirHorario('09:05:00')).toEqual({ hora: 9, minuto: 5 });
  });

  it('texto inválido ou fora da faixa cai no padrão 09:00', () => {
    for (const ruim of ['', 'abc', '9:5', '24:00', '12:60']) expect(dividirHorario(ruim)).toEqual({ hora: 9, minuto: 0 });
  });

  it('o número do meio da roda é o mais próximo da rolagem, sem sair da lista', () => {
    expect(indiceDaRolagem(0, 44, 24)).toBe(0);
    expect(indiceDaRolagem(44 * 9, 44, 24)).toBe(9);
    expect(indiceDaRolagem(44 * 9 + 21, 44, 24)).toBe(9);
    expect(indiceDaRolagem(44 * 9 + 23, 44, 24)).toBe(10);
    expect(indiceDaRolagem(-100, 44, 24)).toBe(0);
    expect(indiceDaRolagem(44 * 99, 44, 24)).toBe(23);
  });
});
