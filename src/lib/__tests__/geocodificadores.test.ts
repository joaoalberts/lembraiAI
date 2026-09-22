import { deAwesomeApi, deBrasilApi, deNominatim, dePhoton, deViaCep } from '../geocodificadores';

describe('deNominatim: resposta do /search com addressdetails', () => {
  const unifor = {
    lat: '-3.7687254', lon: '-38.4776938', category: 'amenity', type: 'university', addresstype: 'amenity', name: 'Universidade de Fortaleza',
    display_name: 'Universidade de Fortaleza, 1321, Avenida Washington Soares, Edson Queiroz, Fortaleza, Ceará, 60811-905, Brasil',
    address: { amenity: 'Universidade de Fortaleza', house_number: '1321', road: 'Avenida Washington Soares', suburb: 'Edson Queiroz', city: 'Fortaleza', state: 'Ceará', 'ISO3166-2-lvl4': 'BR-CE', postcode: '60811-905', country_code: 'br' },
  };

  it('lugar com endereço: nome, rua, número, bairro, cidade, estado e CEP', () => {
    expect(deNominatim(unifor)).toEqual({
      fonte: 'nominatim', lat: -3.7687254, lng: -38.4776938, nome: 'Universidade de Fortaleza', rua: 'Avenida Washington Soares', numero: '1321',
      bairro: 'Edson Queiroz', cidade: 'Fortaleza', uf: 'CE', cep: '60811-905', tipo: 'casa',
    });
  });

  it('só a rua (sem número) é "rua"; o nome não vira nome de lugar quando é o da própria rua', () => {
    const c = deNominatim({ lat: '-3.73', lon: '-38.5', category: 'highway', type: 'residential', addresstype: 'road', name: 'Rua Silva Jatahy', address: { road: 'Rua Silva Jatahy', suburb: 'Meireles', city: 'Fortaleza', state: 'Ceará', 'ISO3166-2-lvl4': 'BR-CE', country_code: 'br' } });
    expect(c).toMatchObject({ tipo: 'rua', rua: 'Rua Silva Jatahy', bairro: 'Meireles' });
    expect(c?.nome).toBeUndefined();
    expect(c?.numero).toBeUndefined();
  });

  it('bairro, cidade e rua vêm de vários nomes possíveis do OpenStreetMap', () => {
    const c = deNominatim({ lat: '-3.7', lon: '-38.5', category: 'place', type: 'house', addresstype: 'building', address: { house_number: '10', pedestrian: 'Rua A', neighbourhood: 'Centro', town: 'Caucaia', state: 'Ceará', country_code: 'br' } });
    expect(c).toMatchObject({ rua: 'Rua A', bairro: 'Centro', cidade: 'Caucaia', uf: 'CE', numero: '10' });
  });

  it('sem sigla no resultado, o estado vem do nome por extenso', () => {
    const c = deNominatim({ lat: '-3.7', lon: '-38.5', category: 'highway', type: 'residential', address: { road: 'Rua A', city: 'Belém', state: 'Pará', country_code: 'br' } });
    expect(c?.uf).toBe('PA');
  });

  it('bairro e cidade são áreas: tipo "area"', () => {
    const c = deNominatim({ lat: '-3.7', lon: '-38.5', category: 'boundary', type: 'administrative', addresstype: 'suburb', name: 'Aldeota', address: { suburb: 'Aldeota', city: 'Fortaleza', state: 'Ceará', country_code: 'br' } });
    expect(c?.tipo).toBe('area');
  });

  it('descarta o que não é do Brasil ou não tem coordenada', () => {
    expect(deNominatim({ lat: '48.8', lon: '2.3', category: 'highway', type: 'x', address: { road: 'Rue A', country_code: 'fr' } })).toBeNull();
    expect(deNominatim({ lat: 'x', lon: '-38', category: 'highway', type: 'x', address: { country_code: 'br' } })).toBeNull();
  });
});

describe('dePhoton: feição do GeoJSON', () => {
  const casa = {
    type: 'Feature', geometry: { type: 'Point', coordinates: [-38.4776938, -3.7687254] },
    properties: { name: 'Universidade de Fortaleza', street: 'Avenida Washington Soares', housenumber: '1321', district: 'Edson Queiroz', city: 'Fortaleza', state: 'Ceará', postcode: '60813-020', countrycode: 'BR', osm_key: 'amenity', osm_value: 'university', type: 'house' },
  };

  it('lugar com endereço, sem inverter longitude e latitude', () => {
    expect(dePhoton(casa)).toEqual({
      fonte: 'photon', lat: -3.7687254, lng: -38.4776938, nome: 'Universidade de Fortaleza', rua: 'Avenida Washington Soares', numero: '1321',
      bairro: 'Edson Queiroz', cidade: 'Fortaleza', uf: 'CE', cep: '60813-020', tipo: 'casa',
    });
  });

  it('rua (type street): o nome é a rua', () => {
    const c = dePhoton({ type: 'Feature', geometry: { type: 'Point', coordinates: [-38.5, -3.73] }, properties: { name: 'Rua Silva Jatahy', district: 'Meireles', city: 'Fortaleza', state: 'Ceará', countrycode: 'BR', osm_key: 'highway', osm_value: 'residential', type: 'street' } });
    expect(c).toMatchObject({ tipo: 'rua', rua: 'Rua Silva Jatahy' });
    expect(c?.nome).toBeUndefined();
  });

  it('bairro ou cidade: área', () => {
    const c = dePhoton({ type: 'Feature', geometry: { type: 'Point', coordinates: [-38.5, -3.73] }, properties: { name: 'Aldeota', city: 'Fortaleza', state: 'Ceará', countrycode: 'BR', osm_key: 'place', osm_value: 'suburb', type: 'district' } });
    expect(c?.tipo).toBe('area');
  });

  it('descarta o que não é do Brasil', () => {
    expect(dePhoton({ type: 'Feature', geometry: { type: 'Point', coordinates: [2.3, 48.8] }, properties: { name: 'Rue A', countrycode: 'FR', type: 'street' } })).toBeNull();
  });
});

describe('deBrasilApi e deViaCep: o CEP vira texto de rua, e a coordenada (imprecisa) só guia', () => {
  it('BrasilAPI v2: rua, bairro, cidade, estado e a coordenada como pista', () => {
    expect(deBrasilApi({ cep: '60811905', state: 'CE', city: 'Fortaleza', neighborhood: 'Edson Queiroz', street: 'Avenida Washington Soares 1321', location: { type: 'Point', coordinates: { longitude: '-38.54306', latitude: '-3.71722' } } })).toEqual({
      cep: '60811905', rua: 'Avenida Washington Soares 1321', bairro: 'Edson Queiroz', cidade: 'Fortaleza', uf: 'CE', pista: { lat: -3.71722, lng: -38.54306 },
    });
  });

  it('BrasilAPI sem coordenada não inventa pista', () => {
    expect(deBrasilApi({ cep: '60000000', state: 'CE', city: 'Fortaleza', neighborhood: 'Centro', street: 'Rua A' })?.pista).toBeUndefined();
  });

  it('ViaCEP: logradouro, bairro, localidade e uf', () => {
    expect(deViaCep({ cep: '60811-905', logradouro: 'Avenida Washington Soares', bairro: 'Edson Queiroz', localidade: 'Fortaleza', uf: 'CE' })).toEqual({
      cep: '60811905', rua: 'Avenida Washington Soares', bairro: 'Edson Queiroz', cidade: 'Fortaleza', uf: 'CE',
    });
  });

  it('CEP que não existe (ViaCEP devolve {erro: true}) vira null', () => {
    expect(deViaCep({ erro: true } as never)).toBeNull();
    expect(deBrasilApi(null as never)).toBeNull();
  });

  it('CEP de um prédio só: o "complemento" que é um número é o número da porta e a "unidade" é o nome do lugar', () => {
    expect(deViaCep({ cep: '60811-905', logradouro: 'Avenida Washington Soares', complemento: '1321', unidade: 'Fundação Edson Queiroz Universidade de Fortaleza - UNIFOR', bairro: 'Edson Queiroz', localidade: 'Fortaleza', uf: 'CE' })).toEqual({
      cep: '60811905', rua: 'Avenida Washington Soares', numero: '1321', nome: 'Fundação Edson Queiroz Universidade de Fortaleza - UNIFOR', bairro: 'Edson Queiroz', cidade: 'Fortaleza', uf: 'CE',
    });
  });

  it('CEP de um trecho da rua: a faixa ("de 691/692 a 2049/2050") não é número de porta', () => {
    const c = deViaCep({ cep: '60125-025', logradouro: 'Rua José Vilar', complemento: 'de 691/692 a 2049/2050', bairro: 'Aldeota', localidade: 'Fortaleza', uf: 'CE' });
    expect(c?.numero).toBeUndefined();
    expect(c?.rua).toBe('Rua José Vilar');
  });
});

describe('deAwesomeApi: só serve como último recurso, porque a coordenada é a do CEP (entre 20 m e 2 km do ponto)', () => {
  const unifor = {
    cep: '60811905', address_type: 'Avenida', address_name: 'Washington Soares, 1321', address: 'Avenida Washington Soares, 1321', state: 'CE',
    district: 'Edson Queiroz', lat: '-3.7690025', lng: '-38.4816434', city: 'Fortaleza', city_ibge: '2304400', ddd: '85',
  };

  it('endereço com número, bairro, cidade, estado e a coordenada do CEP como pista', () => {
    expect(deAwesomeApi(unifor)).toEqual({
      cep: '60811905', rua: 'Avenida Washington Soares', numero: '1321', bairro: 'Edson Queiroz', cidade: 'Fortaleza', uf: 'CE', pista: { lat: -3.7690025, lng: -38.4816434 },
    });
  });

  it('endereço sem número fica só com a rua', () => {
    const c = deAwesomeApi({ ...unifor, address: 'Rua José Vilar', address_name: 'José Vilar', address_type: 'Rua' });
    expect(c).toMatchObject({ rua: 'Rua José Vilar' });
    expect(c?.numero).toBeUndefined();
  });

  it('CEP que não existe ({ code: "not_found" }) e coordenada que não é número viram null / sem pista', () => {
    expect(deAwesomeApi({ code: 'not_found', message: 'CEP não encontrado' } as never)).toBeNull();
    expect(deAwesomeApi(null as never)).toBeNull();
    expect(deAwesomeApi({ ...unifor, lat: 'x' })?.pista).toBeUndefined();
  });
});
