import 'package:flutter/material.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/widgets.dart';
import '../data/dummy_assets.dart';
import '../models/asset_model.dart';
import 'pasar_primitives.dart';

/// Geopolitical heatmap (component #7): rows = asset class, columns = the 3
/// active situations (Natuna / LCS / Taiwan). Cell color encodes intensity.
class GeoHeatmap extends StatelessWidget {
  const GeoHeatmap({super.key});

  static const double _labelWidth = 80;
  static const double _cellHeight = 20;

  @override
  Widget build(BuildContext context) {
    return GeoCard(
      padding: AppPadding.cardSm,
      radius: AppRadii.cardSm,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const CardHeading(
            title: 'Geopolitical Heatmap',
            subtitle: 'Seberapa besar setiap situasi mempengaruhi kelas aset ini',
          ),
          const SizedBox(height: AppSpacing.sm + 2),
          const CardLabel('Pengaruh situasi ke kelas aset'),
          const SizedBox(height: AppSpacing.sm - 2),
          _columnHeader(),
          const SizedBox(height: AppSpacing.xs),
          for (final row in PasarData.heatmapRows) ...[
            _row(row.label, row.levels),
            const SizedBox(height: AppSpacing.xs),
          ],
          const SizedBox(height: AppSpacing.xs),
          Text(
            PasarData.heatmapFootnote,
            style: AppTextStyles.caption.copyWith(height: 1.5),
          ),
        ],
      ),
    );
  }

  Widget _columnHeader() {
    return Row(
      children: [
        const SizedBox(width: _labelWidth),
        for (var i = 0; i < PasarData.heatmapColumns.length; i++) ...[
          if (i > 0) const SizedBox(width: AppSpacing.xs),
          Expanded(
            child: Text(
              PasarData.heatmapColumns[i],
              textAlign: TextAlign.center,
              style: AppTextStyles.caption.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _row(String label, List<HeatLevel> levels) {
    return Row(
      children: [
        SizedBox(
          width: _labelWidth,
          child: Text(
            label,
            style: AppTextStyles.bodySm.copyWith(color: const Color(0xFFC9D1D9)),
          ),
        ),
        for (var i = 0; i < levels.length; i++) ...[
          if (i > 0) const SizedBox(width: AppSpacing.xs),
          Expanded(child: _heatCell(levels[i])),
        ],
      ],
    );
  }

  Widget _heatCell(HeatLevel level) {
    return Container(
      height: _cellHeight,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: level.cellColor,
        borderRadius: BorderRadius.circular(AppRadii.chip / 2),
      ),
      child: Text(
        level.label,
        style: AppTextStyles.caption.copyWith(
          color: level.textColor,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
