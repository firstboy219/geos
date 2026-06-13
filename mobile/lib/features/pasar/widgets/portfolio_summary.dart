import 'package:flutter/material.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/widgets.dart';
import '../data/dummy_assets.dart';
import '../models/asset_model.dart';

/// Portfolio ringkasan — 4-grid summary (component #3 of the Pasar spec).
class PortfolioSummary extends StatelessWidget {
  const PortfolioSummary({super.key});

  @override
  Widget build(BuildContext context) {
    final items = PasarData.portfolio;
    return GeoCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Portofolio Anda',
            style: AppTextStyles.bodySm.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            'Dampak geopolitik tertimbang real-time',
            style: AppTextStyles.caption,
          ),
          const SizedBox(height: AppSpacing.sm + 2),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 7,
            crossAxisSpacing: 7,
            childAspectRatio: 2.5,
            children: [
              for (final item in items)
                _PortfolioCell(
                  value: item.value,
                  label: item.label,
                  tone: item.tone,
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _PortfolioCell extends StatelessWidget {
  const _PortfolioCell({
    required this.value,
    required this.label,
    required this.tone,
  });

  final String value;
  final String label;
  final SignalTone tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 9),
      decoration: BoxDecoration(
        color: AppColors.surfaceAlt,
        borderRadius: BorderRadius.circular(AppRadii.inner),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            value,
            style: AppTextStyles.title.copyWith(
              fontSize: 18,
              color: tone == SignalTone.neutral
                  ? AppColors.textPrimary
                  : tone.fg,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: AppTextStyles.caption.copyWith(height: 1.3),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
