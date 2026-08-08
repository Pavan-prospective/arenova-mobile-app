import { Stack } from 'expo-router';

export default function ParentRootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
