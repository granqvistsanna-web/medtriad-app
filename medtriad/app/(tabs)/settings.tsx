import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Application from 'expo-application';
import { Colors, Typography, Spacing, Radius, Durations } from '@/constants/theme';
import { ToggleRow } from '@/components/settings/ToggleRow';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { loadSettings, saveSettings, UserSettings } from '@/services/settings-storage';
import { clearStats } from '@/services/stats-storage';

export default function SettingsScreen() {
  const colors = Colors.light;
  const [settings, setSettings] = useState<UserSettings>({
    soundEnabled: true,
    hapticsEnabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    const load = async () => {
      const loaded = await loadSettings();
      setSettings(loaded);
      setIsLoading(false);
    };
    load();
  }, []);

  // Reload settings when tab is focused
  useFocusEffect(
    useCallback(() => {
      const reload = async () => {
        const loaded = await loadSettings();
        setSettings(loaded);
      };
      reload();
    }, [])
  );

  const handleSoundToggle = async (value: boolean) => {
    const updated = { ...settings, soundEnabled: value };
    setSettings(updated);
    await saveSettings(updated);
  };

  const handleHapticsToggle = async (value: boolean) => {
    const updated = { ...settings, hapticsEnabled: value };
    setSettings(updated);
    await saveSettings(updated);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Learn medical triads with MedTriads! A fun quiz app for medical students.',
        // URL omitted until App Store listing exists
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleResetStats = () => {
    Alert.alert(
      'Reset Statistics',
      'This will permanently delete all your progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearStats();
            Alert.alert('Done', 'Your statistics have been reset.');
          },
        },
      ]
    );
  };

  const version = Application.nativeApplicationVersion || '1.0.0';
  const build = Application.nativeBuildVersion || '1';

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        {/* PREFERENCES Section */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>
          PREFERENCES
        </Text>
        <View style={[styles.section, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
          <ToggleRow
            label="Sound Effects"
            value={settings.soundEnabled}
            onValueChange={handleSoundToggle}
          />
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <ToggleRow
            label="Haptic Feedback"
            value={settings.hapticsEnabled}
            onValueChange={handleHapticsToggle}
          />
        </View>

        {/* ACTIONS Section */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>
          ACTIONS
        </Text>
        <View style={[styles.section, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
          <SettingsRow
            label="Share App"
            onPress={handleShare}
            icon="square.and.arrow.up"
          />
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <SettingsRow
            label="Reset Statistics"
            onPress={handleResetStats}
            icon="trash"
            destructive
          />
        </View>

        {/* ABOUT Section */}
        <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>
          ABOUT
        </Text>
        <View style={[styles.section, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: colors.text }]}>Version</Text>
            <Text style={[styles.aboutValue, { color: colors.textSecondary }]}>
              {version} (Build {build})
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  title: {
    ...Typography.title,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    ...Typography.footnote,
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    letterSpacing: 0.5,
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
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    minHeight: 44,
  },
  aboutLabel: {
    ...Typography.body,
  },
  aboutValue: {
    ...Typography.caption,
  },
});
