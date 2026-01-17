# Technology Stack

**Analysis Date:** 2026-01-17

## Languages

**Primary:**
- TypeScript ~5.9.2 - All application code in `medtriad/app/`, `medtriad/components/`, `medtriad/hooks/`, `medtriad/constants/`

**Secondary:**
- JavaScript - Configuration files (`eslint.config.js`, `scripts/reset-project.js`)

## Runtime

**Environment:**
- React Native 0.81.5 (New Architecture enabled)
- Expo SDK 54.0.31
- React 19.1.0

**Package Manager:**
- npm
- Lockfile: `medtriad/package-lock.json` (present)

## Frameworks

**Core:**
- Expo ~54.0.31 - Main development platform and build system
- React Native 0.81.5 - Cross-platform mobile framework
- expo-router ~6.0.21 - File-based routing

**Navigation:**
- @react-navigation/native ^7.1.8 - Navigation foundation
- @react-navigation/bottom-tabs ^7.4.0 - Tab navigation
- @react-navigation/elements ^2.6.3 - UI elements for navigation

**Animation:**
- react-native-reanimated ~4.1.1 - Performance animations
- react-native-worklets 0.5.1 - Worklet support for reanimated

**Build/Dev:**
- TypeScript ~5.9.2 - Type checking
- ESLint ^9.25.0 - Linting
- eslint-config-expo ~10.0.0 - Expo-specific lint rules

## Key Dependencies

**Critical:**
- expo-router ~6.0.21 - Core routing system, file-based navigation
- react-native-reanimated ~4.1.1 - Animation system used throughout components
- react-native-safe-area-context ~5.6.0 - Safe area handling for notched devices

**UI/UX:**
- expo-image ~3.0.11 - Optimized image component
- expo-haptics ~15.0.8 - Haptic feedback on tab presses
- expo-symbols ~1.0.8 - SF Symbols on iOS
- @expo/vector-icons ^15.0.3 - Material Icons fallback

**Platform Features:**
- expo-splash-screen ~31.0.13 - Splash screen management
- expo-status-bar ~3.0.9 - Status bar styling
- expo-web-browser ~15.0.10 - In-app browser for external links
- expo-linking ~8.0.11 - Deep linking support
- expo-system-ui ~6.0.9 - System UI configuration
- expo-constants ~18.0.13 - App constants access
- expo-font ~14.0.10 - Custom font loading

**Gesture/Screen:**
- react-native-gesture-handler ~2.28.0 - Gesture recognition
- react-native-screens ~4.16.0 - Native screen containers

**Web Support:**
- react-native-web ~0.21.0 - Web platform support
- react-dom 19.1.0 - DOM rendering for web

## Configuration

**App Configuration:**
- `medtriad/app.json` - Expo configuration (name, version, icons, plugins, experiments)

**TypeScript:**
- `medtriad/tsconfig.json` - Extends `expo/tsconfig.base`
- Strict mode enabled
- Path alias: `@/*` maps to `./*`

**Linting:**
- `medtriad/eslint.config.js` - Uses eslint-config-expo/flat
- Ignores `dist/*`

**Experimental Features (enabled in app.json):**
- `typedRoutes: true` - Type-safe routing
- `reactCompiler: true` - React Compiler experimental support
- `newArchEnabled: true` - React Native New Architecture

## Platform Requirements

**Development:**
- Node.js (version managed by Expo)
- Expo CLI (via `expo start`)
- iOS Simulator or Android Emulator, or physical device with Expo Go

**Production:**
- iOS: Supports tablet (`supportsTablet: true`)
- Android: Edge-to-edge enabled, adaptive icons configured
- Web: Static output (`output: "static"`)

**Run Commands:**
```bash
npm start           # Start Expo dev server
npm run ios         # Start iOS development
npm run android     # Start Android development
npm run web         # Start web development
npm run lint        # Run ESLint
npm run reset-project  # Reset to fresh app directory
```

---

*Stack analysis: 2026-01-17*
