import { StyleSheet, View } from 'react-native';
import { QuizHistoryEntry } from '@/services/stats-storage';
import { theme, Spacing } from '@/constants/theme';
import { Text } from '@/components/primitives';

interface QuizHistoryListProps {
  history: QuizHistoryEntry[];
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function QuizHistoryList({ history }: QuizHistoryListProps) {
  if (history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="caption" color="muted" align="center">
          No quiz history yet
        </Text>
      </View>
    );
  }

  // Only show last 5 entries for minimal design
  const recentHistory = history.slice(0, 5);

  return (
    <View style={styles.container}>
      <Text variant="tiny" color="muted" style={styles.header}>
        RECENT ACTIVITY
      </Text>
      {recentHistory.map((item, index) => (
        <View
          key={`${item.date}-${item.score}-${item.correct}`}
          style={[
            styles.row,
            index < recentHistory.length - 1 && {
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border.default,
            },
          ]}
        >
          <View>
            <Text variant="body" color="primary" weight="medium">
              {formatDate(item.date)}
            </Text>
            <Text variant="caption" color="muted">
              {item.correct}/{item.total} correct
            </Text>
          </View>
          <Text variant="body" color="brand" weight="semibold">
            {item.score.toLocaleString()}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  header: {
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  emptyContainer: {
    paddingVertical: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
});
