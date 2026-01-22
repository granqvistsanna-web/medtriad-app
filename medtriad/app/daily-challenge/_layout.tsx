import { Stack } from 'expo-router';

export default function DailyChallengeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="results" />
    </Stack>
  );
}
