# Phase 9: UI Polish - Research

**Researched:** 2026-01-18
**Domain:** React Native styling consistency, design system application
**Confidence:** HIGH

## Summary

Phase 9 focuses on propagating the Home screen's polished visual patterns to Library, Progress, Settings, and Quiz screens. The Home screen establishes a clear design language with specific spacing (`Spacing.lg` horizontal padding), animation patterns (FadeInUp with stagger), card styles (shadows, radius, background colors), and section header patterns.

The existing theme system in `/constants/theme.ts` is comprehensive with well-defined Typography, Spacing, Radius, Shadows, and Colors tokens. The work is about **consistent application** of these tokens, not creating new ones.

**Primary recommendation:** Create shared patterns (Section headers, Card containers, Page layouts) that encapsulate the Home screen's visual language, then refactor each screen to use these patterns.

## 1. Home Screen Patterns (The Reference)

### Page Layout Pattern
```typescript
// Home screen layout structure
<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
  <ScrollView
    style={{ flex: 1 }}
    contentContainerStyle={{
      paddingHorizontal: Spacing.lg,    // 24px - CONSISTENT
      paddingTop: Spacing.md,           // 12px
      paddingBottom: Spacing.xxl,       // 48px
      gap: Spacing.lg,                  // 24px between sections
    }}
    showsVerticalScrollIndicator={false}
  >
    {/* Content */}
  </ScrollView>
</SafeAreaView>
```

### Section Header Pattern (from StatsGrid)
```typescript
// Uppercase label with decorative line
<View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
  <Text style={[Typography.tiny, { color: colors.textMuted, letterSpacing: 1 }]}>
    SECTION TITLE
  </Text>
  <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
</View>
```

### Card Pattern (from StatsGrid StatCard)
```typescript
// Elevated card with soft shadow
{
  backgroundColor: colors.backgroundSecondary,  // #F8F9FA
  borderRadius: Radius.lg,                      // 16px
  padding: Spacing.base,                        // 16px
  gap: Spacing.xs,                              // 4px
  ...Shadows.light.sm,                          // Subtle elevation
}
```

### Hero Card Pattern (gradient card)
```typescript
// Full-width feature card
{
  borderRadius: Radius.xl,        // 24px
  paddingVertical: Spacing.xl,    // 32px
  paddingHorizontal: Spacing.lg,  // 24px
  gap: Spacing.md,                // 12px
  // LinearGradient with primaryLight colors
}
```

### Animation Pattern
```typescript
// Entry animation with stagger
entering={FadeInUp.delay(delay).duration(Durations.normal).springify()}
// Stagger interval: Durations.stagger (50ms)
```

### Typography Usage
| Element | Style | Color |
|---------|-------|-------|
| Page title | Typography.titleLarge | colors.text |
| Section header | Typography.tiny + uppercase + letterSpacing: 1 | colors.textMuted |
| Card label | Typography.tiny + uppercase + letterSpacing: 0.5 | colors.textMuted |
| Card value | fontSize: 28, fontWeight: 700 | colors.text |
| Card description | Typography.footnote | colors.textMuted |

## 2. Library Screen Analysis (Gaps vs Home)

**Current file:** `/medtriad/app/(tabs)/library.tsx`

### Current State
- Uses `Spacing.base` (16px) horizontal padding instead of `Spacing.lg` (24px)
- No top padding on content
- Title uses `Typography.title` (different from Home's `titleLarge`)
- No section headers like Home's "YOUR PROGRESS" pattern
- No entry animations

### Gaps to Fix

| Gap | Current | Home Standard |
|-----|---------|---------------|
| Horizontal padding | `Spacing.base` (16px) | `Spacing.lg` (24px) |
| Top padding | None | `Spacing.md` (12px) |
| Title style | `Typography.title` (32px, bold) | Could use `titleLarge` (28px, semibold) for consistency |
| Title margin | `marginTop: Spacing.md` | Should be part of scrollContent padding |
| Section gap | None | `gap: Spacing.lg` |
| Animations | None | FadeInUp with stagger |

### CategorySection Component Analysis
**File:** `/medtriad/components/library/CategorySection.tsx`

- Uses `Spacing.sm` (8px) margin bottom - acceptable
- Header uses `Radius.sm` (8px) - should consider `Radius.md` (12px) for consistency
- Category name uses `Typography.heading` - appropriate
- Accordion animation is good

### TriadItem Component Analysis
**File:** `/medtriad/components/library/TriadItem.tsx`

- Styling is reasonable
- Uses theme tokens correctly
- No major gaps

### Recommended Changes
1. Update Library screen `paddingHorizontal` to `Spacing.lg`
2. Add `paddingTop: Spacing.md`
3. Add entry animation to CategorySections (staggered FadeInUp)
4. Consider adding a section header like "10 CATEGORIES" above the list

## 3. Progress Screen Analysis (Gaps vs Home)

**Current file:** `/medtriad/app/(tabs)/progress.tsx`

### Current State
- Uses `Spacing.base` (16px) horizontal padding
- Uses `marginTop: Spacing.lg` on title (different from Home)
- StatsCard uses `Shadows.light.sm` but not backgroundSecondary
- No section headers
- No entry animations

### Gaps to Fix

| Gap | Current | Home Standard |
|-----|---------|---------------|
| Horizontal padding | `Spacing.base` (16px) | `Spacing.lg` (24px) |
| Top padding | None | `Spacing.md` (12px) |
| Title margin | `marginTop: Spacing.lg` | Should be padding from container |
| StatsCard bg | `colors.backgroundCard` (#FFFFFF) | `colors.backgroundSecondary` (#F8F9FA) |
| Grid gap | `Spacing.md` | `Spacing.sm` (Home StatCard grid) |
| Section headers | None | "HIGH SCORES" / "RECENT QUIZZES" |
| Animations | None | FadeInUp with stagger |

### StatsCard Component Analysis
**File:** `/medtriad/components/progress/StatsCard.tsx`

- Uses `Radius.md` (12px) - could use `Radius.lg` (16px) like Home
- Uses centered layout - differs from Home's left-aligned cards
- Missing: description text below value (Home has this)

### QuizHistoryList Component Analysis
**File:** `/medtriad/components/progress/QuizHistoryList.tsx`

- Title uses `Typography.heading` - appropriate
- Row styling is reasonable
- Missing section header pattern (uppercase with line)

### Recommended Changes
1. Update screen `paddingHorizontal` to `Spacing.lg`
2. Add `paddingTop: Spacing.md`
3. Change StatsCard:
   - Background to `colors.backgroundSecondary`
   - Radius to `Radius.lg`
   - Left-align content with label on top, value large, description below
4. Add section headers: "YOUR STATS" and "RECENT QUIZZES"
5. Add entry animations (FadeInUp with stagger)

## 4. Settings Screen Analysis (Gaps vs Home)

**Current file:** `/medtriad/app/(tabs)/settings.tsx`

### Current State
- Uses `Spacing.base` (16px) horizontal padding
- Section headers already use uppercase pattern with letterSpacing
- Section cards use border instead of shadow
- Title margin `marginTop: Spacing.lg`

### Gaps to Fix

| Gap | Current | Home Standard |
|-----|---------|---------------|
| Horizontal padding | `Spacing.base` (16px) | `Spacing.lg` (24px) |
| Top padding | None | `Spacing.md` (12px) |
| Section header | Standalone text | Text + line pattern |
| Section card | Border-based | Shadow-based (or keep border, it's valid iOS pattern) |
| Animations | None | FadeInUp with stagger |

### ToggleRow / SettingsRow Analysis
**Files:** `/medtriad/components/settings/ToggleRow.tsx`, `SettingsRow.tsx`

- Styling is clean and follows iOS conventions
- Uses correct theme tokens
- Row height 44px (iOS minimum) - good

### Recommended Changes
1. Update screen `paddingHorizontal` to `Spacing.lg`
2. Add `paddingTop: Spacing.md`
3. Update section headers to include the decorative line (like Home's "YOUR PROGRESS")
4. Add entry animations (FadeInUp with stagger per section)
5. **Optional:** Consider shadow-based sections instead of border (or keep border - both are valid)

## 5. Quiz Screen Analysis (Gaps vs Home)

**Current file:** `/medtriad/app/quiz/index.tsx`

### Current State
- Uses `Spacing.base` (16px) horizontal padding in main area
- Header uses `Spacing.base` padding
- Has animations (good!)
- FindingsCard uses shadows and radius correctly

### Gaps to Fix

| Gap | Current | Home Standard |
|-----|---------|---------------|
| Main horizontal padding | `Spacing.base` (16px) | `Spacing.lg` (24px) |
| Answer card height | 48px | Consider 56px (like Button) |
| AnswerCard border | 2-3px borders | Could use shadow instead |
| Button consistency | Custom borders | Use Button component style |

### FindingsCard Analysis
**File:** `/medtriad/components/quiz/FindingsCard.tsx`

- Uses `Radius.lg` (16px) - correct
- Uses `Shadows.light.md` - correct
- Category typography could be `Typography.tiny` with `letterSpacing: 1` (currently letterSpacing: 1.5)

### AnswerCard Analysis
**File:** `/medtriad/components/quiz/AnswerCard.tsx`

- Height 48px - could be 52-56px for easier tapping
- Uses `Radius.md` (12px) - correct
- Border-based feedback states are clear
- Text size 15px with Typography.label

### CancelButton Analysis
**File:** `/medtriad/components/quiz/CancelButton.tsx`

- Uses TouchableOpacity instead of Pressable (inconsistent)
- Simple and functional
- Could add hitSlop consistently

### Results Screen Analysis
**File:** `/medtriad/app/quiz/results.tsx`

- Uses `Spacing.lg` padding - correct!
- Uses Typography correctly
- Uses Button component - good
- Well-aligned with Home patterns

### Recommended Changes
1. Update quiz main area `paddingHorizontal` to `Spacing.lg`
2. **Optional:** Increase AnswerCard height to 52px for easier tapping
3. Update CancelButton to use Pressable for consistency
4. Consider using `Typography.tiny` letterSpacing: 1 in FindingsCard category

## 6. Theme Tokens Available

### Colors (from theme.ts)
```typescript
// Backgrounds
background: '#FFFFFF',
backgroundSecondary: '#F8F9FA',
backgroundCard: '#FFFFFF',

// Text
text: '#2D3436',
textSecondary: '#636E72',
textMuted: '#B2BEC3',
textInverse: '#FFFFFF',

// Primary (teal)
primary: '#4ECDC4',
primaryDark: '#3BA99C',
primaryLight: '#E6FAF8',

// Semantic
success: '#00B894',
successBg: '#D4F5ED',
error: '#E17055',
errorBg: '#FFEAEA',

// Borders
border: '#DFE6E9',
```

### Typography (from theme.ts)
```typescript
display:    { fontSize: 64, fontWeight: '700' }  // Results score
title:      { fontSize: 32, fontWeight: '700' }  // Screen titles
titleLarge: { fontSize: 28, fontWeight: '600' }  // Greeting
heading:    { fontSize: 22, fontWeight: '600' }  // Section headers
body:       { fontSize: 18, fontWeight: '500' }  // Content
label:      { fontSize: 17, fontWeight: '600' }  // Buttons
stat:       { fontSize: 20, fontWeight: '700' }  // Stats values
caption:    { fontSize: 15, fontWeight: '400' }  // Secondary info
footnote:   { fontSize: 13, fontWeight: '400' }  // Small details
tiny:       { fontSize: 11, fontWeight: '600' }  // Category labels
```

### Spacing (8px base)
```typescript
xs:   4,
sm:   8,
md:   12,
base: 16,
lg:   24,
xl:   32,
xxl:  48,
xxxl: 64,
```

### Radius
```typescript
sm:   8,
md:   12,
lg:   16,
xl:   24,
xxl:  32,
full: 9999,
```

### Shadows
```typescript
sm: { shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
md: { shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
lg: { shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 },
```

## 7. Key Implementation Notes

### Pattern 1: Consistent Page Container
Create or document this standard layout:
```typescript
const pageStyles = {
  scrollContent: {
    paddingHorizontal: Spacing.lg,    // 24px - ALL screens
    paddingTop: Spacing.md,           // 12px
    paddingBottom: Spacing.xxl,       // 48px
    gap: Spacing.lg,                  // 24px between sections
  },
};
```

### Pattern 2: Section Header with Line
Reuse across Progress, Settings, Library:
```typescript
function SectionHeader({ title }: { title: string }) {
  const colors = Colors.light;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
      <Text style={[Typography.tiny, {
        color: colors.textMuted,
        letterSpacing: 1,
        textTransform: 'uppercase',
      }]}>
        {title}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
    </View>
  );
}
```

### Pattern 3: Elevated Card
Standard card styling:
```typescript
const cardStyles = {
  backgroundColor: colors.backgroundSecondary,
  borderRadius: Radius.lg,
  padding: Spacing.base,
  ...Shadows.light.sm,
};
```

### Pattern 4: Entry Animation
Standard animation config:
```typescript
entering={FadeInUp.delay(index * Durations.stagger).duration(Durations.normal).springify()}
```

### Order of Changes (Recommended)
1. **Library screen** - Simplest, just padding and animations
2. **Settings screen** - Add section header pattern
3. **Progress screen** - StatsCard redesign, section headers
4. **Quiz screen** - Minor padding adjustment

### Do NOT Change
- Button component (already polished)
- Results screen (already well-aligned)
- Animation timing values
- Color palette
- Typography scale

## Common Pitfalls

### Pitfall 1: Inconsistent Padding
**What goes wrong:** Each screen uses different horizontal padding
**Prevention:** Always use `Spacing.lg` (24px) for screen horizontal padding

### Pitfall 2: Title Positioning
**What goes wrong:** Some screens use margin on title, others use padding in container
**Prevention:** Use container padding only, no margin on title

### Pitfall 3: Section Header Inconsistency
**What goes wrong:** Some use plain text, some use uppercase + line
**Prevention:** Create shared SectionHeader component or document pattern

### Pitfall 4: Animation Overkill
**What goes wrong:** Adding too many or conflicting animations
**Prevention:** Only add FadeInUp to top-level sections, not every element

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `/medtriad/app/(tabs)/index.tsx` (Home screen)
- Codebase analysis: `/medtriad/constants/theme.ts` (Design tokens)
- Codebase analysis: `/medtriad/components/home/` (Home components)

### Secondary (MEDIUM confidence)
- Codebase analysis: All target screens and their components

## Metadata

**Confidence breakdown:**
- Home screen patterns: HIGH - Direct code analysis
- Gap analysis: HIGH - Direct comparison
- Recommended changes: HIGH - Based on observable patterns

**Research date:** 2026-01-18
**Valid until:** Indefinite (internal codebase analysis)
