import 'package:flutter/material.dart';

import '../constants/app_constants.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';

/// User-friendly error state with a retry button (BAB 7.3 — never show a stack
/// trace). Drop into the body of any screen whose data load failed.
class ErrorRetry extends StatelessWidget {
  const ErrorRetry({
    super.key,
    this.message = 'Something went wrong. Please try again.',
    this.retryLabel = 'Retry',
    required this.onRetry,
    this.icon = Icons.error_outline,
  });

  final String message;
  final String retryLabel;
  final VoidCallback onRetry;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xxxl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 40, color: AppColors.danger),
            const SizedBox(height: AppSpacing.lg),
            Text(
              message,
              textAlign: TextAlign.center,
              style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: AppSpacing.xl),
            OutlinedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh, size: 18),
              label: Text(retryLabel),
            ),
          ],
        ),
      ),
    );
  }
}
