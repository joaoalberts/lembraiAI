import { Stack } from 'expo-router';

// sem isso, o Expo Router abriria a 1ª tela em ordem alfabética (bem-vindo) sem ser por escolha: quem chega abre a apresentação
export const unstable_settings = { initialRouteName: 'bem-vindo' };

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="bem-vindo" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
