import { combinar, paraLugar, parecidoDeRuas, pontuar, type Candidato } from '../candidatos';
import { lerEndereco } from '../enderecos';

const base: Candidato = { fonte: 'photon', lat: -3.7687, lng: -38.4777, tipo: 'casa' };
const unifor = (parte: Partial<Candidato> = {}): Candidato => ({
  ...base, nome: 'Universidade de Fortaleza', rua: 'Avenida Washington Soares', numero: '1321', bairro: 'Edson Queiroz', cidade: 'Fortaleza', uf: 'CE', cep: '60813-020', ...parte,
});
const lido = lerEndereco('Av. Washington Soares, 1321, Edson Queiroz, Fortaleza - CE');

describe('pontuar: o quanto o resultado é o que a pessoa escreveu', () => {
  it('rua, número, bairro, cidade e estado batendo é a maior nota', () => {
    const completo = pontuar(unifor(), lido);
    expect(completo).toBeGreaterThan(pontuar(unifor({ numero: '999' }), lido));
    expect(completo).toBeGreaterThan(pontuar(unifor({ numero: undefined, tipo: 'rua' }), lido));
    expect(completo).toBeGreaterThan(pontuar(unifor({ bairro: 'Aldeota' }), lido));
    expect(completo).toBeGreaterThan(pontuar(unifor({ uf: 'SP', cidade: 'São Paulo' }), lido));
  });

  it('número certo vale mais que a rua sem número, que vale mais que um número errado da mesma rua', () => {
    const certo = pontuar(unifor(), lido);
    const semNumero = pontuar(unifor({ numero: undefined, tipo: 'rua' }), lido);
    const errado = pontuar(unifor({ numero: '200' }), lido);
    expect(certo).toBeGreaterThan(semNumero);
    expect(semNumero).toBeGreaterThan(errado);
  });

  it('a rua compara sem acento, sem caixa e sem o tipo abreviado ("Av." e "Avenida" são a mesma)', () => {
    const l = lerEndereco('av washington soares 1321');
    expect(pontuar(unifor(), l)).toBeGreaterThan(pontuar(unifor({ rua: 'Rua Outra Coisa' }), l));
    expect(pontuar(unifor({ rua: 'AVENIDA WASHINGTON SOARES' }), l)).toBe(pontuar(unifor({ rua: 'Avenida Washington Soares' }), l));
  });

  it('rua parecida mas diferente (só parte do nome) ganha menos que a rua inteira', () => {
    expect(pontuar(unifor(), lido)).toBeGreaterThan(pontuar(unifor({ rua: 'Rua Washington Luís' }), lido));
  });

  it('estado diferente do que a pessoa escreveu é fortemente penalizado (Rua Silva Jatahy existe em várias cidades)', () => {
    const l = lerEndereco('Rua Silva Jatahy, 100, Fortaleza - CE');
    const aqui = { ...base, rua: 'Rua Silva Jatahy', numero: '100', cidade: 'Fortaleza', uf: 'CE', tipo: 'casa' as const };
    const la = { ...aqui, cidade: 'Recife', uf: 'PE' };
    expect(pontuar(aqui, l)).toBeGreaterThan(pontuar(la, l) + 30);
  });

  it('CEP igual dá bônus; só o começo igual (mesma região) dá um pouco', () => {
    const l = lerEndereco('60813-020');
    expect(pontuar(unifor(), l)).toBeGreaterThan(pontuar(unifor({ cep: '60813-999' }), l));
    expect(pontuar(unifor({ cep: '60813-999' }), l)).toBeGreaterThan(pontuar(unifor({ cep: '30000-000' }), l));
  });

  it('sem cidade na busca, o que está perto da pessoa (ou do centro do mapa) ganha', () => {
    const l = lerEndereco('Rua Silva Jatahy 100');
    const fortaleza = { ...base, lat: -3.73, lng: -38.5, rua: 'Rua Silva Jatahy', numero: '100', cidade: 'Fortaleza', uf: 'CE', tipo: 'casa' as const };
    const recife = { ...fortaleza, lat: -8.05, lng: -34.9, cidade: 'Recife', uf: 'PE' };
    const perto = { lat: -3.75, lng: -38.52 };
    expect(pontuar(fortaleza, l, perto)).toBeGreaterThan(pontuar(recife, l, perto));
    // sem saber onde a pessoa está, as duas empatam
    expect(pontuar(fortaleza, l, null)).toBe(pontuar(recife, l, null));
  });

  it('o número só conta na rua que a pessoa escreveu: o mesmo número em outra rua não ganha bônus e a rua toda diferente perde pontos', () => {
    const l = lerEndereco('Rua Ana Bilhar, 1000, Meireles, Fortaleza - CE');
    const certa: Candidato = { ...base, rua: 'Rua Ana Bilhar', bairro: 'Meireles', cidade: 'Fortaleza', uf: 'CE', tipo: 'rua' };
    const outraRuaMesmoNumero: Candidato = { ...base, rua: 'Rua Canuto de Aguiar', numero: '1000', bairro: 'Meireles', cidade: 'Fortaleza', uf: 'CE', tipo: 'casa' };
    expect(pontuar(certa, l)).toBeGreaterThan(pontuar(outraRuaMesmoNumero, l) + 30);
    // o número igual na rua certa continua valendo
    expect(pontuar({ ...certa, numero: '1000', tipo: 'casa' }, l)).toBeGreaterThan(pontuar(certa, l) + 30);
  });

  it('erro de digitação de uma letra (ou duas trocadas) em palavra comprida ainda reconhece a rua', () => {
    const l = lerEndereco('Rua Ana Bilahr, Meireles, Fortaleza');
    const certa: Candidato = { ...base, rua: 'Rua Ana Bilhar', bairro: 'Meireles', cidade: 'Fortaleza', uf: 'CE', tipo: 'rua' };
    const outra: Candidato = { ...certa, rua: 'Rua Pedro Borges' };
    expect(pontuar(certa, l)).toBeGreaterThan(pontuar(outra, l) + 25);
    expect(parecidoDeRuas('Rua Ana Bilahr', 'Rua Ana Bilhar')).toBe(1);
  });

  it('palavras curtas diferentes não se confundem ("Vilar" e "Vilas" são ruas diferentes)', () => {
    expect(parecidoDeRuas('Rua José Vilar', 'Rua José Vilas')).toBeLessThan(0.6);
  });

  it('nome de lugar: o que se parece com o que foi digitado ganha', () => {
    const l = lerEndereco('Shopping Iguatemi Fortaleza');
    const certo: Candidato = { ...base, nome: 'Shopping Iguatemi Fortaleza', tipo: 'lugar', cidade: 'Fortaleza', uf: 'CE' };
    const outro: Candidato = { ...base, nome: 'Farmácia Pague Menos', tipo: 'lugar', cidade: 'Fortaleza', uf: 'CE' };
    expect(pontuar(certo, l)).toBeGreaterThan(pontuar(outro, l));
  });
});

describe('pontuar: nome de lugar igual ao digitado desempata', () => {
  it('"Reitoria da UFC" vence "Reitoria UFC" quando a pessoa digitou "Reitoria da UFC" (mesmas palavras que contam, nome igual)', () => {
    const l = lerEndereco('Reitoria da UFC');
    const igual: Candidato = { ...base, nome: 'Reitoria da UFC', tipo: 'lugar' };
    const parecido: Candidato = { ...base, nome: 'Reitoria UFC', tipo: 'lugar' };
    expect(pontuar(igual, l)).toBeGreaterThan(pontuar(parecido, l));
    expect(pontuar(parecido, lerEndereco('Reitoria UFC'))).toBeGreaterThan(pontuar(igual, lerEndereco('Reitoria UFC')));
  });
});

describe('combinar: junta as fontes, tira repetidos e ordena', () => {
  it('o mesmo endereço vindo de duas fontes vira um só (o mais completo)', () => {
    const daPhoton = unifor({ fonte: 'photon' });
    const doNominatim = unifor({ fonte: 'nominatim', lat: -3.76872, lng: -38.47772, nome: undefined, cep: undefined });
    const r = combinar([doNominatim, daPhoton], lido, null, 5);
    expect(r).toHaveLength(1);
    expect(r[0]?.cep).toBe('60813-020'); // ficou o que trazia mais informação
  });

  it('endereços diferentes da mesma rua ficam, do mais parecido com o que foi digitado para o menos', () => {
    const certo = unifor();
    const outroNumero = unifor({ numero: '85', lat: -3.7770, lng: -38.4830 });
    const semNumero = unifor({ numero: undefined, tipo: 'rua', lat: -3.7500, lng: -38.4700 });
    const r = combinar([outroNumero, semNumero, certo], lido, null, 5);
    expect(r.map((c) => c.numero)).toEqual(['1321', undefined, '85']);
  });

  it('respeita o limite de resultados', () => {
    const muitos = Array.from({ length: 12 }, (_, i) => unifor({ numero: String(i + 1), lat: -3.7 - i * 0.01 }));
    expect(combinar(muitos, lido, null, 5)).toHaveLength(5);
  });

  it('descarta o que está fora do Brasil ou sem coordenada válida', () => {
    const r = combinar([unifor({ lat: 48.85, lng: 2.35 }), unifor({ lat: Number.NaN }), unifor()], lido, null, 5);
    expect(r).toHaveLength(1);
    expect(r[0]?.lat).toBeCloseTo(-3.7687);
  });

  it('quando algum resultado é a rua digitada, o de rua toda diferente não aparece (é ruído); se nenhum é, ficam todos', () => {
    const busca = lerEndereco('Rua Ana Bilhar, 1000, Meireles');
    const certa: Candidato = { ...base, tipo: 'rua', rua: 'Rua Ana Bilhar', bairro: 'Meireles', cidade: 'Fortaleza', uf: 'CE' };
    const outra: Candidato = { ...base, tipo: 'casa', rua: 'Rua Canuto de Aguiar', numero: '1000', bairro: 'Meireles', cidade: 'Fortaleza', uf: 'CE', lat: -3.7315, lng: -38.4939 };
    expect(combinar([outra, certa], busca, null, 5).map((c) => c.rua)).toEqual(['Rua Ana Bilhar']);
    expect(combinar([outra], busca, null, 5).map((c) => c.rua)).toEqual(['Rua Canuto de Aguiar']);
  });

  it('lista vazia devolve lista vazia', () => {
    expect(combinar([], lido, null, 5)).toEqual([]);
  });

  describe('a mesma rua devolvida em pedaços (a Photon repete a avenida, uma vez por trecho)', () => {
    const busca = lerEndereco('Avenida Santos Dumont, Aldeota, Fortaleza');
    const trecho = (lat: number, parte: Partial<Candidato> = {}): Candidato => ({
      ...base, tipo: 'rua', rua: 'Avenida Santos Dumont', bairro: 'Aldeota', cidade: 'Fortaleza', uf: 'CE', lat, lng: -38.5, ...parte,
    });

    it('vários trechos no mesmo bairro e cidade viram uma linha só (senão a lista teria cinco linhas idênticas)', () => {
      const r = combinar([trecho(-3.7336), trecho(-3.7348), trecho(-3.7360), trecho(-3.7380), trecho(-3.7400)], busca, null, 5);
      expect(r).toHaveLength(1);
    });

    it('a avenida que passa por outro bairro, ou por outra cidade, continua sendo outra linha', () => {
      const r = combinar([trecho(-3.7336), trecho(-3.7348, { bairro: 'Meireles' }), trecho(-3.9, { cidade: 'Eusébio', bairro: undefined })], busca, null, 5);
      expect(r).toHaveLength(3);
    });

    it('"Rua Santos Dumont" e "Avenida Santos Dumont" no mesmo bairro não são a mesma rua', () => {
      const r = combinar([trecho(-3.7336), trecho(-3.7500, { rua: 'Rua Santos Dumont' })], busca, null, 5);
      expect(r).toHaveLength(2);
    });

    it('das repetidas fica a que melhor combina com a busca, e ela recebe o que só a outra sabia (o CEP)', () => {
      const semCep = trecho(-3.7336, { cep: undefined });
      const comCep = trecho(-3.7400, { cep: '60125-035' });
      const r = combinar([semCep, comCep], busca, { lat: -3.7336, lng: -38.5 }, 5);
      expect(r).toHaveLength(1);
      expect(r[0]?.cep).toBe('60125-035');
    });
  });
});

describe('paraLugar: o texto que a pessoa vê e o que é guardado no lembrete', () => {
  it('endereço com número: primeira linha "rua, número", segunda "bairro, cidade - UF, CEP"', () => {
    expect(paraLugar(unifor({ nome: undefined }), lido)).toMatchObject({
      nome: 'Avenida Washington Soares, 1321',
      detalhe: 'Edson Queiroz, Fortaleza - CE, 60813-020',
      lat: -3.7687,
      lng: -38.4777,
    });
  });

  it('lugar com nome: o nome na primeira linha e o endereço na segunda', () => {
    const l = paraLugar(unifor(), lerEndereco('Universidade de Fortaleza'));
    expect(l.nome).toBe('Universidade de Fortaleza');
    expect(l.detalhe).toBe('Avenida Washington Soares, 1321 · Edson Queiroz, Fortaleza - CE');
  });

  it('a pessoa digitou um número que o mapa não tem: o resultado é a rua, marcado como aproximado', () => {
    const l = paraLugar(unifor({ numero: undefined, tipo: 'rua', nome: undefined, cep: undefined }), lido);
    expect(l.aproximado).toBe(true);
    expect(l.nome).toBe('Avenida Washington Soares');
  });

  it('número igual ao digitado não é aproximado; a pessoa que não digitou número também não vê "aproximado"', () => {
    expect(paraLugar(unifor(), lido).aproximado).toBeUndefined();
    expect(paraLugar(unifor({ numero: undefined, tipo: 'rua' }), lerEndereco('Avenida Washington Soares, Edson Queiroz')).aproximado).toBeUndefined();
  });

  it('número diferente do digitado também é aproximado', () => {
    expect(paraLugar(unifor({ numero: '1300' }), lido).aproximado).toBe(true);
  });

  it('o ponto veio do CEP (não de um mapa de portas), ou é o de uma rua achada pelo CEP: aproximado', () => {
    expect(paraLugar({ ...base, fonte: 'cep', rua: 'Rua A', tipo: 'rua' }, lerEndereco('60000-000')).aproximado).toBe(true);
    expect(paraLugar({ ...base, aproximado: true, rua: 'Rua A', tipo: 'rua' }, lerEndereco('60000-000')).aproximado).toBe(true);
  });

  it('o número de porta compara sem caixa: "85a" e "85A" são o mesmo', () => {
    expect(paraLugar(unifor({ numero: '85A' }), lerEndereco('Avenida Washington Soares 85a')).aproximado).toBeUndefined();
  });

  it('"completo" é o endereço numa linha só, o que fica guardado no lembrete (rua, número, bairro, cidade, estado e CEP)', () => {
    expect(paraLugar(unifor({ nome: undefined }), lido).completo).toBe('Avenida Washington Soares, 1321, Edson Queiroz, Fortaleza - CE, 60813-020');
    // quando a pessoa buscou por um lugar, o nome do lugar vem na frente
    expect(paraLugar(unifor(), lerEndereco('Universidade de Fortaleza')).completo).toBe(
      'Universidade de Fortaleza, Avenida Washington Soares, 1321, Edson Queiroz, Fortaleza - CE, 60813-020',
    );
  });

  it('partes que faltam não deixam vírgula solta', () => {
    const l = paraLugar({ ...base, rua: 'Rua A', cidade: 'Fortaleza', tipo: 'rua' }, lerEndereco('Rua A'));
    expect(l.detalhe).toBe('Fortaleza');
    expect(l.nome).toBe('Rua A');
    expect(l.completo).toBe('Rua A, Fortaleza');
  });
});
