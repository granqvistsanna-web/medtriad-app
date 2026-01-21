# Phase 18: Developer Tools - Research

**Researched:** 2026-01-19
**Domain:** React Native/Expo debug tooling, AsyncStorage management
**Confidence:** HIGH

## Summary

Developer tools for MedTriads require: (1) detecting debug vs production builds to conditionally show the dev menu, (2) a dev menu UI accessible from settings, (3) functions to manipulate AsyncStorage for testing onboarding/levels/data clearing.

The key insight is that Expo provides `__DEV__` as a reliable global boolean that is `true` in development and `false` in production builds. This requires no additional dependencies. The dev menu should be a new settings section that only renders when `__DEV__` is true - simple conditional rendering, no gesture detection needed.

**Primary recommendation:** Add a "DEVELOPER" section to the existing Settings screen that only renders when `__DEV__` is true. Use the existing `SettingsRow` component pattern for menu items. Create a `dev-tools.ts` service with functions for storage manipulation.

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@react-native-async-storage/async-storage` | ^2.2.0 | Storage manipulation | Already used for all app data |
| `expo-constants` | ~18.0.13 | Build info (optional) | Already installed, provides `Constants.debugMode` |
| React Native `Alert` | built-in | Confirmation dialogs | Native feel, already used in settings |

### Supporting (No Install Needed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `__DEV__` | global | Debug detection | Always - provided by Metro bundler |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `__DEV__` | `Constants.debugMode` | Same thing, `__DEV__` is simpler |
| Hidden gesture | Settings section | Gesture adds complexity, settings is discoverable during dev |
| Separate dev screen | Section in settings | Separate screen is overkill for 4-5 actions |

**Installation:** None needed - all dependencies already present.

## Architecture Patterns

### Recommended Project Structure
```
medtriad/
├── services/
│   └── dev-tools.ts         # Dev-only storage manipulation functions
├── components/
│   └── settings/
│       └── DevSection.tsx    # Dev menu section component
└── app/
    └── (tabs)/
        └── settings.tsx      # Existing - add DevSection
```

### Pattern 1: Conditional Dev Section Rendering
**What:** Render dev tools section only when `__DEV__` is true
**When to use:** Any dev-only UI
**Example:**
```typescript
// Source: Expo docs - Development mode
import { DevSection } from '@/components/settings/DevSection';

export default function SettingsScreen() {
  return (
    <ScrollView>
      {/* Production sections */}
      <PreferencesSection />
      <ActionsSection />
      <AboutSection />

      {/* Dev-only section - completely removed from production bundle */}
      {__DEV__ && <DevSection />}
    </ScrollView>
  );
}
```

### Pattern 2: Dev Tools Service with Typed Functions
**What:** Centralized service for all dev tool operations
**When to use:** Any storage manipulation for testing
**Example:**
```typescript
// services/dev-tools.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoredStats, DEFAULT_STATS, STATS_KEY } from './stats-storage';
import { TIERS } from './mastery';

// Storage keys used in the app
const APP_STORAGE_KEYS = [
  '@medtriad_stats',
  '@medtriad_quiz_history',
  '@medtriad_settings',
] as const;

/**
 * Reset onboarding state by clearing gamesPlayed
 * Makes app show onboarding again on next launch
 */
export async function resetOnboarding(): Promise<void> {
  const json = await AsyncStorage.getItem('@medtriad_stats');
  if (json) {
    const stats = JSON.parse(json);
    await AsyncStorage.setItem('@medtriad_stats', JSON.stringify({
      ...stats,
      gamesPlayed: 0,
      totalPoints: 0,
    }));
  }
}

/**
 * Set user to specific tier for testing
 * @param tierNumber 1-6 (Student to Chief)
 */
export async function setUserTier(tierNumber: number): Promise<void> {
  const tier = TIERS.find(t => t.tier === tierNumber);
  if (!tier) throw new Error(`Invalid tier: ${tierNumber}`);

  const json = await AsyncStorage.getItem('@medtriad_stats');
  const stats = json ? JSON.parse(json) : DEFAULT_STATS;

  // Set points to tier threshold + small buffer
  const points = tier.pointsRequired + 100;

  await AsyncStorage.setItem('@medtriad_stats', JSON.stringify({
    ...stats,
    totalPoints: points,
    gamesPlayed: Math.max(stats.gamesPlayed, 1), // Ensure not "new user"
  }));
}

/**
 * Clear ALL app data - full reset
 */
export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([...APP_STORAGE_KEYS]);
}
```

### Pattern 3: Confirmation Alert Pattern
**What:** Always confirm destructive dev actions
**When to use:** Any action that modifies storage
**Example:**
```typescript
// Source: Existing settings.tsx handleResetStats pattern
const handleClearAllData = () => {
  Alert.alert(
    'Clear All Data',
    'This will delete ALL app data and reset to fresh install state.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearAllData();
          Alert.alert('Done', 'All data cleared. Restart the app to see changes.');
        },
      },
    ]
  );
};
```

### Anti-Patterns to Avoid
- **Shipping dev code to production:** Always use `__DEV__` check, never comment-based exclusion
- **Gesture-based access:** Adds complexity, harder to discover during testing
- **Separate dev screen/route:** Overkill - just add a section to settings
- **Not confirming destructive actions:** Easy to accidentally clear data

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Debug detection | Environment variable checks | `__DEV__` | Built-in, tree-shaken in production |
| Confirmation dialogs | Custom modal | `Alert.alert` | Native, accessible, consistent |
| Storage key listing | Manual key array | Centralized constants | Single source of truth |

**Key insight:** The existing codebase already has patterns for everything needed - just extend them.

## Common Pitfalls

### Pitfall 1: Dev Code Leaking to Production
**What goes wrong:** Dev menu visible to end users
**Why it happens:** Using wrong check or forgetting conditional
**How to avoid:** Always wrap dev-only code in `{__DEV__ && ...}`
**Warning signs:** Dev section visible when running `npx expo start --no-dev`

### Pitfall 2: Stale UI After Data Change
**What goes wrong:** UI shows old data after dev tool manipulates storage
**Why it happens:** State not refreshed after AsyncStorage change
**How to avoid:** Call `refresh()` from `useStats()` hook after storage manipulation, or show "restart app" message
**Warning signs:** Stats display doesn't update after "set tier" action

### Pitfall 3: Forgetting Storage Keys
**What goes wrong:** "Clear all data" misses some keys
**Why it happens:** Keys defined in multiple files, new key added but not to dev tools
**How to avoid:** Export storage key constants from single source, or use `AsyncStorage.getAllKeys()` to find app keys
**Warning signs:** Some state persists after "clear all" action

### Pitfall 4: AsyncStorage.clear() vs multiRemove()
**What goes wrong:** Clearing data from other apps on device
**Why it happens:** `AsyncStorage.clear()` clears ALL AsyncStorage, not just your app's
**How to avoid:** Always use `multiRemove()` with explicit key list
**Warning signs:** Other apps lose data (very bad UX)

### Pitfall 5: Not Testing Production Mode
**What goes wrong:** Dev section appears in production builds
**Why it happens:** Never verified with `--no-dev` flag
**How to avoid:** Test with `npx expo start --no-dev --minify` before release
**Warning signs:** N/A - must proactively test

## Code Examples

### Example 1: Dev Section Component
```typescript
// components/settings/DevSection.tsx
import { View, Text, Alert, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SettingsRow } from './SettingsRow';
import { Colors, Typography, Spacing, Durations } from '@/constants/theme';
import { TIERS } from '@/services/mastery';
import {
  resetOnboarding,
  setUserTier,
  clearAllData,
  setPendingTierUp,
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
            Alert.alert('Done', 'Restart the app to see onboarding.');
          },
        },
      ]
    );
  };

  const handleSetTier = () => {
    Alert.alert(
      'Set Tier',
      'Choose a tier level:',
      TIERS.map((tier) => ({
        text: `${tier.tier}. ${tier.name}`,
        onPress: async () => {
          await setUserTier(tier.tier);
          await onRefresh();
          Alert.alert('Done', `Set to ${tier.name} (${tier.pointsRequired}+ pts)`);
        },
      })).concat([{ text: 'Cancel', style: 'cancel' }])
    );
  };

  const handleClearAll = () => {
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
            Alert.alert('Done', 'All data cleared. Restart the app.');
          },
        },
      ]
    );
  };

  const handleSimulateTierUp = () => {
    Alert.alert(
      'Simulate Tier Up',
      'Set a pending tier-up celebration:',
      TIERS.slice(1).map((tier) => ({
        text: `${tier.tier}. ${tier.name}`,
        onPress: async () => {
          await setPendingTierUp(tier.tier, tier.name);
          await onRefresh();
          Alert.alert('Done', `Pending tier-up set to ${tier.name}. Go to Home.`);
        },
      })).concat([{ text: 'Cancel', style: 'cancel' }])
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
          onPress={handleClearAll}
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
    gap: 12,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  separator: {
    height: 1,
    marginLeft: 16,
  },
});
```

### Example 2: Dev Tools Service
```typescript
// services/dev-tools.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TIERS } from './mastery';

// Centralized storage keys - import from actual storage files or define here
const STATS_KEY = '@medtriad_stats';
const HISTORY_KEY = '@medtriad_quiz_history';
const SETTINGS_KEY = '@medtriad_settings';

const ALL_APP_KEYS = [STATS_KEY, HISTORY_KEY, SETTINGS_KEY] as const;

/**
 * Reset to show onboarding again
 * Sets gamesPlayed and totalPoints to 0
 */
export async function resetOnboarding(): Promise<void> {
  const json = await AsyncStorage.getItem(STATS_KEY);
  if (json) {
    const stats = JSON.parse(json);
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify({
      ...stats,
      gamesPlayed: 0,
      totalPoints: 0,
    }));
  }
}

/**
 * Set user to a specific tier
 * @param tierNumber - 1-6 (Student to Chief)
 */
export async function setUserTier(tierNumber: number): Promise<void> {
  const tier = TIERS.find(t => t.tier === tierNumber);
  if (!tier) throw new Error(`Invalid tier number: ${tierNumber}`);

  const json = await AsyncStorage.getItem(STATS_KEY);
  const stats = json ? JSON.parse(json) : {};

  await AsyncStorage.setItem(STATS_KEY, JSON.stringify({
    ...stats,
    totalPoints: tier.pointsRequired + 50, // Just above threshold
    gamesPlayed: Math.max(stats.gamesPlayed ?? 0, 1), // Ensure not new user
  }));
}

/**
 * Set a pending tier-up for testing celebration modal
 */
export async function setPendingTierUp(tier: number, name: string): Promise<void> {
  const json = await AsyncStorage.getItem(STATS_KEY);
  const stats = json ? JSON.parse(json) : {};

  await AsyncStorage.setItem(STATS_KEY, JSON.stringify({
    ...stats,
    pendingTierUp: { tier, name },
    gamesPlayed: Math.max(stats.gamesPlayed ?? 0, 1),
  }));
}

/**
 * Clear all app data - full factory reset
 * Uses multiRemove to avoid clearing other apps' data
 */
export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([...ALL_APP_KEYS]);
}

/**
 * Log current storage state for debugging
 */
export async function logStorageState(): Promise<void> {
  console.log('=== DEV: Storage State ===');
  for (const key of ALL_APP_KEYS) {
    const value = await AsyncStorage.getItem(key);
    console.log(`${key}:`, value ? JSON.parse(value) : null);
  }
  console.log('=========================');
}
```

### Example 3: Integration in Settings Screen
```typescript
// In app/(tabs)/settings.tsx - add to imports
import { DevSection } from '@/components/settings/DevSection';

// In SettingsScreen component, add refresh handler
const { refresh: refreshStats } = useStats(); // if available, or create one

// At end of ScrollView content, before closing tag:
{__DEV__ && (
  <DevSection onRefresh={refreshStats} />
)}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom env vars | `__DEV__` global | Always standard in RN | Simpler, tree-shaken |
| `AsyncStorage.clear()` | `multiRemove()` | Best practice | Safer, doesn't affect other apps |
| Gesture-based dev menu | Conditional UI section | Team preference | More discoverable |

**Deprecated/outdated:**
- Using `process.env.NODE_ENV` directly - use `__DEV__` instead (RN-specific)
- `Constants.appOwnership` - deprecated, use `executionEnvironment` if needed

## Open Questions

1. **Error state simulation**
   - What we know: Success criteria mentions "simulate error states"
   - What's unclear: Which specific error states? Network errors? Storage errors?
   - Recommendation: For Phase 18, implement data manipulation tools. Error simulation could be a future enhancement or handled via network debugging tools.

2. **Settings screen already has "Reset Statistics"**
   - What we know: There's overlap with existing reset function
   - What's unclear: Should dev "Clear All Data" replace it, or are they different?
   - Recommendation: Keep both. Production "Reset Statistics" clears stats/history. Dev "Clear All Data" also clears settings and is a true factory reset.

## Sources

### Primary (HIGH confidence)
- [Expo Development Mode Docs](https://docs.expo.dev/workflow/development-mode/) - `__DEV__` variable, production testing
- [Expo Constants Docs](https://docs.expo.dev/versions/latest/sdk/constants/) - `debugMode` property
- [AsyncStorage API Docs](https://react-native-async-storage.github.io/async-storage/docs/api/) - multiRemove vs clear

### Secondary (MEDIUM confidence)
- Existing codebase: `stats-storage.ts`, `mastery.ts`, `settings.tsx` - storage patterns and keys

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed, patterns from official docs
- Architecture: HIGH - Following existing codebase patterns exactly
- Pitfalls: HIGH - Based on official docs and common React Native knowledge

**Research date:** 2026-01-19
**Valid until:** 2026-03-19 (stable patterns, unlikely to change)
