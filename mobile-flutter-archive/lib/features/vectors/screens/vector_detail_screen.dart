import 'package:flutter/material.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/widgets.dart';
import '../data/dummy_vectors.dart';
import '../models/impact_vector_model.dart';

/// Impact-vector detail for a single crisis (route `/vectors/:crisisId`).
class VectorDetailScreen extends StatefulWidget {
  const VectorDetailScreen({super.key, required this.crisisId});

  final String crisisId;

  @override
  State<VectorDetailScreen> createState() => _VectorDetailScreenState();
}

class _VectorDetailScreenState extends State<VectorDetailScreen> {
  int _selected = 0;

  @override
  Widget build(BuildContext context) {
    final crisis = DummyVectors.byId(widget.crisisId);
    if (crisis == null) {
      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Vector')),
        body: const Center(child: EmptyState(title: 'Situasi tidak ditemukan')),
      );
    }
    final scn = crisis.scenarios[_selected.clamp(0, crisis.scenarios.length - 1)];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text(crisis.name)),
      body: ListView(
        padding: AppPadding.screen,
        children: [
          _summaryCard(crisis),
          const SizedBox(height: AppSpacing.md),
          _scenarioTabs(crisis),
          const SizedBox(height: AppSpacing.md),
          _scenarioDetail(scn),
          const SizedBox(height: AppSpacing.md),
          _assetImpact(context, scn),
          const SizedBox(height: AppSpacing.lg),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Laporan lengkap akan tersedia (Pro).')),
              ),
              icon: const Icon(Icons.open_in_new, size: 16),
              label: const Text('Generate full report'),
            ),
          ),
          const SizedBox(height: AppSpacing.xxl),
        ],
      ),
    );
  }

  Widget _summaryCard(ImpactCrisis c) {
    return GeoCard(
      emphasis: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(c.flag, style: const TextStyle(fontSize: 22)),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(c.name, style: AppTextStyles.title),
                    const SizedBox(height: 2),
                    Text(c.subLocation, style: AppTextStyles.caption),
                  ],
                ),
              ),
              RiskPill(level: c.riskLevel, label: c.riskLabel),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              _stat('Tripwires', '${c.tripwires}'),
              _stat('Aktor', '${c.actors}'),
              _stat('Skenario', '${c.scenarios.length}'),
              _stat('Update', c.lastUpdate),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Text('Lapisan AI aktif', style: AppTextStyles.label),
          const SizedBox(height: AppSpacing.sm),
          Wrap(
            spacing: AppSpacing.xs,
            runSpacing: AppSpacing.xs,
            children: [
              for (final l in c.layers)
                LayerChip(
                  code: l.code,
                  label: l.label,
                  color: l.color,
                  tooltip: l.tooltip,
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _stat(String label, String value) => Expanded(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value, style: AppTextStyles.titleSm),
            const SizedBox(height: 2),
            Text(label, style: AppTextStyles.caption),
          ],
        ),
      );

  Widget _scenarioTabs(ImpactCrisis c) {
    return SizedBox(
      height: 34,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: c.scenarios.length,
        separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.xs),
        itemBuilder: (_, i) {
          final s = c.scenarios[i];
          return GeoChip(
            label: s.tabLabel,
            selected: i == _selected,
            onTap: () => setState(() => _selected = i),
          );
        },
      ),
    );
  }

  Widget _scenarioDetail(VectorScenario s) {
    return GeoCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text('Skenario ${s.code} — ${s.name}',
                    style: AppTextStyles.titleSm),
              ),
              const SizedBox(width: AppSpacing.sm),
              Text('${(s.probability * 100).round()}%',
                  style: AppTextStyles.headline2
                      .copyWith(color: AppColors.accent)),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          GeoChip(label: 'Rung ${s.rung}', square: true, dense: true),
          const SizedBox(height: AppSpacing.md),
          Container(
            padding: AppPadding.inner,
            decoration: BoxDecoration(
              color: AppColors.accentDark,
              borderRadius: BorderRadius.circular(AppRadii.inner),
              border: Border.all(
                  color: AppColors.accentBorder, width: AppBorders.hairline),
            ),
            child: Text(s.narrative,
                style: AppTextStyles.body.copyWith(height: 1.5)),
          ),
          const SizedBox(height: AppSpacing.md),
          Text('Impact Vectors', style: AppTextStyles.label),
          const SizedBox(height: AppSpacing.sm),
          for (final v in s.vectors) ...[
            _vectorBar(v),
            const SizedBox(height: AppSpacing.sm),
          ],
          const SizedBox(height: AppSpacing.xs),
          Text('Indikator kunci', style: AppTextStyles.label),
          const SizedBox(height: AppSpacing.sm),
          for (final k in s.indicators) _indicator(k),
        ],
      ),
    );
  }

  Widget _vectorBar(ImpactVector v) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(child: Text(v.label, style: AppTextStyles.bodySm)),
            Text(v.tag,
                style: AppTextStyles.caption.copyWith(color: v.tone.fg)),
            const SizedBox(width: AppSpacing.sm),
            Text('${(v.value * 100).round()}%',
                style: AppTextStyles.bodySm
                    .copyWith(color: AppColors.textPrimary)),
          ],
        ),
        const SizedBox(height: AppSpacing.xs),
        ClipRRect(
          borderRadius: BorderRadius.circular(3),
          child: LinearProgressIndicator(
            value: v.value,
            minHeight: 6,
            backgroundColor: AppColors.borderSubtle,
            valueColor: AlwaysStoppedAnimation(v.tone.fg),
          ),
        ),
      ],
    );
  }

  Widget _indicator(KeyIndicator k) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 8,
            height: 8,
            margin: const EdgeInsets.only(top: 5, right: AppSpacing.sm),
            decoration:
                BoxDecoration(color: k.tone.fg, shape: BoxShape.circle),
          ),
          Expanded(child: Text(k.text, style: AppTextStyles.bodySm)),
        ],
      ),
    );
  }

  Widget _assetImpact(BuildContext context, VectorScenario s) {
    return GeoCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Dampak ke aset', style: AppTextStyles.label),
          const SizedBox(height: AppSpacing.sm),
          for (final a in s.assets)
            InkWell(
              onTap: () => _showAssetSheet(context, a),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(a.name,
                              style: AppTextStyles.bodySm
                                  .copyWith(color: AppColors.textPrimary)),
                          const SizedBox(height: 1),
                          Text(a.sub, style: AppTextStyles.caption),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.sm, vertical: 2),
                      decoration: BoxDecoration(
                        color: a.dir.tone.bg,
                        borderRadius: BorderRadius.circular(AppRadii.chip),
                        border: Border.all(
                            color: a.dir.tone.border,
                            width: AppBorders.hairline),
                      ),
                      child: Text(a.dir.arrow,
                          style: AppTextStyles.bodySm
                              .copyWith(color: a.dir.tone.fg)),
                    ),
                    const Icon(Icons.chevron_right,
                        size: 16, color: AppColors.textMuted),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }

  void _showAssetSheet(BuildContext context, AssetImpact a) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadii.card)),
      ),
      builder: (_) => Padding(
        padding: AppPadding.card,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(child: Text(a.name, style: AppTextStyles.title)),
                Text('${a.dir.arrow} ${a.sub}',
                    style: AppTextStyles.bodySm.copyWith(color: a.dir.tone.fg)),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(a.detail, style: AppTextStyles.body.copyWith(height: 1.5)),
            const SizedBox(height: AppSpacing.lg),
          ],
        ),
      ),
    );
  }
}
