/**
 * Fontes da marca: o mapa que o `useFonts` registra e o gancho que diz quando ficaram prontas.
 *
 * As chaves são os nomes das famílias em `fontFamily` (tokens.ts); `src/design/__tests__/fontes.test.ts` garante que
 * os dois lados combinam e que nenhum peso é carregado à toa. Cada peso é importado por caminho para entrar no bundle
 * só o que se usa: o pacote inteiro traz 16 arquivos.
 *
 * Web: o Expo Router extrai estas fontes na renderização estática e as embute no HTML (`<link rel="preload">` e
 * `<style id="expo-generated-fonts">`), desde que o `useFonts` seja chamado de forma síncrona na renderização.
 * `display: swap` mostra o texto na fonte de reserva (`pilhaDeReserva`) até a da marca chegar.
 */
import { NunitoSans_400Regular } from '@expo-google-fonts/nunito-sans/400Regular';
import { NunitoSans_500Medium } from '@expo-google-fonts/nunito-sans/500Medium';
import { NunitoSans_600SemiBold } from '@expo-google-fonts/nunito-sans/600SemiBold';
import { NunitoSans_700Bold } from '@expo-google-fonts/nunito-sans/700Bold';
import { SourceSerif4_700Bold } from '@expo-google-fonts/source-serif-4/700Bold';
import { FontDisplay, useFonts } from 'expo-font';

const comTrocaImediata = (arquivo: number) => ({ uri: arquivo, display: FontDisplay.SWAP });

export const FONTES = {
  NunitoSans_400Regular: comTrocaImediata(NunitoSans_400Regular),
  NunitoSans_500Medium: comTrocaImediata(NunitoSans_500Medium),
  NunitoSans_600SemiBold: comTrocaImediata(NunitoSans_600SemiBold),
  NunitoSans_700Bold: comTrocaImediata(NunitoSans_700Bold),
  SourceSerif4_700Bold: comTrocaImediata(SourceSerif4_700Bold),
};

/**
 * `true` quando as fontes chegaram **ou falharam** (o app segue na fonte do sistema em vez de ficar preso na abertura).
 * No servidor (renderização estática) o `useFonts` registra as fontes para o HTML e devolve `true`.
 */
export function useFontesDaMarca(): boolean {
  const [carregadas, erro] = useFonts(FONTES);
  return carregadas || erro !== null;
}
