import { UFS, ehCep, lerEndereco, normalizar } from '../enderecos';

describe('normalizar (para comparar textos: sem acento, caixa baixa, só letras e números)', () => {
  it('tira acento, caixa e pontuação', () => {
    expect(normalizar('Avenida Barão de Studart, Nº 1.980 — Aldeota!')).toBe('avenida barao de studart n 1 980 aldeota');
    expect(normalizar('  São  José ')).toBe('sao jose');
  });
});

describe('ehCep', () => {
  it('aceita 8 dígitos, com ou sem hífen', () => {
    expect(ehCep('60811-905')).toBe(true);
    expect(ehCep('60811905')).toBe(true);
    expect(ehCep(' 60811 905 ')).toBe(false);
    expect(ehCep('6081190')).toBe(false);
    expect(ehCep('Rua A, 60811-905')).toBe(false);
  });
});

describe('lerEndereco: a palavra "CEP" na frente do número não vira nome de lugar', () => {
  it.each(['CEP 60811-905', 'cep: 60811905', 'C.E.P. 60811-905', 'CEP:60811-905'])('"%s" é só o CEP', (texto) => {
    const e = lerEndereco(texto);
    expect(e.cep).toBe('60811905');
    expect(e.lugar).toBeUndefined();
    expect(e.logradouro).toBeUndefined();
    expect(e.resto).toEqual([]);
  });

  it('no fim de um endereço também sai, e o resto continua igual', () => {
    expect(lerEndereco('Rua A, 10, Aldeota, Fortaleza - CE, CEP 60000-000')).toMatchObject({ logradouro: 'Rua A', numero: '10', resto: ['Aldeota', 'Fortaleza'], uf: 'CE', cep: '60000000' });
  });

  it('uma palavra que só começa com "cep" (Cepilho, Cepaz) não é apagada', () => {
    expect(lerEndereco('Rua Cepaz, 10').logradouro).toBe('Rua Cepaz');
  });
});

describe('lerEndereco: só o CEP', () => {
  it('guarda os 8 dígitos e nada mais', () => {
    const e = lerEndereco('60811-905');
    expect(e.cep).toBe('60811905');
    expect(e.logradouro).toBeUndefined();
    expect(e.numero).toBeUndefined();
    expect(e.resto).toEqual([]);
    expect(lerEndereco('60811905').cep).toBe('60811905');
  });
});

describe('lerEndereco: endereço completo', () => {
  it('rua, número, bairro, cidade, estado e CEP separados por vírgula e hífen', () => {
    expect(lerEndereco('Av. Washington Soares, 1321, Edson Queiroz, Fortaleza - CE, 60811-905')).toMatchObject({
      logradouro: 'Avenida Washington Soares',
      numero: '1321',
      resto: ['Edson Queiroz', 'Fortaleza'],
      uf: 'CE',
      cep: '60811905',
    });
  });

  it('sem vírgulas: o número é o último número do trecho da rua e o resto vira uma parte só', () => {
    expect(lerEndereco('Rua Barão de Studart 1980 Aldeota Fortaleza')).toMatchObject({
      logradouro: 'Rua Barão de Studart',
      numero: '1980',
      resto: ['Aldeota Fortaleza'],
    });
  });

  it('número colado ao nome da rua, com ou sem vírgula', () => {
    expect(lerEndereco('Rua Silva Jatahy 100')).toMatchObject({ logradouro: 'Rua Silva Jatahy', numero: '100' });
    expect(lerEndereco('Rua Silva Jatahy, 100')).toMatchObject({ logradouro: 'Rua Silva Jatahy', numero: '100' });
  });

  it('abreviações do começo viram o tipo por extenso', () => {
    const tipo = (t: string) => lerEndereco(`${t} Tal, 10`).logradouro?.split(' ')[0];
    expect(tipo('R.')).toBe('Rua');
    expect(tipo('R')).toBe('Rua');
    expect(tipo('Av')).toBe('Avenida');
    expect(tipo('Av.')).toBe('Avenida');
    expect(tipo('Trav.')).toBe('Travessa');
    expect(tipo('Tv.')).toBe('Travessa');
    expect(tipo('Pç.')).toBe('Praça');
    expect(tipo('Praca')).toBe('Praça');
    expect(tipo('Rod.')).toBe('Rodovia');
    expect(tipo('Est.')).toBe('Estrada');
    expect(tipo('Al.')).toBe('Alameda');
  });

  it('"R. Dr. João Moreira" mantém o Dr. e só expande o tipo', () => {
    expect(lerEndereco('R. Dr. João Moreira, 300').logradouro).toBe('Rua Dr. João Moreira');
  });

  it('"nº", "n°", "no." e "número" antes do número', () => {
    expect(lerEndereco('Travessa Pará nº 45').numero).toBe('45');
    expect(lerEndereco('Tv. Pará, n° 45').numero).toBe('45');
    expect(lerEndereco('Tv. Pará, número 45, Centro').numero).toBe('45');
    expect(lerEndereco('Tv. Pará, no. 45').numero).toBe('45');
  });

  it('número com letra ("123A") vale', () => {
    expect(lerEndereco('Rua A, 123A').numero).toBe('123A');
  });

  it('sem número ("s/n") não inventa número e avisa que a pessoa disse que não tem', () => {
    const e = lerEndereco('Praça do Ferreira, s/n, Centro');
    expect(e.numero).toBeUndefined();
    expect(e.semNumero).toBe(true);
    expect(e.logradouro).toBe('Praça do Ferreira');
    expect(e.resto).toEqual(['Centro']);
  });

  it('número que faz parte do nome da rua não é número de porta', () => {
    expect(lerEndereco('Rua 25 de Março, 123')).toMatchObject({ logradouro: 'Rua 25 de Março', numero: '123' });
    expect(lerEndereco('Avenida 13 de Maio')).toMatchObject({ logradouro: 'Avenida 13 de Maio', numero: undefined });
    expect(lerEndereco('Rua 7 de Setembro, 45')).toMatchObject({ logradouro: 'Rua 7 de Setembro', numero: '45' });
  });

  it('rodovia com o código da estrada não confunde o código com o número', () => {
    expect(lerEndereco('Rodovia BR 116, km 10')).toMatchObject({ logradouro: 'Rodovia BR 116', numero: undefined });
    expect(lerEndereco('Rodovia BR-116')).toMatchObject({ logradouro: 'Rodovia BR-116', numero: undefined });
  });

  it('complemento (apto, sala, bloco, loja) sai do caminho', () => {
    const e = lerEndereco('Rua Ana Bilhar, 1200, apto 302, Meireles, Fortaleza');
    expect(e).toMatchObject({ logradouro: 'Rua Ana Bilhar', numero: '1200', resto: ['Meireles', 'Fortaleza'] });
  });
});

describe('lerEndereco: estado', () => {
  it('sigla no fim, com hífen, barra, vírgula ou só espaço', () => {
    expect(lerEndereco('Rua A, 10, Fortaleza - CE').uf).toBe('CE');
    expect(lerEndereco('Rua A, 10, Fortaleza/CE').uf).toBe('CE');
    expect(lerEndereco('Rua A, 10, Fortaleza, CE').uf).toBe('CE');
    expect(lerEndereco('Rua A, 10, Fortaleza CE').uf).toBe('CE');
    expect(lerEndereco('av washington soares 1321 fortaleza ce').uf).toBe('CE');
  });

  it('nome do estado por extenso, com ou sem acento', () => {
    expect(lerEndereco('Rua A, 10, Fortaleza, Ceará').uf).toBe('CE');
    expect(lerEndereco('Rua A, 10, Sao Paulo, Sao Paulo').uf).toBe('SP');
    expect(lerEndereco('Rua A, 10, Belém, Pará').uf).toBe('PA');
  });

  it('a cidade não perde o nome quando a sigla sai', () => {
    expect(lerEndereco('Rua A, 10, Fortaleza - CE').resto).toEqual(['Fortaleza']);
    expect(lerEndereco('Rua A, 10, Fortaleza CE').resto).toEqual(['Fortaleza']);
  });

  it('duas letras que não são sigla de estado ficam no texto', () => {
    expect(lerEndereco('Rua A, 10, Bairro XY').uf).toBeUndefined();
    expect(lerEndereco('Rua A, 10, Bairro XY').resto).toEqual(['Bairro XY']);
  });

  it('toda unidade da federação tem sigla e nome', () => {
    expect(Object.keys(UFS)).toHaveLength(27);
    expect(UFS.CE).toBe('Ceará');
    expect(UFS.DF).toBe('Distrito Federal');
  });
});

describe('lerEndereco: nome de lugar e texto solto', () => {
  it('sem tipo de logradouro é nome de lugar, não rua', () => {
    const e = lerEndereco('Shopping Iguatemi Fortaleza');
    expect(e.logradouro).toBeUndefined();
    expect(e.lugar).toBe('Shopping Iguatemi Fortaleza');
  });

  it('o texto para busca livre junta o que foi entendido, já com o tipo por extenso', () => {
    expect(lerEndereco('av washington soares 1321 fortaleza ce').livre).toBe('Avenida washington soares, 1321, fortaleza, CE');
    expect(lerEndereco('Shopping Iguatemi Fortaleza').livre).toBe('Shopping Iguatemi Fortaleza');
  });

  it('espaços sobrando e vírgulas duplas não atrapalham', () => {
    expect(lerEndereco('  Rua   A ,,  10 ,  Aldeota  ')).toMatchObject({ logradouro: 'Rua A', numero: '10', resto: ['Aldeota'] });
  });

  it('texto vazio não quebra', () => {
    expect(lerEndereco('   ')).toMatchObject({ livre: '', resto: [] });
  });
});
