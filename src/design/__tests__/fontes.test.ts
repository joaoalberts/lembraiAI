import { FontDisplay } from 'expo-font';
import { FONTES } from '../fonts';
import { fontFamily, nomeDeFamilia, pilhaDeReserva, textStyles } from '../tokens';

const nomeBase = (familia: string) => familia.split(',')[0].trim();

describe('fontes da marca', () => {
  it('cada família dos tokens está registrada em FONTES, e só elas (nenhum peso carregado à toa)', () => {
    const dosTokens = Object.values(fontFamily).map(nomeBase).sort();
    expect(Object.keys(FONTES).sort()).toEqual(dosTokens);
  });

  it('todo arquivo de fonte foi resolvido e mostra o texto na hora, na fonte de reserva (display: swap)', () => {
    for (const [nome, fonte] of Object.entries(FONTES)) {
      expect({ nome, resolvido: fonte.uri !== undefined }).toEqual({ nome, resolvido: true });
      expect({ nome, display: fonte.display }).toEqual({ nome, display: FontDisplay.SWAP });
    }
  });

  it('a web soma a pilha de reserva ao nome; iOS e Android usam só o nome', () => {
    expect(nomeDeFamilia('NunitoSans_400Regular', pilhaDeReserva.sans, false)).toBe('NunitoSans_400Regular');
    expect(nomeDeFamilia('NunitoSans_400Regular', pilhaDeReserva.sans, true)).toBe(`NunitoSans_400Regular, ${pilhaDeReserva.sans}`);
  });

  it('a reserva da web termina numa família genérica (senão o texto cai em Times até a fonte chegar)', () => {
    expect(pilhaDeReserva.sans).toMatch(/sans-serif$/);
    expect(pilhaDeReserva.serif).toMatch(/serif$/);
  });

  it('todo estilo de texto usa uma família da marca e nenhum escreve fontWeight (fonte própria ignora o peso e soma negrito falso)', () => {
    const familias = new Set<string>(Object.values(fontFamily));
    for (const [nome, estilo] of Object.entries(textStyles)) {
      expect({ nome, daMarca: familias.has(estilo.fontFamily) }).toEqual({ nome, daMarca: true });
      expect({ nome, escreveOPeso: 'fontWeight' in estilo }).toEqual({ nome, escreveOPeso: false });
    }
  });

  it('títulos em serifa e o resto em sans, como nas referências', () => {
    for (const nome of ['display', 'title', 'heading'] as const) expect(textStyles[nome].fontFamily).toBe(fontFamily.serif);
    for (const nome of ['bodyLg', 'body', 'label', 'button', 'caption', 'micro'] as const) expect(textStyles[nome].fontFamily).not.toBe(fontFamily.serif);
  });
});
