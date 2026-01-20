# Phase 26: App Store Preparation - Research

**Researched:** 2026-01-20
**Domain:** iOS App Store submission, Expo/EAS deployment
**Confidence:** HIGH

## Summary

App Store preparation for this Expo-based medical education quiz app involves several distinct domains: assets (icon, screenshots), metadata (description, keywords, category), privacy compliance (policy URL, nutrition labels, privacy manifest), and technical configuration (bundle ID, versioning, EAS Submit setup).

The app already has a 1024x1024 icon which meets Apple's requirements. Since it's iOS-only with local-only storage (AsyncStorage, no analytics, no tracking), the privacy requirements are minimal - primarily requiring a "Data Not Collected" privacy label and a simple privacy policy stating no data is transmitted off-device.

**Primary recommendation:** Focus on creating 6.9" iPhone screenshots (1260x2736 pixels - the only mandatory size), configuring eas.json for submission, documenting privacy practices in PRIVACY_SUMMARY.md, and preparing App Store Connect metadata.

## Standard Stack

The established tools for App Store preparation with Expo:

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| EAS Submit | Latest | App Store submission | Expo's official submission service - handles credentials, uploading |
| EAS Build | Latest | Production builds | Creates .ipa files for App Store |
| App Store Connect | N/A | Apple's portal | Required for all iOS submissions |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| eas.json | Configuration | Define submission profiles, auto-increment settings |
| ASC API Key | Authentication | CI/CD and programmatic submissions |
| Transporter (macOS) | Manual upload | Fallback if EAS Submit unavailable |

### Screenshot Tools (Manual Approach Recommended)
| Tool | Purpose | Notes |
|------|---------|-------|
| iOS Simulator | Capture screenshots | Built into Xcode, native resolution |
| Device screenshots | Real device capture | Best quality, authentic feel |
| Figma/Sketch | Frame mockups | Optional device frames/text overlays |

**Note:** Automated screenshot tools (Fastlane + Detox) are complex with React Native/Expo. For a single-locale app with ~5 screenshots, manual capture is more practical.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| EAS Submit | Manual Transporter upload | More manual steps, but works offline |
| Manual screenshots | Fastlane + Detox | Complex setup, justified only for 10+ locales |
| Self-hosted privacy policy | Generator service (iubenda) | Adds cost, overkill for no-data-collection apps |

## Architecture Patterns

### App Store Submission Flow

```
1. Prepare Assets
   ├── App icon (1024x1024) ✓ Already exists
   ├── Screenshots (6.9" mandatory)
   └── Privacy policy URL

2. Configure Technical Requirements
   ├── Bundle ID in app.json
   ├── eas.json for submission
   └── Privacy manifest in app.json

3. Prepare App Store Connect
   ├── Create app listing
   ├── Fill metadata (description, keywords)
   └── Complete privacy questionnaire

4. Build & Submit
   ├── eas build --platform ios --profile production
   └── eas submit --platform ios
```

### Project Structure for App Store Assets

```
medtriad/
├── app.json                    # Bundle ID, version, privacy manifest
├── assets/
│   └── images/
│       └── icon.png            # 1024x1024 ✓ Already exists
├── eas.json                    # Submission configuration (TO CREATE)
└── ...

.planning/phases/26-app-store-preparation/
├── PRIVACY_SUMMARY.md          # Data practices documentation
└── SCREENSHOT_PLAN.md          # Screenshot list and specs
```

### app.json Configuration Pattern

```json
{
  "expo": {
    "name": "MedTriad",
    "slug": "medtriad",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.medtriad",
      "buildNumber": "1",
      "supportsTablet": false,
      "privacyManifests": {
        "NSPrivacyAccessedAPITypes": [
          {
            "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults",
            "NSPrivacyAccessedAPITypeReasons": ["CA92.1"]
          }
        ]
      }
    }
  }
}
```

### eas.json Configuration Pattern

```json
{
  "cli": {
    "version": ">= 13.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "production": {
      "ios": {
        "autoIncrement": true,
        "simulator": false
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID"
      }
    }
  }
}
```

### Anti-Patterns to Avoid
- **Manual buildNumber management:** Use EAS remote version source with autoIncrement to avoid duplicate version rejections
- **Screenshots with simulator frames:** Capture clean screenshots; device frames are optional and can distract
- **Placeholder text in metadata:** Apple rejects apps with "Lorem ipsum" or TBD text anywhere
- **Debug menus in production:** Ensure __DEV__ checks prevent dev tools from appearing

## Don't Hand-Roll

Problems that have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Version management | Manual buildNumber tracking | EAS remote version + autoIncrement | Prevents duplicate version rejections |
| Icon size generation | Multiple icon files | Single 1024x1024 + Expo auto-generation | EAS Build generates all sizes automatically |
| Privacy policy hosting | Complex hosting setup | Simple static page on existing domain OR GitHub Pages | Only needs to be a URL that loads |
| App Store submission | Manual Xcode Archive + Transporter | EAS Submit | Handles credentials and upload automatically |
| Privacy manifest | Manual xcprivacy file | app.json privacyManifests config | Expo generates the file during prebuild |

**Key insight:** Expo/EAS handles most App Store preparation complexity automatically. The main work is content creation (screenshots, descriptions) and configuration (eas.json, app.json updates).

## Common Pitfalls

### Pitfall 1: Missing Privacy Manifest for AsyncStorage

**What goes wrong:** App rejected with "ITMS-91053: Missing API declaration" error
**Why it happens:** AsyncStorage uses NSUserDefaults, which is a Required Reason API since May 2024
**How to avoid:** Add privacyManifests to app.json with CA92.1 reason code for UserDefaults
**Warning signs:** No `privacyManifests` key in app.json ios section

### Pitfall 2: Duplicate Build Number

**What goes wrong:** "ERROR ITMS-90189: Redundant Binary Upload" - submission rejected
**Why it happens:** Uploading a build with the same buildNumber as a previous upload
**How to avoid:** Enable `autoIncrement: true` in eas.json and use remote version source
**Warning signs:** Manually managing buildNumber, or buildNumber not incrementing between builds

### Pitfall 3: Screenshot Size Mismatch

**What goes wrong:** "Invalid screenshot size" error in App Store Connect
**Why it happens:** Using wrong pixel dimensions for target device size
**How to avoid:** Use exactly 1260x2736 pixels for 6.9" iPhone (portrait) - the only mandatory size
**Warning signs:** Screenshots taken on simulator with non-standard display settings

### Pitfall 4: Missing Privacy Policy URL

**What goes wrong:** App rejected for missing privacy policy
**Why it happens:** Privacy policy is required for ALL apps, even those collecting no data
**How to avoid:** Create simple policy page stating no data is collected, host anywhere accessible
**Warning signs:** No privacyPolicyUrl planned before submission

### Pitfall 5: iPad Rendering Issues (Even for iPhone-Only Apps)

**What goes wrong:** App rejected because it renders poorly on iPad
**Why it happens:** iPhone apps can run on iPad in compatibility mode
**How to avoid:** Test on iPad simulator; ensure UI scales acceptably
**Warning signs:** `supportsTablet: true` in app.json when targeting iPhone only

### Pitfall 6: Debug Features Visible in Production

**What goes wrong:** App rejected for containing "hidden features" or "test content"
**Why it happens:** Dev tools, debug menus, or test data visible in production build
**How to avoid:** All dev features must be behind `__DEV__` checks; verify in production build
**Warning signs:** Any dev tools without proper __DEV__ guards

### Pitfall 7: Inaccurate Privacy Labels

**What goes wrong:** App removed from store for misrepresenting data practices
**Why it happens:** Apple now uses automated scanning to verify privacy label accuracy
**How to avoid:** Document ALL data practices including third-party SDKs; review each dependency's privacy manifest
**Warning signs:** Claiming "Data Not Collected" while using analytics/crash SDKs

## Code Examples

### Privacy Manifest Configuration in app.json

```json
// Source: https://docs.expo.dev/guides/apple-privacy/
{
  "expo": {
    "ios": {
      "privacyManifests": {
        "NSPrivacyAccessedAPITypes": [
          {
            "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults",
            "NSPrivacyAccessedAPITypeReasons": ["CA92.1"]
          }
        ]
      }
    }
  }
}
```

**Reason code CA92.1 meaning:** "Access info from inside the app's container" - appropriate for AsyncStorage usage.

### eas.json for Production Submission

```json
// Source: https://docs.expo.dev/submit/ios/
{
  "cli": {
    "version": ">= 13.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "production": {
      "ios": {
        "autoIncrement": true
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "1234567890"
      }
    }
  }
}
```

### EAS Submit Commands

```bash
# Build production binary
eas build --platform ios --profile production

# Submit to App Store (TestFlight)
eas submit --platform ios

# Combined build + submit
eas build --platform ios --profile production --auto-submit
```

### Simple Privacy Policy Template (No Data Collection)

```markdown
# Privacy Policy for MedTriad

Last updated: [Date]

## Overview
MedTriad is a medical education quiz application. We respect your privacy and are committed to protecting it.

## Data Collection
**We do not collect any personal data.** All quiz progress, scores, and preferences are stored locally on your device only. No data is transmitted to external servers.

## Data Storage
- All app data is stored locally using device storage
- No user accounts or cloud sync
- No analytics or tracking services

## Third-Party Services
This app does not use any third-party analytics, advertising, or tracking services.

## Contact
If you have questions about this privacy policy, contact: [your email]
```

## Screenshot Requirements

### Mandatory Size (HIGH Confidence)

| Display | Dimensions (Portrait) | Devices Covered |
|---------|----------------------|-----------------|
| **6.9"** | **1260 x 2736 px** | iPhone 16 Pro Max, 15 Pro Max, 14 Pro Max, and all smaller iPhones (auto-scaled) |

**Source:** [Apple Developer Screenshot Specifications](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications)

### Recommended Screenshots for Medical Quiz App

Based on app screens identified:

1. **Home Screen** - Shows mascot, tier progress, category mastery
2. **Quiz Question** - Active quiz with answer options
3. **Correct Answer Feedback** - Success state with explanation
4. **Results Screen** - Quiz completion with stats
5. **Library Browser** - Triad categories and search

**Quantity:** Minimum 1, maximum 10, recommended 5-6 showing key features.

### Screenshot Capture Process

```bash
# 1. Open iOS Simulator with correct device
xcrun simctl boot "iPhone 16 Pro Max"

# 2. Run app in production mode
npx expo start --no-dev

# 3. Navigate to screen, then capture
# Simulator: File > Save Screen (Cmd+S)
# Or: xcrun simctl io booted screenshot ~/Desktop/screenshot.png
```

## App Store Metadata

### Category Selection (HIGH Confidence)

| Option | Recommendation | Rationale |
|--------|----------------|-----------|
| **Primary: Medical** | RECOMMENDED | Targets healthcare professionals/students, less competition than Education |
| **Secondary: Education** | RECOMMENDED | Captures broader audience searching educational apps |

**Source:** [Apple App Store Categories](https://developer.apple.com/app-store/categories/)

### Age Rating (HIGH Confidence)

Based on content (medical education quiz, no violence/mature content):

| Content Type | Selection |
|--------------|-----------|
| Medical/Wellness Topics | Yes - "Health or wellness topics" |
| Violence | None |
| Mature Themes | None |
| Gambling | None |
| User-Generated Content | None |

**Expected Rating:** 4+ or 9+ (likely 9+ due to Medical/Wellness flag)

**Note:** Apple has updated age ratings in 2025. New categories include 13+, 16+, 18+. Medical/wellness apps typically receive 9+ or 13+ depending on content depth.

### Keyword Strategy (MEDIUM Confidence)

iOS keyword field allows 100 characters, comma-separated.

**Recommended keywords for medical triad quiz app:**
```
medical,triad,quiz,flashcards,anatomy,clinical,nursing,USMLE,boards,medicine,study,mcq,diagnosis,symptoms
```

**Strategy:**
- Focus on long-tail terms (less competition)
- Include target audience terms (nursing, USMLE)
- Avoid duplicating words from title/subtitle
- Use singular forms (Apple combines for plurals)

## Privacy Compliance

### App Privacy Labels (HIGH Confidence)

For this app (local storage only, no analytics, no tracking):

| Question | Answer |
|----------|--------|
| Does your app collect any data? | **No** |
| Data Types Collected | None |
| Data Linked to User | None |
| Data Used for Tracking | None |

**Result:** "Data Not Collected" label displayed in App Store

**Source:** [Apple App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/)

### Required Reason API Declaration

AsyncStorage uses NSUserDefaults, requiring privacy manifest declaration:

| API Category | Reason Code | Meaning |
|--------------|-------------|---------|
| NSPrivacyAccessedAPICategoryUserDefaults | CA92.1 | Access info from inside the app's container |

### Privacy Policy Requirements

- **URL required:** Must be accessible via web (App Store Connect field)
- **In-app access:** Should be accessible from Settings screen
- **Content:** Can be simple "no data collected" statement for this app

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Multiple icon sizes required | Single 1024x1024 (auto-scaled) | 2023 | Simpler asset preparation |
| 5.5", 6.5" screenshots required | Only 6.9" mandatory | 2024-2025 | Fewer screenshots needed |
| Manual buildNumber tracking | EAS remote version + autoIncrement | 2022 | Prevents submission failures |
| No privacy manifest | Required Reason API declarations | May 2024 | Must configure in app.json |
| 12+ and 17+ age ratings | New 13+, 16+, 18+ categories | July 2025 | Must complete new questionnaire |

## Open Questions

1. **Bundle Identifier**
   - What we know: Must be unique, format com.company.appname
   - What's unclear: Exact company name / identifier to use
   - Recommendation: User decision needed; format suggestion: `com.yourname.medtriad`

2. **Privacy Policy Hosting**
   - What we know: Needs to be a publicly accessible URL
   - What's unclear: Where to host (GitHub Pages, existing domain, etc.)
   - Recommendation: GitHub Pages is free and reliable for static content

3. **App Name Uniqueness**
   - What we know: App Store names must be globally unique
   - What's unclear: Whether "MedTriad" is available
   - Recommendation: Verify availability in App Store Connect before finalizing

## Sources

### Primary (HIGH confidence)
- [Apple Screenshot Specifications](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications) - Screenshot dimensions verified
- [Expo Privacy Manifests Guide](https://docs.expo.dev/guides/apple-privacy/) - Privacy manifest configuration
- [Expo EAS Submit Documentation](https://docs.expo.dev/submit/ios/) - Submission process and eas.json
- [Expo App Versions Guide](https://docs.expo.dev/build-reference/app-versions/) - Version management patterns
- [Apple App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/) - Privacy label requirements

### Secondary (MEDIUM confidence)
- [App Store Review Guidelines 2025](https://nextnative.dev/blog/app-store-review-guidelines) - Common rejection reasons
- [Age Ratings Update](https://developer.apple.com/news/?id=ks775ehf) - New age rating categories
- [ASO Best Practices 2025](https://appradar.com/academy/apple-app-store-optimization-aso) - Keyword strategy

### Tertiary (LOW confidence)
- WebSearch findings on screenshot automation (Fastlane + Detox complexity confirmed but no standard Expo solution)
- Privacy policy templates from various generators

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Expo/Apple documentation
- Screenshot specs: HIGH - Verified against Apple's current spec page
- Privacy manifest: HIGH - Official Expo docs, verified requirement
- Age rating: MEDIUM - 2025 changes documented but UI may vary
- Keywords/ASO: MEDIUM - Best practices vary by source

**Research date:** 2026-01-20
**Valid until:** 2026-02-20 (30 days - App Store requirements are relatively stable)
