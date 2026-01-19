import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useStats } from '@/hooks/useStats';

export const unstable_settings = {
  anchor: '(tabs)',
};

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
  const { isNewUser, loading } = useStats();

  // Prevent flash - show nothing while determining user state
  if (loading) {
    return null;
  }

  return (
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
  );
}
