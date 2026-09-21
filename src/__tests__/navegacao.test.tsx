import { act } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';
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
