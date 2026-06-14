import 'package:flutter/material.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../data/dummy_assets.dart';
import '../models/asset_model.dart';
import '../widgets/asset_section.dart';
import '../widgets/geo_heatmap.dart';
import '../widgets/geo_risk_banner.dart';
import '../widgets/pasar_tabs.dart';
import '../widgets/portfolio_summary.dart';
import '../widgets/scenario_matrix.dart';

/// Market (Pasar) tab — Phase 2-B.
///
/// Geopolitical market overlay built entirely from dummy data (no backend yet):
/// category tabs, risk banner, portfolio summary, scenario×asset matrix, filter
/// chips, filtered asset sections and a geopolitical heatmap. Mirrors
/// `Knowledge Base/Mockup_mobile/pasar_screen.html`.
class PasarScreen extends StatefulWidget {
  const PasarScreen({super.key});

  @override
  State<PasarScreen> createState() => _PasarScreenState();
}

/// A row-level filter applied on top of the active category.
enum _AssetFilter {
  all('Semua aset'),
  potentialUp('↑ Potensi naik'),
  potentialDown('↓ Potensi turun'),
  natuna('⚡ Dipengaruhi Natuna'),
  taiwan('⚛ Dipengaruhi Taiwan');

  const _AssetFilter(this.label);
  final String label;

  bool matches(AssetModel a) => switch (this) {
        _AssetFilter.all => true,
        _AssetFilter.potentialUp => a.changeDirection == PriceDirection.up,
        _AssetFilter.potentialDown => a.changeDirection == PriceDirection.down,
        _AssetFilter.natuna => a.affectedByNatuna,
        _AssetFilter.taiwan => a.affectedByTaiwan,
      };
}

class _PasarScreenState extends State<PasarScreen> {
  /// 0 = "Semua"; 1..n map onto [AssetCategory.values].
  int _categoryIndex = 0;
  int _filterIndex = 0;

  static const List<String> _categoryTabs = [
    'Semua',
    'Saham',
    'Kurs & Mata Uang',
    'Komoditas',
    'Crypto',
  ];

  /// Selected category, or `null` for "Semua".
  AssetCategory? get _selectedCategory =>
      _categoryIndex == 0 ? null : AssetCategory.values[_categoryIndex - 1];

  _AssetFilter get _selectedFilter => _AssetFilter.values[_filterIndex];

  List<AssetModel> _assetsFor(AssetCategory category) {
    return PasarData.assets
        .where((a) => a.category == category)
        .where(_selectedFilter.matches)
        .toList(growable: false);
  }

  /// Categories to render given the active tab.
  List<AssetCategory> get _visibleCategories => _selectedCategory == null
      ? AssetCategory.values
      : [_selectedCategory!];

  @override
  Widget build(BuildContext context) {
    final showOverview = _selectedCategory == null;
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            CategoryTabs(
              tabs: _categoryTabs,
              selectedIndex: _categoryIndex,
              onSelected: (i) => setState(() => _categoryIndex = i),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.md + 2,
                  AppSpacing.md,
                  AppSpacing.md + 2,
                  AppSpacing.xxl,
                ),
                children: [
                  // Overview blocks only on the "Semua" tab to keep filtered
                  // category views focused on their asset list.
                  if (showOverview) ...[
                    const GeoRiskBanner(),
                    const SizedBox(height: AppSpacing.sm + 2),
                    const PortfolioSummary(),
                    const SizedBox(height: AppSpacing.sm + 2),
                    const ScenarioMatrix(),
                    const SizedBox(height: AppSpacing.md),
                  ],
                  FilterChips(
                    filters: [for (final f in _AssetFilter.values) f.label],
                    selectedIndex: _filterIndex,
                    onSelected: (i) => setState(() => _filterIndex = i),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  for (final category in _visibleCategories) ...[
                    AssetSection(
                      title: PasarData.sectionMeta[category]!.title,
                      actionLabel: PasarData.sectionMeta[category]!.action,
                      assets: _assetsFor(category),
                    ),
                    const SizedBox(height: AppSpacing.xs),
                  ],
                  if (showOverview) ...[
                    const SizedBox(height: AppSpacing.sm),
                    const GeoHeatmap(),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
