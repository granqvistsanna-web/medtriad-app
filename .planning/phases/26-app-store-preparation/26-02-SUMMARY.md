---
phase: 26-app-store-preparation
plan: 02
subsystem: docs
tags: [app-store, privacy-policy, metadata, keywords, age-rating]

# Dependency graph
requires:
  - phase: 26-01
    provides: App Store configuration (app.json, eas.json, privacy manifest)
provides:
  - Privacy policy content ready for hosting
  - App Privacy questionnaire answers for App Store Connect
  - App Store description and keywords
  - Category and age rating documentation
affects: [26-03 (screenshot plan and release checklist)]

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created:
    - .planning/phases/26-app-store-preparation/PRIVACY_SUMMARY.md
    - .planning/phases/26-app-store-preparation/APP_STORE_METADATA.md
  modified: []

key-decisions:
  - "Privacy label: Data Not Collected (no analytics, no tracking, local storage only)"
  - "Primary category: Medical (targets healthcare audience)"
  - "Secondary category: Education (broader discoverability)"
  - "Age rating: 12+ or 17+ expected (due to Medical/Treatment Information)"
  - "Keywords: 94 chars focused on medical education terms"

patterns-established:
  - "Documentation-as-submission-prep: All metadata in markdown for copy-paste"
  - "Placeholder pattern: [YOUR_EMAIL] style for user-specific values"

# Metrics
duration: 2min
completed: 2026-01-20
---

# Phase 26 Plan 02: App Store Metadata & Privacy Summary

**Privacy policy with Data Not Collected label, App Store description with Medical/Education categories, and 94-char keyword set**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-20T20:27:05Z
- **Completed:** 2026-01-20T20:29:01Z
- **Tasks:** 2
- **Files modified:** 2 (created)

## Accomplishments

- Privacy policy content ready for hosting at user's chosen URL
- App Privacy questionnaire documented with "Data Not Collected" outcome
- App Store description highlighting quiz modes and progression system
- Keywords optimized for medical education search terms (94 chars)
- Category selection documented (Medical primary, Education secondary)
- Age rating questionnaire answers complete for 12+/17+ rating

## Task Commits

Each task was committed atomically:

1. **Task 1: Create PRIVACY_SUMMARY.md** - `6a2e6f1` (docs)
2. **Task 2: Create APP_STORE_METADATA.md** - `569529b` (docs)

## Files Created

- `.planning/phases/26-app-store-preparation/PRIVACY_SUMMARY.md` - Privacy policy text, App Privacy questionnaire answers, Required Reason API declaration, third-party SDK analysis, hosting options
- `.planning/phases/26-app-store-preparation/APP_STORE_METADATA.md` - App name, subtitle, description, keywords, category selection, age rating questionnaire, support URL placeholders, version release notes

## Decisions Made

1. **Privacy label: Data Not Collected** - App uses only AsyncStorage for local data, no analytics or tracking SDKs, no user accounts, no cloud sync
2. **Primary category: Medical** - Targets healthcare professionals/students, less competition than Education
3. **Secondary category: Education** - Captures broader audience searching for learning apps
4. **Age rating: Medical/Treatment Information marked as Frequent/Intense** - Expected 12+ or 17+ rating based on Apple's algorithm
5. **Keywords: Focus on long-tail terms** - medical, triad, quiz, flashcards, clinical, nursing, USMLE, boards, study, diagnosis, symptoms, anatomy, exam (94 characters)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**User must complete these before App Store submission:**

1. Replace `[YOUR_EMAIL_ADDRESS]` in privacy policy with actual contact email
2. Host privacy policy at a publicly accessible URL (GitHub Pages recommended)
3. Replace `[YOUR_SUPPORT_URL]` with actual support URL
4. Replace `[YOUR_NAME_OR_COMPANY]` with copyright holder name
5. Verify "MedTriad" name availability in App Store Connect

## Next Phase Readiness

**Ready for 26-03:**
- Privacy policy content complete - user needs to host it
- App Store metadata ready for copy-paste into App Store Connect
- Next plan will add Privacy Policy link to Settings screen and create SCREENSHOT_PLAN.md

**Requirements satisfied:**
- AS-03: Privacy policy content ready (user hosts at URL)
- AS-04: App Privacy questionnaire answers documented
- AS-05: App Store description and keywords finalized
- AS-06: Category (Medical/Education) and age rating (12+/17+) determined
- AS-09: PRIVACY_SUMMARY.md documenting data practices - complete

---
*Phase: 26-app-store-preparation*
*Completed: 2026-01-20*
