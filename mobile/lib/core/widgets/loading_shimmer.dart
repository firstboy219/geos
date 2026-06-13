import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../constants/app_constants.dart';
import '../theme/app_colors.dart';

/// Shimmer skeleton placeholder (BAB 7.3 requires shimmer on every screen that
/// loads data from the API).
///
/// Use [LoadingShimmer.box] for a single rectangle, or [LoadingShimmer.list]
/// for a vertical stack of placeholder cards.
class LoadingShimmer extends StatelessWidget {
  const LoadingShimmer({
    super.key,
    this.width = double.infinity,
    this.height = 16,
    this.radius = AppRadii.chip,
  });

  final double width;
  final double height;
  final double radius;

  /// Convenience: a single shimmering box.
  static Widget box({
    double width = double.infinity,
    double height = 16,
    double radius = AppRadii.chip,
  }) =>
      LoadingShimmer(width: width, height: height, radius: radius);

  /// Convenience: [count] stacked placeholder cards.
  static Widget list({int count = 4, double cardHeight = 120}) {
    return Column(
      children: List.generate(
        count,
        (_) => Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.md),
          child: LoadingShimmer(height: cardHeight, radius: AppRadii.card),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.surface,
      highlightColor: AppColors.border,
      period: AppDurations.shimmer,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(radius),
        ),
      ),
    );
  }
}
