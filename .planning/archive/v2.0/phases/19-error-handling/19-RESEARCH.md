# Phase 19: Error Handling - Research

**Researched:** 2026-01-19
**Domain:** React Native Error Handling, Defensive Programming
**Confidence:** HIGH

## Summary

Phase 19 focuses on making the MedTriad app crash-proof through defensive programming. The codebase already has some error handling patterns (try/catch around AsyncStorage operations with fallbacks to defaults), but lacks error boundaries and comprehensive validation.

Key findings:
1. **AsyncStorage handling is already decent** - All storage functions use try/catch and return safe defaults
2. **No error boundaries exist** - App has zero React error boundaries, meaning render errors crash the whole app
3. **Image assets are static requires** - Cannot fail at runtime, but fallback pattern exists for missing tier images
4. **State validation is implicit** - Tier functions clamp naturally (returns tier 1 if invalid), but explicit clamping would be safer
5. **No user-facing error messages** - All errors go to console.error, users see nothing

**Primary recommendation:** Add a top-level error boundary wrapper, explicit value clamping utilities, and replace console.error with user-friendly handling.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-native-error-boundary | ^1.1.11 | Component error catching | React Native specific, uses RN components for fallback UI |
| react-error-boundary | ^4.0.x | Alternative error boundary | Modern hooks-based, works with RN, more flexible reset options |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (built-in) | - | Image onError prop | Fallback for network images |
| (built-in) | - | defaultSource prop | Placeholder during load |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-native-error-boundary | Custom class component | More control, but must implement from scratch |
| react-error-boundary | react-native-error-boundary | RN-specific has native-feeling fallback UI |

**Installation:**
```bash
npm install react-native-error-boundary
# OR
npm install react-error-boundary
```

**Note:** For this app's simplicity, a custom error boundary class component is sufficient and avoids adding dependencies.

## Architecture Patterns

### Recommended Error Handling Layers

```
App Root
├── ErrorBoundary (top-level, catches render errors)
│   ├── _layout.tsx (navigation)
│   │   ├── (tabs)/ (main app)
│   │   ├── quiz/ (quiz flow)
│   │   └── onboarding
│   └── Fallback UI (simple "Something went wrong" + restart)
```

### Pattern 1: Defensive Storage Access
**What:** Wrap all storage operations in try/catch, always return valid defaults
**When to use:** Every AsyncStorage read/write
**Example (already implemented in codebase):**
```typescript
// From services/stats-storage.ts (EXISTING PATTERN)
export async function loadStats(): Promise<StoredStats> {
  try {
    const json = await AsyncStorage.getItem(STATS_KEY);
    if (json) {
      return { ...DEFAULT_STATS, ...JSON.parse(json) };
    }
    return DEFAULT_STATS;
  } catch (error) {
    console.error('Failed to load stats:', error);
    return DEFAULT_STATS; // Safe fallback
  }
}
```

### Pattern 2: Value Clamping Utility
**What:** Ensure numeric values stay within valid ranges
**When to use:** Any computed value that has bounds (tier 1-6, progress 0-1, etc.)
**Example:**
```typescript
// services/validation.ts
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function clampTier(tier: number): number {
  return clamp(Math.floor(tier), 1, 6);
}

export function clampProgress(progress: number): number {
  return clamp(progress, 0, 1);
}
```

### Pattern 3: Error Boundary with Fallback
**What:** Class component that catches render errors in children
**When to use:** Wrap major UI sections (root, navigators, feature areas)
**Example:**
```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console in dev, could send to service in prod
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            We're sorry, but something unexpected happened.
          </Text>
          <Button title="Try Again" onPress={this.handleReset} />
        </View>
      );
    }
    return this.props.children;
  }
}
```

### Pattern 4: Safe JSON Parsing
**What:** Parse JSON with fallback on failure
**When to use:** Any JSON.parse call on external data
**Example:**
```typescript
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
```

### Anti-Patterns to Avoid
- **Swallowing errors silently:** Don't catch errors without logging or fallback
- **Throwing in render:** Never throw errors in render methods without boundary
- **Empty fallbacks:** Returning undefined/null when function expects a value
- **Infinite fallback loops:** Image onError triggering another failed load

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Catching render errors | Custom error tracking | Error Boundary pattern | Standard React pattern, handles edge cases |
| Progress bar values | Manual bounds checking | clamp() utility | Reusable, testable, consistent |
| Storage serialization | Direct JSON.stringify | Wrapper with validation | Type safety, handles edge cases |

**Key insight:** Error handling in this app is mostly about defensive defaults, not complex recovery. Simple patterns suffice.

## Common Pitfalls

### Pitfall 1: Error Boundaries Don't Catch Event Handlers
**What goes wrong:** Assuming ErrorBoundary catches errors in onPress handlers
**Why it happens:** Error boundaries only catch errors during rendering, not in callbacks
**How to avoid:** Use try/catch in event handlers, especially async ones
**Warning signs:** App crashes on button press without ErrorBoundary catching it

### Pitfall 2: Async Errors in useEffect
**What goes wrong:** Async function throws, useEffect doesn't catch it
**Why it happens:** Promise rejection isn't caught by error boundary
**How to avoid:** Wrap async calls in try/catch inside useEffect
**Warning signs:** White screen after async operation fails

### Pitfall 3: Optional Chaining Isn't Always Enough
**What goes wrong:** `stats?.gamesPlayed` returns undefined, passed to function expecting number
**Why it happens:** Optional chaining only prevents access errors, not type issues
**How to avoid:** Always provide fallback with nullish coalescing: `stats?.gamesPlayed ?? 0`
**Warning signs:** NaN appearing in calculations or UI

### Pitfall 4: Image onError Infinite Loop
**What goes wrong:** Fallback image also fails, triggering onError again
**Why it happens:** Both primary and fallback are broken/missing
**How to avoid:** Fallback must be a guaranteed-available asset (bundled require)
**Warning signs:** App freezing, high CPU usage

### Pitfall 5: JSON.parse on Invalid Data
**What goes wrong:** AsyncStorage has corrupted/invalid JSON, parse throws
**Why it happens:** Data corruption, schema changes, manual tampering
**How to avoid:** Wrap JSON.parse in try/catch, merge with defaults
**Warning signs:** App crashes on startup after app update
**Current status:** Already handled in stats-storage.ts and settings-storage.ts

## Code Examples

Verified patterns from official sources and codebase analysis:

### Existing AsyncStorage Pattern (Already Implemented)
```typescript
// From medtriad/services/stats-storage.ts
export async function loadStats(): Promise<StoredStats> {
  try {
    const json = await AsyncStorage.getItem(STATS_KEY);
    if (json) {
      return { ...DEFAULT_STATS, ...JSON.parse(json) };
    }
    return DEFAULT_STATS;
  } catch (error) {
    console.error('Failed to load stats:', error);
    return DEFAULT_STATS;
  }
}
```

### Existing Image Fallback Pattern (Already Implemented)
```typescript
// From medtriad/components/home/TriMascot.tsx
const TIER_IMAGES: Record<number, ReturnType<typeof require>> = {
  1: require('@/assets/images/tri-lvl1.png'),
  2: require('@/assets/images/tri-lvl2.png'),
  3: require('@/assets/images/tri-lvl2.png'),  // Fallback: lvl3 not provided
  4: require('@/assets/images/tri-lvl4.png'),
  5: require('@/assets/images/tri-lvl5.png'),
  6: require('@/assets/images/tri-lvl6.png'),
};

const getImageSource = () => {
  if (context === 'home' && tier) {
    return TIER_IMAGES[tier] || TIER_IMAGES[1]; // Falls back to tier 1
  }
  // ...
};
```

### Existing Tier Calculation (Already Safe)
```typescript
// From medtriad/services/mastery.ts
export function getTierForPoints(totalPoints: number): TierDefinition {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (totalPoints >= TIERS[i].pointsRequired) {
      return TIERS[i];
    }
  }
  return TIERS[0]; // Always returns valid tier
}
```

### Proposed Error Boundary Usage
```typescript
// In app/_layout.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider value={LightTheme}>
        <Stack>
          {/* ... existing screens ... */}
        </Stack>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

### Proposed Validation Utilities
```typescript
// services/validation.ts
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export function clampTier(tier: number): number {
  return clamp(Math.floor(tier), 1, 6);
}

export function clampProgress(progress: number): number {
  return clamp(progress, 0, 1);
}

export function clampScore(score: number): number {
  return clamp(Math.floor(score), 0, Number.MAX_SAFE_INTEGER);
}

export function safeInt(value: unknown, fallback: number): number {
  const parsed = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  return Number.isFinite(parsed) ? Math.floor(parsed) : fallback;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| componentDidCatch only | getDerivedStateFromError + componentDidCatch | React 16.6 | Cleaner separation of state update vs side effects |
| Class error boundaries only | react-error-boundary with hooks | 2020+ | Function component friendly, reset capabilities |
| Silent error swallowing | Logging + graceful fallback | Always best practice | Better debugging, better UX |

**Deprecated/outdated:**
- React Native's built-in AsyncStorage: Removed from core, use @react-native-async-storage/async-storage (already done in this project)
- componentDidCatch alone: Should pair with getDerivedStateFromError for state updates

## Existing Codebase Analysis

### What's Already Handled Well

| Location | Pattern | Status |
|----------|---------|--------|
| stats-storage.ts | try/catch + DEFAULT_STATS | Good |
| settings-storage.ts | try/catch + DEFAULT_SETTINGS | Good |
| useStats.ts | Optional chaining + nullish coalescing | Good |
| mastery.ts | getTierForPoints always returns valid tier | Good |
| TriMascot.tsx | TIER_IMAGES fallback to tier 1 | Good |
| results.tsx | parseInt with '0' fallback | Good |

### Gaps to Address

| Location | Issue | Risk | Recommendation |
|----------|-------|------|----------------|
| _layout.tsx | No error boundary | HIGH - render error crashes app | Add ErrorBoundary wrapper |
| quiz/index.tsx | No try/catch on recordQuizResult | MEDIUM - async error not caught | Wrap in try/catch |
| progress.tsx | gamesToNext calculation could produce NaN | LOW - nextTier checked first | Add explicit validation |
| TierProgressBar.tsx | progress not clamped | LOW - could overflow animation | Add clamp(progress, 0, 1) |
| scoring.ts | No validation on inputs | LOW - typed inputs | Consider explicit checks |
| dev-tools.ts | No try/catch on clearAllData | LOW - dev only | Add try/catch |

### Error Logging Pattern
Current: `console.error('Failed to X:', error)`
Improvement: Could add user feedback or silent fallback messaging

## Open Questions

Things that couldn't be fully resolved:

1. **User-facing error messages**
   - What we know: Current errors only go to console
   - What's unclear: Should users see toast/alert on save failures?
   - Recommendation: For MVP, silent fallback is fine. Consider toast for write failures later.

2. **Error reporting service**
   - What we know: No Sentry/Crashlytics integration
   - What's unclear: Is production error tracking needed?
   - Recommendation: Out of scope for Phase 19, but note for future

3. **Recovery strategies**
   - What we know: Error boundary can show "try again" button
   - What's unclear: Should we clear storage on repeated failures?
   - Recommendation: Simple reset (re-render) is sufficient for this app's scope

## Sources

### Primary (HIGH confidence)
- Codebase analysis: medtriad/services/stats-storage.ts, settings-storage.ts, mastery.ts
- Codebase analysis: medtriad/hooks/useStats.ts, use-quiz-reducer.ts
- Codebase analysis: medtriad/components/home/TriMascot.tsx
- [React Error Boundaries Documentation](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [react-native-error-boundary](https://react-native-error-boundary.js.org/)

### Secondary (MEDIUM confidence)
- [React Native University - Error Boundaries](https://www.reactnative.university/blog/react-native-error-boundaries)
- [AsyncStorage Troubleshooting](https://react-native-async-storage.github.io/async-storage/docs/help/troubleshooting/)
- [Image onError in React Native](https://www.ifelsething.com/post/image-load-error-react-native/)

### Tertiary (LOW confidence)
- WebSearch results for best practices (verified against official docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Error boundaries are well-documented React patterns
- Architecture: HIGH - Based on direct codebase analysis
- Pitfalls: HIGH - Standard React Native error handling patterns
- Existing gaps: HIGH - Direct code inspection

**Research date:** 2026-01-19
**Valid until:** 2026-02-19 (30 days - stable domain, patterns don't change frequently)
