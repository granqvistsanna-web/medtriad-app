import { View, Text, StyleSheet, Alert } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors, Typography, Spacing, Radius, Durations } from '@/constants/theme';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { TIERS } from '@/services/mastery';
import {
  resetOnboarding,
  setUserTier,
  setPendingTierUp,
  clearAllData,
} from '@/services/dev-tools';

interface DevSectionProps {
  onRefresh: () => Promise<void>;
}

export function DevSection({ onRefresh }: DevSectionProps) {
  const colors = Colors.light;

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will reset gamesPlayed to 0. App will show onboarding on next launch.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetOnboarding();
            await onRefresh();
            Alert.alert('Done', 'Onboarding has been reset.');
          },
        },
      ]
    );
  };

  const handleSetTier = () => {
    const tierButtons = TIERS.map(tier => ({
      text: `${tier.tier}. ${tier.name}`,
      onPress: async () => {
        await setUserTier(tier.tier);
        await onRefresh();
        Alert.alert('Done', `Tier set to ${tier.name}.`);
      },
    }));

    Alert.alert(
      'Set Tier',
      'Choose a tier level:',
      [
        ...tierButtons,
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSimulateTierUp = () => {
    // Skip Student (tier 1) - can't tier UP to Student
    const tierButtons = TIERS.slice(1).map(tier => ({
      text: `${tier.tier}. ${tier.name}`,
      onPress: async () => {
        await setPendingTierUp(tier.tier, tier.name);
        await onRefresh();
        Alert.alert('Done', `Pending tier-up set to ${tier.name}.`);
      },
    }));

    Alert.alert(
      'Simulate Tier Up',
      'Set a pending tier-up celebration:',
      [
        ...tierButtons,
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete ALL app data. You will need to restart the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Done', 'All app data has been cleared.');
          },
        },
      ]
    );
  };

  return (
    <Animated.View entering={FadeInUp.delay(Durations.stagger * 4).duration(Durations.normal).springify()}>
      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionHeaderText, { color: colors.error }]}>
          DEVELOPER
        </Text>
        <View style={[styles.sectionHeaderLine, { backgroundColor: colors.error }]} />
      </View>
      <View style={[styles.section, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
        <SettingsRow
          label="Reset Onboarding"
          onPress={handleResetOnboarding}
          icon="arrow.counterclockwise"
        />
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        <SettingsRow
          label="Set User Tier"
          onPress={handleSetTier}
          icon="person.badge.plus"
        />
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        <SettingsRow
          label="Simulate Tier Up"
          onPress={handleSimulateTierUp}
          icon="star.fill"
        />
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        <SettingsRow
          label="Clear All Data"
          onPress={handleClearAllData}
          icon="trash.fill"
          destructive
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionHeaderText: {
    ...Typography.tiny,
    letterSpacing: 1,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
  },
  section: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  separator: {
    height: 1,
    marginLeft: Spacing.base,
  },
});
