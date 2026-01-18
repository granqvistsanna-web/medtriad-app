# Phase 6: Navigation & Study Mode - Research

**Researched:** 2026-01-18
**Domain:** React Native/Expo navigation, iOS UI patterns, data persistence
**Confidence:** HIGH

## Summary

This phase adds a four-tab navigation structure (Home, Library, Progress, Settings) to the existing MedTriads app. The codebase already uses Expo Router with a basic tab layout and has `expo-symbols` for SF Symbols icons. The quiz runs as a fullScreenModal outside tabs, which naturally hides the tab bar.

Key findings:
- The existing tab bar structure can be extended from 2 to 4 tabs with minimal changes
- Quiz already runs outside tabs via `fullScreenModal`, so no tab hiding logic needed
- Built-in React Native `Switch` and `Share` APIs are sufficient (no new dependencies)
- AsyncStorage pattern is already established in `stats-storage.ts` for settings persistence
- Accordion can be built with existing Reanimated library (already installed)

**Primary recommendation:** Extend the existing `(tabs)/_layout.tsx` to add Library, Progress, and Settings tabs. Use built-in React Native APIs (Switch, Share) and existing patterns from the codebase.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-router | ~6.0.21 | File-based navigation | Already used, handles tab navigation |
| @react-navigation/bottom-tabs | ^7.4.0 | Tab bar implementation | Powers Expo Router tabs |
| expo-symbols | ~1.0.8 | SF Symbols icons | Already used in existing tab bar |
| @react-native-async-storage/async-storage | ^2.2.0 | Settings persistence | Already used for stats storage |
| react-native-reanimated | ~4.1.1 | Accordion animations | Already installed for quiz animations |

### Supporting (May Need Installation)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-application | ~7.0.x | App version display | Settings "About" section |

### Built-in React Native APIs (No Installation)
| API | Purpose | When to Use |
|-----|---------|-------------|
| Switch | Settings toggles | Sound/haptic toggles |
| Share | iOS share sheet | Share app feature |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-native-reanimated accordion | react-native-collapsible | Extra dependency, less control |
| Built-in Switch | Custom animated switch | More work, potential iOS feel mismatch |
| Built-in Share | react-native-share | Unnecessary for simple text/URL sharing |

**Installation:**
```bash
npx expo install expo-application
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── (tabs)/
│   ├── _layout.tsx      # Tab bar configuration (extend existing)
│   ├── index.tsx        # Home screen (existing)
│   ├── library.tsx      # Library screen (NEW)
│   ├── progress.tsx     # Progress screen (NEW)
│   └── settings.tsx     # Settings screen (NEW)
├── quiz/                # Existing quiz flow (outside tabs)
│   ├── _layout.tsx
│   ├── index.tsx
│   └── results.tsx
└── _layout.tsx          # Root layout (existing)

services/
├── stats-storage.ts     # Extend for quiz history (existing)
├── settings-storage.ts  # NEW: Sound/haptic preferences
├── triads.ts           # Triad data access (existing)
└── ...

components/
├── library/
│   ├── CategorySection.tsx    # Collapsible category header
│   └── TriadItem.tsx          # Expandable triad row
├── progress/
│   ├── StatsCard.tsx          # Top-level stats display
│   ├── CategoryBreakdown.tsx  # Per-category accuracy
│   └── QuizHistoryList.tsx    # Recent rounds
├── settings/
│   ├── SettingsRow.tsx        # Generic settings row
│   └── ToggleRow.tsx          # Switch-based row
└── ...
```

### Pattern 1: Tab Bar Configuration with Icons
**What:** Configure 4-tab navigation with SF Symbols
**When to use:** Tab layout file
**Example:**
```typescript
// Source: Existing codebase pattern + expo-router docs
import { Tabs } from 'expo-router';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const colors = Colors.light;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name={focused ? "house.fill" : "house"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name={focused ? "book.fill" : "book"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name={focused ? "chart.bar.fill" : "chart.bar"}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={28}
              name={focused ? "gearshape.fill" : "gearshape"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
```

### Pattern 2: Settings Storage with AsyncStorage
**What:** Persist user preferences (sound, haptics)
**When to use:** Settings service layer
**Example:**
```typescript
// Source: Existing stats-storage.ts pattern
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@medtriad_settings';

export interface UserSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
};

export async function loadSettings(): Promise<UserSettings> {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    if (json) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}
```

### Pattern 3: iOS Native Switch Toggle
**What:** Settings toggle with native iOS appearance
**When to use:** Sound/haptics toggle rows
**Example:**
```typescript
// Source: React Native docs
import { Switch, View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function ToggleRow({ label, value, onValueChange }: ToggleRowProps) {
  const colors = Colors.light;

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: colors.border,
          true: colors.primary
        }}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}
```

### Pattern 4: iOS Share Sheet
**What:** Share app via native iOS share sheet
**When to use:** Settings share button
**Example:**
```typescript
// Source: React Native docs
import { Share, Alert } from 'react-native';

async function shareApp() {
  try {
    const result = await Share.share({
      message: 'Learn medical triads with MedTriads!',
      url: 'https://apps.apple.com/app/medtriads', // App Store URL when available
    });

    if (result.action === Share.sharedAction) {
      // Shared successfully
    } else if (result.action === Share.dismissedAction) {
      // Dismissed
    }
  } catch (error) {
    Alert.alert('Error', 'Unable to share');
  }
}
```

### Pattern 5: Animated Accordion with Reanimated
**What:** Expandable/collapsible sections for Library
**When to use:** Category sections, triad details
**Example:**
```typescript
// Source: Reanimated docs + existing Collapsible component pattern
import Animated, {
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  withTiming
} from 'react-native-reanimated';
import { View, TouchableOpacity, LayoutChangeEvent } from 'react-native';

interface AccordionProps {
  isExpanded: boolean;
  children: React.ReactNode;
  duration?: number;
}

export function Accordion({ isExpanded, children, duration = 300 }: AccordionProps) {
  const height = useSharedValue(0);

  const derivedHeight = useDerivedValue(() =>
    withTiming(height.value * (isExpanded ? 1 : 0), { duration })
  );

  const animatedStyle = useAnimatedStyle(() => ({
    height: derivedHeight.value,
    overflow: 'hidden',
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View
        onLayout={(e: LayoutChangeEvent) => {
          height.value = e.nativeEvent.layout.height;
        }}
        style={{ position: 'absolute', width: '100%' }}
      >
        {children}
      </View>
    </Animated.View>
  );
}
```

### Anti-Patterns to Avoid
- **Hiding tab bar via `setOptions`:** The quiz already runs as `fullScreenModal` outside the tab navigator, which automatically hides tabs. Don't add extra logic to hide/show the tab bar.
- **Installing new navigation libraries:** The existing expo-router + @react-navigation stack is sufficient.
- **Using external accordion libraries:** react-native-collapsible adds unnecessary dependency when Reanimated is already available.
- **Storing sensitive data in AsyncStorage:** Settings (sound/haptics) are fine, but never store tokens or credentials here.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tab navigation | Custom tab bar | Expo Router Tabs | Already configured, handles gestures, deep linking |
| Toggle switches | Custom animated toggle | React Native Switch | Native iOS appearance, accessibility built-in |
| Share functionality | Custom share UI | React Native Share API | Native share sheet, handles all iOS share targets |
| Icon system | SVG icons | expo-symbols (SF Symbols) | Already in use, matches iOS aesthetic |
| Accordion animation | CSS transitions | Reanimated useSharedValue | Already installed, smooth 60fps animations |
| Settings storage | JSON file / SQLite | AsyncStorage | Already used for stats, simple key-value is sufficient |

**Key insight:** The codebase already has excellent patterns established. Extend them rather than introducing new approaches.

## Common Pitfalls

### Pitfall 1: Trying to Hide Tab Bar During Quiz
**What goes wrong:** Developers try to use `navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } })` to hide tabs during quiz.
**Why it happens:** Misunderstanding the navigation structure.
**How to avoid:** The quiz already uses `presentation: 'fullScreenModal'` in the root layout, which naturally hides the tab bar. No additional work needed.
**Warning signs:** Code that manually manipulates `tabBarStyle` display property.

### Pitfall 2: Overcomplicating Settings Persistence
**What goes wrong:** Using Redux, Zustand, or complex state management for simple boolean preferences.
**Why it happens:** Over-engineering from web development habits.
**How to avoid:** Follow the existing `stats-storage.ts` pattern - simple AsyncStorage with typed interfaces.
**Warning signs:** Installing state management libraries for settings.

### Pitfall 3: Not Using Native Switch Props
**What goes wrong:** Using `thumbColor` on iOS removes the native drop shadow effect, making the switch look off.
**Why it happens:** Trying to match exact brand colors.
**How to avoid:** Only customize `trackColor` and `ios_backgroundColor`. Let iOS handle the thumb appearance.
**Warning signs:** Switch looks "flat" compared to system Settings app.

### Pitfall 4: Accordion Height Flashing
**What goes wrong:** Content briefly shows at full height before collapsing on mount.
**Why it happens:** Height measurement happens after initial render.
**How to avoid:** Use `position: 'absolute'` for the measured content container and `overflow: 'hidden'` on the animated wrapper.
**Warning signs:** Visual flash when accordion first renders.

### Pitfall 5: Share API URL on Simulator
**What goes wrong:** Share dialog doesn't show URL option in iOS Simulator.
**Why it happens:** Some share options only appear on real devices.
**How to avoid:** Test on physical device for share functionality. On simulator, `message` will work but `url` behavior varies.
**Warning signs:** "URL not sharing" bug reports that can't be reproduced on device.

### Pitfall 6: AsyncStorage Size Limits
**What goes wrong:** Quiz history grows unbounded and eventually exceeds storage limits.
**Why it happens:** Not limiting stored history entries.
**How to avoid:** Limit quiz history to last N entries (e.g., 50 rounds). Default AsyncStorage limit is 6MB total.
**Warning signs:** Storage errors after extensive app usage.

## Code Examples

Verified patterns from official sources:

### Get App Version for Settings "About"
```typescript
// Source: expo-application docs
import * as Application from 'expo-application';

// Synchronous - can use directly in render
const version = Application.nativeApplicationVersion; // "1.0.0"
const build = Application.nativeBuildVersion;         // "1"
```

### SF Symbol Icon Names for Tab Bar
```typescript
// Source: Apple SF Symbols app (verified available in expo-symbols)
// Standard tab bar icons:
const TAB_ICONS = {
  home: { default: 'house', active: 'house.fill' },
  library: { default: 'book', active: 'book.fill' },
  progress: { default: 'chart.bar', active: 'chart.bar.fill' },
  settings: { default: 'gearshape', active: 'gearshape.fill' },
} as const;

// Share icon for settings:
const SHARE_ICON = 'square.and.arrow.up';
```

### Group Triads by Category
```typescript
// Source: Existing codebase pattern
import { getAllTriads, getTriadsByCategory } from '@/services/triads';
import { TriadCategory, Triad } from '@/types';

const CATEGORIES: TriadCategory[] = [
  'cardiology', 'neurology', 'endocrine', 'pulmonary',
  'gastroenterology', 'infectious', 'hematology',
  'rheumatology', 'renal', 'obstetrics'
];

interface CategoryGroup {
  category: TriadCategory;
  triads: Triad[];
}

function getTriadsGroupedByCategory(): CategoryGroup[] {
  return CATEGORIES.map(category => ({
    category,
    triads: getTriadsByCategory(category),
  }));
}
```

### Reset Stats with Confirmation
```typescript
// Source: React Native Alert API
import { Alert } from 'react-native';
import { clearStats } from '@/services/stats-storage';

function confirmResetStats(onReset: () => void) {
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
          onReset();
        }
      },
    ]
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual tab bar hiding | Nest tabs inside stack | React Nav 6+ | Quiz outside tabs eliminates need for hide logic |
| AsyncStorage in RN core | @react-native-async-storage/async-storage | RN 0.64 | Community package now required |
| react-navigation separate | expo-router file-based | Expo SDK 49+ | Simpler routing, existing app already uses it |
| Custom icon libraries | expo-symbols (SF Symbols) | Expo SDK 50+ | Native iOS icons, existing app already uses it |

**Deprecated/outdated:**
- `@react-native-community/async-storage`: Use `@react-native-async-storage/async-storage` instead
- `navigation.setOptions` for tab bar hiding: Structure navigation properly instead
- React Navigation < v6: Current app uses v7

## Open Questions

Things that couldn't be fully resolved:

1. **Quiz History Data Structure**
   - What we know: Need to store recent quiz rounds for Progress screen
   - What's unclear: Exact fields to store (date, score, accuracy, questions answered?)
   - Recommendation: Start with `{ date: string, score: number, correct: number, total: number }` and extend if needed

2. **Category Accuracy Tracking**
   - What we know: Progress screen needs per-category breakdown
   - What's unclear: Whether to track this in existing stats or new storage
   - Recommendation: Extend `StoredStats` interface with `categoryStats: Record<TriadCategory, { correct: number, total: number }>`

3. **App Store URL for Sharing**
   - What we know: Need URL for share functionality
   - What's unclear: App Store URL not yet available (pre-launch)
   - Recommendation: Use placeholder URL that can be updated later, or just share message without URL initially

## Sources

### Primary (HIGH confidence)
- Existing codebase: `app/(tabs)/_layout.tsx`, `services/stats-storage.ts`, `components/ui/icon-symbol.ios.tsx`
- [Expo Router Tabs Documentation](https://docs.expo.dev/router/advanced/tabs/) - Tab configuration, screenOptions
- [React Native Switch](https://reactnative.dev/docs/switch) - Native switch props and usage
- [React Native Share](https://reactnative.dev/docs/share) - Share API parameters
- [expo-symbols Documentation](https://docs.expo.dev/versions/latest/sdk/symbols/) - SymbolView usage
- [expo-application Documentation](https://docs.expo.dev/versions/latest/sdk/application/) - App version access
- [React Native Reanimated Accordion](https://docs.swmansion.com/react-native-reanimated/examples/accordion/) - Animated height pattern

### Secondary (MEDIUM confidence)
- [React Navigation - Hiding Tab Bar](https://reactnavigation.org/docs/hiding-tabbar-in-screens/) - Navigation structure recommendations
- [GitHub - expo/router discussions](https://github.com/expo/router/discussions/313) - Tab bar hiding patterns

### Tertiary (LOW confidence)
- SF Symbols icon names - Verified against Apple SF Symbols app, but exact availability in expo-symbols should be tested

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Existing codebase + official docs
- Architecture: HIGH - Extends existing patterns
- Tab navigation: HIGH - Already working in codebase
- Settings storage: HIGH - Mirrors existing stats-storage pattern
- Accordion: MEDIUM - Based on Reanimated docs, needs implementation testing
- Pitfalls: HIGH - Based on official docs and common issues

**Research date:** 2026-01-18
**Valid until:** 2026-02-18 (stable patterns, low churn expected)
