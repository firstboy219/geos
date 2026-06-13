import '../models/portfolio_asset_model.dart';

/// Dummy portfolio holdings (Phase 2 — no backend yet).
abstract final class DummyPortfolio {
  DummyPortfolio._();

  static List<PortfolioAsset> assets() => [
        PortfolioAsset(
          id: 'p1',
          type: AssetType.stock,
          name: 'IHSG / Saham Indonesia',
          ticker: 'IHSG',
          quantity: 1,
          purchasePrice: 7200,
          currentValue: 85000000,
          trend: AssetTrend.down,
          impactLabel: '−12%',
        ),
        PortfolioAsset(
          id: 'p2',
          type: AssetType.gold,
          name: 'Emas',
          ticker: 'XAU',
          quantity: 50,
          purchasePrice: 1100000,
          currentValue: 60000000,
          trend: AssetTrend.up,
          impactLabel: '+8%',
        ),
        PortfolioAsset(
          id: 'p3',
          type: AssetType.crypto,
          name: 'Bitcoin',
          ticker: 'BTC',
          quantity: 0.15,
          purchasePrice: 950000000,
          currentValue: 30000000,
          trend: AssetTrend.flat,
          impactLabel: '±0%',
        ),
        PortfolioAsset(
          id: 'p4',
          type: AssetType.deposit,
          name: 'Deposito IDR',
          ticker: 'IDR',
          quantity: 1,
          purchasePrice: 25000000,
          currentValue: 25000000,
          trend: AssetTrend.down,
          impactLabel: 'Inflasi',
        ),
      ];

  static const double totalValue = 200000000; // Rp 200jt
  static const double riskScore = 6.2; // /10
  static const double negativeImpactPct = -8; // weighted
  static const String dominantScenario = 'skenario dominan (43%)';
}
