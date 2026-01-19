# MedTriads Design System

Quick reference for design tokens and motion patterns.

## Color Palette

### Primary

| Token | Value | Usage |
|-------|-------|-------|
| primary | #4ECDC4 | Brand color, buttons, links |
| primaryDark | #3BA99C | Button borders, pressed states |
| primaryLight | #E6FAF8 | Badges, highlights |

### Backgrounds

| Token | Value | Usage |
|-------|-------|-------|
| background | #FFFFFF | Page backgrounds |
| backgroundSecondary | #F8F9FA | Cards, sections |
| backgroundCard | #FFFFFF | Elevated cards |

### Text

| Token | Value | Usage |
|-------|-------|-------|
| text | #2D3436 | Primary text |
| textSecondary | #636E72 | Secondary text |
| textMuted | #B2BEC3 | Hints, captions |
| textInverse | #FFFFFF | Text on primary |

### Borders

| Token | Value | Usage |
|-------|-------|-------|
| border | #DFE6E9 | Default borders |
| borderStrong | #B2BEC3 | Emphasized borders |

### Semantic

| Token | Value | Usage |
|-------|-------|-------|
| success | #00B894 | Correct answers |
| successBg | #D4F5ED | Success backgrounds |
| error | #E17055 | Wrong answers, errors |
| errorBg | #FFEAEA | Error backgrounds |

### Timer States

| Token | Value | Usage |
|-------|-------|-------|
| timerNormal | #4ECDC4 | >5 seconds |
| timerWarning | #FDCB6E | 3-5 seconds |
| timerDanger | #E17055 | <3 seconds |

---

## Spacing Scale (8pt Grid)

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tight gaps, icon margins |
| sm | 8px | Small gaps, padding |
| md | 12px | Medium gaps |
| base | 16px | Standard padding |
| lg | 24px | Section padding |
| xl | 32px | Large gaps |
| xxl | 48px | Major sections |
| xxxl | 64px | Hero spacing |

---

## Typography

| Style | Size | Weight | Usage |
|-------|------|--------|-------|
| display | 64 | 700 | Results score |
| title | 32 | 700 | Screen titles |
| titleLarge | 28 | 600 | App name |
| heading | 22 | 600 | Section headers |
| body | 18 | 500 | Content, findings |
| label | 17 | 600 | Button labels |
| stat | 20 | 700 | Stat values |
| caption | 15 | 400 | Secondary info |
| footnote | 13 | 400 | Small details |
| tiny | 11 | 600 | Category labels |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 8px | Small buttons |
| md | 12px | Cards, inputs |
| lg | 16px | Large cards |
| xl | 24px | Buttons |
| xxl | 32px | Modals |
| full | 9999px | Pills, avatars |

---

## Shadows

| Token | Offset | Opacity | Radius | Usage |
|-------|--------|---------|--------|-------|
| sm | 0, 1 | 0.06 | 3 | Subtle lift |
| md | 0, 4 | 0.08 | 12 | Cards |
| lg | 0, 8 | 0.12 | 24 | Modals, overlays |

---

## Mascot Sizes

| Token | Value | Usage |
|-------|-------|-------|
| sm | 56px | Inline, small UI |
| md | 80px | Cards, avatars |
| lg | 112px | Home screen |
| xl | 160px | Results, celebrations |

---

## Icons

All icons use SF Symbols via `IconSymbol` component (expo/symbols).

### Icon Sizes

| Size | Usage |
|------|-------|
| 14 | Tiny indicators |
| 16 | Small inline icons |
| 18 | Button icons |
| 20 | Standard UI icons |
| 22 | Emphasized icons |
| 32 | Large feature icons |

### Usage

```typescript
import { IconSymbol } from '@/components/ui/icon-symbol';

<IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
```

---

## Card Styling

Duolingo-inspired hard border treatment for all cards.

### CardStyle Pattern

```typescript
import { CardStyle } from '@/constants/theme';

// Spread into StyleSheet
const styles = StyleSheet.create({
  card: {
    ...CardStyle,
    padding: Spacing.base,
  },
});
```

### Properties

| Property | Value | Purpose |
|----------|-------|---------|
| backgroundColor | backgroundCard | White base |
| borderWidth | 2 | Visible border all around |
| borderColor | border | Subtle border |
| borderBottomWidth | 4 | Extra depth on bottom |
| borderBottomColor | borderStrong | Stronger bottom edge |
| borderRadius | Radius.lg (16) | Rounded corners |
| shadow | Shadows.light.sm | Subtle lift |

### Press Animation Pattern

For interactive cards, animate borderBottomWidth on press:

```typescript
const borderBottom = useSharedValue(4);

const handlePressIn = () => {
  borderBottom.value = withSpring(2, Easings.press);
};

const handlePressOut = () => {
  borderBottom.value = withSpring(4, Easings.press);
};
```

---

## Animation

### Durations

| Token | Value | Usage |
|-------|-------|-------|
| fast | 150ms | Quick feedback |
| normal | 300ms | Standard transitions |
| slow | 500ms | Deliberate reveals |
| slower | 800ms | Count-ups, celebrations |
| stagger | 50ms | List item delays |
| staggerMedium | 80ms | Dramatic reveals |

### Spring Presets (Easings)

| Preset | Damping | Stiffness | Usage |
|--------|---------|-----------|-------|
| press | 15 | 400 | Button press/release |
| bouncy | 10 | 300 | Playful reveals |
| gentle | 20 | 150 | Settle animations |
| pop | 8 | 400 | Celebration pops |

### Timing Easings

| Preset | Usage |
|--------|-------|
| easeOut | Exit animations, fades |
| easeInOut | Color transitions |
| easeOutBack | Overshoot entrances |

---

## Motion Principles

1. **Springs over timing** - Use withSpring for position/scale changes
2. **Easing on everything** - No linear motion
3. **Stagger grouped elements** - Build anticipation with delays
4. **Soft, weighted, physical** - Motion should feel real
5. **Nothing snaps** - Everything settles

### Entry Animation Pattern

```typescript
entering={FadeInUp.delay(N * Durations.stagger).duration(Durations.normal).springify()}
```

### Press Animation Pattern

```typescript
const handlePressIn = () => {
  scale.value = withSpring(0.98, Easings.press);
};

const handlePressOut = () => {
  scale.value = withSpring(1, Easings.press);
};
```

### Pop Effect Pattern

```typescript
scale.value = withSequence(
  withSpring(1.35, Easings.pop),   // Overshoot
  withSpring(1, Easings.gentle)    // Settle
);
```

---

## Common Mistakes

Antipatterns to avoid when building UI.

### Hardcoded Colors

```typescript
// Don't
backgroundColor: '#F0F2F4',

// Do
backgroundColor: Colors.light.backgroundSecondary,
```

### Magic Spacing Numbers

```typescript
// Don't
paddingHorizontal: 16,
gap: 8,

// Do
paddingHorizontal: Spacing.base,
gap: Spacing.sm,
```

### Custom Typography

```typescript
// Don't
fontSize: 14,
fontWeight: '400',

// Do
...Typography.caption,
```

### Soft Card Borders

```typescript
// Don't
borderWidth: 1,
borderColor: '#eee',

// Do
borderWidth: 2,
borderColor: Colors.light.border,
borderBottomWidth: 4,
borderBottomColor: Colors.light.borderStrong,
```

### Inline Shadows

```typescript
// Don't
shadowColor: '#000',
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 4,

// Do
...Shadows.light.sm,
```

---

*Generated: Phase 10 - Refine Visuals & Motion*
*Updated: Phase 17 - Design System Audit*
