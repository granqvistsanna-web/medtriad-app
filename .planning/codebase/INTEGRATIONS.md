# External Integrations

**Analysis Date:** 2026-01-17

## APIs & External Services

**None detected.**

This is a fresh Expo starter template. No external API integrations are currently configured.

## Data Storage

**Databases:**
- None configured

**File Storage:**
- Local filesystem only (via expo-file-system available in node_modules)

**Caching:**
- None configured

## Authentication & Identity

**Auth Provider:**
- None configured

No authentication system is implemented in this starter template.

## Monitoring & Observability

**Error Tracking:**
- None configured (development only uses Expo error overlay)

**Logs:**
- Console logging only (no structured logging framework)

## CI/CD & Deployment

**Hosting:**
- Not configured
- Web: Static output ready for any static hosting (Vercel, Netlify, etc.)
- Mobile: EAS Build available via Expo (not configured)

**CI Pipeline:**
- None configured

## Environment Configuration

**Required env vars:**
- None required for current setup

**Environment files:**
- None present in repository

**Secrets location:**
- No secrets configured

**Expo Environment:**
- `process.env.EXPO_OS` - Used for platform detection in code (e.g., `medtriad/components/haptic-tab.tsx`)

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Deep Linking

**Configured:**
- URL scheme: `medtriad://` (via `scheme` in `medtriad/app.json`)
- expo-linking available for handling deep links

## In-App Browser

**Implementation:**
- expo-web-browser used in `medtriad/components/external-link.tsx`
- Opens external URLs in native in-app browser on mobile
- Falls back to standard browser navigation on web

## Platform-Specific Integrations

**iOS:**
- SF Symbols via expo-symbols (`medtriad/components/ui/icon-symbol.ios.tsx`)
- Haptic feedback via expo-haptics

**Android:**
- Material Icons fallback (`medtriad/components/ui/icon-symbol.tsx`)
- Adaptive icons configured in app.json
- Edge-to-edge display enabled

**Web:**
- react-native-web for web compatibility
- System fonts fallback in `medtriad/constants/theme.ts`

## Future Integration Points

When adding integrations, consider:

**Backend/API:**
- Add fetch/axios client in `medtriad/services/` or `medtriad/api/`
- Configure base URL via environment variables

**Authentication:**
- expo-auth-session for OAuth flows
- expo-secure-store for token storage

**Database:**
- Supabase, Firebase, or custom REST API
- React Query or SWR for data fetching

**Analytics:**
- expo-analytics or third-party SDK

**Push Notifications:**
- expo-notifications

---

*Integration audit: 2026-01-17*
