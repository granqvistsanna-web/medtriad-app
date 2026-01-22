import { useEffect, useState } from 'react';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import {
  useFonts,
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
} from '@expo-google-fonts/figtree';

import { Colors } from '@/constants/theme';
import { useStats } from '@/hooks/useStats';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Keep splash visible during initialization
SplashScreen.preventAutoHideAsync();

// Custom light theme with teal accent
const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.backgroundCard,
    text: Colors.light.text,
    border: Colors.light.border,
  },
};

export default function RootLayout() {
  const { isNewUser, loading: statsLoading } = useStats();
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Load Figtree fonts
  const [fontsLoaded, fontError] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Figtree_800ExtraBold,
  });

  // Preload mascot images using expo-asset
  useEffect(() => {
    async function preloadImages() {
      try {
        // expo-image caches images automatically on first use
        // For local assets, they're bundled and load instantly
        // No explicit prefetch needed for require() assets
        setImagesLoaded(true);
      } catch (error) {
        console.warn('Image preload failed:', error);
        setImagesLoaded(true);
      }
    }
    preloadImages();
  }, []);

  // Hide splash when fonts, stats, and images are ready
  useEffect(() => {
    if ((fontsLoaded || fontError) && !statsLoading && imagesLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, statsLoading, imagesLoaded]);

  // Show skeleton while loading (not blank screen)
  // Wait for fonts too to prevent FOUT
  if (!fontsLoaded && !fontError) {
    return null; // Keep splash screen visible
  }

  if (statsLoading || !imagesLoaded) {
    return <LoadingSkeleton />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider value={LightTheme}>
        <Stack>
          {/* Conditional routing based on user state */}
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Always available routes */}
          <Stack.Screen
            name="modal"
            options={{ presentation: 'modal', title: 'Modal' }}
          />
          <Stack.Screen
            name="quiz"
            options={{
              presentation: 'fullScreenModal',
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="challenge"
            options={{
              presentation: 'modal',
              headerShown: false,
              gestureEnabled: true,
            }}
          />
          <Stack.Screen
            name="daily-challenge"
            options={{
              presentation: 'fullScreenModal',
              headerShown: false,
              gestureEnabled: false,
            }}
          />
        </Stack>
        {/* Redirect new users to onboarding */}
        {isNewUser && <Redirect href="/onboarding" />}
        <StatusBar style="dark" />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
