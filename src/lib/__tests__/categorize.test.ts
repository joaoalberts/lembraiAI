import { detectCategory } from '../categorize';

describe('detectCategory (mesma regra do app web)', () => {
  it.each([
    ['Tomar remédio', false, 'blue', 'pill'],
    ['Consulta no dentista', false, 'blue', 'pill'],
    ['Correr no parque', false, 'orange', 'dumbbell'],
    ['Reunião com a equipe', false, 'purple', 'users'],
    ['Entregar o relatório', false, 'purple', 'briefcase'],
    ['Pagar o boleto do aluguel', false, 'green', 'card'],
    ['Comprar leite', true, 'green', 'cart'],
    ['Viagem para Lisboa', false, 'pink', 'plane'],
  ])('%s -> %s/%s', (titulo, local, category, icon) => {
    expect(detectCategory(titulo, local)).toMatchObject({ category, icon });
  });

  it('ignora acentos e maiúsculas', () => {
    expect(detectCategory('REMÉDIO DA MANHÃ', false).icon).toBe('pill');
  });

  it('a ação vence o lugar: remédio no shopping é Saúde, não Compras', () => {
    expect(detectCategory('Tomar remédio no shopping', false)).toMatchObject({ category: 'blue', icon: 'pill' });
  });

  it('"=casa" só casa com a palavra exata (casamento não é Casa)', () => {
    expect(detectCategory('Limpar a casa', false).icon).toBe('house');
    expect(detectCategory('Ir ao casamento', false).icon).not.toBe('house');
  });

  it('sem palavra reconhecida o ícone é neutro: pin com local, sino sem', () => {
    expect(detectCategory('xyzzy', true).icon).toBe('pin');
    expect(detectCategory('xyzzy', false).icon).toBe('bell');
  });
});
