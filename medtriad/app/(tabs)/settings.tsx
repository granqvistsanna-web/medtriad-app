import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Share, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Application from 'expo-application';
import { ShareCircle, TrashBin2, Document, BellBing, Smartphone } from '@solar-icons/react-native/Bold';
import { Text } from '@/components/primitives';
import { theme, Spacing, Radius, Durations } from '@/constants/theme';
import { ToggleRow } from '@/components/settings/ToggleRow';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { DevSection } from '@/components/settings/DevSection';
import { loadSettings, saveSettings, UserSettings } from '@/services/settings-storage';
import { clearStats } from '@/services/stats-storage';
import { useStats } from '@/hooks/useStats';

export default function SettingsScreen() {
  const { refresh: refreshStats } = useStats();
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

  const handlePrivacyPolicy = () => {
    // TODO: Replace with actual privacy policy URL before submission
    Linking.openURL('https://YOUR_PRIVACY_POLICY_URL');
  };

  const version = Application.nativeApplicationVersion || '1.0.0';
  const build = Application.nativeBuildVersion || '1';

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.primary }]}>
        <View style={styles.loadingContainer} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.primary }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(Durations.normal).springify()}>
          <Text variant="titleLarge" color="primary" style={styles.title}>Settings</Text>
        </Animated.View>

        {/* PREFERENCES Section */}
        <Animated.View entering={FadeInUp.delay(Durations.stagger).duration(Durations.normal).springify()}>
          <View style={[styles.sectionHeaderRow, { marginTop: 0 }]}>
            <Text variant="tiny" color="muted" style={styles.sectionHeaderText}>
              PREFERENCES
            </Text>
            <View style={[styles.sectionHeaderLine, { backgroundColor: theme.colors.border.default }]} />
          </View>
          <View style={[styles.section, { backgroundColor: theme.colors.surface.card, borderColor: theme.colors.border.default, borderBottomColor: theme.colors.border.strong }]}>
            <ToggleRow
              label="Sound Effects"
              value={settings.soundEnabled}
              onValueChange={handleSoundToggle}
              icon={BellBing}
            />
            <View style={[styles.separator, { backgroundColor: theme.colors.border.default }]} />
            <ToggleRow
              label="Haptic Feedback"
              value={settings.hapticsEnabled}
              onValueChange={handleHapticsToggle}
              icon={Smartphone}
            />
          </View>
        </Animated.View>

        {/* ACTIONS Section */}
        <Animated.View entering={FadeInUp.delay(Durations.stagger * 2).duration(Durations.normal).springify()}>
          <View style={styles.sectionHeaderRow}>
            <Text variant="tiny" color="muted" style={styles.sectionHeaderText}>
              ACTIONS
            </Text>
            <View style={[styles.sectionHeaderLine, { backgroundColor: theme.colors.border.default }]} />
          </View>
          <View style={[styles.section, { backgroundColor: theme.colors.surface.card, borderColor: theme.colors.border.default, borderBottomColor: theme.colors.border.strong }]}>
            <SettingsRow
              label="Share App"
              onPress={handleShare}
              icon={ShareCircle}
            />
            <View style={[styles.separator, { backgroundColor: theme.colors.border.default }]} />
            <SettingsRow
              label="Reset Statistics"
              onPress={handleResetStats}
              icon={TrashBin2}
              destructive
            />
          </View>
        </Animated.View>

        {/* ABOUT Section */}
        <Animated.View entering={FadeInUp.delay(Durations.stagger * 3).duration(Durations.normal).springify()}>
          <View style={styles.sectionHeaderRow}>
            <Text variant="tiny" color="muted" style={styles.sectionHeaderText}>
              ABOUT
            </Text>
            <View style={[styles.sectionHeaderLine, { backgroundColor: theme.colors.border.default }]} />
          </View>
          <View style={[styles.section, { backgroundColor: theme.colors.surface.card, borderColor: theme.colors.border.default, borderBottomColor: theme.colors.border.strong }]}>
            <View style={styles.aboutRow}>
              <Text variant="body" color="primary">Version</Text>
              <Text variant="caption" color="secondary">
                {version} (Build {build})
              </Text>
            </View>
            <View style={[styles.separator, { backgroundColor: theme.colors.border.default }]} />
            <SettingsRow
              label="Privacy Policy"
              onPress={handlePrivacyPolicy}
              icon={Document}
            />
          </View>
        </Animated.View>

        {/* DEVELOPER Section - only in dev mode */}
        {__DEV__ && (
          <DevSection onRefresh={refreshStats} />
        )}
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
    marginBottom: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionHeaderText: {
    letterSpacing: 1,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 2,
    opacity: 0.6,
  },
  section: {
    borderRadius: Radius.md,
    borderWidth: 2,
    borderBottomWidth: 4,
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
});
