import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_ICON } from '../../src/design/icons';
import { colors, fontFamily, fontSize, size, textStyles } from '../../src/design/tokens';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Aba ativa com o ícone preenchido e inativa em contorno (docs/DESIGN_SYSTEM.md, seção 11.6). */
const aba = (title: string, headerTitle: string, [ativo, inativo]: readonly [string, string]) => ({
  title,
  headerTitle,
  tabBarIcon: ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) => (
    <Ionicons name={(focused ? ativo : inativo) as IconName} size={size} color={color} />
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
      <Tabs.Screen name="index" options={aba('Lembretes', 'Meus Lembretes', TAB_ICON.lembretes)} />
      <Tabs.Screen name="novo" options={aba('Novo', 'Novo Lembrete', TAB_ICON.novo)} />
      <Tabs.Screen name="mapa" options={aba('Mapa', 'Mapa', TAB_ICON.mapa)} />
      <Tabs.Screen name="config" options={aba('Config', 'Configurações', TAB_ICON.config)} />
    </Tabs>
  );
}
