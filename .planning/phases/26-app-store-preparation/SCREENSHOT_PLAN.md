# MedTriad Screenshot Plan

## Required Device Size

**Mandatory for App Store submission:**

| Display Size | Resolution (Portrait) | Device Reference |
|-------------|----------------------|------------------|
| **6.9"** | **1260 x 2736 pixels** | iPhone 16 Pro Max, 15 Pro Max, 14 Pro Max |

This is the only mandatory size. Smaller devices auto-scale from this screenshot.

## Recommended Screenshots

5-6 screenshots showing key features in order of importance:

| # | Screen | What to Show | Why It Matters |
|---|--------|--------------|----------------|
| 1 | Home | Mascot at interesting tier (Resident+), category mastery rings, daily goal | First impression, shows gamification and progress system |
| 2 | Quiz Question | Active question with 3 answer options visible | Core experience - what users will do most |
| 3 | Correct Answer | Green success state with checkmark, explanation visible | Shows quality feedback and learning value |
| 4 | Results | Score display, tier progress bar, share button | Achievement and progression |
| 5 | Library | Category cards with search bar visible | Content depth - shows variety of triads |
| 6 | Study Mode | Blue-themed UI, explanation expanded, tricky bookmark | Learning feature - distinguishes from pure quiz |

## Screenshot Setup

### Ideal App State for Screenshots

Before capturing, set up the app with realistic progress:

- **Tier:** Resident or Attending (visually interesting mascot)
- **Statistics:** ~100 quizzes completed, 75% accuracy
- **Daily Goal:** Show progress ring at ~60%
- **Category Mastery:** Mix of strong and weak categories

### Capture Process

```bash
# 1. Boot the correct simulator
xcrun simctl boot "iPhone 16 Pro Max"

# 2. Open simulator app
open -a Simulator

# 3. Run app in production mode (no dev tools visible)
cd medtriad && npx expo start --no-dev

# 4. Capture screenshots
# Option A: Simulator menu - File > Save Screen (Cmd+S)
# Option B: CLI command for each screenshot:
xcrun simctl io booted screenshot ~/Desktop/screenshot-1-home.png
xcrun simctl io booted screenshot ~/Desktop/screenshot-2-quiz.png
xcrun simctl io booted screenshot ~/Desktop/screenshot-3-correct.png
xcrun simctl io booted screenshot ~/Desktop/screenshot-4-results.png
xcrun simctl io booted screenshot ~/Desktop/screenshot-5-library.png
xcrun simctl io booted screenshot ~/Desktop/screenshot-6-study.png
```

## Screenshot Checklist

Before uploading to App Store Connect:

- [ ] Resolution is exactly 1260 x 2736 pixels
- [ ] Status bar shows realistic time (not 9:41 or carrier text)
- [ ] No debug overlays or dev menus visible
- [ ] No placeholder text (lorem ipsum, TBD, TODO)
- [ ] Data looks realistic (good stats, interesting tier)
- [ ] App name displays correctly in any visible headers
- [ ] Colors and contrast look good (no washed out areas)

## Post-Capture Options

### Option 1: Direct Upload
Upload clean screenshots directly to App Store Connect. Simple and authentic.

### Option 2: Device Frames
Add iPhone device frames around screenshots using:
- Figma (free template available)
- Apple Marketing Resources (official frames)
- Screenshot Builder tools

### Option 3: Marketing Text Overlay
Add promotional text above/below screenshots:
- "Master Medical Triads"
- "Track Your Progress"
- "Learn, Not Just Quiz"

**Recommendation:** Start with Option 1 (direct upload). Add frames/text only if conversion seems low after launch.

## File Naming Convention

```
medtriad-screenshot-{number}-{screen}.png

Examples:
medtriad-screenshot-1-home.png
medtriad-screenshot-2-quiz.png
medtriad-screenshot-3-correct.png
medtriad-screenshot-4-results.png
medtriad-screenshot-5-library.png
medtriad-screenshot-6-study.png
```

## Storage Location

Store final screenshots in:
```
medtriad/assets/app-store/
  screenshots/
    6.9-inch/
      medtriad-screenshot-1-home.png
      medtriad-screenshot-2-quiz.png
      ...
```

Note: This directory should be created before capture and excluded from version control (.gitignore) to avoid large binary files in the repository.

---

*Created: 2026-01-20*
*Reference: Apple Screenshot Specifications (https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications)*
