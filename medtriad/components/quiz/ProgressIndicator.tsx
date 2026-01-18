import { StyleSheet, Text, useColorScheme } from 'react-native';
import { Colors, Typography } from '@/constants/theme';

type ProgressIndicatorProps = {
  current: number;
  total: number;
};

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <Text style={[styles.text, { color: colors.textSecondary }]}>
      Question {current} of {total}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    ...Typography.caption,
  },
});
