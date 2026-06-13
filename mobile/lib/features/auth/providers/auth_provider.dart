import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../core/constants/api_constants.dart';
import '../../../core/models/user_model.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/auth_service.dart';

/// Authentication state + actions (Prompt 1-B).
///
/// Backed by [ApiService] for network and [AuthService] for token storage.
class AuthProvider extends ChangeNotifier {
  AuthProvider({
    required ApiService apiService,
    required AuthService authService,
  })  : _api = apiService,
        _auth = authService;

  final ApiService _api;
  final AuthService _auth;

  bool _isLoading = false;
  String? _error;
  UserModel? _currentUser;

  bool get isLoading => _isLoading;
  String? get error => _error;
  UserModel? get currentUser => _currentUser;

  /// True when an access token exists in secure storage.
  Future<bool> get hasToken => _auth.hasToken();

  // ── Public actions ────────────────────────────────────────

  /// `POST /auth/login` → stores token pair, hydrates [currentUser].
  Future<bool> login(String email, String password) async {
    return _run(() async {
      final res = await _api.post<Map<String, dynamic>>(
        ApiConstants.login,
        data: {'email': email.trim(), 'password': password},
      );
      final data = res.data ?? const {};
      await _persistTokens(data);
      _currentUser = _parseUser(data['user']);
      return true;
    });
  }

  /// `POST /auth/register`. On 201 the backend returns `{message}` only, so we
  /// do NOT auto-login; the UI should route the user back to the login screen.
  Future<bool> register(
    String fullName,
    String email,
    String password,
  ) async {
    return _run(() async {
      await _api.post<Map<String, dynamic>>(
        ApiConstants.register,
        data: {
          'full_name': fullName.trim(),
          'email': email.trim(),
          'password': password,
        },
      );
      return true;
    });
  }

  /// `POST /auth/refresh` (token rotation). Returns true on success.
  Future<bool> refreshToken() async {
    final refresh = await _auth.getRefreshToken();
    if (refresh == null || refresh.isEmpty) return false;
    try {
      final res = await _api.post<Map<String, dynamic>>(
        ApiConstants.refresh,
        data: {'refresh_token': refresh},
      );
      await _persistTokens(res.data ?? const {});
      return true;
    } on DioException {
      return false;
    }
  }

  /// `GET /users/me` — refreshes [currentUser]. Safe to call after startup.
  Future<void> loadCurrentUser() async {
    try {
      final res = await _api.get<Map<String, dynamic>>(ApiConstants.me);
      _currentUser = _parseUser(res.data);
      notifyListeners();
    } on DioException {
      // Leave currentUser as-is; interceptor handles 401 / refresh.
    }
  }

  /// Clears tokens + state. Caller should navigate to `/login`.
  Future<void> logout() async {
    try {
      await _api.post<dynamic>(ApiConstants.logout);
    } on DioException {
      // Ignore network failure — local logout must always succeed.
    }
    await _auth.clear();
    _currentUser = null;
    _error = null;
    notifyListeners();
  }

  void clearError() {
    if (_error == null) return;
    _error = null;
    notifyListeners();
  }

  // ── Internals ─────────────────────────────────────────────

  Future<bool> _run(Future<bool> Function() action) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final ok = await action();
      return ok;
    } on DioException catch (e) {
      _error = _messageFor(e);
      return false;
    } catch (_) {
      _error = 'Something went wrong. Please try again.';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _persistTokens(Map<String, dynamic> data) async {
    final access = data['access_token'] as String?;
    final refresh = data['refresh_token'] as String?;
    if (access != null && refresh != null) {
      await _auth.saveTokens(accessToken: access, refreshToken: refresh);
    }
  }

  UserModel? _parseUser(Object? raw) {
    if (raw is Map<String, dynamic>) return UserModel.fromJson(raw);
    return null;
  }

  String _messageFor(DioException e) {
    final data = e.response?.data;
    if (data is Map && data['detail'] is String) {
      return data['detail'] as String;
    }
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.sendTimeout:
        return 'Connection timed out. Check your network and try again.';
      case DioExceptionType.connectionError:
        return 'Cannot reach the server. Check your connection.';
      default:
        final code = e.response?.statusCode;
        if (code == 401) return 'Invalid email or password.';
        return 'Something went wrong. Please try again.';
    }
  }
}
