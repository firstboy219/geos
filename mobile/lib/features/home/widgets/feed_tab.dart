import 'package:flutter/material.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/geo_card.dart';
import '../data/dummy_data.dart';
import '../models/crisis_model.dart';
import '../models/scenario_model.dart';
import 'home_primitives.dart';

/// The "Berita & Umpan" (News & Feed) tab content.
class FeedTab extends StatelessWidget {
  const FeedTab({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
      children: [
        const _IntegrityNote(),
        const SizedBox(height: AppSpacing.sm + 2),
        for (final a in DummyData.news) ...[
          _NewsCard(article: a),
          const SizedBox(height: AppSpacing.sm),
        ],
        const SizedBox(height: AppSpacing.xs),
        for (final p in DummyData.social) ...[
          _SocialCard(post: p),
          const SizedBox(height: AppSpacing.sm),
        ],
      ],
    );
  }
}

class _IntegrityNote extends StatelessWidget {
  const _IntegrityNote();

  @override
  Widget build(BuildContext context) {
    return GeoCard(
      radius: AppRadii.inner,
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 9),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Lapisan L — Information Integrity Engine aktif',
            style: AppTextStyles.bodySm.copyWith(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            'Setiap sinyal masuk diberi Credibility Score dan dilacak asal-usul '
            'narasinya (Narrative Origin Trace). Video dan audio dicek apakah '
            'buatan AI (deepfake detection). Jika disinformasi terkoordinasi '
            'terdeteksi, semua probabilitas mendapat uncertainty buffer ±15%.',
            style: AppTextStyles.bodySm.copyWith(color: const Color(0xFF8B9FB8), height: 1.5),
          ),
        ],
      ),
    );
  }
}

class _NewsCard extends StatelessWidget {
  const _NewsCard({required this.article});

  final NewsArticle article;

  @override
  Widget build(BuildContext context) {
    final a = article;
    return GeoCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: BoxDecoration(color: a.sourceTone.fg, shape: BoxShape.circle),
              ),
              const SizedBox(width: 5),
              Text(
                a.source,
                style: AppTextStyles.caption.copyWith(fontWeight: FontWeight.w500),
              ),
              const SizedBox(width: 5),
              Text('· ${a.time}', style: AppTextStyles.caption),
              const Spacer(),
              ToneChip(label: a.credibilityLabel, tone: a.credibilityTone, radius: 7),
            ],
          ),
          const SizedBox(height: 7),
          Text(
            a.headline,
            style: AppTextStyles.titleSm.copyWith(fontWeight: FontWeight.w500, height: 1.4),
          ),
          const SizedBox(height: 5),
          Row(
            children: [
              Expanded(child: Text(a.category, style: AppTextStyles.caption)),
              if (a.tripwire != null)
                ToneChip(label: a.tripwire!, tone: SignalTone.danger, radius: 7),
            ],
          ),
        ],
      ),
    );
  }
}

class _SocialCard extends StatelessWidget {
  const _SocialCard({required this.post});

  final SocialPost post;

  @override
  Widget build(BuildContext context) {
    final p = post;
    return GeoCard(
      borderColor: p.tone == SignalTone.special ? AppColors.purpleDark : AppColors.border,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: BoxDecoration(color: p.tone.fg, shape: BoxShape.circle),
              ),
              const SizedBox(width: 5),
              Text(p.source, style: AppTextStyles.caption.copyWith(fontWeight: FontWeight.w500)),
              const SizedBox(width: 5),
              Text('· ${p.time}', style: AppTextStyles.caption),
              const Spacer(),
              ToneChip(label: p.badge, tone: p.tone, radius: 7),
            ],
          ),
          const SizedBox(height: 7),
          Text(
            p.headline,
            style: AppTextStyles.titleSm.copyWith(fontWeight: FontWeight.w500, height: 1.4),
          ),
          const SizedBox(height: 5),
          Text(
            p.note,
            style: AppTextStyles.bodySm.copyWith(color: p.tone.fg, height: 1.4),
          ),
        ],
      ),
    );
  }
}
