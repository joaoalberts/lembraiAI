import { fundoEmDegrade } from '../efeitos';
import { du, gradients } from '../tokens';

// Parser de degradê do próprio React Native (o que decide, no iOS e no Android, se a receita vale ou é ignorada)
const { default: processarFundo } = require('react-native/Libraries/StyleSheet/processBackgroundImage');

/** Camadas de nível mais alto de uma receita: separa por vírgulas fora de parênteses. */
const camadas = (receita: string) => receita.split(/,\s*(?=(?:radial|linear)-gradient\()/);

describe('degradês', () => {
  it('cada receita é entendida pelo parser do React Native, com uma camada para cada parte (senão o fundo some no celular)', () => {
    for (const [nome, receita] of Object.entries(gradients)) {
      const processado = processarFundo(receita);
      expect({ nome, camadas: processado?.length }).toEqual({ nome, camadas: camadas(receita).length });
    }
  });

  it('as camadas radiais guardam forma, tamanho e posição (a luz do cabeçalho fica no canto certo)', () => {
    const [luz] = processarFundo(gradients.cabecalhoVerde);
    expect(luz.type).toBe('radial-gradient');
    expect(luz.position).toEqual({ top: '6%', left: '90%' });
    expect(luz.size).toEqual({ x: du(560), y: du(330) });
  });

  it('a base do cabeçalho verde é o linear a 168° com três paradas', () => {
    const camadasProcessadas = processarFundo(gradients.cabecalhoVerde);
    const base = camadasProcessadas[camadasProcessadas.length - 1];
    expect(base.type).toBe('linear-gradient');
    expect(base.direction).toEqual({ type: 'angle', value: 168 });
    expect(base.colorStops).toHaveLength(3);
  });

  it('a web recebe backgroundImage e o iOS e o Android recebem experimental_backgroundImage', () => {
    expect(fundoEmDegrade('linear-gradient(red, blue)', true)).toEqual({ backgroundImage: 'linear-gradient(red, blue)' });
    expect(fundoEmDegrade('linear-gradient(red, blue)', false)).toEqual({ experimental_backgroundImage: 'linear-gradient(red, blue)' });
  });
});

describe('du', () => {
  it('converte a arte de 851 px para a coluna de 430 dp e nunca devolve menos de 1', () => {
    expect(du(851)).toBe(430);
    expect(du(345)).toBe(174);
    expect(du(0.4)).toBe(1);
  });
});
