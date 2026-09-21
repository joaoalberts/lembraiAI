import { LIMITE_DE_RESULTADOS, MINIMO_DE_LETRAS, buscarLugares, nomeDoPonto } from '../geocodificar';

const resposta = (corpo: unknown, ok = true, status = 200) => ({ ok, status, json: async () => corpo }) as Response;

describe('buscarLugares', () => {
  it('não gasta pedido com menos de três letras', async () => {
    const buscar = jest.fn();
    await expect(buscarLugares('  ab ', { buscar })).resolves.toEqual([]);
    expect(buscar).not.toHaveBeenCalled();
    expect(MINIMO_DE_LETRAS).toBe(3);
  });

  it('pede em português, com o limite e o texto codificado', async () => {
    const buscar = jest.fn().mockResolvedValue(resposta([]));
    await buscarLugares('Av. Washington Soares, 1321', { buscar });
    const [url] = buscar.mock.calls[0];
    expect(url).toContain('https://nominatim.openstreetmap.org/search?');
    expect(url).toContain(`limit=${LIMITE_DE_RESULTADOS}`);
    expect(url).toContain('accept-language=pt-BR');
    expect(url).toContain('q=Av.%20Washington%20Soares%2C%201321');
  });

  it('transforma o resultado em nome, detalhe e coordenadas numéricas', async () => {
    const buscar = jest.fn().mockResolvedValue(resposta([
      { lat: '-3.7566', lon: '-38.4891', display_name: 'Supermercado Frangolândia, Rua A, Fortaleza, Ceará, Brasil' },
    ]));
    await expect(buscarLugares('mercado', { buscar })).resolves.toEqual([
      { nome: 'Supermercado Frangolândia', detalhe: 'Rua A, Fortaleza, Ceará, Brasil', lat: -3.7566, lng: -38.4891 },
    ]);
  });

  it('com o campo name, a segunda linha não repete o nome; se o nome for outro, o endereço vem inteiro', async () => {
    const buscar = jest.fn().mockResolvedValue(resposta([
      { lat: '-3.7', lon: '-38.5', name: 'Academia Smart Fit', display_name: 'Academia Smart Fit, Iguatemi, Fortaleza' },
      { lat: '-3.8', lon: '-38.6', name: 'Casa da Ana', display_name: 'Rua B, 20, Fortaleza' },
    ]));
    const lugares = await buscarLugares('academia', { buscar });
    expect(lugares.map((l) => [l.nome, l.detalhe])).toEqual([
      ['Academia Smart Fit', 'Iguatemi, Fortaleza'],
      ['Casa da Ana', 'Rua B, 20, Fortaleza'],
    ]);
  });

  it('descarta resultado sem coordenada válida', async () => {
    const buscar = jest.fn().mockResolvedValue(resposta([
      { lat: 'x', lon: '-38', display_name: 'Ruim, Lugar' },
      { lat: '-3.7', lon: '-38.5', display_name: 'Bom, Lugar' },
    ]));
    const lugares = await buscarLugares('lugar', { buscar });
    expect(lugares.map((l) => l.nome)).toEqual(['Bom']);
  });

  it('erro do serviço vira exceção (a tela mostra "busca indisponível")', async () => {
    const buscar = jest.fn().mockResolvedValue(resposta(null, false, 429));
    await expect(buscarLugares('mercado', { buscar })).rejects.toThrow('429');
  });

  it('repassa o sinal de cancelamento (digitar de novo cancela o pedido anterior)', async () => {
    const buscar = jest.fn().mockResolvedValue(resposta([]));
    const controle = new AbortController();
    await buscarLugares('mercado', { buscar, sinal: controle.signal });
    expect(buscar.mock.calls[0][1].signal).toBe(controle.signal);
  });
});

describe('nomeDoPonto', () => {
  it('usa o nome do lugar quando existe', async () => {
    const buscar = jest.fn().mockResolvedValue(resposta({ name: 'Parque do Cocó', display_name: 'Parque do Cocó, Fortaleza' }));
    await expect(nomeDoPonto(-3.77, -38.47, { buscar })).resolves.toBe('Parque do Cocó');
  });

  it('sem nome, usa as duas primeiras partes do endereço', async () => {
    const buscar = jest.fn().mockResolvedValue(resposta({ display_name: '320, Avenida Vieira de Moraes, Fortaleza, Ceará' }));
    await expect(nomeDoPonto(-3.7, -38.5, { buscar })).resolves.toBe('320, Avenida Vieira de Moraes');
  });

  it('devolve null quando o serviço não sabe ou falha', async () => {
    await expect(nomeDoPonto(0, 0, { buscar: jest.fn().mockResolvedValue(resposta({ error: 'Unable to geocode' })) })).resolves.toBeNull();
    await expect(nomeDoPonto(0, 0, { buscar: jest.fn().mockResolvedValue(resposta(null, false, 500)) })).resolves.toBeNull();
  });
});
