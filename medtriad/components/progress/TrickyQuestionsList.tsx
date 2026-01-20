import { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BookmarkBold, CloseSquareBold } from '@solar-icons/react-native';

import { Text } from '@/components/primitives';
import { loadTrickyQuestions, removeTrickyQuestion, TrickyQuestion } from '@/services/study-storage';
import { getAllTriads } from '@/services/triads';
import { Triad } from '@/types';
import { theme, Spacing, Radius, CardStyle } from '@/constants/theme';

/**
 * Tricky Questions List Component
 *
 * Displays questions marked as tricky during study sessions.
 * Shows on the Progress screen for review reference.
 */
export function TrickyQuestionsList() {
  const [trickyQuestions, setTrickyQuestions] = useState<TrickyQuestion[]>([]);
  const [triadsMap, setTriadsMap] = useState<Map<string, Triad>>(new Map());
  const [loading, setLoading] = useState(true);

  // Load data on mount and focus
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);
        try {
          // Load tricky questions from storage
          const questions = await loadTrickyQuestions();
          setTrickyQuestions(questions);

          // Build triad lookup map
          const allTriads = getAllTriads();
          const map = new Map<string, Triad>();
          allTriads.forEach((triad) => {
            map.set(triad.id, triad);
          });
          setTriadsMap(map);
        } catch (error) {
          console.error('Failed to load tricky questions:', error);
        } finally {
          setLoading(false);
        }
      };
      load();
    }, [])
  );

  // Handle removing a tricky question
  const handleRemove = useCallback(async (triadId: string) => {
    try {
      await removeTrickyQuestion(triadId);
      setTrickyQuestions((prev) => prev.filter((q) => q.triadId !== triadId));
    } catch (error) {
      console.error('Failed to remove tricky question:', error);
    }
  }, []);

  // Don't show section while loading
  if (loading) {
    return null;
  }

  // Empty state
  if (trickyQuestions.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <BookmarkBold size={18} color={theme.colors.blue.main} />
          <Text variant="heading" color="primary" style={styles.headerText}>
            Tricky Questions
          </Text>
        </View>
        <View style={[styles.emptyCard, CardStyle]}>
          <Text variant="body" color="secondary" align="center">
            No tricky questions yet
          </Text>
          <Text variant="caption" color="muted" align="center">
            Mark questions during Study Mode to review them here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BookmarkBold size={18} color={theme.colors.blue.main} />
        <Text variant="heading" color="primary" style={styles.headerText}>
          Tricky Questions
        </Text>
        <View style={[styles.countBadge, { backgroundColor: theme.colors.blue.light }]}>
          <Text variant="tiny" color={theme.colors.blue.text} weight="semibold">
            {trickyQuestions.length}
          </Text>
        </View>
      </View>

      <View style={[styles.listCard, CardStyle]}>
        {trickyQuestions.map((question, index) => {
          const triad = triadsMap.get(question.triadId);
          if (!triad) return null;

          const isLast = index === trickyQuestions.length - 1;

          return (
            <View
              key={question.triadId}
              style={[
                styles.item,
                !isLast && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border.default,
                },
              ]}
            >
              <View style={styles.itemContent}>
                <Text variant="body" color="primary" weight="semibold" numberOfLines={1}>
                  {triad.condition}
                </Text>
                <View style={styles.itemMeta}>
                  <Text
                    variant="tiny"
                    color={theme.colors.blue.text}
                    style={styles.categoryBadge}
                  >
                    {triad.category}
                  </Text>
                  <Text variant="caption" color="muted" numberOfLines={1} style={styles.findings}>
                    {triad.findings.join(' + ')}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => handleRemove(question.triadId)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.removeButton}
              >
                <CloseSquareBold size={20} color={theme.colors.text.muted} />
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  listCard: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  emptyCard: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  itemContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryBadge: {
    textTransform: 'capitalize',
  },
  findings: {
    flex: 1,
  },
  removeButton: {
    padding: Spacing.xs,
  },
});
