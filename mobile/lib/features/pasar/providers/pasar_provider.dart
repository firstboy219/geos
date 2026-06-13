import 'package:flutter/foundation.dart';

import '../../../core/constants/api_constants.dart';
import '../../../core/models/api_models.dart';
import '../../../core/services/api_service.dart';

/// Live market data (Phase 6): assets, scenario×asset matrix, heatmap.
class PasarProvider extends ChangeNotifier {
  PasarProvider(this._api);
  final ApiService _api;

  bool isLoading = false;
  String? error;
  List<PasarAssetDto> assets = [];
  Map<String, dynamic>? matrix;
  Map<String, dynamic>? heatmap;

  static List<dynamic> _list(dynamic data) {
    if (data is List) return data;
    if (data is Map && data['data'] is List) return data['data'] as List;
    return const [];
  }

  Future<void> fetchAssets({String? category}) async {
    isLoading = true;
    error = null;
    notifyListeners();
    try {
      final res = await _api.get<dynamic>(
        ApiConstants.pasarAssets,
        queryParameters: {
          if (category != null && category != 'all') 'category': category,
        },
      );
      assets = _list(res.data)
          .map((e) => PasarAssetDto.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      error = 'Gagal memuat data pasar.';
      if (kDebugMode) debugPrint('fetchAssets: $e');
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<void> fetchMatrix() async {
    try {
      final res = await _api.get<Map<String, dynamic>>(ApiConstants.pasarMatrix);
      matrix = res.data;
      notifyListeners();
    } catch (e) {
      if (kDebugMode) debugPrint('fetchMatrix: $e');
    }
  }

  Future<void> fetchHeatmap() async {
    try {
      final res = await _api.get<Map<String, dynamic>>(ApiConstants.pasarHeatmap);
      heatmap = res.data;
      notifyListeners();
    } catch (e) {
      if (kDebugMode) debugPrint('fetchHeatmap: $e');
    }
  }
}
