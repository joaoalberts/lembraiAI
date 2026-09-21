import { createSessionStorage, type KeyValueStore } from '../session-storage';

function disco(): KeyValueStore & { dados: Map<string, string> } {
  const dados = new Map<string, string>();
  return {
    dados,
    getItem: async (k) => dados.get(k) ?? null,
    setItem: async (k, v) => { dados.set(k, v); },
    removeItem: async (k) => { dados.delete(k); },
  };
}

describe('createSessionStorage', () => {
  it('com "Manter conectado" desligado a sessão fica disponível em memória, mas não vai para o disco', async () => {
    const backend = disco();
    const storage = createSessionStorage(backend, async () => false);

    await storage.setItem('sb-auth', '{"token":"x"}');

    // O supabase-js relê o armazenamento a cada requisição: se isto voltasse null, as chamadas iriam sem token e o RLS devolveria vazio
    expect(await storage.getItem('sb-auth')).toBe('{"token":"x"}');
    expect(backend.dados.has('sb-auth')).toBe(false);
  });

  it('com "Manter conectado" ligado grava no disco, e um app novo (memória vazia) lê de lá', async () => {
    const backend = disco();
    await createSessionStorage(backend, async () => true).setItem('sb-auth', 'abc');
    expect(backend.dados.get('sb-auth')).toBe('abc');

    const aposReiniciar = createSessionStorage(backend, async () => true);
    expect(await aposReiniciar.getItem('sb-auth')).toBe('abc');
  });

  it('desligar o "Manter conectado" apaga a cópia antiga do disco na próxima gravação', async () => {
    const backend = disco();
    backend.dados.set('sb-auth', 'velha');
    const storage = createSessionStorage(backend, async () => false);

    await storage.setItem('sb-auth', 'nova');

    expect(backend.dados.has('sb-auth')).toBe(false);
    expect(await storage.getItem('sb-auth')).toBe('nova');
  });

  it('removeItem limpa memória e disco (sair da conta)', async () => {
    const backend = disco();
    const storage = createSessionStorage(backend, async () => true);
    await storage.setItem('sb-auth', 'abc');

    await storage.removeItem('sb-auth');

    expect(await storage.getItem('sb-auth')).toBeNull();
    expect(backend.dados.has('sb-auth')).toBe(false);
  });

  it('se o disco falhar, a sessão continua valendo em memória em vez de quebrar o login', async () => {
    const quebrado: KeyValueStore = {
      getItem: async () => { throw new Error('sem disco'); },
      setItem: async () => { throw new Error('sem disco'); },
      removeItem: async () => { throw new Error('sem disco'); },
    };
    const storage = createSessionStorage(quebrado, async () => true);

    await expect(storage.setItem('k', 'v')).resolves.toBeUndefined();
    expect(await storage.getItem('k')).toBe('v');
    expect(await storage.getItem('outra')).toBeNull();
    await expect(storage.removeItem('k')).resolves.toBeUndefined();
  });
});
