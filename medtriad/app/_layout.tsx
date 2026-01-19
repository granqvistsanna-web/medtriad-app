import { useEffect, useState } from 'react';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { Image } from 'expo-image';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useStats } from '@/hooks/useStats';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Keep splash visible during initialization
SplashScreen.preventAutoHideAsync();

// All mascot images to preload
const MASCOT_IMAGES = [
  require('@/assets/images/tri-neutral.png'),
  require('@/assets/images/tri-success.png'),
  require('@/assets/images/tri-lvl1.png'),
  require('@/assets/images/tri-lvl2.png'),
  require('@/assets/images/tri-lvl3.png'),
  require('@/assets/images/tri-lvl4.png'),
  require('@/assets/images/tri-lvl5.png'),
  require('@/assets/images/tri-lvl6.png'),
  require('@/assets/images/tri-chill.png'),
  require('@/assets/images/tri-thinking.png'),
  require('@/assets/images/tri-share.png'),
];

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

  // Preload mascot images
  useEffect(() => {
    async function preloadImages() {
      try {
        await Image.prefetch(MASCOT_IMAGES);
        setImagesLoaded(true);
      } catch (error) {
        // Images will load on-demand if prefetch fails
        console.warn('Image prefetch failed:', error);
        setImagesLoaded(true);
      }
    }
    preloadImages();
  }, []);

  // Hide splash when both stats and images are ready
  useEffect(() => {
    if (!statsLoading && imagesLoaded) {
      SplashScreen.hideAsync();
    }
  }, [statsLoading, imagesLoaded]);

  // Show skeleton while loading (not blank screen)
  if (statsLoading || !imagesLoaded) {
    return <LoadingSkeleton />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider value={LightTheme}>
        <Stack>
          {/* Onboarding for new users only */}
          <Stack.Protected guard={isNewUser}>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          </Stack.Protected>

          {/* Main app for returning users */}
          <Stack.Protected guard={!isNewUser}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack.Protected>

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
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
