export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/**
 * Armazenamento da sessão do Supabase com "Manter conectado".
 *
 * A sessão SEMPRE fica em memória enquanto o app está aberto: o supabase-js relê o armazenamento a cada requisição
 * para obter o token, então descartar a gravação (como era antes, com "lembrar" desligado) deixava as chamadas seguintes
 * sem token — o RLS respondia com listas vazias. Só a cópia em disco depende da escolha da pessoa.
 */
export function createSessionStorage(backend: KeyValueStore, lembrar: () => Promise<boolean>): KeyValueStore {
  const memoria = new Map<string, string>();

  return {
    async getItem(key) {
      const emMemoria = memoria.get(key);
      if (emMemoria !== undefined) return emMemoria;
      try {
        return await backend.getItem(key);
      } catch {
        return null;
      }
    },
    async setItem(key, value) {
      memoria.set(key, value);
      try {
        if (await lembrar()) await backend.setItem(key, value);
        else await backend.removeItem(key);   // não deixa uma sessão antiga em disco se a pessoa desligou o "Manter conectado"
      } catch {
        // sem acesso ao disco: a sessão vale só até fechar o app
      }
    },
    async removeItem(key) {
      memoria.delete(key);
      try {
        await backend.removeItem(key);
      } catch {
        // nada a fazer
      }
    },
  };
}
