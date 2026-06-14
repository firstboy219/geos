import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';

/// Asset classes a user can hold (BAB 4.7 user_portfolio.asset_type).
enum AssetType { stock, crypto, gold, property, deposit, commodity }

extension AssetTypeView on AssetType {
  String get label => switch (this) {
        AssetType.stock => 'Saham',
        AssetType.crypto => 'Crypto',
        AssetType.gold => 'Emas',
        AssetType.property => 'Properti',
        AssetType.deposit => 'Deposito',
        AssetType.commodity => 'Komoditas',
      };

  IconData get icon => switch (this) {
        AssetType.stock => Icons.trending_up,
        AssetType.crypto => Icons.currency_bitcoin,
        AssetType.gold => Icons.toll,
        AssetType.property => Icons.home_work_outlined,
        AssetType.deposit => Icons.savings_outlined,
        AssetType.commodity => Icons.grain,
      };

  Color get color => switch (this) {
        AssetType.stock => AppColors.accent,
        AssetType.crypto => AppColors.warning,
        AssetType.gold => AppColors.warning,
        AssetType.property => AppColors.success,
        AssetType.deposit => AppColors.textSecondary,
        AssetType.commodity => AppColors.purple,
      };
}

/// Direction of an asset's impact under the dominant scenario.
enum AssetTrend { up, down, flat }

extension AssetTrendView on AssetTrend {
  String get arrow => switch (this) {
        AssetTrend.up => '↑',
        AssetTrend.down => '↓',
        AssetTrend.flat => '→',
      };

  Color get color => switch (this) {
        AssetTrend.up => AppColors.success,
        AssetTrend.down => AppColors.danger,
        AssetTrend.flat => AppColors.textSecondary,
      };
}

class PortfolioAsset {
  PortfolioAsset({
    required this.id,
    required this.type,
    required this.name,
    required this.ticker,
    required this.quantity,
    required this.purchasePrice,
    required this.currentValue,
    required this.trend,
    required this.impactLabel,
  });

  final String id;
  final AssetType type;
  final String name;
  final String ticker;
  final double quantity;
  final double purchasePrice;
  final double currentValue; // total IDR value
  final AssetTrend trend;
  final String impactLabel; // e.g. "−12%" under dominant scenario
}
