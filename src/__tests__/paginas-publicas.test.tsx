import { render, screen } from '@testing-library/react-native';
import ExcluirContaScreen from '../../app/excluir-conta';
import PrivacidadeScreen from '../../app/privacidade';

/**
 * Política de privacidade e exclusão de conta são promessas públicas (as lojas exigem as duas URLs). Estes testes garantem que
 * o texto não remeta a um contato que não existe e que as duas páginas digam o mesmo sobre os backups.
 * As páginas leem EXPO_PUBLIC_CONTACT_EMAIL ao renderizar, então cada caso só precisa ajustar a variável.
 */
const original = process.env.EXPO_PUBLIC_CONTACT_EMAIL;
const semContato = () => { delete process.env.EXPO_PUBLIC_CONTACT_EMAIL; };
const comContato = () => { process.env.EXPO_PUBLIC_CONTACT_EMAIL = 'contato@exemplo.invalid'; };
afterEach(() => {
  if (original === undefined) delete process.env.EXPO_PUBLIC_CONTACT_EMAIL;
  else process.env.EXPO_PUBLIC_CONTACT_EMAIL = original;
});

describe('páginas públicas sem e-mail de contato (o padrão do build)', () => {
  it('a política não manda "falar pelo contato abaixo" nem mostra um bloco Contato vazio', async () => {
    semContato();
    await render(<PrivacidadeScreen />);
    expect(screen.queryByText(/contato abaixo/)).toBeNull();
    expect(screen.queryByText('Contato')).toBeNull();
    expect(screen.getByText(/apagar sua conta e todos os dados/)).toBeTruthy();
  });

  it('a exclusão não remete a um contato inexistente e ensina o caminho pelo app, pelo site e pelo "Esqueci minha senha"', async () => {
    semContato();
    await render(<ExcluirContaScreen />);
    expect(screen.queryByText(/contato indicado na política/)).toBeNull();
    expect(screen.queryByText('Sem conseguir entrar')).toBeNull();
    expect(screen.getByText('Pelo aplicativo ou por este site')).toBeTruthy();
    expect(screen.getByText(/Esqueci minha senha/)).toBeTruthy();
  });
});

describe('páginas públicas com e-mail de contato', () => {
  it('a política mostra o contato e o cita', async () => {
    comContato();
    await render(<PrivacidadeScreen />);
    expect(screen.getByText('Contato')).toBeTruthy();
    expect(screen.getByText('contato@exemplo.invalid')).toBeTruthy();
    expect(screen.getByText(/pelo contato abaixo/)).toBeTruthy();
  });

  it('a exclusão oferece o e-mail para quem não consegue entrar', async () => {
    comContato();
    await render(<ExcluirContaScreen />);
    expect(screen.getByText('Sem conseguir entrar')).toBeTruthy();
    expect(screen.getByText(/Escreva para contato@exemplo\.invalid/)).toBeTruthy();
  });
});

describe('consistência entre as páginas', () => {
  it('as duas prometem o mesmo prazo para os backups (14 dias, o mesmo do scripts/backup.sh)', async () => {
    semContato();
    await render(<PrivacidadeScreen />);
    expect(screen.getByText(/até 14 dias depois da exclusão/)).toBeTruthy();
    await render(<ExcluirContaScreen />);
    expect(screen.getByText(/até 14 dias/)).toBeTruthy();
  });

  it('a política diz onde os dados ficam sem citar um provedor que não é mais o usado', async () => {
    semContato();
    await render(<PrivacidadeScreen />);
    expect(screen.queryByText(/no Supabase, nosso provedor/)).toBeNull();
    expect(screen.getByText(/servidor virtual \(VPS\)/)).toBeTruthy();
  });
});
