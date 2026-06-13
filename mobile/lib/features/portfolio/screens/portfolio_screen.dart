import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/models/api_models.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/widgets.dart';
import '../data/dummy_portfolio.dart';
import '../models/portfolio_asset_model.dart';
import '../providers/portfolio_provider.dart';

/// Portfolio screen (Prompt 2-C / Phase 6) — live data via [PortfolioProvider]
/// with graceful fallback to dummy data when the backend is unreachable.
class PortfolioScreen extends StatefulWidget {
  const PortfolioScreen({super.key});

  @override
  State<PortfolioScreen> createState() => _PortfolioScreenState();
}

class _PortfolioScreenState extends State<PortfolioScreen> {
  final _rp = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

  /// Local fallback used only when the backend returns nothing (offline demo).
  final List<PortfolioAsset> _fallback = DummyPortfolio.assets();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback(
      (_) => context.read<PortfolioProvider>().fetchPortfolio(),
    );
  }

  static AssetType _typeFrom(String s) => switch (s) {
        'crypto' => AssetType.crypto,
        'gold' => AssetType.gold,
        'property' => AssetType.property,
        'deposit' => AssetType.deposit,
        'commodity' => AssetType.commodity,
        _ => AssetType.stock,
      };

  PortfolioAsset _fromDto(PortfolioAssetDto d) {
    final cur = d.currentPrice > 0 ? d.currentPrice : d.purchasePrice;
    final change = d.purchasePrice > 0 ? (cur - d.purchasePrice) / d.purchasePrice * 100 : 0.0;
    return PortfolioAsset(
      id: d.id,
      type: _typeFrom(d.assetType),
      name: d.assetName.isNotEmpty ? d.assetName : d.ticker,
      ticker: d.ticker,
      quantity: d.quantity,
      purchasePrice: d.purchasePrice,
      currentValue: d.value,
      trend: change > 0 ? AssetTrend.up : (change < 0 ? AssetTrend.down : AssetTrend.flat),
      impactLabel: '${change >= 0 ? '+' : ''}${change.toStringAsFixed(1)}%',
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PortfolioProvider>();
    final live = provider.assets.map(_fromDto).toList();
    final isLive = live.isNotEmpty;
    final assets = isLive ? live : _fallback;
    final total = assets.fold(0.0, (s, a) => s + a.currentValue);
    final loading = provider.isLoading && live.isEmpty;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Portofolio')),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.accent,
        onPressed: () => _openAddSheet(isLive),
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: RefreshIndicator(
        onRefresh: () => context.read<PortfolioProvider>().fetchPortfolio(),
        child: ListView(
          padding: AppPadding.screen,
          children: [
            _summaryCard(total),
            const SizedBox(height: AppSpacing.lg),
            const SectionHeader(
              title: 'Aset Anda',
              subtitle: 'Geser kiri untuk menghapus',
            ),
            if (loading)
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xl),
                child: LoadingShimmer.list(count: 4, cardHeight: 64),
              )
            else if (assets.isEmpty)
              const Padding(
                padding: EdgeInsets.only(top: AppSpacing.xxl),
                child: EmptyState(
                  title: 'Belum ada aset',
                  message: 'Tambahkan aset untuk melihat dampak geopolitiknya.',
                ),
              )
            else
              for (final a in assets) _assetTile(a, isLive),
            const SizedBox(height: AppSpacing.lg),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => context.go('/portfolio/impact'),
                icon: const Icon(Icons.insights_outlined, size: 16),
                label: const Text('Generate rekomendasi rebalancing'),
              ),
            ),
            const SizedBox(height: AppSpacing.xxxl),
          ],
        ),
      ),
    );
  }

  Widget _summaryCard(double total) {
    return GeoCard(
      emphasis: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Total nilai portofolio', style: AppTextStyles.label),
          const SizedBox(height: AppSpacing.xs),
          Text(_rp.format(total), style: AppTextStyles.headline1),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              _metric('Skor risiko geopolitik',
                  '${DummyPortfolio.riskScore}/10', AppColors.warning),
              _metric('Estimasi dampak',
                  '${DummyPortfolio.negativeImpactPct.toStringAsFixed(0)}%',
                  AppColors.danger),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          Text('Berdasarkan ${DummyPortfolio.dominantScenario}',
              style: AppTextStyles.caption),
        ],
      ),
    );
  }

  Widget _metric(String label, String value, Color color) => Expanded(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value, style: AppTextStyles.headline2.copyWith(color: color)),
            const SizedBox(height: 2),
            Text(label, style: AppTextStyles.caption),
          ],
        ),
      );

  Widget _assetTile(PortfolioAsset a, bool isLive) {
    return Dismissible(
      key: ValueKey(a.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: AppSpacing.lg),
        margin: const EdgeInsets.only(bottom: AppSpacing.sm),
        decoration: BoxDecoration(
          color: AppColors.dangerDark,
          borderRadius: BorderRadius.circular(AppRadii.cardSm),
        ),
        child: const Icon(Icons.delete_outline, color: AppColors.danger),
      ),
      onDismissed: (_) {
        if (isLive) {
          context.read<PortfolioProvider>().deleteAsset(a.id);
        } else {
          setState(() => _fallback.removeWhere((x) => x.id == a.id));
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${a.name} dihapus')),
        );
      },
      child: GeoCard(
        margin: const EdgeInsets.only(bottom: AppSpacing.sm),
        padding: AppPadding.cardSm,
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: a.type.color.withOpacity(0.15),
                borderRadius: BorderRadius.circular(AppRadii.inner),
              ),
              child: Icon(a.type.icon, size: 18, color: a.type.color),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(a.name,
                      style: AppTextStyles.bodySm
                          .copyWith(color: AppColors.textPrimary)),
                  const SizedBox(height: 1),
                  Text('${a.type.label} · ${a.ticker}',
                      style: AppTextStyles.caption),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(_rp.format(a.currentValue),
                    style: AppTextStyles.bodySm
                        .copyWith(color: AppColors.textPrimary)),
                const SizedBox(height: 1),
                Text('${a.trend.arrow} ${a.impactLabel}',
                    style: AppTextStyles.caption.copyWith(color: a.trend.color)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _openAddSheet(bool isLive) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadii.card)),
      ),
      builder: (_) => _AddAssetSheet(
        onSave: (type, name, qty, price) async {
          if (isLive) {
            await context.read<PortfolioProvider>().addAsset(
                  PortfolioAssetDto(
                    id: '',
                    assetType: type.name,
                    assetName: name,
                    ticker: name.toUpperCase(),
                    quantity: qty,
                    purchasePrice: price,
                  ),
                );
          } else {
            setState(() => _fallback.add(
                  PortfolioAsset(
                    id: 'p${DateTime.now().millisecondsSinceEpoch}',
                    type: type,
                    name: name,
                    ticker: name.toUpperCase(),
                    quantity: qty,
                    purchasePrice: price,
                    currentValue: qty * price,
                    trend: AssetTrend.flat,
                    impactLabel: '±0%',
                  ),
                ));
          }
        },
      ),
    );
  }
}

class _AddAssetSheet extends StatefulWidget {
  const _AddAssetSheet({required this.onSave});
  final void Function(AssetType type, String name, double qty, double price) onSave;

  @override
  State<_AddAssetSheet> createState() => _AddAssetSheetState();
}

class _AddAssetSheetState extends State<_AddAssetSheet> {
  AssetType _type = AssetType.stock;
  final _name = TextEditingController();
  final _qty = TextEditingController();
  final _price = TextEditingController();

  @override
  void dispose() {
    _name.dispose();
    _qty.dispose();
    _price.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.of(context).viewInsets.bottom;
    return Padding(
      padding: EdgeInsets.fromLTRB(
          AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, bottom + AppSpacing.lg),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Tambah Aset', style: AppTextStyles.title),
          const SizedBox(height: AppSpacing.lg),
          DropdownButtonFormField<AssetType>(
            value: _type,
            dropdownColor: AppColors.surface,
            decoration: const InputDecoration(labelText: 'Jenis aset'),
            items: [
              for (final t in AssetType.values)
                DropdownMenuItem(value: t, child: Text(t.label)),
            ],
            onChanged: (v) => setState(() => _type = v ?? _type),
          ),
          const SizedBox(height: AppSpacing.md),
          TextField(
            controller: _name,
            decoration:
                const InputDecoration(labelText: 'Nama / ticker (mis. BBCA)'),
          ),
          const SizedBox(height: AppSpacing.md),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _qty,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Jumlah'),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: TextField(
                  controller: _price,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Harga beli'),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          SizedBox(
            width: double.infinity,
            child: FilledButton(onPressed: _save, child: const Text('SIMPAN')),
          ),
        ],
      ),
    );
  }

  void _save() {
    final name = _name.text.trim();
    if (name.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Nama aset wajib diisi.')),
      );
      return;
    }
    widget.onSave(
      _type,
      name,
      double.tryParse(_qty.text.trim()) ?? 0,
      double.tryParse(_price.text.trim()) ?? 0,
    );
    Navigator.of(context).pop();
  }
}
