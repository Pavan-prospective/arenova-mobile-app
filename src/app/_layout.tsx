import '../../global.css';

import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, View, ActivityIndicator } from 'react-native';
import { 
  useFonts, 
  Outfit_400Regular, 
  Outfit_500Medium, 
  Outfit_600SemiBold, 
  Outfit_700Bold 
} from '@expo-google-fonts/outfit';

import { useAuthStore } from '@/store';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/services/queryClient';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  
  const { user, isLoading, hydrateAuth } = useAuthStore();

  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    if (isLoading || !fontsLoaded || !navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isCoachOnboarding = segments[0] === '(coach)' && segments[1] === 'onboarding';
    
    if (!user && !inAuthGroup && !isCoachOnboarding) {
      // Redirect to authentication if not logged in
      router.replace('/(auth)');
    } else if (user && inAuthGroup) {
      if (!user.isRegistered) {
        // Here you could redirect to a specific onboarding screen if needed,
        // but for now, we just don't redirect them to tabs.
      } else {
        // Redirect to app if logged in and registered
        let targetRoute = '';
        if (user.role === 'coach') {
          if (user.status === 'active') {
            targetRoute = '/(coach)/(coach-tabs)/coach-dashboard';
          } else {
            targetRoute = '/(coach)/onboarding';
          }
        } else if (user.role === 'parent') {
          targetRoute = '/(parent)/(parent-tabs)/parent-dashboard';
        } else {
          targetRoute = '/(individual)/(individual-tabs)/individual-dashboard';
        }
        router.replace(targetRoute as any);
      }
    } else if (user && !user.isRegistered && !inAuthGroup) {
      // If they somehow got to a non-auth group but aren't registered
      router.replace('/(auth)');
    } else if (user && user.isRegistered && (segments[0] as string) === '(tabs)') {
      // Catch users stuck on the old deleted (tabs) route and redirect them
      let targetRoute = '';
      if (user.role === 'coach') {
        if (user.status === 'active') {
          targetRoute = '/(coach)/(coach-tabs)/coach-dashboard';
        } else {
          targetRoute = '/(coach)/onboarding';
        }
      } else if (user.role === 'parent') {
        targetRoute = '/(parent)/(parent-tabs)/parent-dashboard';
      } else {
        targetRoute = '/(individual)/(individual-tabs)/individual-dashboard';
      }
      router.replace(targetRoute as any);
    }
  }, [user, isLoading, segments]);

  useEffect(() => {
    if (!isLoading && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, fontsLoaded]);



  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
