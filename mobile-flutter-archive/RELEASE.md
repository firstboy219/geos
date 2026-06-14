# Geoscan Mobile — Release Build (Phase 7)

## Before building
1. Point the API at production in `lib/core/constants/api_constants.dart`:
   - `baseUrl = 'https://apigeo.cosger.online'`
   - `wsBaseUrl = 'wss://apigeo.cosger.online'`
2. Add Firebase platform config (for push): `android/app/google-services.json`,
   `ios/Runner/GoogleService-Info.plist` (see `INTEGRATION.md`).
3. `flutter pub get`

## Android (APK / AAB, obfuscated)
ProGuard/R8 rules: `android/app/proguard-rules.pro` (enable `minifyEnabled true` +
`shrinkResources true` in `android/app/build.gradle` release block, and reference the
rules file).

```bash
flutter build apk  --release --obfuscate --split-debug-info=build/debug-info
flutter build appbundle --release --obfuscate --split-debug-info=build/debug-info
```

## iOS (needs a Mac + Xcode)
```bash
flutter build ios --release --obfuscate --split-debug-info=build/debug-info
# then archive & upload via Xcode / Transporter
```

## Sanity
```bash
flutter analyze        # static checks
flutter test           # widget tests
flutter run --profile  # check for jank / ANR before shipping
```

Keep `build/debug-info/` to de-obfuscate stack traces later
(`flutter symbolize -i <stack> -d build/debug-info`).
