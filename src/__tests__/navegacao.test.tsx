import { act } from '@testing-library/react-native';
import fs from 'fs';
import path from 'path';
import { Stack, router } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import AppLayout from '../../app/(app)/_layout';

// Navegação de verdade (Expo Router + o layout de abas do app), com telas de mentira: o que se prova aqui é para onde o "voltar" leva.
// `renderRouter` foi feito para o `render` síncrono do RNTL 13; no 14 ele devolve uma Promise que carrega os auxiliares (`getPathname`), por isso o `await app`.
const tela = (nome: string) => () => <Text>{nome}</Text>;
const telas = {
  '(app)/_layout': AppLayout,
  '(app)/inicio': tela('inicio'),
  '(app)/index': tela('lista'),
  '(app)/novo': tela('novo'),
  '(app)/editar': tela('editar'),
  '(app)/sucesso': tela('sucesso'),
  '(app)/mapa': tela('mapa'),
  '(app)/config': tela('config'),
};

// devolve só a leitura do caminho: retornar o próprio `app` de uma função async o "desembrulharia" (é uma Promise) e os auxiliares sumiriam
const abrir = async (initialUrl: string) => {
  const app = renderRouter(telas, { initialUrl });
  await app;
  return { getPathname: () => app.getPathname() };
};
const ir = async (destino: Parameters<typeof router.navigate>[0]) => { await act(async () => { router.navigate(destino); }); };
const voltar = async () => { await act(async () => { router.back(); }); };

describe('Navegação: o voltar das telas de formulário', () => {
  it('da lista para a edição e de volta: volta à lista, não à primeira aba', async () => {
    const app = await abrir('/');
    expect(app.getPathname()).toBe('/');
    await ir('/editar');
    expect(app.getPathname()).toBe('/editar');
    await voltar();
    expect(app.getPathname()).toBe('/');
  });

  it('quem veio da tela inicial para o formulário novo volta para a tela inicial', async () => {
    const app = await abrir('/inicio');
    await ir('/novo');
    expect(app.getPathname()).toBe('/novo');
    await voltar();
    expect(app.getPathname()).toBe('/inicio');
  });

  it('entrando direto pelo endereço não há para onde voltar (aí o formulário manda para a lista)', async () => {
    await abrir('/editar');
    expect(router.canGoBack()).toBe(false);
  });

  it('Editar a partir do sucesso e voltar traz o sucesso de volta (e não a primeira aba)', async () => {
    const app = await abrir('/');
    await ir({ pathname: '/sucesso', params: { id: 'a1' } });
    await ir({ pathname: '/editar', params: { id: 'a1' } });
    expect(app.getPathname()).toBe('/editar');
    await voltar();
    expect(app.getPathname()).toBe('/sucesso');
  });
});

describe('Navegação: a tela de sucesso', () => {
  it('não é uma aba: esconde a barra de abas, que volta quando se sai dela', async () => {
    const app = await abrir('/');
    expect(screen.getByTestId('barra-de-abas')).toBeTruthy();
    await ir({ pathname: '/sucesso', params: { id: 'a1' } });
    expect(app.getPathname()).toBe('/sucesso');
    expect(screen.queryByTestId('barra-de-abas')).toBeNull();
    await ir('/');
    expect(screen.getByTestId('barra-de-abas')).toBeTruthy();
  });
});

// Réplica do guard do layout raiz (app/_layout.tsx): telas de conta sem sessão, o app depois dela. O layout `(app)` é o de verdade.
let comecaEntrado = false;
let entrarNoApp: () => void = () => {};
function RaizComGuard() {
  const [autenticado, setAutenticado] = useState(comecaEntrado);
  useEffect(() => { entrarNoApp = () => setAutenticado(true); }, []);
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={autenticado}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!autenticado}>
        <Stack.Screen name="auth" />
      </Stack.Protected>
    </Stack>
  );
}
// `auth/_layout` existe no app de verdade: sem ele o `auth/login` viraria uma rota solta e o guard de `auth` não a alcançaria
const AuthDeTeste = () => <Stack screenOptions={{ headerShown: false }} />;
const abrirComGuard = async (initialUrl: string) => {
  const app = renderRouter({ _layout: RaizComGuard, 'auth/_layout': AuthDeTeste, 'auth/login': tela('login'), ...telas }, { initialUrl });
  await app;
  return { getPathname: () => app.getPathname() };
};

describe('Navegação: depois de entrar', () => {
  afterEach(() => { comecaEntrado = false; });

  it('logo depois de entrar (ou criar a conta) o app abre no formulário de novo lembrete, não na abertura', async () => {
    const app = await abrirComGuard('/auth/login');
    expect(app.getPathname()).toBe('/auth/login');
    await act(async () => { entrarNoApp(); });
    expect(app.getPathname()).toBe('/novo');
  });

  it('a barra de abas continua completa: dá para ir à abertura e à lista a partir do novo lembrete', async () => {
    const app = await abrirComGuard('/auth/login');
    await act(async () => { entrarNoApp(); });
    await ir('/inicio');
    expect(app.getPathname()).toBe('/inicio');
    await ir('/');
    expect(app.getPathname()).toBe('/');
  });

  it('quem abre o app já entrado, pelo endereço da lista, continua na lista (só o ato de entrar leva ao novo)', async () => {
    comecaEntrado = true;
    const app = await abrirComGuard('/');
    expect(app.getPathname()).toBe('/');
  });
});

describe('Navegação: a réplica do guard corresponde ao layout raiz de verdade', () => {
  // A réplica acima não é o `app/_layout.tsx`. Se o guard real mudar (outro nome de grupo, outra condição) e a réplica não, os testes de cima
  // continuariam verdes provando uma navegação que o app não faz mais. Esta amarra confere a forma que a réplica copia.
  const raiz = fs.readFileSync(path.join(__dirname, '../../app/_layout.tsx'), 'utf8').replace(/\s+/g, ' ');

  it('o app fica atrás de `autenticado` e as telas de conta atrás do contrário, pelos mesmos nomes de grupo', () => {
    expect(raiz).toContain('<Stack.Protected guard={autenticado}> <Stack.Screen name="(app)" /> </Stack.Protected>');
    expect(raiz).toContain('<Stack.Protected guard={!autenticado}> <Stack.Screen name="auth" /> </Stack.Protected>');
  });

  it('a navegação depois de entrar é do guard: `entrar` e `cadastrar` não navegam à mão (CLAUDE.md: nunca navegar à mão após login)', () => {
    const auth = fs.readFileSync(path.join(__dirname, '../state/auth.tsx'), 'utf8');
    expect(auth).not.toMatch(/router\.(replace|push|navigate)|useRouter|<Redirect/);
  });
});
