import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/risk_pill.dart';

/// Tone used by impact bars / indicators / asset badges.
enum VectorTone { positive, caution, negative, neutral, special }

extension VectorToneColors on VectorTone {
  Color get fg => switch (this) {
        VectorTone.positive => AppColors.success,
        VectorTone.caution => AppColors.warning,
        VectorTone.negative => AppColors.danger,
        VectorTone.neutral => AppColors.textSecondary,
        VectorTone.special => AppColors.purple,
      };

  Color get bg => switch (this) {
        VectorTone.positive => AppColors.successDark,
        VectorTone.caution => AppColors.warningDark,
        VectorTone.negative => AppColors.dangerDark,
        VectorTone.neutral => AppColors.borderSubtle,
        VectorTone.special => AppColors.purpleDark,
      };

  Color get border => switch (this) {
        VectorTone.positive => AppColors.successBorder,
        VectorTone.caution => AppColors.warningBorder,
        VectorTone.negative => AppColors.dangerBorder,
        VectorTone.neutral => AppColors.border,
        VectorTone.special => AppColors.purpleBorder,
      };
}

enum ImpactDir { up, down, flat }

extension ImpactDirView on ImpactDir {
  String get arrow => switch (this) {
        ImpactDir.up => '↑',
        ImpactDir.down => '↓',
        ImpactDir.flat => '→',
      };

  VectorTone get tone => switch (this) {
        ImpactDir.up => VectorTone.positive,
        ImpactDir.down => VectorTone.negative,
        ImpactDir.flat => VectorTone.neutral,
      };
}

/// One of the three framework output vectors (Escalation/Hybridization/Duration).
class ImpactVector {
  const ImpactVector({
    required this.label,
    required this.value, // 0.0 - 1.0
    required this.tag,
    required this.tone,
  });

  final String label;
  final double value;
  final String tag;
  final VectorTone tone;
}

class KeyIndicator {
  const KeyIndicator({required this.text, required this.tone});
  final String text;
  final VectorTone tone;
}

class AssetImpact {
  const AssetImpact({
    required this.name,
    required this.sub,
    required this.dir,
    required this.detail,
  });

  final String name;
  final String sub;
  final ImpactDir dir;
  final String detail; // shown in bottom sheet
}

/// A single scenario within a crisis impact vector.
class VectorScenario {
  const VectorScenario({
    required this.code,
    required this.name,
    required this.probability,
    required this.rung,
    required this.narrative,
    required this.vectors,
    required this.indicators,
    required this.assets,
  });

  final String code; // A..E
  final String name;
  final double probability; // 0.0 - 1.0
  final int rung; // 1..6
  final String narrative;
  final List<ImpactVector> vectors;
  final List<KeyIndicator> indicators;
  final List<AssetImpact> assets;

  String get tabLabel => '$code · ${(probability * 100).round()}%';
}

class CrisisLayerTag {
  const CrisisLayerTag({
    required this.code,
    required this.label,
    required this.tooltip,
    this.color = AppColors.accent,
  });
  final String code;
  final String label;
  final String tooltip;
  final Color color;
}

/// A crisis with its full impact-vector breakdown.
class ImpactCrisis {
  const ImpactCrisis({
    required this.id,
    required this.flag,
    required this.name,
    required this.subLocation,
    required this.riskLevel,
    required this.riskLabel,
    required this.tripwires,
    required this.actors,
    required this.lastUpdate,
    required this.layers,
    required this.scenarios,
  });

  final String id;
  final String flag;
  final String name;
  final String subLocation;
  final RiskLevel riskLevel;
  final String riskLabel;
  final int tripwires;
  final int actors;
  final String lastUpdate;
  final List<CrisisLayerTag> layers;
  final List<VectorScenario> scenarios;
}
