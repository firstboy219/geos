import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/widgets.dart';
import '../data/dummy_vectors.dart';
import '../models/impact_vector_model.dart';

/// Impact Vector — crisis selector (Prompt 2-C, Screen 1).
class VectorListScreen extends StatelessWidget {
  const VectorListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final crises = DummyVectors.crises;
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Row(
          children: [
            const Text('Impact ', style: AppTextStyles.title),
            Text('Vectors',
                style: AppTextStyles.title.copyWith(color: AppColors.accent)),
          ],
        ),
      ),
      body: ListView(
        padding: AppPadding.screen,
        children: [
          Text(
            'Pilih situasi untuk melihat vektor dampak multidimensi (Eskalasi · Hibridisasi · Durasi) per skenario.',
            style: AppTextStyles.bodySm,
          ),
          const SizedBox(height: AppSpacing.lg),
          for (final c in crises) ...[
            _CrisisSummaryCard(
              crisis: c,
              onTap: () => context.go('/vectors/${c.id}'),
            ),
            const SizedBox(height: AppSpacing.md),
          ],
        ],
      ),
    );
  }
}

class _CrisisSummaryCard extends StatelessWidget {
  const _CrisisSummaryCard({required this.crisis, required this.onTap});

  final ImpactCrisis crisis;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final top = crisis.scenarios.isNotEmpty ? crisis.scenarios.first : null;
    return GeoCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(crisis.flag, style: const TextStyle(fontSize: 22)),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(crisis.name, style: AppTextStyles.titleSm),
                    const SizedBox(height: 2),
                    Text(crisis.subLocation, style: AppTextStyles.caption),
                  ],
                ),
              ),
              RiskPill(level: crisis.riskLevel, label: crisis.riskLabel),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              _stat('Tripwires', '${crisis.tripwires}'),
              _stat('Aktor', '${crisis.actors}'),
              _stat('Skenario', '${crisis.scenarios.length}'),
              _stat('Update', crisis.lastUpdate),
            ],
          ),
          if (top != null) ...[
            const SizedBox(height: AppSpacing.md),
            Container(
              padding: AppPadding.inner,
              decoration: BoxDecoration(
                color: AppColors.surfaceAlt,
                borderRadius: BorderRadius.circular(AppRadii.inner),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      'Dominan: ${top.name}',
                      style: AppTextStyles.bodySm
                          .copyWith(color: AppColors.textPrimary),
                    ),
                  ),
                  Text('${(top.probability * 100).round()}%',
                      style: AppTextStyles.titleSm
                          .copyWith(color: AppColors.accent)),
                ],
              ),
            ),
          ],
          const SizedBox(height: AppSpacing.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Text('Lihat impact vector',
                  style:
                      AppTextStyles.bodySm.copyWith(color: AppColors.accent)),
              const Icon(Icons.chevron_right,
                  size: 16, color: AppColors.accent),
            ],
          ),
        ],
      ),
    );
  }

  Widget _stat(String label, String value) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(value,
              style: AppTextStyles.titleSm
                  .copyWith(color: AppColors.textPrimary)),
          const SizedBox(height: 2),
          Text(label, style: AppTextStyles.caption),
        ],
      ),
    );
  }
}
