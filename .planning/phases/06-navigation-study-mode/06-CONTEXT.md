# Phase 6: Navigation & Study Mode - Context

**Gathered:** 2026-01-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Tab-based navigation with four screens: Home (existing), Library (triad browsing), Progress (detailed stats/history), and Settings (toggles + share). This phase adds ways to explore triads, track detailed progress, and customize the app beyond the core quiz loop.

</domain>

<decisions>
## Implementation Decisions

### Tab bar design
- Icons + labels visible (standard iOS pattern)
- Active state: filled icon + tint color (standard iOS style)
- Position: bottom of screen (iOS standard)
- Hide tab bar during quiz for full-screen focus

### Library browsing
- Triads grouped by category (sections like Cardiology, Neurology)
- Categories collapsed by default — tap header to reveal triads
- Tap triad to expand inline (accordion-style, findings appear below condition name)
- Simple checkmark indicator for triads user has answered correctly

### Progress display
- Reset stats option lives in Settings, not Progress screen
- Progress screen is display-only

### Settings & Share
- iOS native switches for sound/haptic toggles
- Share button in Settings screen only (not Home)
- About section with version number included
- Reset stats option with confirmation dialog

### Claude's Discretion
- Top stats layout for Progress screen (accuracy, streak, high score arrangement)
- Category breakdown visualization (bars vs list with percentages)
- Quiz history format (recent rounds list vs full scrollable history)
- Share text content (link only vs link + description)
- Exact icon choices for tab bar items
- Spacing, typography, and visual polish

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. The app should feel native iOS throughout.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-navigation-study-mode*
*Context gathered: 2026-01-18*
