#!/usr/bin/env bash
# Gera o APK de release do Android SEM nenhuma conta (JDK 17 e Android SDK instalados no seu usuário; ver LANCAMENTO.md).
#
#   EXPO_PUBLIC_SUPABASE_URL=https://seu-backend EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=chave scripts/build-android.sh
#
# Opcionais: ABIS=arm64-v8a,armeabi-v7a (padrão)  ·  ALLOW_CLEARTEXT=1 (SÓ para testar num emulador contra http://10.0.2.2)
# A chave de assinatura fica FORA do repositório (~/.lembreiai/keys). Faça backup dela: sem a mesma chave, quem instalou não consegue atualizar o app.
set -euo pipefail
cd "$(dirname "$0")/.."

# Sem isto o `.env.local` (com o Supabase de localhost) iria para dentro do APK.
: "${EXPO_PUBLIC_SUPABASE_URL:?defina EXPO_PUBLIC_SUPABASE_URL}"
: "${EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:?defina EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY}"
export EXPO_PUBLIC_SUPABASE_URL EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY

JAVA_HOME="${JAVA_HOME:-$(ls -d "$HOME"/Library/Java/JavaVirtualMachines/jdk-17*/Contents/Home 2>/dev/null | head -1)}"
export JAVA_HOME
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
[ -x "$JAVA_HOME/bin/java" ] || { echo "JDK 17 não encontrado (JAVA_HOME=$JAVA_HOME)"; exit 1; }
[ -d "$ANDROID_HOME/platforms/android-36" ] || { echo "Android SDK (platform 36) não encontrado em $ANDROID_HOME"; exit 1; }

KEYS_ENV="${LEMBREIAI_KEYS_ENV:-$HOME/.lembreiai/keys/keystore.env}"
[ -f "$KEYS_ENV" ] || { echo "arquivo da chave de assinatura não encontrado: $KEYS_ENV"; exit 1; }
# shellcheck disable=SC1090
source "$KEYS_ENV"

CI=1 npx expo prebuild --platform android --clean --no-install

if [ "${ALLOW_CLEARTEXT:-0}" = "1" ]; then
  echo "AVISO: build de TESTE com tráfego HTTP liberado (não distribua este APK)"
  sed -i '' 's#<application #<application android:usesCleartextTraffic="true" #' android/app/src/main/AndroidManifest.xml
fi

(cd android && ./gradlew assembleRelease -PreactNativeArchitectures="${ABIS:-arm64-v8a,armeabi-v7a}" --no-daemon)

mkdir -p dist-android
cp android/app/build/outputs/apk/release/app-release.apk dist-android/lembreiai.apk
"$ANDROID_HOME"/build-tools/36.0.0/apksigner verify --print-certs dist-android/lembreiai.apk | head -3
ls -lh dist-android/lembreiai.apk
