# MedTriad Release Checklist

Pre-submission verification for App Store release.

## Configuration Checks

| Item | Status | Notes |
|------|--------|-------|
| Bundle ID customized | PENDING | Currently `com.YOURNAME.medtriad` - must replace before submission |
| Version is 1.0.0 | VERIFIED | app.json: `"version": "1.0.0"` |
| Privacy manifest includes UserDefaults | VERIFIED | app.json: NSPrivacyAccessedAPICategoryUserDefaults with CA92.1 |
| supportsTablet is false | VERIFIED | app.json: `"supportsTablet": false` |
| eas.json ascAppId is set | PENDING | Currently placeholder - set after creating App Store Connect app |
| EAS remote version source enabled | VERIFIED | eas.json: `"appVersionSource": "remote"` |
| Production autoIncrement enabled | VERIFIED | eas.json: ios.autoIncrement: true |

## Content Checks

| Item | Status | Notes |
|------|--------|-------|
| No placeholder text visible | MANUAL | Check all screens in production build |
| No test data in default state | MANUAL | Fresh install shows empty stats (expected) |
| App name displays correctly | MANUAL | Verify in simulator |
| Privacy Policy URL is valid | PENDING | Currently placeholder URL - must host and update |

## Debug Feature Checks

| Item | Status | Notes |
|------|--------|-------|
| DevSection only shows when __DEV__ | VERIFIED | settings.tsx line 186: `{__DEV__ && (<DevSection .../>)}` |
| No console.log visible to users | N/A | console.log hidden in production builds |
| No dev-only buttons/features | VERIFIED | All dev features behind __DEV__ guard |
| Production build has no debug overlays | MANUAL | Verify with `npx expo start --no-dev` |

## Functionality Checks

| Item | Status | Notes |
|------|--------|-------|
| App launches without crash | MANUAL | Test fresh install |
| Quiz flow completes start to finish | MANUAL | Test full quiz: start -> answer all -> results |
| All tabs navigate correctly | MANUAL | Home, Library, Progress, Settings |
| Settings toggles persist | MANUAL | Toggle sound/haptics, close app, verify saved |
| Share functionality works | MANUAL | Test share button on results screen |
| Privacy Policy link opens URL | MANUAL | Settings > About > Privacy Policy |

## Asset Checks

| Item | Status | Notes |
|------|--------|-------|
| App icon displays correctly | VERIFIED | icon.png exists at 1024x1024 (AS-01) |
| Splash screen appears on launch | MANUAL | Verify splash shows then fades |
| All images load | MANUAL | Check mascots, icons, no broken images |

## How to Verify Production Build

### Option 1: Local Production Mode
```bash
cd medtriad
npx expo start --no-dev --minify
```
Runs app in production mode locally. Good for quick checks.

### Option 2: EAS Preview Build
```bash
cd medtriad
eas build --platform ios --profile preview
```
Creates installable .app for simulator. Most accurate to final build.

### Option 3: EAS Production Build
```bash
cd medtriad
eas build --platform ios --profile production
```
Creates actual App Store binary. Use for final verification before submit.

## Pre-Submission Final Steps

1. **Replace placeholders:**
   - [ ] Bundle ID: Change `com.YOURNAME.medtriad` in app.json
   - [ ] Privacy Policy URL: Update in settings.tsx
   - [ ] ascAppId: Update in eas.json after creating App Store Connect app

2. **Create App Store Connect app listing:**
   - [ ] Log into App Store Connect
   - [ ] Create new app with your bundle ID
   - [ ] Copy App ID to eas.json ascAppId

3. **Build and submit:**
   ```bash
   eas build --platform ios --profile production --auto-submit
   ```

4. **Complete App Store Connect:**
   - [ ] Upload screenshots (see SCREENSHOT_PLAN.md)
   - [ ] Fill in description and keywords (see APP_STORE_METADATA.md)
   - [ ] Complete privacy questionnaire (see PRIVACY_SUMMARY.md)
   - [ ] Set pricing (Free)
   - [ ] Submit for review

## Crash-Free Verification

Before submitting, verify the app is crash-free:

1. **Fresh install test:**
   - Delete app from simulator/device
   - Install fresh build
   - Complete full user flow without crashes

2. **Edge cases to test:**
   - First launch (no data)
   - Quiz with 0 questions answered (early exit)
   - Reset statistics then quiz
   - Toggle settings rapidly

3. **Expected result:**
   - App should never crash
   - All states should be handled gracefully
   - No error screens shown to users

---

*Created: 2026-01-20*
*Last verified: 2026-01-20 (code review verification)*
