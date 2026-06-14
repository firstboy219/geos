# Phase 6 — Mobile ↔ Backend Integration

## What's wired
- **DTOs** (`core/models/api_models.dart`) — defensive `fromJson` for crisis, scenario, alert, portfolio asset, pasar asset.
- **Providers** (Provider/ChangeNotifier, registered in `app.dart`):
  - `CrisisProvider` — `GET /crises`, `GET /crises/{id}`, `applyScenarioUpdate()` (from WS)
  - `AlertProvider` — `GET /alerts`, unread count, mark read / read-all
  - `PasarProvider` — `GET /pasar/assets|matrix|heatmap`
  - `PortfolioProvider` — full CRUD + `GET /portfolio/impact`
- **WebSocketService** (`core/services/websocket_service.dart`) — `ws://host/ws?token=`, subscribe, auto-reconnect (exp backoff), broadcast `messages` stream.
- **FcmService** (`core/services/fcm_service.dart`) — permission, token → `PATCH /users/me`, foreground local notification; **no-ops gracefully if Firebase isn't configured**.
- **Portfolio screen** is fully wired to `PortfolioProvider` (live CRUD + pull-to-refresh + shimmer), with automatic fallback to dummy data when the backend is unreachable — a working reference for binding the other screens.

## Binding the remaining screens (same pattern)
The rich Home/Pasar/Vectors screens still render their polished dummy presentation.
To make them live, in each screen:
```dart
@override
void initState() {
  super.initState();
  WidgetsBinding.instance.addPostFrameCallback(
    (_) => context.read<CrisisProvider>().fetchCrises(),
  );
}
// in build:
final p = context.watch<CrisisProvider>();
if (p.isLoading && p.crises.isEmpty) return LoadingShimmer.list();
// map p.crises (CrisisDto) onto the presentation widgets; keep dummy extras
// (perception grid, evidence) until the backend/AI emits them.
```
Note: the dummy UI is richer than the API currently returns (perception matrix,
evidence accordions, domino chips). Those fields require the Phase 5 AI engine to
populate; bind the core fields now and enrich as the backend grows.

## App-level lifecycle (do after auth)
WebSocket + FCM need the access token, so initialize them after a successful login
(e.g. in `SplashScreen`/`MainNavScreen` once authenticated):
```dart
final token = await authService.getAccessToken();
ws.connect(token);
for (final c in crisisProvider.crises) ws.subscribe(c.id);
ws.messages.listen((m) {
  switch (m['type']) {
    case 'scenario_update':
      crisisProvider.applyScenarioUpdate(m['data']['crisis_id'], m['data']['scenarios']);
    case 'tripwire_fired':
    case 'alert_new':
      alertProvider.onNewAlert();
  }
});
await fcmService.init();
await fcmService.registerToken();
```
(WS/FCM are intentionally not auto-started in `main.dart` because Firebase needs
platform config — see below.)

## Pointing at the backend
`core/constants/api_constants.dart`:
- Android emulator: `http://10.0.2.2:8000` (default)
- iOS simulator: `http://localhost:8000`
- **Production: `https://apigeo.cosger.online`** (and `wsBaseUrl` → `wss://apigeo.cosger.online`)

## Firebase (FCM) setup — required for push
1. Create a Firebase project, add Android + iOS apps (package/bundle id).
2. Drop `android/app/google-services.json` and `ios/Runner/GoogleService-Info.plist`.
3. Add the Google Services Gradle plugin (Android) / enable Push capability (iOS).
4. Backend already accepts the token via `PATCH /users/me {fcm_token}` and sends via
   `/internal/notifications/send` (n8n WF-02 / WF-10).
Without this config, `FcmService.init()` logs and disables itself — the app still runs.

## New packages (run `flutter pub get`)
`firebase_core`, `firebase_messaging`, `flutter_local_notifications`.
