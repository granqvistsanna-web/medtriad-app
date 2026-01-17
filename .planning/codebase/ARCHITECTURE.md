# Architecture

**Analysis Date:** 2026-01-17

## Pattern Overview

**Overall:** Expo Router File-Based Architecture with Component-Driven UI

**Key Characteristics:**
- File-based routing using Expo Router (routes defined by file structure in `app/`)
- Component-driven UI with themed, reusable components
- Theme system with light/dark mode support via React Navigation
- Platform-adaptive components (iOS-specific implementations with fallbacks)
- Hooks for shared logic and state management

## Layers

**Routing Layer:**
- Purpose: Define navigation structure and screen composition
- Location: `medtriad/app/`
- Contains: Route layouts, screen components, navigation configuration
- Depends on: Components, Hooks, Constants
- Used by: Expo Router runtime

**Components Layer:**
- Purpose: Reusable UI building blocks
- Location: `medtriad/components/`
- Contains: Themed components, UI primitives, interactive elements
- Depends on: Hooks, Constants
- Used by: Screens in `app/`

**UI Components Sublayer:**
- Purpose: Platform-adaptive primitive components
- Location: `medtriad/components/ui/`
- Contains: Icon system with platform-specific implementations
- Depends on: expo-symbols (iOS), @expo/vector-icons (Android/Web)
- Used by: Components layer

**Hooks Layer:**
- Purpose: Encapsulate reusable logic and state
- Location: `medtriad/hooks/`
- Contains: Theme hooks, color scheme detection
- Depends on: Constants, react-native APIs
- Used by: Components, Screens

**Constants Layer:**
- Purpose: Define design tokens and configuration values
- Location: `medtriad/constants/`
- Contains: Color definitions, font configurations
- Depends on: Nothing (leaf layer)
- Used by: Hooks, Components

## Data Flow

**Theme Color Flow:**

1. `useColorScheme()` hook detects system light/dark preference
2. `useThemeColor()` looks up color from `Colors` constant based on theme
3. Themed components (`ThemedText`, `ThemedView`) apply colors automatically
4. React Navigation `ThemeProvider` provides navigation theming

**Navigation Flow:**

1. `app/_layout.tsx` defines root Stack navigator with ThemeProvider
2. `app/(tabs)/_layout.tsx` defines tab navigator inside Stack
3. Screen files (`index.tsx`, `explore.tsx`) render as tab screens
4. Modal routes (`modal.tsx`) render as Stack screens with modal presentation

**State Management:**
- Local component state via React `useState`
- No global state management library (bare React state)
- System state (color scheme) via React Native hooks

## Key Abstractions

**ThemedText:**
- Purpose: Text component with automatic theme-aware coloring
- Examples: `medtriad/components/themed-text.tsx`
- Pattern: Wraps RN Text with theme color injection via `useThemeColor`

**ThemedView:**
- Purpose: View component with automatic theme-aware background
- Examples: `medtriad/components/themed-view.tsx`
- Pattern: Wraps RN View with theme background color injection

**IconSymbol:**
- Purpose: Cross-platform icon abstraction
- Examples: `medtriad/components/ui/icon-symbol.tsx`, `medtriad/components/ui/icon-symbol.ios.tsx`
- Pattern: Platform-specific files (`.ios.tsx` suffix) for native SF Symbols on iOS, MaterialIcons fallback elsewhere

**ParallaxScrollView:**
- Purpose: Scrollable container with parallax header effect
- Examples: `medtriad/components/parallax-scroll-view.tsx`
- Pattern: Uses react-native-reanimated for scroll-driven animations

## Entry Points

**Application Entry:**
- Location: `medtriad/app/_layout.tsx`
- Triggers: App launch via Expo Router
- Responsibilities: Theme provider setup, root navigation stack, status bar configuration

**Tab Navigator:**
- Location: `medtriad/app/(tabs)/_layout.tsx`
- Triggers: Rendering of (tabs) route group
- Responsibilities: Tab bar configuration, screen registration, haptic feedback setup

**Main Screen:**
- Location: `medtriad/app/(tabs)/index.tsx`
- Triggers: Home tab selection, app launch (default route)
- Responsibilities: Welcome content, getting started instructions

## Error Handling

**Strategy:** Minimal/Framework-default

**Patterns:**
- No custom error boundaries detected
- Relies on Expo/React Native default error handling
- No try-catch patterns in current codebase

## Cross-Cutting Concerns

**Logging:** No custom logging (console only via development)

**Validation:** None implemented (starter template state)

**Authentication:** Not implemented

**Theming:**
- Centralized in `medtriad/constants/theme.ts`
- Applied via `useThemeColor` hook
- Automatic light/dark switching

**Platform Adaptation:**
- Platform-specific file extensions (`.ios.tsx`, `.web.ts`)
- `Platform.select()` for inline platform checks
- `process.env.EXPO_OS` for Expo-specific platform detection

---

*Architecture analysis: 2026-01-17*
