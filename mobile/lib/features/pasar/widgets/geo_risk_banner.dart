import 'package:flutter/material.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/widgets.dart';
import '../data/dummy_assets.dart';
import 'pasar_primitives.dart';

/// Geopolitical risk banner: weighted score, Shock Multiplier description and
/// tap-tooltip geo-signal chips (component #2 of the Pasar spec).
class GeoRiskBanner extends StatelessWidget {
  const GeoRiskBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return GeoCard(
      padding: AppPadding.cardSm,
      radius: AppRadii.cardSm,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Risiko Geopolitik ke Pasar',
                      style: AppTextStyles.bodySm.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 1),
                    Text(PasarData.riskSubtitle, style: AppTextStyles.caption),
                  ],
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  RichText(
                    text: TextSpan(
                      text: PasarData.riskScore,
                      style: AppTextStyles.headline2.copyWith(
                        color: AppColors.warning,
                      ),
                      children: [
                        TextSpan(
                          text: PasarData.riskScoreMax,
                          style: AppTextStyles.titleSm.copyWith(
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    PasarData.riskLabel,
                    style: AppTextStyles.label.copyWith(color: AppColors.warning),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            PasarData.riskDescription,
            style: AppTextStyles.caption.copyWith(
              color: const Color(0xFF8B9FB8),
              height: 1.4,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Wrap(
            spacing: AppSpacing.xs,
            runSpacing: AppSpacing.xs,
            children: [
              for (final chip in PasarData.riskChips)
                TooltipChip(
                  label: chip.label,
                  tooltip: chip.tooltip,
                  tone: chip.tone,
                ),
            ],
          ),
        ],
      ),
    );
  }
}
