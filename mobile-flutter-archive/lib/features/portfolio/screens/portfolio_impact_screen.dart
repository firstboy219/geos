import 'package:flutter/material.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/widgets.dart';
import '../data/dummy_portfolio.dart';
import '../models/portfolio_asset_model.dart';

/// Portfolio impact detail (route `/portfolio/impact`) — weighted impact matrix
/// (assets × dominant scenarios) + recommendations. Dummy data.
class PortfolioImpactScreen extends StatelessWidget {
  const PortfolioImpactScreen({super.key});

  // Scenario columns (probability-weighted view).
  static const _scenarios = ['S1 43%', 'S2 29%', 'S3 15%', 'S4 9%'];

  @override
  Widget build(BuildContext context) {
    final assets = DummyPortfolio.assets();
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Dampak Portofolio')),
      body: ListView(
        padding: AppPadding.screen,
        children: [
          GeoCard(
            emphasis: true,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Dampak tertimbang', style: AppTextStyles.label),
                const SizedBox(height: AppSpacing.xs),
                Text('${DummyPortfolio.negativeImpactPct.toStringAsFixed(0)}%',
                    style: AppTextStyles.headline1
                        .copyWith(color: AppColors.danger)),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  'Estimasi dampak ke seluruh portofolio berdasarkan probabilitas semua skenario aktif (16 lapisan AI).',
                  style: AppTextStyles.bodySm,
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          SectionHeader(title: 'Matriks dampak per skenario'),
          GeoCard(
            padding: AppPadding.cardSm,
            child: _matrix(assets),
          ),
          const SizedBox(height: AppSpacing.lg),
          SectionHeader(title: 'Rekomendasi rebalancing'),
          _reco(
            'Naikkan alokasi Emas',
            'Emas adalah hedge terbaik di 3 dari 4 skenario aktif. Pertimbangkan menambah bobot 5–10%.',
            AppColors.success,
            Icons.trending_up,
          ),
          _reco(
            'Kurangi eksposur IHSG jangka pendek',
            'Saham Indonesia berisiko turun −12% pada skenario dominan. Pertimbangkan trimming bertahap.',
            AppColors.danger,
            Icons.trending_down,
          ),
          _reco(
            'Pantau kurs IDR / deposito',
            'Tekanan kurs dapat menggerus imbal hasil deposito riil bila Shock Multiplier berlanjut.',
            AppColors.warning,
            Icons.remove_red_eye_outlined,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Bukan nasihat keuangan. Output Geoscan bersifat edukatif dan probabilistik.',
            style: AppTextStyles.caption,
          ),
          const SizedBox(height: AppSpacing.xxl),
        ],
      ),
    );
  }

  Widget _matrix(List<PortfolioAsset> assets) {
    return Column(
      children: [
        // header
        Row(
          children: [
            const SizedBox(width: 96),
            for (final s in _scenarios)
              Expanded(
                child: Text(s,
                    textAlign: TextAlign.center,
                    style: AppTextStyles.caption
                        .copyWith(color: AppColors.textSecondary)),
              ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        for (final a in assets) _matrixRow(a),
      ],
    );
  }

  Widget _matrixRow(PortfolioAsset a) {
    // Derive 4 cells from the asset trend (illustrative, deterministic).
    final cells = switch (a.trend) {
      AssetTrend.up => [AssetTrend.up, AssetTrend.up, AssetTrend.flat, AssetTrend.up],
      AssetTrend.down => [
          AssetTrend.flat,
          AssetTrend.down,
          AssetTrend.down,
          AssetTrend.up
        ],
      AssetTrend.flat => [
          AssetTrend.flat,
          AssetTrend.flat,
          AssetTrend.down,
          AssetTrend.flat
        ],
    };
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.xs),
      child: Row(
        children: [
          SizedBox(
            width: 96,
            child: Text(a.ticker,
                style: AppTextStyles.bodySm
                    .copyWith(color: AppColors.textPrimary)),
          ),
          for (final c in cells)
            Expanded(
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 2),
                padding: const EdgeInsets.symmetric(vertical: 6),
                decoration: BoxDecoration(
                  color: c.color.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(c.arrow,
                    textAlign: TextAlign.center,
                    style: AppTextStyles.bodySm.copyWith(color: c.color)),
              ),
            ),
        ],
      ),
    );
  }

  Widget _reco(String title, String body, Color color, IconData icon) {
    return GeoCard(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      padding: AppPadding.cardSm,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(AppRadii.inner),
            ),
            child: Icon(icon, size: 16, color: color),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title,
                    style: AppTextStyles.bodySm
                        .copyWith(color: AppColors.textPrimary)),
                const SizedBox(height: 2),
                Text(body, style: AppTextStyles.caption.copyWith(height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
