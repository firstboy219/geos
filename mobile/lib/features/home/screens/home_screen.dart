import 'package:flutter/material.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/geo_logo.dart';
import '../../../core/widgets/loading_shimmer.dart';
import '../../../core/widgets/section_header.dart';
import '../data/dummy_data.dart';
import '../widgets/analysis_header.dart';
import '../widgets/crisis_card.dart';
import '../widgets/extras.dart';
import '../widgets/feed_tab.dart';
import '../widgets/home_primitives.dart';
import '../models/scenario_model.dart';

/// Geoscan Home screen — the Analysis + News/Feed tabs (Phase 2-A).
///
/// Self-contained with dummy data ([DummyData]); Phase 6 will wire real data.
/// Builds the full mockup: temporal calibration, shock-multiplier / TDI
/// banners, world-status hero, framework strip, CTA, crisis cards, portfolio
/// nudge, alerts, and the Berita & Umpan feed.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  late final TabController _tab = TabController(length: 2, vsync: this);

  AnalysisPeriod _period = AnalysisPeriod.d90;
  String _lang = 'EN';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    // Simulate an initial data load so the shimmer is exercised (BAB 7.3).
    Future.delayed(const Duration(milliseconds: 700), () {
      if (mounted) setState(() => _loading = false);
    });
  }

  @override
  void dispose() {
    _tab.dispose();
    super.dispose();
  }

  String get _periodLabel => switch (_period) {
        AnalysisPeriod.h72 => '72 Jam',
        AnalysisPeriod.d90 => '90 Hari',
        AnalysisPeriod.y5 => '1–5 Tahun',
      };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            _TopBar(
              lang: _lang,
              onToggleLang: () => setState(() => _lang = _lang == 'EN' ? 'ID' : 'EN'),
            ),
            TabBar(
              controller: _tab,
              labelColor: AppColors.accent,
              unselectedLabelColor: AppColors.textSecondary,
              indicatorColor: AppColors.accent,
              indicatorSize: TabBarIndicatorSize.tab,
              labelStyle: AppTextStyles.bodySm.copyWith(fontWeight: FontWeight.w500),
              unselectedLabelStyle: AppTextStyles.bodySm,
              dividerColor: AppColors.borderSubtle,
              tabs: const [
                Tab(text: 'Analisis'),
                Tab(text: 'Berita & Umpan'),
              ],
            ),
            Expanded(
              child: TabBarView(
                controller: _tab,
                children: [
                  _loading
                      ? const _AnalysisShimmer()
                      : _AnalysisTab(
                          period: _period,
                          periodLabel: _periodLabel,
                          onPeriodChanged: (p) => setState(() => _period = p),
                        ),
                  _loading ? const _AnalysisShimmer() : const FeedTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({required this.lang, required this.onToggleLang});

  final String lang;
  final VoidCallback onToggleLang;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: AppSpacing.sm + 2),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.borderSubtle, width: 0.5)),
      ),
      child: Row(
        children: [
          const GeoLogo(),
          const Spacer(),
          InkWell(
            onTap: onToggleLang,
            borderRadius: BorderRadius.circular(6),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
              decoration: BoxDecoration(
                color: AppColors.accentDark,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: AppColors.accentBorder, width: AppBorders.hairline),
              ),
              child: Text(
                lang,
                style: AppTextStyles.caption.copyWith(
                  color: AppColors.accent,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.sm + 2),
          SizedBox(
            width: 32,
            height: 32,
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.border, width: AppBorders.hairline),
                  ),
                  child: const Icon(Icons.notifications_none, size: 16, color: AppColors.textSecondary),
                ),
                Positioned(
                  top: 1,
                  right: 1,
                  child: Container(
                    width: 7,
                    height: 7,
                    decoration: BoxDecoration(
                      color: AppColors.danger,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.background, width: 1),
                    ),
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

class _AnalysisTab extends StatelessWidget {
  const _AnalysisTab({
    required this.period,
    required this.periodLabel,
    required this.onPeriodChanged,
  });

  final AnalysisPeriod period;
  final String periodLabel;
  final ValueChanged<AnalysisPeriod> onPeriodChanged;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
      children: [
        PeriodSelector(value: period, onChanged: onPeriodChanged),
        const SizedBox(height: AppSpacing.sm + 2),
        _shockBanner(),
        const SizedBox(height: AppSpacing.sm),
        _tdiBanner(),
        const SizedBox(height: AppSpacing.sm + 2),
        const WorldStatusHero(),
        const SizedBox(height: AppSpacing.sm + 2),
        FrameworkStrip(periodLabel: periodLabel),
        const SizedBox(height: AppSpacing.sm + 2),
        const ProtectionCta(),
        const SizedBox(height: AppSpacing.sm + 2),
        SectionHeader(
          title: 'Situasi yang perlu Anda ketahui',
          actionLabel: 'Lihat semua',
          onAction: () {},
        ),
        const SizedBox(height: AppSpacing.xs),
        for (final crisis in DummyData.crises) CrisisCard(crisis: crisis),
        const SizedBox(height: AppSpacing.xs),
        const PortfolioNudge(),
        const SizedBox(height: AppSpacing.sm + 2),
        SectionHeader(
          title: 'Peringatan terbaru',
          actionLabel: 'Lihat semua',
          onAction: () {},
        ),
        const SizedBox(height: AppSpacing.xs),
        const AlertsList(),
      ],
    );
  }

  Widget _shockBanner() {
    return InfoBanner(
      emoji: '⚡',
      title: 'Pengali Syok Sistemik (Shock Multiplier)',
      titleColor: AppColors.warning,
      subtitle: 'semua probabilitas konflik naik',
      background: const Color(0xFF1A1208),
      borderColor: const Color(0xFF7A4800),
      body: const Text(
        '2 krisis non-militer aktif bersamaan: harga komoditas jatuh + cuaca '
        'ekstrem El Niño. Keduanya meningkatkan tekanan domestik di setiap '
        'negara yang terlibat.',
      ),
      chips: const [
        ToneChip(label: 'Komoditas turun aktif', tone: SignalTone.warning),
        ToneChip(label: 'El Niño aktif', tone: SignalTone.warning),
        ToneChip(label: 'Semua risiko +12%', tone: SignalTone.danger),
      ],
    );
  }

  Widget _tdiBanner() {
    return InfoBanner(
      emoji: '🤖',
      title: 'Technology Disruption Index (TDI) naik',
      titleColor: AppColors.purple,
      subtitle: 'kapabilitas militer China meningkat',
      background: const Color(0xFF0D1020),
      borderColor: const Color(0xFF3D2080),
      body: RichText(
        text: TextSpan(
          style: AppTextStyles.caption.copyWith(
            color: const Color(0xFF8B9FB8),
            fontSize: 11,
            height: 1.5,
          ),
          children: const [
            TextSpan(
              text:
                  'Drone swarm terbaru PLAN diuji pekan lalu → Action Readiness '
                  '(kesiapan bertindak) diperbarui dari T-90 hari menjadi ',
            ),
            TextSpan(
              text: 'T-21 hari',
              style: TextStyle(color: AppColors.danger, fontWeight: FontWeight.w500),
            ),
            TextSpan(text: ' — China bisa bergerak jauh lebih cepat dari perkiraan.'),
          ],
        ),
      ),
      chips: const [
        ToneChip(label: 'TDI ↑ Naik', tone: SignalTone.special),
        ToneChip(label: 'Action Readiness: T-21 hari', tone: SignalTone.danger),
      ],
    );
  }
}

/// Shimmer skeleton shown while the initial dummy "load" runs.
class _AnalysisShimmer extends StatelessWidget {
  const _AnalysisShimmer();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
      children: [
        LoadingShimmer.box(height: 64, radius: AppRadii.cardSm),
        const SizedBox(height: AppSpacing.md),
        LoadingShimmer.box(height: 72, radius: AppRadii.inner),
        const SizedBox(height: AppSpacing.md),
        LoadingShimmer.box(height: 150, radius: AppRadii.card),
        const SizedBox(height: AppSpacing.md),
        LoadingShimmer.list(count: 3, cardHeight: 160),
      ],
    );
  }
}
