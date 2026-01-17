# Coding Conventions

**Analysis Date:** 2025-01-17

## Naming Patterns

**Files:**
- kebab-case for all source files: `themed-text.tsx`, `use-color-scheme.ts`, `parallax-scroll-view.tsx`
- Platform-specific files use suffix: `icon-symbol.ios.tsx`, `use-color-scheme.web.ts`
- Layout files use underscore prefix: `_layout.tsx`
- Route files use lowercase: `index.tsx`, `modal.tsx`, `explore.tsx`

**Functions:**
- PascalCase for React components: `ThemedText`, `ParallaxScrollView`, `HapticTab`
- camelCase for hooks: `useColorScheme`, `useThemeColor`
- camelCase for regular functions: `moveDirectories`

**Variables:**
- camelCase for variables: `colorScheme`, `scrollRef`, `headerAnimatedStyle`
- UPPER_SNAKE_CASE for constants: `HEADER_HEIGHT`, `MAPPING`
- camelCase for style keys: `titleContainer`, `stepContainer`

**Types:**
- PascalCase for type definitions: `ThemedTextProps`, `ThemedViewProps`, `Props`
- Suffix with `Props` for component prop types

## Code Style

**Formatting:**
- ESLint with `eslint-config-expo` flat config
- Auto-fix on save enabled via VSCode settings
- Import organization handled by VSCode code actions

**Linting:**
- Tool: ESLint 9.x with flat config
- Config file: `medtriad/eslint.config.js`
- Ignores: `dist/*`
- Extends: `eslint-config-expo/flat`

```javascript
// eslint.config.js pattern
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
]);
```

## Import Organization

**Order:**
1. External packages (React, React Native, Expo)
2. Path-aliased internal imports (`@/components/`, `@/hooks/`, `@/constants/`)
3. Relative imports (if any)

**Path Aliases:**
- `@/*` maps to project root (`./`)
- Configured in `medtriad/tsconfig.json`

**Examples:**
```typescript
// External imports first
import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

// Internal imports via path alias
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
```

## Component Patterns

**Default Exports:**
- Screen components use default export: `export default function HomeScreen()`
- Layout components use default export: `export default function RootLayout()`

**Named Exports:**
- Reusable components use named export: `export function ThemedText()`
- Hooks use named export: `export function useThemeColor()`
- Re-exports from hooks: `export { useColorScheme } from 'react-native';`

**Type Exports:**
- Export prop types with component: `export type ThemedTextProps = ...`

## Styling Patterns

**StyleSheet:**
- Use `StyleSheet.create()` at bottom of file
- camelCase keys for style objects
- Inline styles only for dynamic/conditional styles

```typescript
const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
});
```

**Theming:**
- Use `useThemeColor` hook for theme-aware colors
- Define color constants in `medtriad/constants/theme.ts`
- Support both `lightColor` and `darkColor` props on themed components

## Props Patterns

**Prop Destructuring:**
- Destructure props in function signature
- Use `...rest` or `...otherProps` for pass-through props
- Provide default values inline: `type = 'default'`

```typescript
export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  // ...
}
```

**Prop Types:**
- Extend base types with intersection: `TextProps & { ... }`
- Use `PropsWithChildren` for container components
- Use `ReactElement` for slot props like `headerImage`

## Platform-Specific Code

**File-based:**
- Use platform-specific file extensions: `.ios.tsx`, `.web.ts`
- Example: `icon-symbol.ios.tsx` vs `icon-symbol.tsx` (fallback)

**Runtime checks:**
- Use `Platform.select()` for platform-specific values
- Use `process.env.EXPO_OS` for Expo-specific platform checks

```typescript
// Platform.select pattern
Platform.select({
  ios: 'cmd + d',
  android: 'cmd + m',
  web: 'F12',
})

// Expo OS check pattern
if (process.env.EXPO_OS === 'ios') {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
```

## Error Handling

**Patterns:**
- Optional chaining for event handlers: `props.onPressIn?.(ev)`
- Nullish coalescing for defaults: `useColorScheme() ?? 'light'`
- No explicit try/catch in component code currently

## Comments

**When to Comment:**
- JSDoc-style comments for public API documentation
- Brief inline comments for non-obvious behavior

**JSDoc:**
- Used sparingly for key utilities
- Document purpose and link to external docs

```typescript
/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */
```

## Function Design

**Size:** Small, focused functions. Components are 10-80 lines typically.

**Parameters:**
- Use object destructuring for multiple params
- Provide sensible defaults

**Return Values:**
- Components return JSX directly
- Hooks return single value or tuple

## Module Design

**Exports:**
- One primary export per file (component or hook)
- Co-locate related type exports

**Barrel Files:**
- Not currently used
- Import directly from file paths

## TypeScript Configuration

**Strict Mode:** Enabled (`"strict": true`)

**Key Settings:**
- Extends: `expo/tsconfig.base`
- Path aliases configured
- Include: `**/*.ts`, `**/*.tsx`, `.expo/types/**/*.ts`, `expo-env.d.ts`

---

*Convention analysis: 2025-01-17*
