import 'package:flutter/material.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../models/scenario_model.dart';

/// Small reusable building blocks shared by the home analysis widgets.

/// A tinted "tone" chip: small rounded label colored from a [SignalTone].
class ToneChip extends StatelessWidget {
  const ToneChip({
    super.key,
    required this.label,
    required this.tone,
    this.bold = true,
    this.radius = AppRadii.chip,
  });

  final String label;
  final SignalTone tone;
  final bool bold;
  final double radius;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: tone.bg,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: tone.border, width: AppBorders.hairline),
      ),
      child: Text(
        label,
        style: AppTextStyles.caption.copyWith(
          color: tone.fg,
          fontWeight: bold ? FontWeight.w500 : FontWeight.w400,
        ),
      ),
    );
  }
}

/// A horizontal progress bar (track + fill) used for scenario probabilities and
/// confidence scores.
class ToneBar extends StatelessWidget {
  const ToneBar({
    super.key,
    required this.percent,
    required this.tone,
    this.height = 6,
    this.trackColor = AppColors.border,
  });

  final int percent;
  final SignalTone tone;
  final double height;
  final Color trackColor;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(height / 2),
      child: Stack(
        children: [
          Container(height: height, color: trackColor),
          FractionallySizedBox(
            widthFactor: (percent.clamp(0, 100)) / 100,
            child: Container(height: height, color: tone.fg),
          ),
        ],
      ),
    );
  }
}

/// A small uppercase label used as a section sub-heading inside cards.
class MicroLabel extends StatelessWidget {
  const MicroLabel(this.text, {super.key, this.trailing});

  final String text;
  final String? trailing;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        Flexible(
          child: Text(
            text.toUpperCase(),
            style: AppTextStyles.label.copyWith(color: AppColors.textSecondary),
          ),
        ),
        if (trailing != null) ...[
          const SizedBox(width: AppSpacing.xs),
          Flexible(
            child: Text(
              trailing!,
              style: AppTextStyles.caption,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ],
    );
  }
}

/// A tappable chip that reveals an explanatory tooltip on tap (mobile-friendly).
///
/// Used for scenario tags and actor score chips that each carry a long
/// description (BAB 2 layer definitions).
class TooltipChip extends StatelessWidget {
  const TooltipChip({
    super.key,
    required this.label,
    required this.tooltip,
    required this.tone,
  });

  final String label;
  final String tooltip;
  final SignalTone tone;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      triggerMode: TooltipTriggerMode.tap,
      preferBelow: false,
      showDuration: const Duration(seconds: 6),
      margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      padding: AppPadding.inner,
      textStyle:
          AppTextStyles.caption.copyWith(color: AppColors.textPrimary, height: 1.5),
      decoration: BoxDecoration(
        color: const Color(0xFF1C2333),
        borderRadius: BorderRadius.circular(AppRadii.chip),
        border: Border.all(color: AppColors.border, width: AppBorders.hairline),
      ),
      child: ToneChip(label: label, tone: tone),
    );
  }
}

/// A simple labelled metric bar row: `label … track … percent%`.
class MetricBarRow extends StatelessWidget {
  const MetricBarRow({
    super.key,
    required this.label,
    required this.percent,
    required this.tone,
  });

  final String label;
  final int percent;
  final SignalTone tone;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.xs + 1),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: AppTextStyles.bodySm.copyWith(color: const Color(0xFFC9D1D9)),
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          SizedBox(width: 72, child: ToneBar(percent: percent, tone: tone, height: 5)),
          SizedBox(
            width: 32,
            child: Text(
              '$percent%',
              textAlign: TextAlign.right,
              style: AppTextStyles.bodySm.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
