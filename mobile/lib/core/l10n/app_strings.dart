import 'package:flutter/widgets.dart';

/// Lightweight bilingual (EN / ID) string table.
///
/// Phase 1 keeps localization deliberately simple: a static map keyed by
/// language code rather than the full ARB / gen-l10n pipeline. Phase 2+ may
/// migrate to `flutter_localizations` ARB files if string volume grows.
///
/// Usage:
/// ```dart
/// AppStrings.of(context).t('login_button');
/// ```
class AppStrings {
  AppStrings(this.languageCode);

  /// 'en' or 'id'.
  final String languageCode;

  static const List<Locale> supportedLocales = [
    Locale('en'),
    Locale('id'),
  ];

  static AppStrings of(BuildContext context) {
    final code = Localizations.localeOf(context).languageCode;
    return AppStrings(_map.containsKey(code) ? code : 'en');
  }

  /// Returns the translated string for [key], falling back to EN then the key.
  String t(String key) {
    return _map[languageCode]?[key] ?? _map['en']?[key] ?? key;
  }

  static const Map<String, Map<String, String>> _map = {
    'en': {
      'tagline': 'Predictive Intelligence. Real-time.',
      'login_title': 'Sign In',
      'email': 'Email',
      'password': 'Password',
      'confirm_password': 'Confirm Password',
      'full_name': 'Full Name',
      'login_button': 'SIGN IN',
      'register_button': 'REGISTER',
      'no_account': "Don't have an account? Register",
      'have_account': 'Already have an account? Sign In',
      'err_email_required': 'Email is required',
      'err_email_invalid': 'Enter a valid email',
      'err_password_required': 'Password is required',
      'err_password_short': 'Password must be at least 8 characters',
      'err_password_mismatch': 'Passwords do not match',
      'err_name_required': 'Full name is required',
      'err_generic': 'Something went wrong. Please try again.',
      'nav_analysis': 'Analysis',
      'nav_pasar': 'Market',
      'nav_vectors': 'Vectors',
      'nav_portfolio': 'Portfolio',
      'nav_profile': 'Profile',
      'retry': 'Retry',
      'empty_title': 'Nothing here yet',
    },
    'id': {
      'tagline': 'Predictive Intelligence. Real-time.',
      'login_title': 'Masuk',
      'email': 'Email',
      'password': 'Kata Sandi',
      'confirm_password': 'Konfirmasi Kata Sandi',
      'full_name': 'Nama Lengkap',
      'login_button': 'MASUK',
      'register_button': 'DAFTAR',
      'no_account': 'Belum punya akun? Daftar',
      'have_account': 'Sudah punya akun? Masuk',
      'err_email_required': 'Email wajib diisi',
      'err_email_invalid': 'Masukkan email yang valid',
      'err_password_required': 'Kata sandi wajib diisi',
      'err_password_short': 'Kata sandi minimal 8 karakter',
      'err_password_mismatch': 'Kata sandi tidak cocok',
      'err_name_required': 'Nama lengkap wajib diisi',
      'err_generic': 'Terjadi kesalahan. Silakan coba lagi.',
      'nav_analysis': 'Analisis',
      'nav_pasar': 'Pasar',
      'nav_vectors': 'Vectors',
      'nav_portfolio': 'Portofolio',
      'nav_profile': 'Profil',
      'retry': 'Coba Lagi',
      'empty_title': 'Belum ada apa-apa',
    },
  };
}

/// Holds and toggles the active locale; persists via [StorageService] caller.
class LocaleProvider extends ChangeNotifier {
  LocaleProvider({String initialCode = 'en'})
      : _locale = Locale(initialCode);

  Locale _locale;
  Locale get locale => _locale;

  /// Callback to persist the chosen language code (wired to StorageService).
  Future<void> Function(String code)? onChanged;

  void setLocale(String code) {
    if (code == _locale.languageCode) return;
    _locale = Locale(code);
    onChanged?.call(code);
    notifyListeners();
  }

  void toggle() => setLocale(_locale.languageCode == 'en' ? 'id' : 'en');
}
