import { FlatList, StyleSheet, Text, View } from 'react-native';
import { QuizHistoryEntry } from '@/services/stats-storage';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface QuizHistoryListProps {
  history: QuizHistoryEntry[];
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function QuizHistoryList({ history }: QuizHistoryListProps) {
  const colors = Colors.light;

  if (history.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Recent Quizzes</Text>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          No quizzes yet
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Recent Quizzes</Text>
      <FlatList
        data={history}
        keyExtractor={(item, index) => `${item.date}-${index}`}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <View style={styles.leftContent}>
              <Text style={[styles.date, { color: colors.text }]}>
                {formatDate(item.date)}
              </Text>
              <Text style={[styles.accuracy, { color: colors.textMuted }]}>
                {item.correct}/{item.total} correct
              </Text>
            </View>
            <Text style={[styles.score, { color: colors.primary }]}>
              {item.score.toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  title: {
    ...Typography.heading,
    marginBottom: Spacing.md,
  },
  emptyText: {
    ...Typography.caption,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  leftContent: {
    gap: Spacing.xs,
  },
  date: {
    ...Typography.body,
    fontWeight: '500',
  },
  accuracy: {
    ...Typography.footnote,
  },
  score: {
    ...Typography.stat,
  },
});
