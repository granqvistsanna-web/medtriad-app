import { SafeAreaView, StyleSheet, Text, View, Pressable, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

export default function ResultsScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Results</Text>

        <View style={styles.buttons}>
          <Pressable
            style={[styles.button, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}
            onPress={() => router.replace('/quiz')}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>Play Again</Text>
          </Pressable>

          <Pressable
            style={[styles.button, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>Home</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.xxl,
  },
  title: {
    ...Typography.title,
  },
  buttons: {
    gap: Spacing.base,
    width: '100%',
    maxWidth: 280,
  },
  button: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  buttonText: {
    ...Typography.label,
  },
});
