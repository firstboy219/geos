import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';

/// Semantic tone applied to chips, cells, badges and bars across the Pasar UI.
///
/// Maps directly to the Geoscan palette (BAB 7.1) so a single enum drives
/// foreground / background / border colors consistently. Kept self-contained
/// inside the pasar feature (no cross-feature imports).
enum SignalTone { positive, neutral, warning, danger, info, special }

extension SignalToneColors on SignalTone {
  Color get fg => switch (this) {
        SignalTone.positive => AppColors.success,
        SignalTone.neutral => AppColors.textSecondary,
        SignalTone.warning => AppColors.warning,
        SignalTone.danger => AppColors.danger,
        SignalTone.info => AppColors.accent,
        SignalTone.special => AppColors.purple,
      };

  Color get bg => switch (this) {
        SignalTone.positive => AppColors.successDark,
        SignalTone.neutral => AppColors.border,
        SignalTone.warning => AppColors.warningDark,
        SignalTone.danger => AppColors.dangerDark,
        SignalTone.info => AppColors.accentDark,
        SignalTone.special => AppColors.purpleDark,
      };

  Color get border => switch (this) {
        SignalTone.positive => AppColors.successBorder,
        SignalTone.neutral => AppColors.border,
        SignalTone.warning => AppColors.warningBorder,
        SignalTone.danger => AppColors.dangerBorder,
        SignalTone.info => AppColors.accentBorder,
        SignalTone.special => AppColors.purpleBorder,
      };
}

/// The asset categories surfaced by the horizontal category tabs.
enum AssetCategory {
  saham('Saham'),
  kurs('Kurs & Mata Uang'),
  komoditas('Komoditas'),
  crypto('Crypto');

  const AssetCategory(this.label);

  /// Indonesian display label for the tab.
  final String label;
}

/// Direction of a price change / scenario impact.
enum PriceDirection { up, down, neutral }

extension PriceDirectionTone on PriceDirection {
  SignalTone get tone => switch (this) {
        PriceDirection.up => SignalTone.positive,
        PriceDirection.down => SignalTone.danger,
        PriceDirection.neutral => SignalTone.neutral,
      };

  /// Triangle glyph shown alongside change %.
  String get glyph => switch (this) {
        PriceDirection.up => '▲', // ▲
        PriceDirection.down => '▼', // ▼
        PriceDirection.neutral => '▶', // ▶
      };
}

/// A small geopolitical signal chip used inside the risk banner. Each carries a
/// tap-triggered tooltip describing the underlying layer / situation.
class GeoSignalChip {
  const GeoSignalChip({
    required this.label,
    required this.tooltip,
    required this.tone,
  });

  final String label;
  final String tooltip;
  final SignalTone tone;
}

/// One colored cell in the Skenario × Pasar matrix.
class MatrixCell {
  const MatrixCell({required this.label, required this.tone});

  final String label;
  final SignalTone tone;
}

/// One row of the Skenario × Pasar matrix: an asset class plus its impact under
/// each of the 4 dominant scenarios (S1..S4).
class MatrixRow {
  const MatrixRow({required this.label, required this.cells});

  final String label;

  /// Exactly 4 cells (S1..S4).
  final List<MatrixCell> cells;
}

/// Header column of the matrix — a scenario id with its weighted probability.
class MatrixScenario {
  const MatrixScenario({
    required this.id,
    required this.probability,
    required this.tone,
  });

  final String id;

  /// 0–100 weighted probability share.
  final int probability;
  final SignalTone tone;
}

/// Qualitative intensity used by the geopolitical heatmap cells.
enum HeatLevel {
  sangatTinggi('Sangat', Color(0xFFF85149), Color(0xFFFFFFFF)),
  tinggi('Tinggi', Color(0xFFE3B341), Color(0xFF0D1117)),
  sedang('Sedang', Color(0xFF5F6B3A), Color(0xFFFFFFFF)),
  rendah('Rendah', Color(0xFF30363D), AppColors.textSecondary);

  const HeatLevel(this.label, this.cellColor, this.textColor);

  final String label;
  final Color cellColor;
  final Color textColor;
}

/// One row of the geopolitical heatmap: an asset class scored against the 3
/// active situations (Natuna / LCS / Taiwan).
class HeatmapRow {
  const HeatmapRow({required this.label, required this.levels});

  final String label;

  /// Exactly 3 levels — [Natuna, LCS, Taiwan].
  final List<HeatLevel> levels;
}

/// A single tradeable asset row with its geopolitical overlay.
///
/// Mirrors the asset rows in `pasar_screen.html` (icon + name + sub +
/// geo-signal badge + price + change%). For later wiring this maps onto the
/// `GET /pasar/assets` response shape (KB BAB 5).
class AssetModel {
  const AssetModel({
    required this.symbol,
    required this.name,
    required this.category,
    required this.price,
    required this.change,
    required this.changeDirection,
    required this.iconLabel,
    required this.iconFg,
    required this.iconBg,
    required this.subtitle,
    required this.geoSignalType,
    required this.geoSignalText,
    required this.geoSignalDetail,
    this.sparkline = const [],
    this.scenarioImpacts = const [],
    this.affectedByNatuna = false,
    this.affectedByTaiwan = false,
  });

  final String symbol;
  final String name;
  final AssetCategory category;

  /// Pre-formatted price string (e.g. "Rp 9.475", "\$3.324", "7.284").
  final String price;

  /// Pre-formatted change string (e.g. "−0.82%", "+125", "YTD").
  final String change;
  final PriceDirection changeDirection;

  /// Short label rendered inside the rounded asset icon (e.g. "IDX", "BBCA").
  final String iconLabel;
  final Color iconFg;
  final Color iconBg;

  /// One-line descriptor under the asset name.
  final String subtitle;

  /// Tone driving the geo-signal badge colors.
  final SignalTone geoSignalType;

  /// Short badge text (e.g. "↓ Risiko −12% tertimbang").
  final String geoSignalText;

  /// Long explanation shown in the bottom sheet on tap.
  final String geoSignalDetail;

  /// Normalized 0..1 bar heights for the mini sparkline.
  final List<double> sparkline;

  /// Per-scenario expected impact labels (S1..S4), parallel to the matrix.
  final List<String> scenarioImpacts;

  final bool affectedByNatuna;
  final bool affectedByTaiwan;
}
