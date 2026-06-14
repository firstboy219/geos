import 'package:flutter/material.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/geo_card.dart';
import 'home_primitives.dart';
import '../models/scenario_model.dart';

/// The analysis horizon options (Temporal Calibration — Layer P).
enum AnalysisPeriod { h72, d90, y5 }

/// Period selector = Temporal Calibration (Layer P). Three selectable chips,
/// each with a small sub-label describing how AI weights change.
class PeriodSelector extends StatelessWidget {
  const PeriodSelector({
    super.key,
    required this.value,
    required this.onChanged,
  });

  final AnalysisPeriod value;
  final ValueChanged<AnalysisPeriod> onChanged;

  static const _items = [
    (AnalysisPeriod.h72, '72 Jam', 'Peringatan dini · Tripwire dominan'),
    (AnalysisPeriod.d90, '30–90 Hari', 'Semua 16 faktor aktif'),
    (AnalysisPeriod.y5, '1–5 Tahun', 'Faktor struktural dominan'),
  ];

  @override
  Widget build(BuildContext context) {
    return GeoCard(
      radius: AppRadii.cardSm,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm + 2,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          RichText(
            text: TextSpan(
              style: AppTextStyles.bodySm,
              children: const [
                TextSpan(text: '🕐 '),
                TextSpan(
                  text: 'Horizon analisis',
                  style: TextStyle(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                TextSpan(
                  text: ' — Bobot AI berubah otomatis sesuai pilihan',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 11),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Row(
            children: [
              for (final item in _items) ...[
                Expanded(
                  child: _PeriodTab(
                    title: item.$2,
                    subtitle: item.$3,
                    selected: value == item.$1,
                    onTap: () => onChanged(item.$1),
                  ),
                ),
                if (item != _items.last) const SizedBox(width: AppSpacing.xs),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

class _PeriodTab extends StatelessWidget {
  const _PeriodTab({
    required this.title,
    required this.subtitle,
    required this.selected,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadii.chip),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xs, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? AppColors.accentDark : AppColors.surfaceAlt,
          borderRadius: BorderRadius.circular(AppRadii.chip),
          border: Border.all(
            color: selected ? AppColors.accent : AppColors.borderSubtle,
            width: AppBorders.hairline,
          ),
        ),
        child: Column(
          children: [
            Text(
              title,
              textAlign: TextAlign.center,
              style: AppTextStyles.caption.copyWith(
                color: selected ? AppColors.accent : AppColors.textSecondary,
                fontWeight: FontWeight.w500,
                fontSize: 11,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: AppTextStyles.label.copyWith(
                color: selected ? AppColors.accent : AppColors.textMuted,
                letterSpacing: 0,
                height: 1.3,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// A generic banner (icon + title + body + chips) used for the Shock Multiplier
/// (Layer M) and TDI (Layer N) callouts.
class InfoBanner extends StatelessWidget {
  const InfoBanner({
    super.key,
    required this.emoji,
    required this.title,
    required this.titleColor,
    required this.subtitle,
    required this.body,
    required this.background,
    required this.borderColor,
    required this.chips,
  });

  final String emoji;
  final String title;
  final Color titleColor;
  final String subtitle;

  /// Body with optional inline highlight; pass a [Text]/[RichText] widget.
  final Widget body;
  final Color background;
  final Color borderColor;
  final List<Widget> chips;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 9),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(AppRadii.inner),
        border: Border.all(color: borderColor, width: AppBorders.hairline),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 18)),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                RichText(
                  text: TextSpan(
                    style: AppTextStyles.bodySm.copyWith(
                      color: titleColor,
                      fontWeight: FontWeight.w500,
                    ),
                    children: [
                      TextSpan(text: title),
                      TextSpan(
                        text: ' — $subtitle',
                        style: AppTextStyles.caption.copyWith(
                          color: const Color(0xFF8B9FB8),
                          fontSize: 11,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 3),
                DefaultTextStyle.merge(
                  style: AppTextStyles.caption.copyWith(
                    color: const Color(0xFF8B9FB8),
                    fontSize: 11,
                    height: 1.5,
                  ),
                  child: body,
                ),
                const SizedBox(height: AppSpacing.xs + 1),
                Wrap(spacing: 5, runSpacing: 5, children: chips),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// World Status hero card: status pill + description + 2×2 metric grid.
class WorldStatusHero extends StatelessWidget {
  const WorldStatusHero({super.key});

  @override
  Widget build(BuildContext context) {
    return GeoCard(
      radius: AppRadii.card + 2,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'STATUS KEAMANAN DUNIA SAAT INI',
            style: AppTextStyles.label.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: AppSpacing.sm),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 5),
            decoration: BoxDecoration(
              color: const Color(0xFF3D2000),
              borderRadius: BorderRadius.circular(AppRadii.pill),
              border: Border.all(color: const Color(0xFF7A4800), width: AppBorders.hairline),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: AppColors.warning,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Text(
                  'Waspada — Perlu Perhatian',
                  style: AppTextStyles.body.copyWith(
                    color: AppColors.warning,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Ada 3 situasi aktif yang bisa berdampak ke investasi Anda. Shock '
            'Multiplier aktif meningkatkan semua risiko +12%.',
            style: AppTextStyles.body.copyWith(color: const Color(0xFF8B9FB8), height: 1.5),
          ),
          const SizedBox(height: AppSpacing.sm + 2),
          const _HeroGrid(),
        ],
      ),
    );
  }
}

class _HeroGrid extends StatelessWidget {
  const _HeroGrid();

  static const _cells = [
    ('7', 'Situasi aktif dipantau', AppColors.warning),
    ('3', 'Butuh perhatian segera', AppColors.danger),
    ('16', 'Lapisan AI aktif', AppColors.purple),
    ('−8%', 'Estimasi dampak portofolio', AppColors.warning),
  ];

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 7,
      crossAxisSpacing: 7,
      childAspectRatio: 2.5,
      children: [
        for (final c in _cells)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
            decoration: BoxDecoration(
              color: AppColors.surfaceAlt,
              borderRadius: BorderRadius.circular(AppRadii.inner),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  c.$1,
                  style: AppTextStyles.headline2.copyWith(color: c.$3),
                ),
                const SizedBox(height: 2),
                Text(
                  c.$2,
                  textAlign: TextAlign.center,
                  style: AppTextStyles.caption.copyWith(height: 1.3),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

/// Collapsible 16-layer framework strip. Tap to expand a wrap of layer chips.
class FrameworkStrip extends StatefulWidget {
  const FrameworkStrip({super.key, required this.periodLabel});

  /// e.g. "90 Hari" — reflected in the temporal (P) chip.
  final String periodLabel;

  @override
  State<FrameworkStrip> createState() => _FrameworkStripState();
}

class _FrameworkStripState extends State<FrameworkStrip> {
  bool _open = false;

  List<(String, SignalTone)> get _chips => [
        ('1 · Data Ingestion (9 domain)', SignalTone.info),
        ('2 · Grouping & Situasi', SignalTone.positive),
        ('A · Redline Index', SignalTone.danger),
        ('B · Perception Gap', SignalTone.warning),
        ('C · Military Logistics', SignalTone.danger),
        ('3 · Escalation Ladder', SignalTone.warning),
        ('D · Pivot Watch', SignalTone.info),
        ('4 · Probabilitas Bayesian', SignalTone.positive),
        ('E · 2nd & 3rd Order', SignalTone.info),
        ('F · Gray Zone', SignalTone.special),
        ('G · NSA Engine', SignalTone.warning),
        ('H · N×N Perception', SignalTone.danger),
        ('I · Nuclear Threshold', SignalTone.special),
        ('J · Financial Warfare', SignalTone.warning),
        ('K · Cognitive Stress', SignalTone.warning),
        ('L · Info Integrity', SignalTone.special),
        ('M · Shock Multiplier ×1.12', SignalTone.warning),
        ('N · Tech Disruption ↑', SignalTone.special),
        ('O · Regime Fragility', SignalTone.danger),
        ('P · Temporal: ${widget.periodLabel}', SignalTone.info),
      ];

  @override
  Widget build(BuildContext context) {
    return GeoCard(
      radius: AppRadii.cardSm,
      onTap: () => setState(() => _open = !_open),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Geoscan Framework v3.0 — 16 Lapisan AI Aktif',
                      style: AppTextStyles.bodySm.copyWith(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Tap untuk lihat semua faktor yang sedang berjalan',
                      style: AppTextStyles.caption,
                    ),
                  ],
                ),
              ),
              Icon(
                _open ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                size: 18,
                color: AppColors.textSecondary,
              ),
            ],
          ),
          if (_open) ...[
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: 3,
              runSpacing: 3,
              children: [
                for (final c in _chips) ToneChip(label: c.$1, tone: c.$2),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

/// Blue CTA banner: "Ada 3 langkah yang bisa Anda ambil sekarang".
class ProtectionCta extends StatelessWidget {
  const ProtectionCta({super.key, this.onTap});

  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GeoCard(
      radius: AppRadii.cardSm,
      color: AppColors.accentDark,
      borderColor: AppColors.accent,
      onTap: onTap,
      padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 11),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: const Color(0xFF1A3A6A),
              borderRadius: BorderRadius.circular(AppRadii.inner),
            ),
            child: const Icon(Icons.verified_user_outlined, size: 18, color: AppColors.accent),
          ),
          const SizedBox(width: 9),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Ada 3 langkah yang bisa Anda ambil sekarang',
                  style: AppTextStyles.bodySm.copyWith(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  'Lindungi portofolio dari risiko aktif',
                  style: AppTextStyles.caption.copyWith(color: const Color(0xFF8B9FB8)),
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, size: 18, color: AppColors.accent),
        ],
      ),
    );
  }
}
