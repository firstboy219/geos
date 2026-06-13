import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';

/// Semantic tone applied to chips, bars and tags across the analysis UI.
///
/// Maps directly to the Geoscan palette (BAB 7.1) so that a single enum drives
/// foreground / background / border colors consistently.
enum SignalTone { positive, neutral, warning, danger, info, special }

extension SignalToneColors on SignalTone {
  Color get fg => switch (this) {
        SignalTone.positive => AppColors.success,
        SignalTone.neutral => AppColors.textSecondary,
        SignalTone.warning => AppColors.warning,
        SignalTone.danger => AppColors.danger,
        SignalTone.info => AppColors.accent,
        SignalTone.special => AppColors.purple,
      };

  Color get bg => switch (this) {
        SignalTone.positive => AppColors.successDark,
        SignalTone.neutral => AppColors.border,
        SignalTone.warning => AppColors.warningDark,
        SignalTone.danger => AppColors.dangerDark,
        SignalTone.info => AppColors.accentDark,
        SignalTone.special => AppColors.purpleDark,
      };

  Color get border => switch (this) {
        SignalTone.positive => AppColors.successBorder,
        SignalTone.neutral => AppColors.border,
        SignalTone.warning => AppColors.warningBorder,
        SignalTone.danger => AppColors.dangerBorder,
        SignalTone.info => AppColors.accentBorder,
        SignalTone.special => AppColors.purpleBorder,
      };
}

/// One piece of supporting evidence behind a scenario probability
/// (Bayesian engine — Layer 4 / evidence accordion in the mockup).
class Evidence {
  const Evidence({
    required this.text,
    required this.source,
    required this.tag,
    this.tone = SignalTone.neutral,
    this.icon = Icons.circle,
  });

  final String text;
  final String source;

  /// Short classification label shown as a colored tag under the evidence.
  final String tag;
  final SignalTone tone;
  final IconData icon;
}

/// A 2nd / 3rd-order domino effect chip (Layer E).
class DominoEffect {
  const DominoEffect(this.label, [this.tone = SignalTone.neutral]);

  final String label;
  final SignalTone tone;
}

/// An industry-impact chip (↑ / ↓ / → / !).
enum ImpactDirection { up, down, neutral, watch }

class IndustryImpact {
  const IndustryImpact(this.label, this.direction);

  final String label;
  final ImpactDirection direction;
}

/// A scenario tag with an explanatory tooltip (rung, duration, layer flag).
class ScenarioTag {
  const ScenarioTag({
    required this.label,
    required this.tooltip,
    this.tone = SignalTone.info,
  });

  final String label;
  final String tooltip;
  final SignalTone tone;
}

/// A single weapon line inside the Financial Warfare card (Layer J).
class FinancialWeapon {
  const FinancialWeapon({
    required this.flag,
    required this.text,
    required this.asymmetry,
    this.tone = SignalTone.warning,
  });

  final String flag;
  final String text;
  final String asymmetry;
  final SignalTone tone;
}

/// A nuclear-threshold indicator line (Layer I).
class NuclearIndicator {
  const NuclearIndicator(this.label, this.value, [this.tone = SignalTone.special]);

  final String label;
  final String value;
  final SignalTone tone;
}

/// A full scenario with probability, escalation rung, evidence and impacts.
///
/// Mirrors the expandable scenario blocks in `Home_screen.html`
/// (Bayesian probability + confidence + 2nd-order effects + industry impacts).
class ScenarioModel {
  const ScenarioModel({
    required this.name,
    required this.probability,
    required this.tone,
    required this.hint,
    this.rung,
    this.duration,
    this.tags = const [],
    this.evidences = const [],
    this.confidenceScore = 0,
    this.confidenceFormula = '',
    this.dominoEffects = const [],
    this.industryImpacts = const [],
    this.financialWeapons = const [],
    this.nuclearIndicators = const [],
  });

  final String name;

  /// 0–100 probability share.
  final int probability;
  final SignalTone tone;

  /// One-line plain-language hint shown under the tags.
  final String hint;

  /// Escalation rung label (Layer 3), e.g. "Rung 2 — Posturing".
  final String? rung;
  final String? duration;
  final List<ScenarioTag> tags;
  final List<Evidence> evidences;

  /// 0–100 AI confidence in this estimate (Layer 4 Bayesian).
  final int confidenceScore;
  final String confidenceFormula;
  final List<DominoEffect> dominoEffects;
  final List<IndustryImpact> industryImpacts;

  /// Optional Financial Warfare sub-card (Layer J).
  final List<FinancialWeapon> financialWeapons;

  /// Optional Nuclear Threshold sub-card (Layer I).
  final List<NuclearIndicator> nuclearIndicators;
}
