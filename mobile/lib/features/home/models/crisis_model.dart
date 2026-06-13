import 'package:flutter/material.dart';

import '../../../core/widgets/risk_pill.dart';
import 'scenario_model.dart';

/// A small layer chip on a crisis card (e.g. `A · Redline 3/10`) with a
/// tap-to-reveal tooltip explaining the layer (BAB 2 — 16 layers).
class CrisisLayerChip {
  const CrisisLayerChip({
    required this.code,
    required this.label,
    required this.tooltip,
    this.tone = SignalTone.info,
  });

  final String code;
  final String label;
  final String tooltip;
  final SignalTone tone;
}

/// One cell of the N×N Perception Matrix (Layer H) — how actor X reads actor Y.
class PerceptionRead {
  const PerceptionRead({
    required this.actor,
    required this.reading,
    required this.verdict,
    required this.tone,
  });

  /// e.g. "🇨🇳 China membaca Indonesia".
  final String actor;

  /// The perceived reading, e.g. "Diam = setuju secara diam-diam".
  final String reading;

  /// Verdict label, e.g. "Misread ⚠ — sangat berbahaya".
  final String verdict;
  final SignalTone tone;
}

/// One score chip for a key actor (RCS / CSI / RFS / decision style),
/// with a tap tooltip (Layers K + O).
class ActorScore {
  const ActorScore({
    required this.label,
    required this.tooltip,
    this.tone = SignalTone.info,
  });

  final String label;
  final String tooltip;
  final SignalTone tone;
}

/// A key decision-maker profile (Layer K Cognitive Stress + O Regime Fragility).
class ActorModel {
  const ActorModel({
    required this.initials,
    required this.name,
    required this.scores,
    required this.stressLabel,
    required this.stressLevel,
    this.stressTone = SignalTone.warning,
  });

  final String initials;
  final String name;
  final List<ActorScore> scores;

  /// e.g. "Sedang — mulai naik".
  final String stressLabel;

  /// Filled dots out of 5.
  final int stressLevel;
  final SignalTone stressTone;
}

/// An item in the Pivot Watch list (Layer D) — an event that, if it occurs,
/// flips all probabilities.
class PivotWatch {
  const PivotWatch({
    required this.text,
    required this.badge,
    required this.tone,
    this.icon = Icons.flag_outlined,
  });

  final String text;
  final String badge;
  final SignalTone tone;
  final IconData icon;
}

/// A compact probability bar shown in the collapsed crisis card preview.
class ProbabilityBar {
  const ProbabilityBar(this.label, this.percent, this.tone);

  final String label;
  final int percent;
  final SignalTone tone;
}

/// A complete crisis / situation card matching the mockup's Natuna block.
class CrisisModel {
  const CrisisModel({
    required this.id,
    required this.flag,
    required this.title,
    required this.location,
    required this.riskLevel,
    required this.riskLabel,
    required this.statusText,
    required this.statusTone,
    required this.summaryText,
    required this.credibilityScore,
    required this.credibilityNote,
    this.grayZone = true,
    required this.redlineIndex,
    required this.misreadScore,
    required this.csiScore,
    required this.rfsScore,
    required this.cascadeNote,
    this.layerChips = const [],
    this.perceptions = const [],
    this.actors = const [],
    this.pivotWatches = const [],
    this.probabilityBars = const [],
    this.scenarios = const [],
  });

  final String id;
  final String flag;
  final String title;
  final String location;
  final RiskLevel riskLevel;
  final String riskLabel;

  /// Status line under the title (e.g. "Kemungkinan besar tidak ada konflik…").
  final String statusText;
  final SignalTone statusTone;
  final String summaryText;

  /// 0–100 Info Integrity credibility (Layer L).
  final int credibilityScore;
  final String credibilityNote;
  final bool grayZone;

  // Layer scalar scores (out of 10) — exposed for reuse by other features.
  final int redlineIndex;
  final int misreadScore;
  final int csiScore;
  final int rfsScore;

  /// Cascade / spiral risk callout (Layer H).
  final String cascadeNote;

  final List<CrisisLayerChip> layerChips;
  final List<PerceptionRead> perceptions;
  final List<ActorModel> actors;
  final List<PivotWatch> pivotWatches;
  final List<ProbabilityBar> probabilityBars;
  final List<ScenarioModel> scenarios;
}

/// A news item for the Berita & Umpan feed (Layer L credibility).
class NewsArticle {
  const NewsArticle({
    required this.source,
    required this.time,
    required this.headline,
    required this.category,
    required this.credibilityLabel,
    required this.credibilityTone,
    required this.sourceTone,
    this.tripwire,
  });

  final String source;
  final String time;
  final String headline;
  final String category;
  final String credibilityLabel;
  final SignalTone credibilityTone;
  final SignalTone sourceTone;

  /// Optional tripwire badge, e.g. "Memicu Tripwire TW-01".
  final String? tripwire;
}

/// A social / OSINT post — including deepfake alerts (Layer L uncertainty).
class SocialPost {
  const SocialPost({
    required this.source,
    required this.time,
    required this.headline,
    required this.note,
    required this.badge,
    required this.tone,
  });

  final String source;
  final String time;
  final String headline;
  final String note;
  final String badge;
  final SignalTone tone;
}
