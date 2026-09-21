import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

type IconName = ComponentProps<typeof Ionicons>['name'];

const aba = (title: string, headerTitle: string, icon: IconName) => ({
  title,
  headerTitle,
  tabBarIcon: ({ color, size }: { color: ColorValue; size: number }) => <Ionicons name={icon} size={size} color={color} />,
});

// A proteção por sessão fica no layout raiz (Stack.Protected); aqui só as abas.
export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleStyle: { fontSize: 18, fontWeight: '600' },
        tabBarActiveTintColor: '#FE532A',
      }}
    >
      <Tabs.Screen name="index" options={aba('Lembretes', 'Meus Lembretes', 'list')} />
      <Tabs.Screen name="novo" options={aba('Novo', 'Novo Lembrete', 'add-circle')} />
      <Tabs.Screen name="mapa" options={aba('Mapa', 'Mapa', 'map')} />
      <Tabs.Screen name="config" options={aba('Config', 'Configurações', 'settings')} />
    </Tabs>
  );
}
