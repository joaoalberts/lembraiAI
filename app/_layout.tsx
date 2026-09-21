import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { Stack, useSegments } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { AvisosNaTela } from '../src/components/AvisosNaTela';
import { BarraDeStatusPadrao } from '../src/components/BarraDeStatus';
import { useFontesDaMarca } from '../src/design/fonts';
import { colors, layout, shadow } from '../src/design/tokens';
import { AuthProvider, useAuth } from '../src/state/auth';
import { GeoProvider } from '../src/state/geo';
import { GeofencesProvider } from '../src/state/geofences';
import { NotificationsProvider } from '../src/state/notifications';
import { ReminderScheduler } from '../src/state/reminder-scheduler';
import { RemindersProvider } from '../src/state/reminders';

const ROTAS_PUBLICAS = ['privacidade', 'excluir-conta'];

// Segura a abertura (splash) até a fonte da marca chegar; sem isso o texto piscaria em outra fonte no iOS e no Android
SplashScreen.preventAutoHideAsync();

/** Na web o app fica numa coluna de celular centralizada (como o frame do app original); no iOS/Android ocupa a tela. */
function Shell({ children }: { children: ReactNode }) {
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <View style={styles.page}>
      <View style={styles.column}>{children}</View>
    </View>
  );
}

function RootLayoutNav() {
  const { session, recuperando } = useAuth();
  // Recuperando a senha já existe sessão, mas a pessoa ainda não entrou: fica nas telas de conta até definir a senha
  const autenticado = !!session && !recuperando;
  // Rotas públicas não dependem da sessão: liberadas já na renderização estática, para a política de privacidade
  // e a página de exclusão de conta chegarem como HTML pronto (revisores das lojas e buscadores não rodam o JavaScript)
  const rotaPublica = ROTAS_PUBLICAS.includes((useSegments() as string[])[0]);

  // `undefined` = ainda lendo a sessão guardada; um indicador evita a tela vazia (e o piscar do login)
  if (session === undefined && !rotaPublica) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.spinner} />
      </View>
    );
  }

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

export default function RootLayout() {
  const fontesProntas = useFontesDaMarca();

  useEffect(() => {
    if (fontesProntas) SplashScreen.hideAsync();
  }, [fontesProntas]);

  // Só o iOS e o Android esperam a fonte. A web nunca bloqueia: o `useFonts` do servidor devolve `true`, o HTML estático
  // já sai com o texto (as páginas públicas dependem disso) e a fonte entra com `display: swap`
  if (!fontesProntas && Platform.OS !== 'web') return null;

  return (
    <AuthProvider>
      <NotificationsProvider>
        <GeoProvider>
          <RemindersProvider>
            <GeofencesProvider>
              <Shell>
                {/* o React Navigation apaga o <title> de +html.tsx na web; sem isto a aba fica sem nome */}
                <Head>
                  <title>LembreiAi — lembretes por hora e lugar</title>
                </Head>
                <ReminderScheduler />
                {/* o padrão do app (telas claras): texto escuro; as telas de fundo escuro trocam enquanto estão em foco */}
                <BarraDeStatusPadrao />
                <RootLayoutNav />
                {/* avisos na tela (só na web): por cima de tudo, no alto da coluna */}
                <AvisosNaTela />
              </Shell>
            </GeofencesProvider>
          </RemindersProvider>
        </GeoProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', backgroundColor: colors.bg.stage },
  column: { flex: 1, width: '100%', maxWidth: layout.columnMax, backgroundColor: colors.bg.page, boxShadow: shadow.column },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.page },
});
