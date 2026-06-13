/// Centralised API base URL + endpoint paths.
///
/// Source of truth: project_knowledge_base BAB 5 (API Specification).
abstract final class ApiConstants {
  ApiConstants._();

  /// Android emulator routes `10.0.2.2` to the host machine's `localhost:8000`.
  ///
  /// Production: `https://apigeo.cosger.online`
  /// iOS simulator: `http://localhost:8000`
  static const String baseUrl = 'http://10.0.2.2:8000';

  /// WebSocket base. Mirror of [baseUrl] over the ws scheme.
  static const String wsBaseUrl = 'ws://10.0.2.2:8000';

  /// Request timeouts (BAB 1-B: 30s connect + receive).
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // ── Auth ──────────────────────────────────────────────────
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';

  // ── Users ─────────────────────────────────────────────────
  static const String me = '/users/me';

  // ── Crisis & scenario ─────────────────────────────────────
  static const String crises = '/crises';
  static String crisis(String id) => '/crises/$id';
  static String crisisScenarios(String id) => '/crises/$id/scenarios';
  static String crisisActors(String id) => '/crises/$id/actors';
  static String scenarioHistory(String id) => '/scenarios/$id/history';

  // ── Actors ────────────────────────────────────────────────
  static const String actors = '/actors';
  static String actor(String id) => '/actors/$id';

  // ── Portfolio ─────────────────────────────────────────────
  static const String portfolio = '/portfolio';
  static String portfolioAsset(String id) => '/portfolio/$id';
  static const String portfolioImpact = '/portfolio/impact';

  // ── Pasar (market) ────────────────────────────────────────
  static const String pasarAssets = '/pasar/assets';
  static const String pasarMatrix = '/pasar/matrix';
  static const String pasarHeatmap = '/pasar/heatmap';

  // ── Alerts ────────────────────────────────────────────────
  static const String alerts = '/alerts';
  static const String alertsUnreadCount = '/alerts/unread-count';
  static String alertRead(String id) => '/alerts/$id/read';
  static const String alertsReadAll = '/alerts/read-all';

  // ── WebSocket & system ────────────────────────────────────
  static const String ws = '/ws';
  static const String health = '/health';

  /// Builds the authenticated WebSocket URL: `ws://host/ws?token={jwt}`.
  static String wsUrl(String token) => '$wsBaseUrl$ws?token=$token';
}
