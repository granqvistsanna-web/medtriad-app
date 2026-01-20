# MedTriad Privacy Summary

**Created:** 2026-01-20
**For:** App Store Connect submission and privacy policy hosting
**App:** MedTriad - Medical Triads Quiz

---

## Privacy Policy Content

*Ready to host as a static page at your chosen URL.*

---

### Privacy Policy for MedTriad

**Last updated:** January 2026

#### Overview

MedTriad is a medical education quiz application that helps you learn medical triads through interactive quizzes. We respect your privacy and are committed to protecting it.

#### Data Collection

**We do not collect any personal data.**

All quiz progress, scores, tier progression, category mastery, and preferences are stored locally on your device only. No data is transmitted to external servers.

#### Data Storage

- All app data is stored locally using device storage (AsyncStorage)
- No user accounts are created
- No cloud sync or backup services
- No sign-in or registration required

#### Third-Party Services

This app does not use any third-party services that collect data, including:

- No analytics services (Firebase Analytics, Google Analytics, Mixpanel, etc.)
- No crash reporting services that transmit data
- No advertising SDKs
- No social login providers (Google, Apple, Facebook)
- No tracking or attribution services

#### Children's Privacy

This app does not collect personal information from anyone, including children under 13.

#### Changes to This Policy

We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy in this location.

#### Contact

If you have questions about this privacy policy, please contact:

**[YOUR_EMAIL_ADDRESS]**

*Replace [YOUR_EMAIL_ADDRESS] with your actual contact email before hosting.*

---

## App Privacy Questionnaire Answers

*For App Store Connect > App Privacy section*

### Data Types Collected

| Question | Answer |
|----------|--------|
| Does your app collect any data from users? | **No** |

**Result:** Your app will display "Data Not Collected" label in the App Store.

### Data Collection Details

Since "No" was selected for data collection, no further questions about data types, linking, or tracking are required.

### Third-Party SDK Analysis

| SDK / Library | Collects Data? | Notes |
|---------------|----------------|-------|
| expo | No | Core framework, no data collection |
| expo-router | No | Navigation, local only |
| react-native-reanimated | No | Animations, local only |
| expo-audio | No | Sound effects, local only |
| expo-image | No | Image display, local only |
| @shopify/flash-list | No | List rendering, local only |
| react-native-view-shot | No | Screenshot generation, local only |
| expo-sharing | No | Native share sheet, no SDK data collection |
| @react-native-async-storage/async-storage | No | Local storage only |

**Verification:** None of the dependencies used transmit data to external servers.

---

## Required Reason API Declaration

*Already configured in app.json*

### NSUserDefaults (AsyncStorage)

| Field | Value |
|-------|-------|
| API Category | NSPrivacyAccessedAPICategoryUserDefaults |
| Reason Code | CA92.1 |
| Reason Description | Access info from inside the app's container |

**Important:** This is a technical declaration required by Apple since May 2024. It declares that the app uses device storage (NSUserDefaults via AsyncStorage) for storing app data locally. This is NOT the same as data collection - no data leaves the device.

### Configuration in app.json

```json
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

---

## Data Practices Verification Checklist

*Verify before submission*

- [ ] No analytics SDKs installed (expo-analytics, Firebase Analytics, etc.)
- [ ] No crash reporting that transmits data off-device
- [ ] No advertising SDKs
- [ ] No third-party login (Google, Apple, Facebook)
- [ ] AsyncStorage only stores quiz progress locally
- [ ] No network calls to external data collection endpoints
- [ ] No device identifiers (IDFA, IDFV) accessed for tracking
- [ ] All dependencies reviewed for data collection (see SDK table above)

---

## Privacy Policy Hosting Options

You need to host the privacy policy at a publicly accessible URL.

### Option 1: GitHub Pages (Free, Recommended)

1. Create a new GitHub repository or use existing
2. Add `privacy-policy.md` or `privacy-policy.html` file
3. Enable GitHub Pages in repository settings
4. URL format: `https://yourusername.github.io/repo-name/privacy-policy`

### Option 2: Personal Website

1. Upload privacy policy to your existing domain
2. URL format: `https://yoursite.com/medtriad/privacy`

### Option 3: GitHub Gist

1. Create a public gist with privacy policy content
2. URL format: `https://gist.github.com/yourusername/gistid`
3. Note: Less professional appearance but functional

### What to Enter in App Store Connect

**Privacy Policy URL field:** Enter the URL where you hosted the policy

**In-App Settings:** The app already has a Settings screen where you can add a "Privacy Policy" link (optional but recommended).

---

## Summary

| Aspect | Status |
|--------|--------|
| Personal data collection | None |
| Data transmission | None (offline only) |
| Third-party analytics | None |
| Third-party advertising | None |
| User accounts | None |
| Cloud sync | None |
| Privacy manifest | Configured (CA92.1 for AsyncStorage) |
| Expected App Store label | "Data Not Collected" |

---

*This document prepared for MedTriad App Store submission - January 2026*
