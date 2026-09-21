import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Estende o app.json. A chave do Google Maps (Android) é um SEGREDO de build: vem da variável de ambiente
 * GOOGLE_MAPS_ANDROID_API_KEY (segredo do EAS ou .env.local) e nunca é commitada. No Expo Go o mapa funciona sem chave;
 * num build próprio sem ela, o app avisa em vez de abrir o mapa (ver src/lib/map-availability.ts). iOS usa o Apple Maps.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const androidMapsKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;

  if (process.env.EAS_BUILD_PROFILE === 'production' && process.env.EAS_BUILD_PLATFORM === 'android' && !androidMapsKey) {
    throw new Error(
      'Build de produção do Android sem GOOGLE_MAPS_ANDROID_API_KEY: o mapa ficaria indisponível. ' +
        'Crie o segredo com `eas env:create` (veja LANCAMENTO.md).',
    );
  }

  return {
    ...config,
    name: config.name ?? 'LembreiAi',
    slug: config.slug ?? 'lembreiai',
    extra: { ...config.extra, googleMapsConfigured: Boolean(androidMapsKey) },
    plugins: [
      ...(config.plugins ?? []),
      ['react-native-maps', { androidGoogleMapsApiKey: androidMapsKey }],
      './plugins/withReleaseSigning',
    ],
  };
};
