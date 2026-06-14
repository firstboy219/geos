import 'package:flutter/material.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/widgets.dart';
import '../data/dummy_assets.dart';
import '../models/asset_model.dart';
import 'pasar_primitives.dart';

/// Skenario × Pasar matrix (component #4): S1..S4 columns × asset-class rows,
/// every cell colored and labelled with its expected direction.
class ScenarioMatrix extends StatelessWidget {
  const ScenarioMatrix({super.key});

  static const double _labelWidth = 88;

  @override
  Widget build(BuildContext context) {
    return GeoCard(
      padding: AppPadding.cardSm,
      radius: AppRadii.cardSm,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const CardHeading(
            title: 'Dampak Skenario ke Kelas Aset',
            subtitle: 'Tap setiap sel untuk detail · Probabilitas tertimbang',
          ),
          const SizedBox(height: AppSpacing.sm + 2),
          _headerRow(),
          const SizedBox(height: AppSpacing.xs + 2),
          for (final row in PasarData.matrixRows) ...[
            _bodyRow(row),
            const SizedBox(height: AppSpacing.xs),
          ],
          const SizedBox(height: AppSpacing.xs),
          Text(
            PasarData.matrixLegend,
            style: AppTextStyles.caption,
          ),
        ],
      ),
    );
  }

  Widget _headerRow() {
    return Row(
      children: [
        const SizedBox(width: _labelWidth),
        for (final scn in PasarData.matrixScenarios) ...[
          Expanded(
            child: _cell(
              label: '${scn.id} · ${scn.probability}%',
              tone: scn.tone,
            ),
          ),
          if (scn != PasarData.matrixScenarios.last)
            const SizedBox(width: 3),
        ],
      ],
    );
  }

  Widget _bodyRow(MatrixRow row) {
    return Row(
      children: [
        SizedBox(
          width: _labelWidth,
          child: Text(
            row.label,
            style: AppTextStyles.bodySm.copyWith(color: const Color(0xFFC9D1D9)),
          ),
        ),
        for (var i = 0; i < row.cells.length; i++) ...[
          Expanded(
            child: _cell(label: row.cells[i].label, tone: row.cells[i].tone),
          ),
          if (i < row.cells.length - 1) const SizedBox(width: 3),
        ],
      ],
    );
  }

  Widget _cell({required String label, required SignalTone tone}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 4),
      decoration: BoxDecoration(
        color: tone.bg,
        borderRadius: BorderRadius.circular(5),
      ),
      alignment: Alignment.center,
      child: Text(
        label,
        textAlign: TextAlign.center,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: AppTextStyles.caption.copyWith(
          color: tone.fg,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}
