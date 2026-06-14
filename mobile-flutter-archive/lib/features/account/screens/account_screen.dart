import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/l10n/app_strings.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/widgets.dart';
import '../../auth/providers/auth_provider.dart';

/// Account / profile screen (Prompt 2-C, Screen 3).
class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().currentUser;
    final locale = context.watch<LocaleProvider>();
    final name = user?.fullName ?? 'Demo Investor';
    final email = user?.email ?? 'demo@geoscan.app';
    final tier = (user?.tier ?? 'free').toUpperCase();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Profil')),
      body: ListView(
        padding: AppPadding.screen,
        children: [
          _profileHeader(name, email, tier),
          const SizedBox(height: AppSpacing.lg),
          GeoCard(
            padding: EdgeInsets.zero,
            child: Column(
              children: [
                _tile(Icons.notifications_outlined, 'Notifikasi',
                    onTap: () => context.go('/account/notifications')),
                _divider(),
                _tile(Icons.tune, 'Konfigurasi Tripwire',
                    onTap: () => context.go('/account/tripwire')),
                _divider(),
                _tile(Icons.credit_card, 'Subscription & billing',
                    onTap: () => context.go('/account/billing')),
                _divider(),
                _tile(Icons.vpn_key_outlined, 'API Key',
                    trailing: _badge('Enterprise'),
                    onTap: () => _soon(context)),
                _divider(),
                _tile(Icons.download_outlined, 'Export laporan',
                    onTap: () => _soon(context)),
                _divider(),
                _tile(
                  Icons.translate,
                  'Bahasa',
                  trailing: Text(
                    locale.locale.languageCode.toUpperCase(),
                    style: AppTextStyles.bodySm
                        .copyWith(color: AppColors.accent),
                  ),
                  onTap: () => locale.toggle(),
                ),
                _divider(),
                _tile(Icons.shield_outlined, 'Privasi & keamanan',
                    onTap: () => _soon(context)),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          GeoCard(
            padding: EdgeInsets.zero,
            child: _tile(
              Icons.logout,
              'Keluar',
              color: AppColors.danger,
              onTap: () => _logout(context),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Center(
            child: Text('Geoscan v0.1.0 · Framework v3.0',
                style: AppTextStyles.caption),
          ),
          const SizedBox(height: AppSpacing.xxl),
        ],
      ),
    );
  }

  Widget _profileHeader(String name, String email, String tier) {
    final initials = name
        .trim()
        .split(RegExp(r'\s+'))
        .where((p) => p.isNotEmpty)
        .take(2)
        .map((p) => p[0].toUpperCase())
        .join();
    return GeoCard(
      emphasis: true,
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: AppColors.accentDark,
              shape: BoxShape.circle,
              border: Border.all(
                  color: AppColors.accentBorder, width: AppBorders.hairline),
            ),
            alignment: Alignment.center,
            child: Text(initials.isEmpty ? 'GS' : initials,
                style: AppTextStyles.title.copyWith(color: AppColors.accent)),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: AppTextStyles.title),
                const SizedBox(height: 2),
                Text(email, style: AppTextStyles.bodySm),
              ],
            ),
          ),
          _badge(tier),
        ],
      ),
    );
  }

  Widget _badge(String text) {
    final isFree = text.toUpperCase() == 'FREE';
    final color = isFree ? AppColors.textSecondary : AppColors.accent;
    final bg = isFree ? AppColors.surfaceAlt : AppColors.accentDark;
    return Container(
      padding:
          const EdgeInsets.symmetric(horizontal: AppSpacing.sm, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(AppRadii.chip),
        border: Border.all(color: color, width: AppBorders.hairline),
      ),
      child: Text(text,
          style: AppTextStyles.caption
              .copyWith(color: color, fontWeight: FontWeight.w500)),
    );
  }

  Widget _tile(IconData icon, String label,
      {Widget? trailing, VoidCallback? onTap, Color? color}) {
    final fg = color ?? AppColors.textPrimary;
    return ListTile(
      onTap: onTap,
      leading: Icon(icon, size: 20, color: color ?? AppColors.textSecondary),
      title: Text(label, style: AppTextStyles.body.copyWith(color: fg)),
      trailing: trailing ??
          const Icon(Icons.chevron_right,
              size: 18, color: AppColors.textMuted),
      dense: true,
    );
  }

  Widget _divider() => const Divider(
      height: 0.5, thickness: 0.5, color: AppColors.borderSubtle, indent: 52);

  void _soon(BuildContext context) =>
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Fitur akan tersedia.')),
      );

  Future<void> _logout(BuildContext context) async {
    final router = GoRouter.of(context);
    await context.read<AuthProvider>().logout();
    router.go('/login');
  }
}
