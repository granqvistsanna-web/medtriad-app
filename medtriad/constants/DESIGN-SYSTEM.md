# MedTriads Design System

Complete reference for design tokens, primitive components, and usage patterns.

**Version:** 2.1 (Phase 22 - Design System Application)

---

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Primitive Components](#primitive-components)
3. [Icon System](#icon-system)
4. [Migration Guide](#migration-guide)
5. [Documented Exceptions](#documented-exceptions)
6. [Common Mistakes](#common-mistakes)

---

## Design Tokens

The design system uses a three-layer token architecture:

1. **Raw Tokens** (`constants/tokens/*.ts`) - Base values (colors, sizes)
2. **Semantic Theme** (`constants/theme.ts`) - Contextual meanings
3. **Components** (`components/primitives/*`) - Ready-to-use UI

### Colors

#### Semantic Theme Structure

```typescript
import { theme } from '@/constants/theme';

theme.colors.surface   // Background colors
theme.colors.text      // Text colors
theme.colors.brand     // Brand identity
theme.colors.success   // Success/correct states
theme.colors.warning   // Warning states
theme.colors.danger    // Error/danger states
theme.colors.border    // Border colors
theme.colors.gold      // Achievement colors
theme.colors.streak    // Streak/fire colors
theme.colors.blue      // Info/teal colors
theme.colors.purple    // Purple accent
theme.colors.timer     // Timer state colors
theme.colors.icon      // Icon colors
```

#### Surface Colors

| Token | Value | Usage |
|-------|-------|-------|
| `surface.primary` | #FFFFFF | Main page backgrounds |
| `surface.secondary` | #F7F7F7 | Secondary backgrounds |
| `surface.card` | #FFFFFF | Card backgrounds |
| `surface.brand` | #F8E8EE | Light wine brand background |
| `surface.brandSubtle` | #FCF5F8 | Ultra-light wine |

#### Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `text.primary` | #3C3C3C | Primary text |
| `text.secondary` | #777777 | Secondary text |
| `text.muted` | #AFAFAF | Muted/hint text |
| `text.inverse` | #FFFFFF | Text on dark backgrounds |
| `text.brand` | #4A1230 | Brand-colored text |

#### Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `brand.primary` | #8B2252 | Primary brand (wine) |
| `brand.primaryDark` | #6B1A3F | 3D depth/shadow |
| `brand.primaryDarker` | #4A1230 | Strong accent |
| `brand.accent` | #FFE8EE | Light pink accent |

#### Success Colors

| Token | Value | Usage |
|-------|-------|-------|
| `success.main` | #58CC02 | Correct answers |
| `success.dark` | #46A302 | 3D depth |
| `success.darker` | #16A34A | Deeper 3D borders |
| `success.light` | #E5F9DB | Success background |
| `success.text` | #3D8B00 | Success text |

#### Danger Colors

| Token | Value | Usage |
|-------|-------|-------|
| `danger.main` | #FF4B4B | Errors/incorrect |
| `danger.dark` | #EA2B2B | 3D depth |
| `danger.darker` | #DC2626 | Deeper 3D borders |
| `danger.light` | #FFE5E5 | Error background |

#### Gold Colors (Achievements)

| Token | Value | Usage |
|-------|-------|-------|
| `gold.main` | #F5B800 | XP, achievements |
| `gold.dark` | #D4A000 | 3D depth |
| `gold.light` | #FFF8E1 | Gold background |
| `gold.text` | #996600 | Gold text |

#### Streak Colors

| Token | Value | Usage |
|-------|-------|-------|
| `streak.main` | #FF6B6B | Streak flame |
| `streak.dark` | #E85555 | 3D depth |
| `streak.light` | #FFE8E8 | Streak background |
| `streak.text` | #C44545 | Streak text |

#### Border Colors

| Token | Value | Usage |
|-------|-------|-------|
| `border.default` | #E5E5E5 | Standard borders |
| `border.strong` | #CDCDCD | 3D depth borders |

#### Timer Colors

| Token | Value | Usage |
|-------|-------|-------|
| `timer.normal` | #8B2252 | Normal time |
| `timer.warning` | #FF9500 | Warning (< 5s) |
| `timer.danger` | #FF4B4B | Danger (< 2s) |

---

### Typography

Font: **Figtree** (Google Font)

#### Font Families

```typescript
import { fontFamily } from '@/constants/tokens/typography';

fontFamily.regular   // Figtree_400Regular
fontFamily.medium    // Figtree_500Medium
fontFamily.semibold  // Figtree_600SemiBold
fontFamily.bold      // Figtree_700Bold
fontFamily.extrabold // Figtree_800ExtraBold
```

#### Typography Variants

| Variant | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| `display` | 64px | Bold | 64px | Results score |
| `title` | 32px | Bold | 38px | Screen titles |
| `titleLarge` | 28px | SemiBold | 34px | App name |
| `heading` | 22px | SemiBold | 28px | Section headers |
| `body` | 18px | Medium | 26px | Body text, findings |
| `label` | 17px | SemiBold | 22px | Button labels |
| `stat` | 24px | ExtraBold | 28px | Stats values |
| `caption` | 15px | Regular | 20px | Secondary info |
| `footnote` | 13px | Regular | 18px | Small details |
| `tiny` | 11px | SemiBold | 14px | Category labels |

---

### Spacing

8px grid system with smaller increments for fine control.

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight inline spacing |
| `sm` | 8px | Small gaps |
| `md` | 12px | Medium gaps |
| `base` | 16px | Standard padding |
| `lg` | 24px | Large sections |
| `xl` | 32px | Extra large |
| `xxl` | 48px | Page-level spacing |
| `xxxl` | 64px | Hero sections |

```typescript
import { theme } from '@/constants/theme';

paddingHorizontal: theme.spacing.base,  // 16px
gap: theme.spacing.sm,                   // 8px
```

---

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 8px | Small elements, badges |
| `md` | 12px | Medium elements, buttons |
| `lg` | 16px | Cards, containers |
| `xl` | 24px | Large containers |
| `xxl` | 32px | Extra large |
| `full` | 9999px | Pills, circles |

```typescript
borderRadius: theme.radius.lg,  // 16px
```

---

### Shadows

Platform-aware shadow definitions (iOS uses shadow*, Android uses elevation).

| Token | Usage |
|-------|-------|
| `sm` | Subtle depth |
| `md` | Standard cards |
| `lg` | Elevated modals |

```typescript
...theme.shadows.md,  // Spread shadow props
```

---

### Motion

#### Durations

| Token | Value | Usage |
|-------|-------|-------|
| `fast` | 150ms | Quick feedback |
| `normal` | 300ms | Standard transitions |
| `slow` | 500ms | Deliberate animations |
| `slower` | 800ms | Score count-ups |
| `stagger` | 50ms | List item delays |
| `staggerMedium` | 80ms | Celebratory reveals |

#### Spring Presets

| Preset | Damping | Stiffness | Usage |
|--------|---------|-----------|-------|
| `press` | 15 | 400 | Button press/release |
| `bouncy` | 10 | 300 | Playful reveals |
| `gentle` | 20 | 150 | Settle animations |
| `pop` | 8 | 400 | Celebration pops |

```typescript
import { theme } from '@/constants/theme';

withSpring(1, theme.motion.springs.press)
```

---

## Primitive Components

All primitives are exported from `@/components/primitives`.

```typescript
import { Icon, Text, Surface, Button, Badge, Tag, Card } from '@/components/primitives';
```

---

### Icon

Renders Solar Icons with standardized sizes.

```typescript
import { Icon } from '@/components/primitives';
import { Fire } from '@solar-icons/react-native/Bold';

<Icon icon={Fire} size="md" color={theme.colors.brand.primary} />
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ComponentType` | required | Solar Icon component |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Icon size |
| `color` | `string` | `theme.colors.text.primary` | Icon color |
| `mirrored` | `boolean` | `false` | Mirror horizontally |
| `alt` | `string` | - | Accessibility label |

**Size Reference:**

| Size | Pixels | Usage |
|------|--------|-------|
| `sm` | 16px | Badges, inline text |
| `md` | 20px | Buttons, default |
| `lg` | 24px | Navigation, prominent |

---

### Text

Typography primitive using Figtree font and semantic tokens.

```typescript
import { Text } from '@/components/primitives';

<Text variant="title" color="primary">Screen Title</Text>
<Text variant="body">Body text content</Text>
<Text variant="caption" color="secondary">Secondary info</Text>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `TextVariant` | `'body'` | Typography variant |
| `color` | `TextColor \| string` | `'primary'` | Color (semantic key or raw) |
| `weight` | `TextWeight` | varies | Font weight override |
| `align` | `'left' \| 'center' \| 'right'` | - | Text alignment |
| `children` | `ReactNode` | required | Text content |

**Variants:** `display`, `title`, `titleLarge`, `heading`, `body`, `label`, `stat`, `caption`, `footnote`, `tiny`

**Colors (semantic):** `primary`, `secondary`, `muted`, `inverse`, `brand`

**Weights:** `regular`, `medium`, `semibold`, `bold`, `extrabold`

---

### Surface

Themed container with semantic background colors and optional shadows.

```typescript
import { Surface } from '@/components/primitives';

<Surface variant="card" elevation="sm">
  <Text>Card content</Text>
</Surface>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `SurfaceVariant` | `'primary'` | Background color variant |
| `elevation` | `SurfaceElevation` | `'none'` | Shadow level |
| `style` | `ViewStyle` | - | Additional styles |
| `children` | `ReactNode` | - | Content |

**Variants:** `primary`, `secondary`, `card`, `brand`, `brandSubtle`

**Elevations:** `none`, `sm`, `md`, `lg`

---

### Button

Duolingo-style button with 3D press animation.

```typescript
import { Button } from '@/components/primitives';
import { Play } from '@solar-icons/react-native/Bold';

<Button label="Start Quiz" onPress={() => {}} />
<Button label="Play" onPress={() => {}} icon={Play} />
<Button label="Loading..." onPress={() => {}} loading />
<Button label="Cancel" onPress={() => {}} variant="outline" />
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | required | Button text |
| `onPress` | `() => void` | required | Press handler |
| `variant` | `ButtonVariant` | `'primary'` | Visual variant |
| `size` | `ButtonSize` | `'lg'` | Button size |
| `icon` | `ComponentType` | - | Solar Icon component |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon position |
| `loading` | `boolean` | `false` | Show spinner |
| `disabled` | `boolean` | `false` | Disabled state |
| `fullWidth` | `boolean` | `true` | Full width |
| `style` | `ViewStyle` | - | Additional styles |

**Variants:**

| Variant | Background | Text | Usage |
|---------|------------|------|-------|
| `primary` | Wine | White | Primary actions |
| `secondary` | Green | White | Secondary actions |
| `outline` | White | Wine | Tertiary actions |
| `ghost` | Transparent | Wine | Subtle actions |

**Sizes:** `sm` (40px), `md` (48px), `lg` (56px)

---

### Badge

Status indicator with Duolingo-style 3D depth.

```typescript
import { Badge } from '@/components/primitives';
import { Fire, Star } from '@solar-icons/react-native/Bold';

<Badge label="5 Day Streak" icon={Fire} variant="streak" />
<Badge label="100 XP" icon={Star} variant="gold" />
<Badge label="Mastered" variant="success" />
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | required | Badge text |
| `icon` | `ComponentType` | - | Solar Icon component |
| `variant` | `BadgeVariant` | `'default'` | Visual variant |
| `size` | `'sm' \| 'md'` | `'md'` | Badge size |
| `style` | `ViewStyle` | - | Additional styles |

**Variants:** `default`, `success`, `warning`, `danger`, `brand`, `gold`, `streak`

---

### Tag

Flat label/category component without 3D depth.

```typescript
import { Tag } from '@/components/primitives';
import { Bookmark } from '@solar-icons/react-native/Bold';

<Tag label="Cardiology" variant="brand" />
<Tag label="Filter" icon={Bookmark} onPress={() => {}} />
<Tag label="Selected" onRemove={() => {}} />
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | required | Tag text |
| `icon` | `ComponentType` | - | Solar Icon component |
| `variant` | `TagVariant` | `'default'` | Visual variant |
| `onPress` | `() => void` | - | Makes tag tappable |
| `onRemove` | `() => void` | - | Shows X button |
| `style` | `ViewStyle` | - | Additional styles |

**Variants:** `default`, `brand`, `success`, `info`, `purple`

**Badge vs Tag:**
- **Badge** has 3D depth (borderBottomWidth: 3) - for status, achievements
- **Tag** is flat - for labels, categories, filters

---

### Card

Container with Duolingo-style 3D depth and optional press animation.

```typescript
import { Card } from '@/components/primitives';

<Card>Static content</Card>
<Card onPress={() => {}}>Tappable card</Card>
<Card variant="elevated">Shadow-only card</Card>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Card content |
| `variant` | `CardVariant` | `'default'` | Visual variant |
| `onPress` | `() => void` | - | Makes card interactive |
| `disabled` | `boolean` | `false` | Disabled state |
| `style` | `ViewStyle` | - | Additional styles |

**Variants:**

| Variant | Borders | Shadow | Animation |
|---------|---------|--------|-----------|
| `default` | 3D depth | sm | Yes (if onPress) |
| `elevated` | None | md | No |
| `outlined` | 3D depth | None | Yes (if onPress) |

---

## Icon System

### Solar Icons

We use `@solar-icons/react-native` for all icons.

```typescript
// Bold (filled) icons
import { Home, Fire, Star } from '@solar-icons/react-native/Bold';

// Linear (outline) icons
import { Home2, BookMinimalistic } from '@solar-icons/react-native/Linear';
```

### SF Symbol to Solar Icon Mapping

| SF Symbol | Solar Icon | Import Path |
|-----------|------------|-------------|
| `house.fill` | `Home` | `@solar-icons/react-native/Bold` |
| `house` | `Home2` | `@solar-icons/react-native/Linear` |
| `book.fill` | `Book` | `@solar-icons/react-native/Bold` |
| `book` | `BookMinimalistic` | `@solar-icons/react-native/Linear` |
| `chart.bar.fill` | `ChartSquare` | `@solar-icons/react-native/Bold` |
| `chart.bar` | `ChartSquare` | `@solar-icons/react-native/Linear` |
| `gearshape.fill` | `Settings` | `@solar-icons/react-native/Bold` |
| `flame.fill` | `Fire` | `@solar-icons/react-native/Bold` |
| `star.fill` | `Star` | `@solar-icons/react-native/Bold` |
| `trophy.fill` | `Cup` | `@solar-icons/react-native/Bold` |
| `percent` | `PieChart` | `@solar-icons/react-native/Bold` |
| `gamecontroller.fill` | `Gamepad` | `@solar-icons/react-native/Bold` |
| `play.fill` | `Play` | `@solar-icons/react-native/Bold` |
| `bolt.fill` | `Bolt` | `@solar-icons/react-native/Bold` |
| `magnifyingglass` | `MagnifyingGlass` | `@solar-icons/react-native/Linear` |
| `xmark` | `CloseCircle` | `@solar-icons/react-native/Bold` |
| `chevron.right` | `AltArrowRight` | `@solar-icons/react-native/Bold` |
| `square.and.arrow.up` | `Share` | `@solar-icons/react-native/Bold` |
| `trash` | `TrashBinTrash` | `@solar-icons/react-native/Bold` |
| `checkmark.circle.fill` | `CheckCircle` | `@solar-icons/react-native/Bold` |
| `target` | `Target` | `@solar-icons/react-native/Bold` |
| `doc.text.fill` | `Document` | `@solar-icons/react-native/Bold` |

### Tab Bar Icons

Tab bar uses raw Solar Icons directly (not Icon primitive) because Expo Router passes the `color` prop:

```typescript
tabBarIcon: ({ color, focused }) =>
  focused ? <Home size={28} color={color} /> : <Home2 size={28} color={color} />
```

---

## Migration Guide

### Before/After Examples

#### Text Migration

```typescript
// BEFORE
import { Text } from 'react-native';
import { Typography, Colors } from '@/constants/theme';

<Text style={[styles.title, { color: colors.text }]}>Title</Text>

const styles = StyleSheet.create({
  title: { ...Typography.title },
});

// AFTER
import { Text } from '@/components/primitives';

<Text variant="title">Title</Text>
```

#### Icon Migration

```typescript
// BEFORE
import { IconSymbol } from '@/components/ui/icon-symbol';

<IconSymbol name="flame.fill" size={16} color={colors.primary} />

// AFTER
import { Icon } from '@/components/primitives';
import { Fire } from '@solar-icons/react-native/Bold';

<Icon icon={Fire} size="sm" color={theme.colors.brand.primary} />
```

#### Badge Migration

```typescript
// BEFORE
<View style={[styles.badge, { backgroundColor: colors.goldLight }]}>
  <IconSymbol name="star.fill" size={14} color={colors.gold} />
  <Text style={{ color: colors.goldText }}>100 XP</Text>
</View>

// AFTER
import { Badge } from '@/components/primitives';
import { Star } from '@solar-icons/react-native/Bold';

<Badge label="100 XP" icon={Star} variant="gold" />
```

#### Card Migration

```typescript
// BEFORE
<Pressable style={[styles.card, CardStyle]}>
  <Text>Content</Text>
</Pressable>

// AFTER
import { Card } from '@/components/primitives';

<Card onPress={() => {}}>
  <Text variant="body">Content</Text>
</Card>
```

#### Button Migration

```typescript
// BEFORE
import { Button } from '@/components/ui/Button';

<Button label="Start" onPress={() => {}} icon="play.fill" />

// AFTER
import { Button } from '@/components/primitives';
import { Play } from '@solar-icons/react-native/Bold';

<Button label="Start" onPress={() => {}} icon={Play} />
```

---

## Documented Exceptions

These intentional deviations from the design system are documented and acceptable.

### Category Colors (FilterChips.tsx)

10 unique color palettes for medical categories are kept for visual differentiation between specialties.

**Location:** `components/library/FilterChips.tsx`

**Reason:** Visual distinction helps users quickly identify categories. Semantic colors would make all categories look identical.

### Accuracy Stat Color (StatsCard.tsx)

Teal color used for accuracy stat instead of semantic color.

**Location:** `components/progress/StatsCard.tsx`

**Reason:** Visual variety in stats grid. Each stat has its own color for quick recognition.

### Confetti Colors (TierUpCelebration.tsx)

Celebration-specific colors for confetti animation.

**Location:** `components/results/TierUpCelebration.tsx`

**Reason:** Confetti colors are decorative and don't need semantic meaning.

---

## Common Mistakes

### DO NOT

```typescript
// Import Text from react-native
import { Text } from 'react-native';  // WRONG
import { Text } from '@/components/primitives';  // CORRECT

// Use IconSymbol
import { IconSymbol } from '@/components/ui/icon-symbol';  // WRONG
import { Icon } from '@/components/primitives';  // CORRECT

// Use Colors.light.*
backgroundColor: Colors.light.primary,  // WRONG
backgroundColor: theme.colors.brand.primary,  // CORRECT

// Use hardcoded colors
color: '#8B2252',  // WRONG
color: theme.colors.brand.primary,  // CORRECT

// Use Typography spread
style: { ...Typography.title },  // WRONG
<Text variant="title">...</Text>  // CORRECT
```

### DO

```typescript
// Import from primitives
import { Text, Icon, Button, Badge, Card } from '@/components/primitives';

// Use theme.colors for all colors
backgroundColor: theme.colors.surface.card,

// Use Text variant prop
<Text variant="heading">Section Title</Text>

// Use Icon with Solar Icon components
import { Fire } from '@solar-icons/react-native/Bold';
<Icon icon={Fire} size="md" color={theme.colors.streak.main} />

// Document exceptions
// NOTE: Exception - category colors for visual differentiation
const categoryColor = CATEGORY_COLORS[category];
```

---

## Component Styling Patterns

### Press Animation (Duolingo-style 3D)

```typescript
const scale = useSharedValue(1);
const borderBottom = useSharedValue(4);

const handlePressIn = () => {
  scale.value = withSpring(0.98, theme.motion.springs.press);
  borderBottom.value = withSpring(2, theme.motion.springs.press);
};

const handlePressOut = () => {
  scale.value = withSpring(1, theme.motion.springs.press);
  borderBottom.value = withSpring(4, theme.motion.springs.press);
};
```

### Entry Animation Pattern

```typescript
entering={FadeInUp.delay(index * theme.motion.durations.stagger)
  .duration(theme.motion.durations.normal)
  .springify()}
```

### Pop Effect Pattern

```typescript
scale.value = withSequence(
  withSpring(1.35, theme.motion.springs.pop),   // Overshoot
  withSpring(1, theme.motion.springs.gentle)    // Settle
);
```

---

*Last updated: Phase 22 - Design System Application*
*Components: Icon, Text, Surface, Button, Badge, Tag, Card*
