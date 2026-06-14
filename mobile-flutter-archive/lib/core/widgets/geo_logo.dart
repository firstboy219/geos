import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

/// The "GEOSCAN" wordmark: `GEO` in [AppColors.textPrimary] and `SCAN` in
/// [AppColors.accent] (BAB 7.2 logo styling).
///
/// [scale] multiplies the base font size so the same widget serves both the
/// app bar (scale 1) and the large login hero (scale ~2.4).
class GeoLogo extends StatelessWidget {
  const GeoLogo({super.key, this.scale = 1});

  final double scale;

  @override
  Widget build(BuildContext context) {
    final base = AppTextStyles.logo.copyWith(
      fontSize: AppTextStyles.logo.fontSize! * scale,
    );
    return RichText(
      text: TextSpan(
        style: base,
        children: const [
          TextSpan(text: 'GEO', style: TextStyle(color: AppColors.textPrimary)),
          TextSpan(text: 'SCAN', style: TextStyle(color: AppColors.accent)),
        ],
      ),
    );
  }
}
