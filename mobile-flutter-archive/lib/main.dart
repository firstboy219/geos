import 'package:flutter/material.dart';

import 'app.dart';
import 'core/l10n/app_strings.dart';
import 'core/services/api_service.dart';
import 'core/services/auth_service.dart';
import 'core/services/storage_service.dart';
import 'features/auth/providers/auth_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // ── Compose dependencies ──────────────────────────────────
  final storageService = await StorageService.create();
  final authService = AuthService();
  final apiService = ApiService(authService: authService);

  final authProvider = AuthProvider(
    apiService: apiService,
    authService: authService,
  );

  final localeProvider = LocaleProvider(
    initialCode: storageService.localeCode ?? 'en',
  )..onChanged = storageService.setLocaleCode;

  runApp(
    GeoscanApp(
      apiService: apiService,
      authService: authService,
      authProvider: authProvider,
      localeProvider: localeProvider,
    ),
  );
}
