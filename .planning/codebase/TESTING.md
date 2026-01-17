# Testing Patterns

**Analysis Date:** 2025-01-17

## Test Framework

**Status: NOT CONFIGURED**

No testing framework is currently set up for this project. The following are not present:
- No Jest configuration (`jest.config.*`)
- No Vitest configuration (`vitest.config.*`)
- No test scripts in `package.json`
- No test files in the source code (`*.test.ts`, `*.spec.ts`)

**Recommendation:** Set up Jest with `@testing-library/react-native` for React Native component testing.

## Recommended Setup

When adding tests, follow Expo's recommended approach:

**Install Dependencies:**
```bash
npm install --save-dev jest @testing-library/react-native jest-expo
```

**Create jest.config.js:**
```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['@testing-library/react-native/extend-expect'],
};
```

**Add Test Script to package.json:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Suggested Test File Organization

**Location:**
- Co-located with source files: `components/__tests__/themed-text.test.tsx`
- Or in dedicated test directory: `__tests__/components/themed-text.test.tsx`

**Naming:**
- Pattern: `[component-name].test.tsx`
- Match kebab-case source file naming

**Structure:**
```
medtriad/
├── components/
│   ├── __tests__/
│   │   ├── themed-text.test.tsx
│   │   ├── themed-view.test.tsx
│   │   └── hello-wave.test.tsx
│   ├── themed-text.tsx
│   └── themed-view.tsx
├── hooks/
│   ├── __tests__/
│   │   ├── use-color-scheme.test.ts
│   │   └── use-theme-color.test.ts
│   └── use-color-scheme.ts
```

## Suggested Test Structure

**Component Test Pattern:**
```typescript
import { render, screen } from '@testing-library/react-native';
import { ThemedText } from '../themed-text';

describe('ThemedText', () => {
  it('renders children correctly', () => {
    render(<ThemedText>Hello World</ThemedText>);
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  it('applies title styles when type is title', () => {
    const { getByText } = render(<ThemedText type="title">Title</ThemedText>);
    // Assert styles
  });
});
```

**Hook Test Pattern:**
```typescript
import { renderHook } from '@testing-library/react-native';
import { useThemeColor } from '../use-theme-color';

describe('useThemeColor', () => {
  it('returns light color when theme is light', () => {
    const { result } = renderHook(() =>
      useThemeColor({ light: '#fff', dark: '#000' }, 'text')
    );
    expect(result.current).toBe('#fff');
  });
});
```

## Mocking

**Framework:** Jest mocks (when configured)

**What to Mock:**
- Platform-specific modules (`expo-haptics`, `expo-symbols`)
- Native modules
- Navigation hooks

**What NOT to Mock:**
- Pure utility functions
- Component props
- StyleSheet definitions

**Suggested Mock Pattern:**
```typescript
// __mocks__/expo-haptics.ts
export const impactAsync = jest.fn();
export const ImpactFeedbackStyle = {
  Light: 'light',
  Medium: 'medium',
  Heavy: 'heavy',
};
```

## Priority Test Areas

Based on codebase analysis, these components should be tested first:

**High Priority:**
1. `medtriad/components/themed-text.tsx` - Core UI primitive
2. `medtriad/components/themed-view.tsx` - Core UI primitive
3. `medtriad/hooks/use-theme-color.ts` - Theme logic

**Medium Priority:**
4. `medtriad/components/ui/collapsible.tsx` - Interactive component
5. `medtriad/components/parallax-scroll-view.tsx` - Complex animation

**Lower Priority:**
6. `medtriad/components/external-link.tsx` - Platform-specific behavior
7. `medtriad/components/haptic-tab.tsx` - Platform-specific behavior

## Coverage

**Requirements:** None enforced (no test framework configured)

**Recommended Targets:**
- Components: 80%+
- Hooks: 90%+
- Utils: 100%

## Linting Integration

Once tests are configured, add ESLint rules for test files:

```javascript
// eslint.config.js addition
{
  files: ['**/*.test.{ts,tsx}'],
  rules: {
    // Test-specific rule overrides
  },
}
```

## Current State Summary

| Aspect | Status |
|--------|--------|
| Test Framework | Not configured |
| Test Files | None |
| Test Scripts | None |
| Coverage Tool | None |
| CI Integration | None |

**Next Steps:**
1. Install Jest and React Native Testing Library
2. Create `jest.config.js`
3. Add test scripts to `package.json`
4. Create initial tests for `ThemedText` and `ThemedView`
5. Set up coverage reporting

---

*Testing analysis: 2025-01-17*
