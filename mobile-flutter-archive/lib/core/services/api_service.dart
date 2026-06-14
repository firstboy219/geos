import 'package:dio/dio.dart';

import '../constants/api_constants.dart';
import 'auth_service.dart';

/// HTTP client wrapping [Dio].
///
/// Responsibilities (Prompt 1-B):
///  * base URL + 30s timeouts
///  * inject `Authorization: Bearer <token>` on every request
///  * on `401` → refresh the access token once → retry the original request
///  * if refresh fails → clear tokens and notify via [onForceLogout]
class ApiService {
  ApiService({
    required AuthService authService,
    Dio? dio,
  })  : _authService = authService,
        _dio = dio ?? Dio() {
    _dio.options
      ..baseUrl = ApiConstants.baseUrl
      ..connectTimeout = ApiConstants.connectTimeout
      ..receiveTimeout = ApiConstants.receiveTimeout
      ..headers['Content-Type'] = 'application/json'
      ..headers['Accept'] = 'application/json';

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: _onRequest,
        onError: _onError,
      ),
    );
  }

  final Dio _dio;
  final AuthService _authService;

  /// Invoked when token refresh fails — wire this to navigate to `/login`.
  void Function()? onForceLogout;

  /// Guards against concurrent refresh attempts.
  bool _isRefreshing = false;

  /// Underlying client exposed for feature repositories that need raw access.
  Dio get client => _dio;

  // ── Convenience verbs ─────────────────────────────────────
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) =>
      _dio.get<T>(path, queryParameters: queryParameters, options: options);

  Future<Response<T>> post<T>(
    String path, {
    Object? data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) =>
      _dio.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );

  Future<Response<T>> patch<T>(
    String path, {
    Object? data,
    Options? options,
  }) =>
      _dio.patch<T>(path, data: data, options: options);

  Future<Response<T>> delete<T>(
    String path, {
    Object? data,
    Options? options,
  }) =>
      _dio.delete<T>(path, data: data, options: options);

  // ── Interceptor handlers ──────────────────────────────────
  Future<void> _onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Skip auth header for the refresh endpoint itself.
    if (options.path != ApiConstants.refresh) {
      final token = await _authService.getAccessToken();
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
      }
    }
    handler.next(options);
  }

  Future<void> _onError(
    DioException error,
    ErrorInterceptorHandler handler,
  ) async {
    final response = error.response;
    final requestPath = error.requestOptions.path;

    final isUnauthorized = response?.statusCode == 401;
    final isAuthCall = requestPath == ApiConstants.refresh ||
        requestPath == ApiConstants.login ||
        requestPath == ApiConstants.register;
    final alreadyRetried =
        error.requestOptions.extra['__retried__'] == true;

    if (!isUnauthorized || isAuthCall || alreadyRetried) {
      return handler.next(error);
    }

    final refreshed = await _refreshToken();
    if (!refreshed) {
      await _authService.clear();
      onForceLogout?.call();
      return handler.next(error);
    }

    // Retry the original request with the new token.
    try {
      final newToken = await _authService.getAccessToken();
      final opts = error.requestOptions
        ..headers['Authorization'] = 'Bearer $newToken'
        ..extra['__retried__'] = true;

      final retryResponse = await _dio.fetch<dynamic>(opts);
      return handler.resolve(retryResponse);
    } on DioException catch (e) {
      return handler.next(e);
    }
  }

  /// Calls `POST /auth/refresh` with the stored refresh token and persists the
  /// rotated token pair. Returns true on success.
  Future<bool> _refreshToken() async {
    if (_isRefreshing) return false;
    _isRefreshing = true;
    try {
      final refreshToken = await _authService.getRefreshToken();
      if (refreshToken == null || refreshToken.isEmpty) return false;

      // Use a bare client so the interceptor chain does not recurse.
      final bareDio = Dio(
        BaseOptions(
          baseUrl: ApiConstants.baseUrl,
          connectTimeout: ApiConstants.connectTimeout,
          receiveTimeout: ApiConstants.receiveTimeout,
        ),
      );

      final res = await bareDio.post<Map<String, dynamic>>(
        ApiConstants.refresh,
        data: {'refresh_token': refreshToken},
      );

      final data = res.data;
      final newAccess = data?['access_token'] as String?;
      final newRefresh = data?['refresh_token'] as String?;
      if (newAccess == null || newRefresh == null) return false;

      await _authService.saveTokens(
        accessToken: newAccess,
        refreshToken: newRefresh,
      );
      return true;
    } on DioException {
      return false;
    } finally {
      _isRefreshing = false;
    }
  }
}
