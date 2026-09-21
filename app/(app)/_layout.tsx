import { Tabs } from 'expo-router/js-tabs';
import { BarraDeAbas } from '../../src/components/BarraDeAbas';
import { colors, textStyles } from '../../src/design/tokens';

// A proteção por sessão fica no layout raiz (Stack.Protected); aqui só as abas.
// A barra é a do app (BarraDeAbas): Início, Lembretes, Mapa e Configurações. O formulário `novo` é uma tela sob "Lembretes".
export default function AppLayout() {
  return (
    <Tabs
      tabBar={(props) => <BarraDeAbas {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.bg.page },
        headerShadowVisible: false,
        headerTitleStyle: { ...textStyles.heading, color: colors.text.primary },
        sceneStyle: { backgroundColor: colors.bg.page },
      }}
    >
      <Tabs.Screen name="inicio" options={{ title: 'Início', headerShown: false }} />
      <Tabs.Screen name="index" options={{ title: 'Lembretes', headerShown: false }} />
      <Tabs.Screen name="novo" options={{ title: 'Novo lembrete', headerShown: false }} />
      <Tabs.Screen name="editar" options={{ title: 'Editar lembrete', headerShown: false }} />
      <Tabs.Screen name="mapa" options={{ title: 'Mapa', headerTitle: 'Mapa' }} />
      <Tabs.Screen name="config" options={{ title: 'Configurações', headerTitle: 'Configurações' }} />
    </Tabs>
  );
}
