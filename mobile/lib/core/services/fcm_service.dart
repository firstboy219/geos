import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import '../constants/api_constants.dart';
import 'api_service.dart';

/// Background message handler — must be a top-level function.
@pragma('vm:entry-point')
Future<void> firebaseBackgroundHandler(RemoteMessage message) async {
  // Keep minimal; the OS displays the notification payload automatically.
  if (kDebugMode) debugPrint('FCM background: ${message.messageId}');
}

/// Firebase Cloud Messaging integration (Phase 6).
///
/// Gracefully no-ops if Firebase is not configured (no google-services.json /
/// GoogleService-Info.plist), so the app still runs in development.
class FcmService {
  FcmService(this._api);
  final ApiService _api;

  final FlutterLocalNotificationsPlugin _local =
      FlutterLocalNotificationsPlugin();
  bool _enabled = false;

  static const _channel = AndroidNotificationChannel(
    'geoscan_alerts',
    'Geoscan Alerts',
    description: 'Tripwire & scenario alerts',
    importance: Importance.high,
  );

  Future<void> init() async {
    try {
      await Firebase.initializeApp();
      FirebaseMessaging.onBackgroundMessage(firebaseBackgroundHandler);

      final messaging = FirebaseMessaging.instance;
      await messaging.requestPermission();

      await _local.initialize(
        const InitializationSettings(
          android: AndroidInitializationSettings('@mipmap/ic_launcher'),
          iOS: DarwinInitializationSettings(),
        ),
      );
      await _local
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(_channel);

      FirebaseMessaging.onMessage.listen(_showForeground);
      _enabled = true;
    } catch (e) {
      _enabled = false;
      if (kDebugMode) debugPrint('FCM disabled (not configured): $e');
    }
  }

  /// Fetch the FCM token and register it via `PATCH /users/me`.
  Future<void> registerToken() async {
    if (!_enabled) return;
    try {
      final token = await FirebaseMessaging.instance.getToken();
      if (token == null) return;
      await _api.patch<dynamic>(ApiConstants.me, data: {'fcm_token': token});
    } catch (e) {
      if (kDebugMode) debugPrint('registerToken: $e');
    }
  }

  void _showForeground(RemoteMessage message) {
    final n = message.notification;
    if (n == null) return;
    _local.show(
      n.hashCode,
      n.title,
      n.body,
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'geoscan_alerts',
          'Geoscan Alerts',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(),
      ),
    );
  }
}
