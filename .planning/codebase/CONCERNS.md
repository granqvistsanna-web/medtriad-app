# Codebase Concerns

**Analysis Date:** 2025-01-17

## Tech Debt

**Expo Starter Template Not Customized:**
- Issue: The codebase is largely unchanged from the default Expo Router starter template. Contains demo/example content rather than application-specific code.
- Files: `medtriad/app/(tabs)/index.tsx`, `medtriad/app/(tabs)/explore.tsx`, `medtriad/components/hello-wave.tsx`
- Impact: Template code clutters the codebase; developers must distinguish between example and production code.
- Fix approach: Run `npm run reset-project` script or manually remove example content and replace with actual application features.

**Hardcoded Colors in ThemedText:**
- Issue: Link color is hardcoded (`#0a7ea4`) rather than using theme system.
- Files: `medtriad/components/themed-text.tsx` (line 58)
- Impact: Link color won't change in dark mode; inconsistent theming approach.
- Fix approach: Use `useThemeColor` hook or add link color to `Colors` object in `medtriad/constants/theme.ts`.

**IconSymbol Mapping Limited:**
- Issue: SF Symbols to Material Icons mapping contains only 4 icons. Any new icons require manual mapping.
- Files: `medtriad/components/ui/icon-symbol.tsx` (lines 16-21)
- Impact: New icons will fail silently or throw errors on Android/Web until mapped.
- Fix approach: Document mapping requirement; consider using a cross-platform icon library or generating mappings.

**Unused Container Style:**
- Issue: `styles.container` defined but never used in ParallaxScrollView.
- Files: `medtriad/components/parallax-scroll-view.tsx` (line 66-68)
- Impact: Dead code; minor clutter.
- Fix approach: Remove unused style definition.

## Known Bugs

**None Detected:**
- The codebase is minimal starter template code with no complex logic that could harbor bugs.

## Security Considerations

**No Environment Configuration:**
- Risk: No `.env` file or environment variable handling present. When API keys or secrets are needed, no pattern exists.
- Files: Project root (missing `.env`, `expo-env.d.ts` referenced but environment handling not implemented)
- Current mitigation: None needed yet as no secrets exist.
- Recommendations: Establish `.env` pattern before adding any external integrations. Use `expo-constants` for environment-specific config.

**External Links Without Validation:**
- Risk: `ExternalLink` component opens any URL passed to it via in-app browser.
- Files: `medtriad/components/external-link.tsx`
- Current mitigation: Only used with hardcoded documentation URLs.
- Recommendations: When used with dynamic URLs, validate against allowlist or sanitize input.

**No Authentication Infrastructure:**
- Risk: No auth patterns established. Adding auth later will require significant refactoring.
- Files: N/A
- Current mitigation: App is template only.
- Recommendations: Plan auth strategy before adding protected features.

## Performance Bottlenecks

**No Performance Issues Detected:**
- The codebase is minimal with no data fetching, heavy computation, or complex rendering.
- ParallaxScrollView uses proper animation throttling (`scrollEventThrottle={16}`).

## Fragile Areas

**Platform-Specific Icon Implementation:**
- Files: `medtriad/components/ui/icon-symbol.tsx`, `medtriad/components/ui/icon-symbol.ios.tsx`
- Why fragile: Two separate implementations with different APIs must be kept in sync. iOS version uses native SF Symbols; Android/Web uses MaterialIcons with manual mapping.
- Safe modification: Test on all platforms after any icon changes.
- Test coverage: None.

**Web-Specific Color Scheme Hook:**
- Files: `medtriad/hooks/use-color-scheme.ts`, `medtriad/hooks/use-color-scheme.web.ts`
- Why fragile: Web version has hydration workaround that defaults to light mode before hydration. Platform-specific logic split across files.
- Safe modification: Test SSR/hydration scenarios on web after changes.
- Test coverage: None.

## Scaling Limits

**No Scaling Concerns:**
- The app is a starter template with no data, state management, or backend integration.
- Future scaling concerns will emerge when adding:
  - Data fetching (need caching strategy)
  - State management (no pattern established)
  - Navigation depth (currently only tabs)

## Dependencies at Risk

**React 19.1.0 (Minor Behind):**
- Risk: React 19.2.x is available. Version pinning may cause issues with newer dependency updates.
- Impact: Potential compatibility issues with future expo updates.
- Migration plan: Monitor Expo compatibility and update when safe.

**Outdated React Native Ecosystem Packages:**
- Risk: Several RN packages have newer versions available:
  - `react-native`: 0.81.5 -> 0.83.1
  - `react-native-screens`: 4.16.0 -> 4.19.0
  - `react-native-reanimated`: 4.1.6 -> 4.2.1
  - `react-native-gesture-handler`: 2.28.0 -> 2.30.0
  - `react-native-worklets`: 0.5.1 -> 0.7.2
- Impact: Missing bug fixes and features; potential security patches.
- Migration plan: Update via `expo update` to maintain SDK compatibility. Do not update RN directly outside Expo SDK.

**Experimental Features Enabled:**
- Risk: `reactCompiler` and `typedRoutes` are experimental in `app.json`.
- Files: `medtriad/app.json` (lines 43-46)
- Impact: May have breaking changes in future Expo updates.
- Migration plan: Monitor Expo release notes; be prepared to disable if issues arise.

## Missing Critical Features

**No Error Boundary:**
- Problem: No error boundary component to catch and handle React errors gracefully.
- Blocks: Graceful error handling; crash recovery; error reporting.

**No State Management:**
- Problem: No global state solution (Context, Zustand, Redux, etc.) established.
- Blocks: Complex data flows; shared state between screens.

**No Data Fetching Pattern:**
- Problem: No API client, data fetching hooks, or caching strategy.
- Blocks: Any backend integration.

**No Navigation Type Safety Beyond Routes:**
- Problem: While typed routes are enabled, no pattern for passing typed params between screens.
- Blocks: Type-safe deep linking; complex navigation flows.

## Test Coverage Gaps

**No Application Tests:**
- What's not tested: All application code (100% untested).
- Files: `medtriad/app/**/*`, `medtriad/components/**/*`, `medtriad/hooks/**/*`
- Risk: All changes are unverified; regressions will go unnoticed.
- Priority: High - establish testing pattern before adding features.

**No Test Framework Configured:**
- What's not tested: No test runner (Jest/Vitest) configured in project.
- Files: `medtriad/package.json` (no test script or dependencies)
- Risk: No infrastructure for testing; developers cannot write tests.
- Priority: High - add Jest with React Native Testing Library before development begins.

---

*Concerns audit: 2025-01-17*
