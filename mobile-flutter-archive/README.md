# Geoscan Mobile (Flutter)

Phase 1 foundation: design system, services, routing, and authentication for the
Geoscan Intelligence System. Built mobile-first with a dark, Bloomberg-style UI.

> Flutter SDK is **not** installed in the authoring environment. Run the commands
> below on a machine with Flutter `>=3.2.0 <4.0.0` installed.

## Getting started

```bash
cd mobile
flutter pub get
flutter run        # Android emulator hits the backend at http://10.0.2.2:8000
```

The Android runner config under `android/` and iOS config under `ios/` are
minimal stubs. If a build complains about missing native scaffolding, regenerate
the platform folders without touching `lib/`:

```bash
flutter create --platforms=android,ios --org online.cosger .
```

## Architecture

```
lib/
  main.dart                 # composition root → runApp(GeoscanApp(...))
  app.dart                  # GeoscanApp: MaterialApp.router, dark theme, providers, locale
  core/
    theme/                  # app_colors, app_text_styles, app_theme (BAB 7.1 / 7.2 / 7.3)
    constants/              # api_constants (BAB 5), app_constants (spacing/radii/durations)
    services/               # api_service (Dio), auth_service (secure storage), storage_service (prefs)
    router/                 # app_router (GoRouter, BAB 7.4)
    models/                 # user_model
    l10n/                   # app_strings (EN/ID map) + LocaleProvider
    widgets/                # reusable components (see below)
  features/
    auth/                   # splash, login, register screens + AuthProvider
    home/                   # main_nav_screen (bottom nav shell) + home_screen
    pasar/ vectors/ portfolio/ account/   # placeholder screens for Phase 2
```

### Design system (BAB 7 — authoritative)

- **Colors**: every token from BAB 7.1 lives in `core/theme/app_colors.dart`.
- **Typography**: every style from BAB 7.2 lives in `core/theme/app_text_styles.dart`.
- **Component rules** (BAB 7.3): card radius 14/12/10, chip radius 20/8, border
  0.5dp (1.5dp emphasis), spacing multiples of 4 — all in
  `core/constants/app_constants.dart`.

### Reusable widgets (for Phase 2 screens)

Import the barrel: `import 'package:geoscan/core/widgets/widgets.dart';`

| Widget | Purpose |
| --- | --- |
| `GeoCard` | Standard surface card (radius/border/padding presets, `onTap`, `emphasis`). |
| `GeoChip` | Pill/square chip with `selected` state, leading icon. |
| `SectionHeader` | Section title + optional "see all" action. |
| `LoadingShimmer` | Shimmer skeleton (`.box`, `.list`) — required on data screens (BAB 7.3). |
| `ErrorRetry` | Friendly error state + retry button. |
| `EmptyState` | Icon + description + optional action. |
| `RiskPill` | Risk-level pill (low/medium/high/critical) with `levelFrom()` EN/ID mapping. |
| `LayerChip` | AI-layer chip (code + label) with tap-to-reveal tooltip. |
| `GeoLogo` | "GEOSCAN" wordmark (GEO white / SCAN blue), `scale` param. |

### Networking & auth

- `ApiService` (Dio): base URL + 30s timeouts, Bearer interceptor, `401 →
  refresh → retry` once, force-logout on refresh failure (`onForceLogout`).
- `AuthService`: JWT storage via `flutter_secure_storage`.
- `AuthProvider` (Provider/ChangeNotifier): `login`, `register`, `refreshToken`,
  `logout`, `loadCurrentUser`; exposes `isLoading`, `error`, `currentUser`.

### Routing (BAB 7.4)

`/` (splash) · `/login` · `/register` · `/home` (bottom-nav shell) ·
`/pasar` · `/vectors` · `/vectors/:crisisId` · `/portfolio` ·
`/portfolio/impact` · `/account` · `/account/notifications` ·
`/account/tripwire` · `/account/billing`.

Redirect: no token → `/login` for every non-auth route.

### Localization

Simple manual EN/ID string map in `core/l10n/app_strings.dart`
(`AppStrings.of(context).t('key')`) + `LocaleProvider` toggle persisted to
`SharedPreferences`. Migrate to gen-l10n/ARB in a later phase if string volume
grows.

## API base URL

`ApiConstants.baseUrl = 'http://10.0.2.2:8000'` (Android emulator → host:8000).
Production is `https://apigeo.cosger.online`. iOS simulator should use
`http://localhost:8000`.

## Notes / packages wished for

- All requested packages are included. No additional packages were needed for
  Phase 1.
- For Phase 6 (live data) consider `flutter_riverpod` only if Provider becomes
  unwieldy — current scope is fine with `provider`.
- Push notifications (FCM) and the `fcm_token` field on `PATCH /users/me` will
  need `firebase_core` + `firebase_messaging` in a later phase (not added now,
  per the "no extra packages" rule).
