import { CURVAS, ESTRELA, FAISCAS, HEROI, separarCor, type Janela } from '../heroi';
import { palette } from '../tokens';

describe('faíscas do herói', () => {
  it('são 14, nove círculos e cinco estrelas', () => {
    expect(FAISCAS).toHaveLength(14);
    expect(FAISCAS.filter((f) => f.forma === 'estrela')).toHaveLength(5);
    expect(FAISCAS.filter((f) => f.forma === 'circulo')).toHaveLength(9);
  });

  it('o deslocamento vem do ângulo e do alcance: bate com a tabela do original, que arredonda em du (tolerância de 1 dp)', () => {
    // (dx, dy) em dp conforme a tabela da especificação: -297/-24 du, -203/-158 du, -87/-136 du, 327/-26 du, 295/30 du, -295/30 du
    const esperado: [number, number, number][] = [[0, -150, -12], [3, -103, -80], [4, -44, -69], [11, 165, -13], [12, 149, 15], [13, -149, 15]];
    for (const [i, dx, dy] of esperado) {
      expect(Math.abs(FAISCAS[i].dx - dx)).toBeLessThanOrEqual(1);
      expect(Math.abs(FAISCAS[i].dy - dy)).toBeLessThanOrEqual(1);
    }
  });

  it('as de cima sobem (dy negativo) e há faíscas para os dois lados', () => {
    expect(FAISCAS.filter((f) => f.dy < 0).length).toBeGreaterThan(10);
    expect(FAISCAS.some((f) => f.dx < 0)).toBe(true);
    expect(FAISCAS.some((f) => f.dx > 0)).toBe(true);
  });

  it('só usam as quatro cores do original (menta, branco, verde-floresta e laranja)', () => {
    const permitidas = new Set<string>([palette.mint400, palette.white, palette.forest600, palette.orange500]);
    for (const f of FAISCAS) expect(permitidas.has(f.cor)).toBe(true);
  });

  it('cada uma começa entre 0,62 s e 0,73 s e termina antes do fim da sequência', () => {
    for (const f of FAISCAS) {
      expect(f.atraso).toBeGreaterThanOrEqual(0.62);
      expect(f.atraso).toBeLessThanOrEqual(0.73);
      expect(f.atraso + HEROI.faisca.duracao).toBeLessThanOrEqual(HEROI.duracao);
    }
  });

  it('a estrela tem oito pontos', () => {
    expect(ESTRELA.split(' ')).toHaveLength(8);
  });
});

describe('linha do tempo do herói', () => {
  const janelas: [string, Janela][] = [
    ['brilho', HEROI.brilho.janela],
    ['anel', HEROI.anel.janela],
    ['disco', HEROI.disco.janela],
    ['onda 1', HEROI.onda.janelas[0]],
    ['onda 2', HEROI.onda.janelas[1]],
    ['entrada do selo', HEROI.selo.entrada.janela],
    ['visto', HEROI.selo.visto.janela],
    ['brilho do selo', HEROI.selo.brilho.janela],
    ['aparece do ponto A', HEROI.cintilacao.pontos[0].aparece],
    ['aparece do ponto B', HEROI.cintilacao.pontos[1].aparece],
    ['título', HEROI.subida.titulo],
    ['subtítulo', HEROI.subida.subtitulo],
  ].map(([nome, j]) => [nome as string, j as Janela]);

  it.each(janelas)('%s começa antes de terminar e cabe na duração total', (_nome, [inicio, fim]) => {
    expect(inicio).toBeGreaterThanOrEqual(0);
    expect(fim).toBeGreaterThan(inicio);
    expect(fim).toBeLessThanOrEqual(HEROI.duracao);
  });

  it('o "estouro" do selo passa do tamanho final antes de assentar, no meio da janela', () => {
    const { escalaMeio, meio, janela } = HEROI.selo.entrada;
    expect(escalaMeio).toBeGreaterThan(1);
    expect(meio).toBeGreaterThan(janela[0]);
    expect(meio).toBeLessThan(janela[1]);
  });

  it('as curvas têm x entre 0 e 1 (só o y pode passar, como no "estouro")', () => {
    for (const [x1, , x2] of Object.values(CURVAS)) {
      expect(x1).toBeGreaterThanOrEqual(0);
      expect(x1).toBeLessThanOrEqual(1);
      expect(x2).toBeGreaterThanOrEqual(0);
      expect(x2).toBeLessThanOrEqual(1);
    }
    expect(CURVAS.estourar[1]).toBeGreaterThan(1);
  });
});

describe('desenho do selo', () => {
  it('o comprimento do visto é o do caminho: 28,28 + 58,80 unidades (o traço só se apaga por inteiro se o comprimento for exato)', () => {
    const [a, b, c] = [[42, 74], [62, 94], [101, 50]];
    const comprimento = Math.hypot(b[0] - a[0], b[1] - a[1]) + Math.hypot(c[0] - b[0], c[1] - b[1]);
    expect(HEROI.selo.visto.caminho).toBe('M42 74 L62 94 L101 50');
    expect(HEROI.selo.visto.comprimento).toBeCloseTo(comprimento, 1);
  });

  it('as sombras são camadas de boxShadow válidas (x y desfoque [espalhamento] cor)', () => {
    const camada = /^(inset )?(-?\d+(\.\d+)?px ){2,3}\d+(\.\d+)?px rgba\(\d+, \d+, \d+, [\d.]+\)$/;
    for (const s of [HEROI.disco.sombra, HEROI.selo.sombra, HEROI.selo.filete, HEROI.cintilacao.brilho]) {
      for (const parte of s.split(/, (?=inset |-?\d+(?:\.\d+)?px)/)) expect(parte).toMatch(camada);
    }
  });

  it('o selo é o menor dos círculos e a onda cresce a partir do disco', () => {
    expect(HEROI.selo.tamanho).toBeLessThan(HEROI.disco.tamanho);
    expect(HEROI.disco.tamanho).toBeLessThan(HEROI.anel.tamanho);
    expect(HEROI.anel.tamanho).toBeLessThan(HEROI.brilho.tamanho);
    expect(HEROI.onda.tamanho).toBe(HEROI.disco.tamanho);
    expect(HEROI.onda.escalaFinal).toBeGreaterThan(1);
  });
});

describe('separarCor', () => {
  it('separa a cor da opacidade (o SVG guarda as duas em atributos diferentes)', () => {
    expect(separarCor('rgba(226, 246, 234, 0.95)')).toEqual({ cor: 'rgb(226, 246, 234)', alfa: 0.95 });
    expect(separarCor('rgba(170,238,205,0)')).toEqual({ cor: 'rgb(170, 238, 205)', alfa: 0 });
  });

  it('cor sem opacidade é opaca', () => {
    expect(separarCor('rgb(0, 0, 0)')).toEqual({ cor: 'rgb(0, 0, 0)', alfa: 1 });
  });

  it('recusa o que não é rgb/rgba em vez de desenhar uma cor errada', () => {
    expect(() => separarCor('#FFFFFF')).toThrow('cor rgb/rgba esperada');
  });

  it('todas as paradas do brilho e do disco são rgba válidos', () => {
    for (const p of [...HEROI.brilho.paradas, ...HEROI.disco.paradas]) expect(() => separarCor(p.cor)).not.toThrow();
  });
});
