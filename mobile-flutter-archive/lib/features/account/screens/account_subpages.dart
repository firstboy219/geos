import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

/// Shared scaffold for the simple account sub-page stubs.
class _AccountStub extends StatelessWidget {
  const _AccountStub(this.title);

  final String title;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: Text(title)),
      body: Center(child: Text(title, style: AppTextStyles.headline2)),
    );
  }
}

/// Route `/account/notifications`. PLACEHOLDER — filled in Phase 2.
class NotificationSettingsScreen extends StatelessWidget {
  const NotificationSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) => const _AccountStub('Notifications');
}

/// Route `/account/tripwire`. PLACEHOLDER — filled in Phase 2.
class TripwireConfigScreen extends StatelessWidget {
  const TripwireConfigScreen({super.key});

  @override
  Widget build(BuildContext context) => const _AccountStub('Tripwire Config');
}

/// Route `/account/billing`. PLACEHOLDER — filled in Phase 2.
class BillingScreen extends StatelessWidget {
  const BillingScreen({super.key});

  @override
  Widget build(BuildContext context) => const _AccountStub('Billing');
}
