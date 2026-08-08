import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F4F7FB' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="register" />
      <Stack.Screen name="login" />
      <Stack.Screen name="role-selection" />
    </Stack>
  );
}
