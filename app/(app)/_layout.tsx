import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconeNome } from '../../src/components/Icon';
import { TAB_ICON } from '../../src/design/icons';
import { colors, fontFamily, fontSize, iconStroke, size, textStyles } from '../../src/design/tokens';

/** Aba: o mesmo ícone nas duas situações; a ativa leva o traço mais grosso (docs/DESIGN_SYSTEM.md, seção 11.6). */
const aba = (title: string, headerTitle: string, icone: IconeNome) => ({
  title,
  headerTitle,
  tabBarIcon: ({ color, size: lado, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Icon name={icone} size={lado} color={String(color)} stroke={focused ? iconStroke.base : iconStroke.tab} />
  ),
});

// A proteção por sessão fica no layout raiz (Stack.Protected); aqui só as abas.
export default function AppLayout() {
  // altura própria (o rótulo de 12 é cortado na altura padrão): a área segura de baixo (barra de gestos) é somada à mão
  const { bottom } = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.bg.page },
        headerShadowVisible: false,
        headerTitleStyle: { ...textStyles.heading, color: colors.text.primary },
        tabBarActiveTintColor: colors.text.brand,
        tabBarInactiveTintColor: colors.icon.muted,
        tabBarStyle: {
          backgroundColor: colors.bg.card,
          borderTopColor: colors.border.divider,
          height: size.tabBar + bottom,
          paddingBottom: bottom,
        },
        tabBarLabelStyle: { fontFamily: fontFamily.medium, fontSize: fontSize.micro },
      }}
    >
      <Tabs.Screen name="inicio" options={{ ...aba('Início', 'Início', TAB_ICON.inicio), headerShown: false }} />
      <Tabs.Screen name="index" options={{ ...aba('Lembretes', 'Meus Lembretes', TAB_ICON.lembretes), headerShown: false }} />
      <Tabs.Screen name="novo" options={aba('Novo', 'Novo Lembrete', 'plus')} />
      <Tabs.Screen name="mapa" options={aba('Mapa', 'Mapa', TAB_ICON.mapa)} />
      <Tabs.Screen name="config" options={aba('Config', 'Configurações', TAB_ICON.config)} />
    </Tabs>
  );
}
