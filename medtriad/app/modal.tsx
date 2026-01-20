import { Link } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/primitives';
import { theme, Spacing } from '@/constants/theme';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text variant="title" color="primary">This is a modal</Text>
      <Link href="/" dismissTo style={styles.link}>
        <Text variant="body" color="brand">Go to home screen</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    backgroundColor: theme.colors.surface.primary,
  },
  link: {
    marginTop: Spacing.base,
    paddingVertical: Spacing.base,
  },
});
