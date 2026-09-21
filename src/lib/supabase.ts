import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSessionStorage } from './session-storage';

/**
 * Cliente do Supabase para React Native (Expo).
 *
 * RLS (Row Level Security) protege os dados — a chave publicável é segura no app.
 * As variáveis EXPO_PUBLIC_* são embutidas na hora da transformação do Metro: depois de criar ou mudar o `.env.local`,
 * reinicie com `npx expo start --clear`, senão o app segue usando o valor antigo (ou o fallback abaixo).
 */

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const key =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sem-chave';

/** Verifica se as variáveis estão configuradas */
export const supabaseConfigurado = Boolean(url && key && url !== 'http://127.0.0.1:54321');

const LEMBRAR = 'lembreiai:lembrar-me';

export const getLembrarMe = async () => {
  try {
    const value = await AsyncStorage.getItem(LEMBRAR);
    return value === '1';
  } catch {
    return false;
  }
};

export const setLembrarMe = async (on: boolean) => {
  try {
    await AsyncStorage.setItem(LEMBRAR, on ? '1' : '0');
  } catch {
    // Erro ao salvar (pode não ter permissão)
  }
};

export const supabase = createClient(url, key, {
  auth: {
    storage: createSessionStorage(AsyncStorage, getLembrarMe),
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Recuperação de senha é feita pelo código de 6 números (ou pelo token_hash do link)
  },
});
