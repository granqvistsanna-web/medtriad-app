# User-Provided Research: v2.1

**Compiled:** 2026-01-20

This research was provided by the user during milestone initialization and informs the v2.1 implementation.

---

## Challenge Feature Implementation

**Key approach:** Encoded URL challenges with deep links for future App Store release.

**Current v2.1 scope:** Simple share card with competitive messaging (app not live yet).

**Future considerations:**
- Encoded payload in URL: `myapp://challenge/<payload>` or `https://myapp.com/challenge/<payload>`
- Payload format: compact JSON, base64url encoded
- Firebase Dynamic Links for cross-platform linking
- Web Share API for PWA-compatible sharing

**UX Flow (future):**
1. After results: "Challenge a friend"
2. Share sheet opens with link + text
3. Receiving link opens challenge screen with target score
4. After attempt: compare local score vs target

---

## iOS App Store Submission (2026)

**Required assets:**
- 1024x1024 app icon for App Store Connect
- Screenshots for each device type (iPhone 6.7" etc.)
- App previews (optional video)

**Privacy requirements:**
- Privacy policy URL (required)
- App Privacy Questionnaire for "nutrition label"
- Disclose all data collection including third-party SDKs

**Framework compliance:**
- Must behave like native app, not just web wrapper
- Use WKWebView (UIWebView disallowed)
- Cannot download and execute new code post-release
- Follow Human Interface Guidelines

**Key guidelines:**
- 4.2 Minimum Functionality: elevate beyond repackaged website
- 2.4.2: don't drain battery/memory excessively
- 1.2 User Generated Content: moderation if applicable

---

## Quiz-Based Learning Design

**Study Mode principles:**
- Untimed practice removes pressure
- Focus on learning, not racing
- Indicate clearly when quiz is untimed

**Retention through spaced repetition:**
- Duolingo fades completed skills to prompt review
- Spacing effect improves memory retention
- "Review quiz" buttons for old topics

**Adaptive difficulty:**
- Keep challenge "just right"
- If acing: introduce harder questions
- If struggling: serve easier questions
- Zone of proximal development

**Immediate feedback:**
- Show whether correct and explain why
- "Incorrect - the right answer is X because..."
- Green checkmark / red highlight

**Gamification:**
- Points, streaks, badges
- Progress bar, leveling system
- Celebratory animations
- De-emphasize scores in study mode to reduce stress

---

## UI Consistency & Design Systems

**Unified visual language:**
- Duolingo uses simple geometric shapes consistently
- Custom fonts and vibrant color palette
- Immediately recognizable interface

**Iconography:**
- Use one icon family (e.g., Solar Icons Bold)
- Consistent icon sizing and alignment
- Same stroke weight throughout

**Feedback animations:**
- Positive reinforcement on correct answers
- Micro-animations direct attention
- Quick shake on wrong, confetti on completion

**Component reuse:**
- Design system with reusable components
- Standard patterns for cards, buttons, progress
- Changes to master propagate throughout

**Figma handoff:**
- Clear naming matching code
- Components and Variants for states
- Style Guide page with tokens
- Annotate responsive behavior

---

## Solar Icons Integration

- Cross-platform: Figma, React, React Native, Vue
- Choose one style (Bold, Linear, Outline) and use universally
- Standardized sizes: 16px, 20px, 24px
- Align with text baselines and button shapes
