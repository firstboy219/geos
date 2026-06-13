import 'package:go_router/go_router.dart';

import '../../features/account/screens/account_screen.dart';
import '../../features/account/screens/account_subpages.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/auth/screens/splash_screen.dart';
import '../../features/home/screens/main_nav_screen.dart';
import '../../features/pasar/screens/pasar_screen.dart';
import '../../features/portfolio/screens/portfolio_impact_screen.dart';
import '../../features/portfolio/screens/portfolio_screen.dart';
import '../../features/vectors/screens/vector_detail_screen.dart';
import '../../features/vectors/screens/vector_list_screen.dart';
import '../services/auth_service.dart';

/// Builds the app [GoRouter] (BAB 7.4 — path strings are authoritative).
///
/// Redirect rule: when no token is present, every non-auth route bounces to
/// `/login`. The `/` splash route performs the initial token check itself.
GoRouter buildRouter({
  required AuthService authService,
  required AuthProvider authProvider,
}) {
  const authRoutes = {'/', '/login', '/register'};

  return GoRouter(
    initialLocation: '/',
    // Rebuild redirects when auth state changes (e.g. forced logout).
    refreshListenable: authProvider,
    redirect: (context, state) async {
      final hasToken = await authService.hasToken();
      final goingToAuth = authRoutes.contains(state.matchedLocation);

      // Unauthenticated users may only reach auth routes.
      if (!hasToken && !goingToAuth) return '/login';
      return null;
    },
    routes: [
      GoRoute(path: '/', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterScreen()),
      GoRoute(path: '/home', builder: (_, __) => const MainNavScreen()),

      // Direct (deep-link) routes to feature screens outside the tab shell.
      GoRoute(path: '/pasar', builder: (_, __) => const PasarScreen()),
      GoRoute(path: '/vectors', builder: (_, __) => const VectorListScreen()),
      GoRoute(
        path: '/vectors/:crisisId',
        builder: (_, state) => VectorDetailScreen(
          crisisId: state.pathParameters['crisisId'] ?? '',
        ),
      ),
      GoRoute(path: '/portfolio', builder: (_, __) => const PortfolioScreen()),
      GoRoute(
        path: '/portfolio/impact',
        builder: (_, __) => const PortfolioImpactScreen(),
      ),
      GoRoute(path: '/account', builder: (_, __) => const AccountScreen()),
      GoRoute(
        path: '/account/notifications',
        builder: (_, __) => const NotificationSettingsScreen(),
      ),
      GoRoute(
        path: '/account/tripwire',
        builder: (_, __) => const TripwireConfigScreen(),
      ),
      GoRoute(
        path: '/account/billing',
        builder: (_, __) => const BillingScreen(),
      ),
    ],
  );
}
