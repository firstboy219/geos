import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'core/l10n/app_strings.dart';
import 'core/router/app_router.dart';
import 'core/services/api_service.dart';
import 'core/services/auth_service.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/providers/auth_provider.dart';
import 'features/home/providers/alert_provider.dart';
import 'features/home/providers/crisis_provider.dart';
import 'features/pasar/providers/pasar_provider.dart';
import 'features/portfolio/providers/portfolio_provider.dart';

/// Root application widget. Wires up:
///  * dependency providers (services + [AuthProvider] + [LocaleProvider])
///  * the dark [ThemeData]
///  * [GoRouter] with auth redirect
///  * EN/ID locale support
class GeoscanApp extends StatefulWidget {
  const GeoscanApp({
    super.key,
    required this.apiService,
    required this.authService,
    required this.authProvider,
    required this.localeProvider,
  });

  final ApiService apiService;
  final AuthService authService;
  final AuthProvider authProvider;
  final LocaleProvider localeProvider;

  @override
  State<GeoscanApp> createState() => _GeoscanAppState();
}

class _GeoscanAppState extends State<GeoscanApp> {
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    _router = buildRouter(
      authService: widget.authService,
      authProvider: widget.authProvider,
    );
    // Forced logout (refresh failed) → kick the user back to /login.
    widget.apiService.onForceLogout = () => _router.go('/login');
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<ApiService>.value(value: widget.apiService),
        Provider<AuthService>.value(value: widget.authService),
        ChangeNotifierProvider<AuthProvider>.value(value: widget.authProvider),
        ChangeNotifierProvider<LocaleProvider>.value(
          value: widget.localeProvider,
        ),
        // ── Phase 6 live-data providers ──
        ChangeNotifierProvider<CrisisProvider>(
          create: (_) => CrisisProvider(widget.apiService),
        ),
        ChangeNotifierProvider<AlertProvider>(
          create: (_) => AlertProvider(widget.apiService),
        ),
        ChangeNotifierProvider<PasarProvider>(
          create: (_) => PasarProvider(widget.apiService),
        ),
        ChangeNotifierProvider<PortfolioProvider>(
          create: (_) => PortfolioProvider(widget.apiService),
        ),
      ],
      child: Consumer<LocaleProvider>(
        builder: (context, localeProvider, _) {
          return MaterialApp.router(
            title: 'Geoscan',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.dark,
            darkTheme: AppTheme.dark,
            themeMode: ThemeMode.dark,
            routerConfig: _router,
            locale: localeProvider.locale,
            supportedLocales: AppStrings.supportedLocales,
            localizationsDelegates: const [
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
          );
        },
      ),
    );
  }
}
