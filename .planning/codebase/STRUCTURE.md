# Codebase Structure

**Analysis Date:** 2026-01-17

## Directory Layout

```
medtriad-app/
├── .claude/                    # Claude configuration
├── .planning/                  # Planning documents
│   └── codebase/              # Codebase analysis docs
├── medtriad/                   # Main Expo application
│   ├── app/                   # Expo Router routes
│   │   ├── (tabs)/           # Tab navigator group
│   │   │   ├── _layout.tsx   # Tab navigator config
│   │   │   ├── index.tsx     # Home screen
│   │   │   └── explore.tsx   # Explore screen
│   │   ├── _layout.tsx       # Root layout (Stack + Theme)
│   │   └── modal.tsx         # Modal screen
│   ├── assets/               # Static assets
│   │   └── images/           # Image files
│   ├── components/           # Reusable components
│   │   └── ui/              # UI primitives
│   ├── constants/            # Design tokens, config
│   ├── hooks/                # Custom React hooks
│   ├── scripts/              # Build/utility scripts
│   ├── .vscode/              # VS Code settings
│   ├── app.json              # Expo configuration
│   ├── package.json          # Dependencies
│   ├── tsconfig.json         # TypeScript config
│   └── eslint.config.js      # ESLint config
└── .git/                      # Git repository
```

## Directory Purposes

**medtriad/app/:**
- Purpose: Expo Router file-based routes
- Contains: Screen components, layout configurations
- Key files: `_layout.tsx` (root), `(tabs)/_layout.tsx` (tabs)

**medtriad/app/(tabs)/:**
- Purpose: Tab navigator route group
- Contains: Tab screen components
- Key files: `index.tsx` (Home), `explore.tsx` (Explore)

**medtriad/components/:**
- Purpose: Reusable UI components
- Contains: Themed wrappers, interactive elements, layout components
- Key files: `themed-text.tsx`, `themed-view.tsx`, `parallax-scroll-view.tsx`

**medtriad/components/ui/:**
- Purpose: Low-level UI primitives with platform adaptation
- Contains: Icon components, collapsible
- Key files: `icon-symbol.tsx` (default), `icon-symbol.ios.tsx` (iOS-specific)

**medtriad/constants/:**
- Purpose: Application-wide constants and design tokens
- Contains: Color palette, font definitions
- Key files: `theme.ts`

**medtriad/hooks/:**
- Purpose: Reusable React hooks
- Contains: Theme-related hooks
- Key files: `use-color-scheme.ts`, `use-theme-color.ts`, `use-color-scheme.web.ts`

**medtriad/assets/images/:**
- Purpose: Static image assets
- Contains: App icons, splash screen, React logos
- Key files: `icon.png`, `splash-icon.png`, `favicon.png`

**medtriad/scripts/:**
- Purpose: Development utility scripts
- Contains: Project reset script
- Key files: `reset-project.js`

## Key File Locations

**Entry Points:**
- `medtriad/app/_layout.tsx`: Root application layout and navigation
- `medtriad/app/(tabs)/_layout.tsx`: Tab navigator configuration
- `medtriad/app/(tabs)/index.tsx`: Home screen (default route)

**Configuration:**
- `medtriad/app.json`: Expo app configuration (plugins, experiments, icons)
- `medtriad/package.json`: Dependencies and scripts
- `medtriad/tsconfig.json`: TypeScript configuration with `@/*` path alias
- `medtriad/eslint.config.js`: ESLint with Expo config

**Core Logic:**
- `medtriad/hooks/use-theme-color.ts`: Theme color resolution logic
- `medtriad/constants/theme.ts`: Color and font definitions

**Testing:**
- No test files detected (starter template without tests)

## Naming Conventions

**Files:**
- kebab-case for component files: `themed-text.tsx`, `parallax-scroll-view.tsx`
- kebab-case for hook files: `use-color-scheme.ts`, `use-theme-color.ts`
- Platform suffix for platform-specific: `*.ios.tsx`, `*.web.ts`
- Underscore prefix for layouts: `_layout.tsx`
- Parentheses for route groups: `(tabs)/`

**Directories:**
- lowercase kebab-case: `components/`, `hooks/`, `constants/`
- Parentheses for Expo Router groups: `(tabs)/`

**Components:**
- PascalCase for component functions: `ThemedText`, `ParallaxScrollView`, `IconSymbol`
- PascalCase with "use" prefix for hooks: `useColorScheme`, `useThemeColor`

**Exports:**
- Named exports for components: `export function ThemedText`
- Default exports for screens: `export default function HomeScreen`
- Re-exports for hooks: `export { useColorScheme } from 'react-native'`

## Where to Add New Code

**New Screen:**
- Primary code: `medtriad/app/` (file becomes route)
- For tab screen: `medtriad/app/(tabs)/new-screen.tsx`
- For modal: `medtriad/app/new-modal.tsx`
- Register in layout if needed: `medtriad/app/_layout.tsx` or `medtriad/app/(tabs)/_layout.tsx`

**New Reusable Component:**
- Implementation: `medtriad/components/component-name.tsx`
- For UI primitives: `medtriad/components/ui/component-name.tsx`
- Platform-specific: Add `.ios.tsx` or `.android.tsx` suffix

**New Hook:**
- Implementation: `medtriad/hooks/use-hook-name.ts`
- Platform-specific: Add `.web.ts`, `.ios.ts` suffix

**New Constants/Theme Values:**
- Add to: `medtriad/constants/theme.ts`

**New Static Assets:**
- Images: `medtriad/assets/images/`
- Use `@/assets/images/filename.png` for imports

**New Utility Script:**
- Implementation: `medtriad/scripts/script-name.js`
- Add npm script to: `medtriad/package.json`

## Special Directories

**node_modules/:**
- Purpose: NPM dependencies
- Generated: Yes (npm install)
- Committed: No (.gitignore)

**.expo/:**
- Purpose: Expo cache and generated types
- Generated: Yes (expo start)
- Committed: Partial (types committed, cache ignored)

**app-example/ (potential):**
- Purpose: Backup of starter template after reset-project
- Generated: Yes (npm run reset-project)
- Committed: No (should be deleted after reference)

## Import Path Aliases

**Configured in tsconfig.json:**
```json
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

**Usage:**
- `@/components/themed-text` resolves to `medtriad/components/themed-text`
- `@/hooks/use-color-scheme` resolves to `medtriad/hooks/use-color-scheme`
- `@/constants/theme` resolves to `medtriad/constants/theme`
- `@/assets/images/logo.png` resolves to `medtriad/assets/images/logo.png`

---

*Structure analysis: 2026-01-17*
