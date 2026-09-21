/**
 * O mapa nativo do Android precisa da chave do Google Maps no AndroidManifest; sem a tag, o SDK lança exceção ao criar
 * o MapView e derruba o app. O Expo Go (`storeClient`) traz a chave do próprio Expo, então lá o mapa sempre funciona.
 * iOS usa o Apple Maps, que não precisa de chave. `configured` vem de `extra.googleMapsConfigured` (app.config.ts).
 */
export function nativeMapUnavailable(os: string, executionEnvironment: string, configured: boolean): boolean {
  return os === 'android' && executionEnvironment !== 'storeClient' && !configured;
}
