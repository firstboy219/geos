import 'package:flutter/material.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/geo_card.dart';
import '../models/scenario_model.dart';
import 'home_primitives.dart';

/// Portfolio-impact nudge card with weighted rows + rebalancing CTA.
class PortfolioNudge extends StatelessWidget {
  const PortfolioNudge({super.key, this.onRebalance});

  final VoidCallback? onRebalance;

  static const _rows = [
    ('IHSG / Saham Indonesia', 'Risiko turun −12%', SignalTone.danger),
    ('Emas', 'Peluang naik — hedge terbaik ↑', SignalTone.positive),
    ('IDR / Deposito', 'Pantau kurs — potensi tekanan', SignalTone.warning),
  ];

  @override
  Widget build(BuildContext context) {
    return GeoCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: AppColors.warningDark,
                  borderRadius: BorderRadius.circular(AppRadii.chip),
                ),
                child: const Icon(Icons.account_balance_wallet_outlined,
                    size: 15, color: AppColors.warning),
              ),
              const SizedBox(width: AppSpacing.sm),
              Text(
                'Dampak ke portofolio Anda',
                style: AppTextStyles.bodySm.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Berdasarkan probabilitas tertimbang semua skenario aktif:',
            style: AppTextStyles.bodySm.copyWith(color: const Color(0xFF8B9FB8), height: 1.5),
          ),
          const SizedBox(height: AppSpacing.sm + 2),
          for (final r in _rows)
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(color: r.$3.fg, shape: BoxShape.circle),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      r.$1,
                      style: AppTextStyles.bodySm.copyWith(color: const Color(0xFFC9D1D9)),
                    ),
                  ),
                  Text(
                    r.$2,
                    style: AppTextStyles.bodySm.copyWith(color: r.$3.fg, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
          const SizedBox(height: AppSpacing.sm),
          const Divider(color: AppColors.borderSubtle, height: 1),
          const SizedBox(height: AppSpacing.sm),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: onRebalance,
              style: OutlinedButton.styleFrom(
                backgroundColor: AppColors.accentDark,
                side: const BorderSide(color: AppColors.accent, width: AppBorders.hairline),
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm + 2),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadii.inner)),
              ),
              child: Text(
                'Lihat rekomendasi rebalancing →',
                style: AppTextStyles.body.copyWith(
                  color: AppColors.accent,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// A single alert row (icon + title + meta + badge).
class AlertItem {
  const AlertItem({
    required this.icon,
    required this.title,
    required this.meta,
    required this.badge,
    required this.tone,
  });

  final IconData icon;
  final String title;
  final String meta;
  final String badge;
  final SignalTone tone;
}

/// "Peringatan terbaru" alerts list.
class AlertsList extends StatelessWidget {
  const AlertsList({super.key});

  static const _alerts = [
    AlertItem(
      icon: Icons.directions_boat_outlined,
      title: 'Kapal China masuk perairan Natuna',
      meta: 'Militer · Lapisan C: Action Readiness diperbarui · 12 mnt lalu',
      badge: 'Pantau',
      tone: SignalTone.danger,
    ),
    AlertItem(
      icon: Icons.trending_down,
      title: 'Nikel mendekati \$12k — Shock Multiplier aktif',
      meta: 'Ekonomi · Lapisan M: semua risiko +12% · 38 mnt lalu',
      badge: 'Siaga',
      tone: SignalTone.warning,
    ),
    AlertItem(
      icon: Icons.visibility_off_outlined,
      title: 'Deepfake video pejabat Taiwan terdeteksi AI',
      meta: 'Lapisan L: Info Integrity · Uncertainty buffer ±15% aktif · 2 jam lalu',
      badge: 'L ⚠',
      tone: SignalTone.special,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return GeoCard(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
      child: Column(
        children: [
          for (var i = 0; i < _alerts.length; i++)
            Container(
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm + 2),
              decoration: BoxDecoration(
                border: i == _alerts.length - 1
                    ? null
                    : const Border(bottom: BorderSide(color: AppColors.borderSubtle, width: 0.5)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 30,
                    height: 30,
                    decoration: BoxDecoration(
                      color: _alerts[i].tone.bg,
                      borderRadius: BorderRadius.circular(9),
                    ),
                    child: Icon(_alerts[i].icon, size: 14, color: _alerts[i].tone.fg),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _alerts[i].title,
                          style: AppTextStyles.bodySm.copyWith(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 1),
                        Text(_alerts[i].meta, style: AppTextStyles.caption),
                      ],
                    ),
                  ),
                  const SizedBox(width: 6),
                  ToneChip(label: _alerts[i].badge, tone: _alerts[i].tone),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
