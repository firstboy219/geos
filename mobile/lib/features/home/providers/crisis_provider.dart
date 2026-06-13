import 'package:flutter/foundation.dart';

import '../../../core/constants/api_constants.dart';
import '../../../core/models/api_models.dart';
import '../../../core/services/api_service.dart';

/// Live crisis data from the backend (Phase 6). Replaces dummy data on the
/// Analysis tab; the rich presentation widgets read from these DTOs where the
/// backend provides the field.
class CrisisProvider extends ChangeNotifier {
  CrisisProvider(this._api);
  final ApiService _api;

  bool isLoading = false;
  String? error;
  List<CrisisDto> crises = [];
  CrisisDto? selected;

  static List<dynamic> _list(dynamic data) {
    if (data is List) return data;
    if (data is Map && data['data'] is List) return data['data'] as List;
    return const [];
  }

  Future<void> fetchCrises() async {
    isLoading = true;
    error = null;
    notifyListeners();
    try {
      final res = await _api.get<dynamic>(ApiConstants.crises);
      crises = _list(res.data)
          .map((e) => CrisisDto.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      error = 'Gagal memuat data krisis.';
      if (kDebugMode) debugPrint('fetchCrises: $e');
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchDetail(String id) async {
    try {
      final res = await _api.get<dynamic>(ApiConstants.crisis(id));
      if (res.data is Map<String, dynamic>) {
        selected = CrisisDto.fromJson(res.data as Map<String, dynamic>);
        notifyListeners();
      }
    } catch (e) {
      if (kDebugMode) debugPrint('fetchDetail: $e');
    }
  }

  /// Called by [WebSocketService] on a `scenario_update` message.
  void applyScenarioUpdate(String crisisId, List<dynamic> scenarios) {
    final idx = crises.indexWhere((c) => c.id == crisisId);
    if (idx < 0) return;
    final updated = scenarios
        .map((e) => ScenarioDto.fromJson(e as Map<String, dynamic>))
        .toList();
    final old = crises[idx];
    crises[idx] = CrisisDto(
      id: old.id,
      title: old.title,
      region: old.region,
      subRegion: old.subRegion,
      crisisType: old.crisisType,
      status: old.status,
      severityLevel: old.severityLevel,
      redlineIndex: old.redlineIndex,
      misreadScore: old.misreadScore,
      csiAverage: old.csiAverage,
      rfsAverage: old.rfsAverage,
      credibilityScore: old.credibilityScore,
      grayZone: old.grayZone,
      shockMultiplier: old.shockMultiplier,
      scenarios: updated.isNotEmpty ? updated : old.scenarios,
    );
    notifyListeners();
  }
}
