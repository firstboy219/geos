import 'package:flutter/foundation.dart';

import '../../../core/constants/api_constants.dart';
import '../../../core/models/api_models.dart';
import '../../../core/services/api_service.dart';

/// Live portfolio CRUD + impact (Phase 6).
class PortfolioProvider extends ChangeNotifier {
  PortfolioProvider(this._api);
  final ApiService _api;

  bool isLoading = false;
  String? error;
  List<PortfolioAssetDto> assets = [];
  Map<String, dynamic>? impact;

  double get totalValue => assets.fold(0.0, (s, a) => s + a.value);

  static List<dynamic> _list(dynamic data) {
    if (data is List) return data;
    if (data is Map && data['data'] is List) return data['data'] as List;
    return const [];
  }

  Future<void> fetchPortfolio() async {
    isLoading = true;
    error = null;
    notifyListeners();
    try {
      final res = await _api.get<dynamic>(ApiConstants.portfolio);
      assets = _list(res.data)
          .map((e) => PortfolioAssetDto.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      error = 'Gagal memuat portofolio.';
      if (kDebugMode) debugPrint('fetchPortfolio: $e');
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> addAsset(PortfolioAssetDto asset) async {
    try {
      await _api.post<dynamic>(ApiConstants.portfolio, data: asset.toCreateJson());
      await fetchPortfolio();
      return true;
    } catch (e) {
      error = 'Gagal menambah aset.';
      if (kDebugMode) debugPrint('addAsset: $e');
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteAsset(String id) async {
    final backup = List<PortfolioAssetDto>.from(assets);
    assets.removeWhere((a) => a.id == id); // optimistic
    notifyListeners();
    try {
      await _api.delete<dynamic>(ApiConstants.portfolioAsset(id));
      return true;
    } catch (e) {
      assets = backup; // rollback
      notifyListeners();
      if (kDebugMode) debugPrint('deleteAsset: $e');
      return false;
    }
  }

  Future<void> fetchImpact() async {
    try {
      final res = await _api.get<Map<String, dynamic>>(ApiConstants.portfolioImpact);
      impact = res.data;
      notifyListeners();
    } catch (e) {
      if (kDebugMode) debugPrint('fetchImpact: $e');
    }
  }
}
