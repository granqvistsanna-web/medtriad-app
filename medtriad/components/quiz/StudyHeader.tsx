import { StyleSheet, View } from 'react-native';
import { CancelButton } from '@/components/quiz/CancelButton';
import { Text } from '@/components/primitives';
import { theme, Spacing, Radius } from '@/constants/theme';

type StudyHeaderProps = {
  /** Current question index (0-based) */
  currentIndex: number;
  /** Total number of questions in the session */
  totalQuestions: number;
  /** Callback when user cancels the study session */
  onCancel?: () => void;
};

/**
 * Header component for Study Mode
 * Shows progress without timer - relaxed learning experience
 */
export function StudyHeader({
  currentIndex,
  totalQuestions,
}: StudyHeaderProps) {
  return (
    <View style={[styles.header, { borderBottomColor: theme.colors.border.default }]}>
      {/* Left: Cancel button */}
      <View style={styles.cancelButton}>
        <CancelButton />
      </View>

      {/* Center: Progress text */}
      <View style={styles.progressContainer}>
        <Text variant="footnote" color="muted" weight="medium">
          {currentIndex + 1} of {totalQuestions}
        </Text>
      </View>

      {/* Right: Study mode badge for visual distinction */}
      <View style={[styles.studyBadge, { backgroundColor: theme.colors.blue.light }]}>
        <Text variant="tiny" color={theme.colors.blue.main} weight="semibold">
          STUDY
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  cancelButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  progressContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  studyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
});
