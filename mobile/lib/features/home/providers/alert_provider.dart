import 'package:flutter/foundation.dart';

import '../../../core/constants/api_constants.dart';
import '../../../core/models/api_models.dart';
import '../../../core/services/api_service.dart';

/// Live alerts + unread badge count (Phase 6).
class AlertProvider extends ChangeNotifier {
  AlertProvider(this._api);
  final ApiService _api;

  bool isLoading = false;
  String? error;
  List<AlertDto> alerts = [];
  int unreadCount = 0;

  static List<dynamic> _list(dynamic data) {
    if (data is List) return data;
    if (data is Map && data['data'] is List) return data['data'] as List;
    return const [];
  }

  Future<void> fetchAlerts({bool unreadOnly = false, String? type}) async {
    isLoading = true;
    error = null;
    notifyListeners();
    try {
      final res = await _api.get<dynamic>(
        ApiConstants.alerts,
        queryParameters: {
          if (unreadOnly) 'unread_only': true,
          if (type != null) 'type': type,
        },
      );
      alerts = _list(res.data)
          .map((e) => AlertDto.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      error = 'Gagal memuat peringatan.';
      if (kDebugMode) debugPrint('fetchAlerts: $e');
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchUnreadCount() async {
    try {
      final res = await _api.get<Map<String, dynamic>>(
        ApiConstants.alertsUnreadCount,
      );
      unreadCount = (res.data?['count'] as num?)?.toInt() ?? 0;
      notifyListeners();
    } catch (e) {
      if (kDebugMode) debugPrint('fetchUnreadCount: $e');
    }
  }

  Future<void> markRead(String id) async {
    try {
      await _api.patch<dynamic>(ApiConstants.alertRead(id));
      final idx = alerts.indexWhere((a) => a.id == id);
      if (idx >= 0 && !alerts[idx].isRead) {
        final a = alerts[idx];
        alerts[idx] = AlertDto(
          id: a.id, type: a.type, severity: a.severity, title: a.title,
          body: a.body, isRead: true, createdAt: a.createdAt,
        );
        if (unreadCount > 0) unreadCount--;
        notifyListeners();
      }
    } catch (e) {
      if (kDebugMode) debugPrint('markRead: $e');
    }
  }

  Future<void> markAllRead() async {
    try {
      await _api.patch<dynamic>(ApiConstants.alertsReadAll);
      unreadCount = 0;
      await fetchAlerts();
    } catch (e) {
      if (kDebugMode) debugPrint('markAllRead: $e');
    }
  }

  /// Called by [WebSocketService] on `alert_new` / `tripwire_fired`.
  void onNewAlert() {
    unreadCount++;
    notifyListeners();
  }
}
