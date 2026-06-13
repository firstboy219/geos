import 'package:flutter/material.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/widgets.dart';
import '../models/asset_model.dart';
import 'pasar_primitives.dart';

/// One asset-class section (component #6): a section header plus a card of
/// asset rows. Each row's geo-signal badge opens a detail bottom sheet on tap.
class AssetSection extends StatelessWidget {
  const AssetSection({
    super.key,
    required this.title,
    required this.actionLabel,
    required this.assets,
  });

  final String title;
  final String actionLabel;
  final List<AssetModel> assets;

  @override
  Widget build(BuildContext context) {
    if (assets.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: title,
          actionLabel: actionLabel,
          onAction: () {},
        ),
        GeoCard(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          radius: AppRadii.cardSm,
          child: Column(
            children: [
              for (var i = 0; i < assets.length; i++)
                AssetRow(
                  asset: assets[i],
                  showDivider: i < assets.length - 1,
                ),
            ],
          ),
        ),
      ],
    );
  }
}

/// A single asset row: icon + name + sub + geo-signal badge + price + change% +
/// mini sparkline.
class AssetRow extends StatelessWidget {
  const AssetRow({super.key, required this.asset, this.showDivider = true});

  final AssetModel asset;
  final bool showDivider;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: showDivider
            ? const Border(
                bottom: BorderSide(
                  color: AppColors.borderSubtle,
                  width: AppBorders.hairline,
                ),
              )
            : null,
      ),
      padding: const EdgeInsets.symmetric(vertical: 9),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          _icon(),
          const SizedBox(width: AppSpacing.sm + 2),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  asset.name,
                  style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 1),
                Text(
                  asset.subtitle,
                  style: AppTextStyles.caption.copyWith(color: AppColors.textMuted),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: AppSpacing.xs),
                _geoBadge(context),
              ],
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          if (asset.sparkline.isNotEmpty) ...[
            MiniSparkline(
              values: asset.sparkline,
              direction: asset.changeDirection,
            ),
            const SizedBox(width: AppSpacing.sm),
          ],
          _priceColumn(),
        ],
      ),
    );
  }

  Widget _icon() {
    return Container(
      width: 34,
      height: 34,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: asset.iconBg,
        borderRadius: BorderRadius.circular(AppRadii.inner),
      ),
      child: Text(
        asset.iconLabel,
        style: TextStyle(
          color: asset.iconFg,
          fontWeight: FontWeight.w500,
          fontSize: asset.iconLabel.length > 3 ? 11 : 13,
        ),
      ),
    );
  }

  Widget _geoBadge(BuildContext context) {
    final tone = asset.geoSignalType;
    return GestureDetector(
      onTap: () => _showDetail(context),
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
        decoration: BoxDecoration(
          color: tone.bg,
          borderRadius: BorderRadius.circular(AppRadii.chip),
          border: Border.all(color: tone.border, width: AppBorders.hairline),
        ),
        child: Text(
          asset.geoSignalText,
          style: AppTextStyles.caption.copyWith(
            color: tone.fg,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _priceColumn() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text(
          asset.price,
          style: AppTextStyles.body.copyWith(fontWeight: FontWeight.w500),
        ),
        const SizedBox(height: 1),
        Text(
          '${asset.changeDirection.glyph} ${asset.change}',
          style: AppTextStyles.caption.copyWith(
            color: asset.changeDirection.tone.fg,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  void _showDetail(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => AssetGeoSignalSheet(asset: asset),
    );
  }
}

/// Bottom sheet shown when a row's geo-signal badge is tapped — full
/// explanation of the geopolitical impact on that asset.
class AssetGeoSignalSheet extends StatelessWidget {
  const AssetGeoSignalSheet({super.key, required this.asset});

  final AssetModel asset;

  @override
  Widget build(BuildContext context) {
    final tone = asset.geoSignalType;
    final bottomInset = MediaQuery.of(context).viewPadding.bottom;
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(
          top: BorderSide(color: AppColors.border, width: AppBorders.hairline),
        ),
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadii.card)),
      ),
      padding: EdgeInsets.fromLTRB(
        AppSpacing.lg,
        AppSpacing.md,
        AppSpacing.lg,
        AppSpacing.xl + bottomInset,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Row(
            children: [
              Container(
                width: 38,
                height: 38,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: asset.iconBg,
                  borderRadius: BorderRadius.circular(AppRadii.inner),
                ),
                child: Text(
                  asset.iconLabel,
                  style: TextStyle(
                    color: asset.iconFg,
                    fontWeight: FontWeight.w500,
                    fontSize: asset.iconLabel.length > 3 ? 11 : 13,
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(asset.name, style: AppTextStyles.title),
                    const SizedBox(height: 1),
                    Text(asset.subtitle, style: AppTextStyles.bodySm),
                  ],
                ),
              ),
              Text(
                asset.price,
                style: AppTextStyles.title.copyWith(fontWeight: FontWeight.w500),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          ToneChip(label: asset.geoSignalText, tone: tone),
          const SizedBox(height: AppSpacing.md),
          Text(
            asset.geoSignalDetail,
            style: AppTextStyles.body.copyWith(
              color: const Color(0xFFC9D1D9),
              height: 1.55,
            ),
          ),
        ],
      ),
    );
  }
}
