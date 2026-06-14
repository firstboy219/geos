import 'package:shared_preferences/shared_preferences.dart';

/// Thin wrapper over [SharedPreferences] for non-sensitive app state
/// (locale preference, onboarding flags, etc.).
///
/// JWT tokens live in [AuthService] (flutter_secure_storage), NOT here.
class StorageService {
  StorageService._(this._prefs);

  final SharedPreferences _prefs;

  static const String _kLocale = 'app_locale'; // 'en' | 'id'
  static const String _kOnboardingDone = 'onboarding_done';

  /// Async factory — call once at startup and inject the result.
  static Future<StorageService> create() async {
    final prefs = await SharedPreferences.getInstance();
    return StorageService._(prefs);
  }

  // ── Locale ────────────────────────────────────────────────
  String? get localeCode => _prefs.getString(_kLocale);

  Future<void> setLocaleCode(String code) => _prefs.setString(_kLocale, code);

  // ── Flags ─────────────────────────────────────────────────
  bool get onboardingDone => _prefs.getBool(_kOnboardingDone) ?? false;

  Future<void> setOnboardingDone(bool value) =>
      _prefs.setBool(_kOnboardingDone, value);

  // ── Generic helpers ───────────────────────────────────────
  Future<void> setBool(String key, bool value) => _prefs.setBool(key, value);

  bool? getBool(String key) => _prefs.getBool(key);

  Future<void> setString(String key, String value) =>
      _prefs.setString(key, value);

  String? getString(String key) => _prefs.getString(key);

  Future<void> remove(String key) => _prefs.remove(key);
}
