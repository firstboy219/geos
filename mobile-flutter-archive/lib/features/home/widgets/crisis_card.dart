import 'package:flutter/material.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/risk_pill.dart';
import '../models/crisis_model.dart';
import '../models/scenario_model.dart';
import 'home_primitives.dart';
import 'scenario_detail.dart';

/// A full crisis / situation card (collapsed preview + expandable scenarios),
/// mirroring the Natuna block in `Home_screen.html`.
class CrisisCard extends StatefulWidget {
  const CrisisCard({super.key, required this.crisis});

  final CrisisModel crisis;

  @override
  State<CrisisCard> createState() => _CrisisCardState();
}

class _CrisisCardState extends State<CrisisCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final c = widget.crisis;
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm + 2),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadii.card),
        border: Border.all(color: AppColors.border, width: AppBorders.hairline),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppRadii.card),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 13, 14, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _Header(crisis: c),
                  const SizedBox(height: AppSpacing.sm),
                  _InfoIntegrityRow(crisis: c),
                  const SizedBox(height: 7),
                  _StatusLine(crisis: c),
                  const SizedBox(height: AppSpacing.sm),
                  _LayerChips(chips: c.layerChips),
                  const SizedBox(height: AppSpacing.sm),
                  _SummaryBlurb(crisis: c),
                  const SizedBox(height: AppSpacing.sm),
                  if (c.actors.isNotEmpty) ...[
                    _ActorSection(actors: c.actors),
                    const SizedBox(height: AppSpacing.sm),
                  ],
                  if (c.pivotWatches.isNotEmpty) ...[
                    _PivotWatchSection(items: c.pivotWatches),
                    const SizedBox(height: AppSpacing.sm),
                  ],
                  Text('Apa yang paling mungkin terjadi:', style: AppTextStyles.bodySm),
                  const SizedBox(height: 7),
                  for (final b in c.probabilityBars)
                    MetricBarRow(label: b.label, percent: b.percent, tone: b.tone),
                  const SizedBox(height: 5),
                  if (c.scenarios.isNotEmpty)
                    InkWell(
                      onTap: () => setState(() => _expanded = !_expanded),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(vertical: 5),
                        child: Row(
                          children: [
                            Icon(
                              _expanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                              size: 14,
                              color: AppColors.accent,
                            ),
                            const SizedBox(width: 3),
                            Expanded(
                              child: Text(
                                _expanded
                                    ? 'Tutup detail'
                                    : 'Lihat semua skenario + bukti pendukung + dampak industri',
                                style: AppTextStyles.bodySm.copyWith(color: AppColors.accent),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  const SizedBox(height: AppSpacing.sm),
                ],
              ),
            ),
            if (_expanded && c.scenarios.isNotEmpty)
              DecoratedBox(
                decoration: const BoxDecoration(
                  border: Border(top: BorderSide(color: AppColors.borderSubtle, width: 0.5)),
                ),
                child: Column(
                  children: [
                    for (var i = 0; i < c.scenarios.length; i++)
                      ScenarioDetail(
                        scenario: c.scenarios[i],
                        showDivider: i != c.scenarios.length - 1,
                      ),
                  ],
                ),
              ),
            _Footer(),
          ],
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.crisis});

  final CrisisModel crisis;

  @override
  Widget build(BuildContext context) {
    final c = crisis;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(c.flag, style: const TextStyle(fontSize: 18)),
        const SizedBox(width: 7),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                c.title,
                style: AppTextStyles.titleSm.copyWith(fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 2),
              Text(c.location, style: AppTextStyles.caption),
            ],
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            RiskPill(level: c.riskLevel, label: c.riskLabel),
            if (c.grayZone) ...[
              const SizedBox(height: 4),
              const ToneChip(label: '⟷ Gray Zone aktif', tone: SignalTone.special),
            ],
          ],
        ),
      ],
    );
  }
}

class _InfoIntegrityRow extends StatelessWidget {
  const _InfoIntegrityRow({required this.crisis});

  final CrisisModel crisis;

  @override
  Widget build(BuildContext context) {
    final c = crisis;
    final ok = c.credibilityScore >= 80;
    final tone = ok
        ? SignalTone.positive
        : (c.credibilityScore >= 70 ? SignalTone.warning : SignalTone.special);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.surfaceAlt,
        borderRadius: BorderRadius.circular(7),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(color: tone.fg, shape: BoxShape.circle),
            ),
          ),
          const SizedBox(width: 6),
          Expanded(
            child: RichText(
              text: TextSpan(
                style: AppTextStyles.bodySm.copyWith(color: const Color(0xFFC9D1D9)),
                children: [
                  TextSpan(
                    text: 'Credibility Score ${c.credibilityScore}%',
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                  TextSpan(
                    text: ' — ${c.credibilityNote}',
                    style: const TextStyle(color: AppColors.textSecondary),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 6),
          ToneChip(label: ok ? 'L ✓' : 'L ⚠', tone: tone, radius: 6),
        ],
      ),
    );
  }
}

class _StatusLine extends StatelessWidget {
  const _StatusLine({required this.crisis});

  final CrisisModel crisis;

  @override
  Widget build(BuildContext context) {
    final c = crisis;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm + 2, vertical: AppSpacing.sm),
      decoration: BoxDecoration(
        color: c.statusTone.bg,
        borderRadius: BorderRadius.circular(AppRadii.chip),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 3),
            child: Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(color: c.statusTone.fg, shape: BoxShape.circle),
            ),
          ),
          const SizedBox(width: 6),
          Expanded(
            child: Text(
              c.statusText,
              style: AppTextStyles.bodySm.copyWith(color: c.statusTone.fg, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }
}

class _LayerChips extends StatelessWidget {
  const _LayerChips({required this.chips});

  final List<CrisisLayerChip> chips;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 3,
      runSpacing: 3,
      children: [
        for (final c in chips)
          TooltipChip(
            label: '${c.code} · ${c.label}',
            tooltip: c.tooltip,
            tone: c.tone,
          ),
      ],
    );
  }
}

class _SummaryBlurb extends StatelessWidget {
  const _SummaryBlurb({required this.crisis});

  final CrisisModel crisis;

  @override
  Widget build(BuildContext context) {
    final c = crisis;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 9),
      decoration: BoxDecoration(
        color: AppColors.surfaceAlt,
        borderRadius: BorderRadius.circular(AppRadii.inner),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const MicroLabel('Ringkasan situasi', trailing: '· Lapisan H — N×N Perception Matrix'),
          const SizedBox(height: 5),
          Text(
            c.summaryText,
            style: AppTextStyles.bodySm.copyWith(color: const Color(0xFFC9D1D9), height: 1.6),
          ),
          if (c.perceptions.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Bagaimana setiap pihak membaca situasi ini (sumber utama kesalahpahaman):',
              style: AppTextStyles.bodySm.copyWith(
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 5),
            _PerceptionGrid(reads: c.perceptions),
          ],
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 5),
            decoration: BoxDecoration(
              color: AppColors.dangerDark,
              borderRadius: BorderRadius.circular(6),
            ),
            child: RichText(
              text: TextSpan(
                style: AppTextStyles.caption.copyWith(color: AppColors.danger, height: 1.5),
                children: [
                  const TextSpan(text: '⚠ '),
                  TextSpan(text: c.cascadeNote),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PerceptionGrid extends StatelessWidget {
  const _PerceptionGrid({required this.reads});

  final List<PerceptionRead> reads;

  @override
  Widget build(BuildContext context) {
    // Lay out perception cells two-per-row, each row sized to its tallest cell
    // (avoids overflow from variable text lengths).
    final rows = <Widget>[];
    for (var i = 0; i < reads.length; i += 2) {
      rows.add(
        Padding(
          padding: EdgeInsets.only(top: i == 0 ? 0 : 4),
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(child: _cell(reads[i])),
                const SizedBox(width: 4),
                Expanded(
                  child: i + 1 < reads.length ? _cell(reads[i + 1]) : const SizedBox(),
                ),
              ],
            ),
          ),
        ),
      );
    }
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: rows);
  }

  Widget _cell(PerceptionRead r) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(7),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(r.actor, style: AppTextStyles.caption),
          const SizedBox(height: 2),
          Text(
            r.reading,
            style: AppTextStyles.caption.copyWith(
              color: const Color(0xFFC9D1D9),
              fontSize: 11,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            r.verdict,
            style: AppTextStyles.caption.copyWith(color: r.tone.fg, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}

class _ActorSection extends StatelessWidget {
  const _ActorSection({required this.actors});

  final List<ActorModel> actors;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm + 2, vertical: AppSpacing.sm),
      decoration: BoxDecoration(
        color: AppColors.surfaceAlt,
        borderRadius: BorderRadius.circular(AppRadii.inner),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'PROFIL AKTOR KUNCI — LAPISAN K (COGNITIVE STRESS) + O (REGIME FRAGILITY)',
            style: AppTextStyles.label.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 7),
          for (var i = 0; i < actors.length; i++) ...[
            _ActorRow(actor: actors[i]),
            if (i != actors.length - 1) const SizedBox(height: 6),
          ],
        ],
      ),
    );
  }
}

class _ActorRow extends StatelessWidget {
  const _ActorRow({required this.actor});

  final ActorModel actor;

  @override
  Widget build(BuildContext context) {
    final a = actor;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 28,
          height: 28,
          alignment: Alignment.center,
          decoration: const BoxDecoration(color: Color(0xFF1A2740), shape: BoxShape.circle),
          child: Text(
            a.initials,
            style: AppTextStyles.caption.copyWith(color: AppColors.accent, fontWeight: FontWeight.w500),
          ),
        ),
        const SizedBox(width: 7),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                a.name,
                style: AppTextStyles.bodySm.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 3),
              Wrap(
                spacing: 3,
                runSpacing: 3,
                children: [
                  for (final s in a.scores)
                    TooltipChip(label: s.label, tooltip: s.tooltip, tone: s.tone),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Text('Tekanan domestik:', style: AppTextStyles.caption),
                  const SizedBox(width: 5),
                  for (var i = 0; i < 5; i++)
                    Padding(
                      padding: const EdgeInsets.only(right: 2),
                      child: Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: i < a.stressLevel ? a.stressTone.fg : AppColors.border,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                  const SizedBox(width: 3),
                  Flexible(
                    child: Text(
                      a.stressLabel,
                      style: AppTextStyles.caption.copyWith(color: a.stressTone.fg),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _PivotWatchSection extends StatelessWidget {
  const _PivotWatchSection({required this.items});

  final List<PivotWatch> items;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm + 2, vertical: AppSpacing.sm),
      decoration: BoxDecoration(
        color: AppColors.surfaceAlt,
        borderRadius: BorderRadius.circular(AppRadii.inner),
        border: Border.all(color: AppColors.border, width: AppBorders.hairline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.flag_outlined, size: 12, color: AppColors.danger),
              const SizedBox(width: 5),
              Expanded(
                child: Text(
                  'PIVOT WATCH LIST (LAPISAN D)',
                  style: AppTextStyles.label.copyWith(color: AppColors.textSecondary),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          for (var i = 0; i < items.length; i++)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 5),
              decoration: BoxDecoration(
                border: i == items.length - 1
                    ? null
                    : const Border(bottom: BorderSide(color: AppColors.borderSubtle, width: 0.5)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 20,
                    height: 20,
                    decoration: BoxDecoration(
                      color: items[i].tone.bg,
                      borderRadius: BorderRadius.circular(5),
                    ),
                    child: Icon(items[i].icon, size: 11, color: items[i].tone.fg),
                  ),
                  const SizedBox(width: 7),
                  Expanded(
                    child: Text(
                      items[i].text,
                      style: AppTextStyles.caption.copyWith(
                        color: const Color(0xFFC9D1D9),
                        fontSize: 11,
                        height: 1.4,
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  ToneChip(label: items[i].badge, tone: items[i].tone, radius: 7),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _Footer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: AppColors.borderSubtle, width: 0.5)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'Lihat impact vector lengkap →',
            style: AppTextStyles.bodySm.copyWith(
              color: AppColors.accent,
              fontWeight: FontWeight.w500,
            ),
          ),
          Text('Live · 16 lapisan aktif', style: AppTextStyles.caption),
        ],
      ),
    );
  }
}
