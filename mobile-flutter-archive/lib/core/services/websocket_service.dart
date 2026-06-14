import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import '../constants/api_constants.dart';

/// Real-time channel to `ws://host/ws?token={jwt}` (Phase 6).
///
/// Emits decoded server messages on [messages]. Providers listen and react:
///   type=scenario_update → CrisisProvider.applyScenarioUpdate
///   type=tripwire_fired / alert_new → AlertProvider.onNewAlert
/// Auto-reconnects with exponential backoff (capped at 30s) and re-subscribes.
class WebSocketService {
  WebSocketChannel? _channel;
  StreamSubscription<dynamic>? _sub;
  String? _token;
  final Set<String> _subscribed = {};
  int _retry = 0;
  bool _disposed = false;

  final StreamController<Map<String, dynamic>> _controller =
      StreamController<Map<String, dynamic>>.broadcast();

  Stream<Map<String, dynamic>> get messages => _controller.stream;

  void connect(String token) {
    _token = token;
    _disposed = false;
    _open();
  }

  void _open() {
    if (_disposed || _token == null) return;
    try {
      _channel = WebSocketChannel.connect(Uri.parse(ApiConstants.wsUrl(_token!)));
      _sub = _channel!.stream.listen(
        _onData,
        onError: (_) => _scheduleReconnect(),
        onDone: _scheduleReconnect,
        cancelOnError: true,
      );
      _retry = 0;
      for (final c in _subscribed) {
        _send({'action': 'subscribe', 'crisis_id': c});
      }
    } catch (e) {
      if (kDebugMode) debugPrint('ws connect: $e');
      _scheduleReconnect();
    }
  }

  void subscribe(String crisisId) {
    _subscribed.add(crisisId);
    _send({'action': 'subscribe', 'crisis_id': crisisId});
  }

  void _send(Map<String, dynamic> msg) {
    try {
      _channel?.sink.add(jsonEncode(msg));
    } catch (_) {/* not yet open */}
  }

  void _onData(dynamic data) {
    try {
      final decoded = jsonDecode(data as String);
      if (decoded is Map<String, dynamic>) _controller.add(decoded);
    } catch (_) {/* ignore non-JSON frames */}
  }

  void _scheduleReconnect() {
    if (_disposed || _token == null) return;
    final delay = min(30, pow(2, _retry).toInt());
    _retry++;
    Future.delayed(Duration(seconds: delay), _open);
  }

  void dispose() {
    _disposed = true;
    _sub?.cancel();
    _channel?.sink.close();
    _controller.close();
  }
}
