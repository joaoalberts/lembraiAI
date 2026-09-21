const { withAppBuildGradle } = require('expo/config-plugins');

/**
 * Assina o APK de release com a chave própria do app (em vez da chave de debug do template).
 *
 * A chave vem de variáveis de ambiente (LEMBREIAI_KEYSTORE_FILE/_PASSWORD, LEMBREIAI_KEY_ALIAS/_PASSWORD), nunca do repositório.
 * Sem uma chave estável, cada build sairia com uma assinatura diferente e ninguém conseguiria atualizar o app já instalado.
 * Falha alto se o Expo mudar o formato do build.gradle, em vez de voltar em silêncio para a chave de debug.
 */
module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (mod) => {
    let gradle = mod.modResults.contents;
    if (gradle.includes('LEMBREIAI_KEYSTORE_FILE')) return mod; // já aplicado

    const comRelease = gradle.replace(
      /(signingConfigs\s*\{\s*debug\s*\{[\s\S]*?\}\s*)(\})/,
      `$1    release {
            def keystoreFile = System.getenv('LEMBREIAI_KEYSTORE_FILE')
            if (keystoreFile) {
                storeFile file(keystoreFile)
                storePassword System.getenv('LEMBREIAI_KEYSTORE_PASSWORD')
                keyAlias System.getenv('LEMBREIAI_KEY_ALIAS')
                keyPassword System.getenv('LEMBREIAI_KEY_PASSWORD')
            }
        }
    $2`,
    );
    const usandoRelease = comRelease.replace(
      /(release\s*\{\s*\/\/ Caution![\s\S]*?)signingConfig signingConfigs\.debug/,
      `$1signingConfig System.getenv('LEMBREIAI_KEYSTORE_FILE') ? signingConfigs.release : signingConfigs.debug`,
    );

    if (!usandoRelease.includes('signingConfigs.release') || !usandoRelease.includes("? signingConfigs.release")) {
      throw new Error('withReleaseSigning: o android/app/build.gradle mudou de formato e a assinatura de release não foi aplicada.');
    }
    mod.modResults.contents = usandoRelease;
    return mod;
  });
};
