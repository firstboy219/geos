import 'package:flutter/material.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../models/scenario_model.dart';
import 'home_primitives.dart';

/// Full expandable scenario block: header + bar + tags + hint + (financial
/// warfare / nuclear sub-cards) + evidence accordion + confidence bar +
/// 2nd/3rd-order domino chips + industry impact chips.
///
/// Mirrors the `.scn` blocks in `Home_screen.html`.
class ScenarioDetail extends StatelessWidget {
  const ScenarioDetail({super.key, required this.scenario, this.showDivider = true});

  final ScenarioModel scenario;
  final bool showDivider;

  @override
  Widget build(BuildContext context) {
    final s = scenario;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg - 2, vertical: 11),
      decoration: BoxDecoration(
        border: showDivider
            ? const Border(bottom: BorderSide(color: AppColors.borderSubtle, width: 0.5))
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  s.name,
                  style: AppTextStyles.bodySm.copyWith(
                    color: const Color(0xFFC9D1D9),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              Text(
                '${s.probability}%',
                style: AppTextStyles.title.copyWith(color: s.tone.fg, fontSize: 15),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          ToneBar(percent: s.probability, tone: s.tone, height: 6),
          if (s.tags.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: 3,
              runSpacing: 3,
              children: [
                for (final t in s.tags)
                  TooltipChip(label: t.label, tooltip: t.tooltip, tone: t.tone),
              ],
            ),
          ],
          const SizedBox(height: AppSpacing.sm),
          Text(
            s.hint,
            style: AppTextStyles.caption.copyWith(color: AppColors.textMuted, height: 1.4),
          ),
          if (s.financialWeapons.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.sm),
            _FinancialWarfareCard(weapons: s.financialWeapons),
          ],
          if (s.nuclearIndicators.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.sm),
            _NuclearCard(indicators: s.nuclearIndicators),
          ],
          if (s.evidences.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.sm),
            _EvidenceAccordion(scenario: s),
          ],
          const SizedBox(height: AppSpacing.xs + 1),
          _ConfidenceBar(score: s.confidenceScore, formula: s.confidenceFormula, tone: s.tone),
          if (s.dominoEffects.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.xs + 1),
            _DominoSection(effects: s.dominoEffects),
          ],
          if (s.industryImpacts.isNotEmpty) ...[
            const SizedBox(height: 3),
            _IndustrySection(impacts: s.industryImpacts),
          ],
        ],
      ),
    );
  }
}

class _FinancialWarfareCard extends StatelessWidget {
  const _FinancialWarfareCard({required this.weapons});

  final List<FinancialWeapon> weapons;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm + 2, vertical: AppSpacing.sm),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1208),
        borderRadius: BorderRadius.circular(AppRadii.chip),
        border: Border.all(color: const Color(0xFF7A4800), width: AppBorders.hairline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.gavel, size: 12, color: AppColors.warning),
              const SizedBox(width: 5),
              Expanded(
                child: RichText(
                  text: TextSpan(
                    style: AppTextStyles.bodySm.copyWith(
                      color: AppColors.warning,
                      fontWeight: FontWeight.w500,
                    ),
                    children: const [
                      TextSpan(text: 'Financial Warfare Inventory (Lapisan J)'),
                      TextSpan(
                        text: ' — senjata ekonomi yang bisa ditembakkan',
                        style: TextStyle(
                          color: Color(0xFF8B9FB8),
                          fontSize: 10,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 5),
          for (final w in weapons)
            Padding(
              padding: const EdgeInsets.only(bottom: 5),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(w.flag, style: const TextStyle(fontSize: 12)),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          w.text,
                          style: AppTextStyles.bodySm.copyWith(color: const Color(0xFFC9D1D9)),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          w.asymmetry,
                          style: AppTextStyles.caption.copyWith(color: w.tone.fg),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _NuclearCard extends StatelessWidget {
  const _NuclearCard({required this.indicators});

  final List<NuclearIndicator> indicators;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm + 2, vertical: AppSpacing.sm),
      decoration: BoxDecoration(
        color: const Color(0xFF1A0820),
        borderRadius: BorderRadius.circular(AppRadii.chip),
        border: Border.all(color: AppColors.purpleBorder, width: AppBorders.hairline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: const [
              Icon(Icons.dangerous_outlined, size: 12, color: AppColors.purple),
              SizedBox(width: 5),
              Text(
                'Nuclear Threshold (Lapisan I)',
                style: TextStyle(
                  color: AppColors.purple,
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 5),
          for (final i in indicators)
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                children: [
                  const Icon(Icons.circle, size: 6, color: AppColors.purple),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      i.label,
                      style: AppTextStyles.bodySm.copyWith(color: const Color(0xFFC9D1D9)),
                    ),
                  ),
                  Text(
                    i.value,
                    style: AppTextStyles.bodySm.copyWith(
                      color: i.tone.fg,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _EvidenceAccordion extends StatefulWidget {
  const _EvidenceAccordion({required this.scenario});

  final ScenarioModel scenario;

  @override
  State<_EvidenceAccordion> createState() => _EvidenceAccordionState();
}

class _EvidenceAccordionState extends State<_EvidenceAccordion> {
  bool _open = false;

  @override
  Widget build(BuildContext context) {
    final s = widget.scenario;
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(9),
        border: Border.all(color: AppColors.borderSubtle, width: AppBorders.hairline),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(9),
        child: Column(
          children: [
            InkWell(
              onTap: () => setState(() => _open = !_open),
              child: Container(
                color: AppColors.surfaceAlt,
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm + 2, vertical: 7),
                child: Row(
                  children: [
                    Icon(Icons.storage_outlined, size: 13, color: s.tone.fg),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        'Mengapa ${s.probability}%? — Faktor pendukung & bukti nyata',
                        style: AppTextStyles.bodySm.copyWith(
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    ToneChip(label: '${s.evidences.length} bukti', tone: s.tone, radius: 10),
                    const SizedBox(width: 4),
                    Icon(
                      _open ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                      size: 14,
                      color: AppColors.textSecondary,
                    ),
                  ],
                ),
              ),
            ),
            if (_open)
              Container(
                color: AppColors.surfaceAlt,
                child: Column(
                  children: [
                    for (var i = 0; i < s.evidences.length; i++)
                      _EvidenceRow(
                        evidence: s.evidences[i],
                        last: i == s.evidences.length - 1,
                      ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _EvidenceRow extends StatelessWidget {
  const _EvidenceRow({required this.evidence, required this.last});

  final Evidence evidence;
  final bool last;

  @override
  Widget build(BuildContext context) {
    final e = evidence;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm + 2, vertical: 7),
      decoration: BoxDecoration(
        border: last
            ? null
            : const Border(bottom: BorderSide(color: AppColors.surface, width: 0.5)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 22,
            height: 22,
            decoration: BoxDecoration(color: e.tone.bg, borderRadius: BorderRadius.circular(5)),
            child: Icon(e.icon, size: 11, color: e.tone.fg),
          ),
          const SizedBox(width: 7),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  e.text,
                  style: AppTextStyles.bodySm.copyWith(color: const Color(0xFFC9D1D9), height: 1.5),
                ),
                const SizedBox(height: 2),
                Text(e.source, style: AppTextStyles.caption.copyWith(color: e.tone.fg)),
                const SizedBox(height: 3),
                ToneChip(label: e.tag, tone: e.tone, radius: 6),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ConfidenceBar extends StatelessWidget {
  const _ConfidenceBar({required this.score, required this.formula, required this.tone});

  final int score;
  final String formula;
  final SignalTone tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.surfaceAlt,
        borderRadius: BorderRadius.circular(7),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Tingkat kepercayaan AI (Confidence Score)',
                  style: AppTextStyles.bodySm,
                ),
                const SizedBox(height: 1),
                Text(formula, style: AppTextStyles.caption),
              ],
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          SizedBox(width: 60, child: ToneBar(percent: score, tone: tone, height: 4)),
          SizedBox(
            width: 30,
            child: Text(
              '$score%',
              textAlign: TextAlign.right,
              style: AppTextStyles.bodySm.copyWith(color: tone.fg, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }
}

class _DominoSection extends StatelessWidget {
  const _DominoSection({required this.effects});

  final List<DominoEffect> effects;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 7),
      decoration: BoxDecoration(
        color: AppColors.surfaceAlt,
        borderRadius: BorderRadius.circular(AppRadii.chip),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'EFEK DOMINO (2ND & 3RD ORDER — LAPISAN E)',
            style: AppTextStyles.label.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 5),
          Wrap(
            spacing: 3,
            runSpacing: 3,
            children: [
              for (final e in effects) ToneChip(label: e.label, tone: e.tone, radius: 10),
            ],
          ),
        ],
      ),
    );
  }
}

class _IndustrySection extends StatelessWidget {
  const _IndustrySection({required this.impacts});

  final List<IndustryImpact> impacts;

  ({String prefix, SignalTone tone}) _style(ImpactDirection d) => switch (d) {
        ImpactDirection.up => (prefix: '↑ ', tone: SignalTone.positive),
        ImpactDirection.down => (prefix: '↓ ', tone: SignalTone.danger),
        ImpactDirection.neutral => (prefix: '→ ', tone: SignalTone.neutral),
        ImpactDirection.watch => (prefix: '! ', tone: SignalTone.warning),
      };

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.surfaceAlt,
        borderRadius: BorderRadius.circular(AppRadii.chip),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'DAMPAK KE INDUSTRI',
            style: AppTextStyles.label.copyWith(color: AppColors.textSecondary),
          ),
          const SizedBox(height: 5),
          Wrap(
            spacing: 3,
            runSpacing: 3,
            children: [
              for (final i in impacts)
                ToneChip(
                  label: '${_style(i.direction).prefix}${i.label}',
                  tone: _style(i.direction).tone,
                  radius: 14,
                ),
            ],
          ),
        ],
      ),
    );
  }
}
