import { Stack } from 'expo-router';

// sem isso, o Expo Router abriria a 1ª tela em ordem alfabética (forgot-password) em vez do login
export const unstable_settings = { initialRouteName: 'login' };

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
