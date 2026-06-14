import 'package:flutter/material.dart';

import '../models/asset_model.dart';

/// Static dummy data for the Pasar screen (Phase 2-B — no backend yet).
///
/// Numbers and copy mirror `Knowledge Base/Mockup_mobile/pasar_screen.html`.
/// When the API lands (KB BAB 5: /pasar/assets, /pasar/matrix, /pasar/heatmap)
/// these constants are replaced by provider-fetched models.
abstract final class PasarData {
  PasarData._();

  // ── Geopolitical risk banner ──────────────────────────────
  static const String riskScore = '6.2';
  static const String riskScoreMax = '/10';
  static const String riskLabel = 'Waspada';
  static const String riskSubtitle = 'Berdasarkan 3 situasi aktif · 16 lapisan AI';
  static const String riskDescription =
      'Shock Multiplier (+12%) aktif karena harga komoditas jatuh + El Niño. '
      'Pasar lebih sensitif dari biasanya terhadap setiap perkembangan geopolitik.';

  static const List<GeoSignalChip> riskChips = [
    GeoSignalChip(
      label: 'Natuna: Sedang',
      tone: SignalTone.positive,
      tooltip: 'Natuna ZEE\n'
          'Redline 3/10 · Misread 6/10 · Gray Zone aktif\n'
          'Skenario dominan (43%): tidak ada eskalasi → pasar cenderung stabil',
    ),
    GeoSignalChip(
      label: 'LCS: Tinggi',
      tone: SignalTone.danger,
      tooltip: 'Laut China Selatan\n'
          'Redline 8/10 · Misread 7/10 · Multi-aktor\n'
          'Skenario dominan (42%): frozen conflict → energi naik, pariwisata turun',
    ),
    GeoSignalChip(
      label: 'Taiwan: Tinggi',
      tone: SignalTone.danger,
      tooltip: 'Selat Taiwan\n'
          'Redline 10/10 · Nuclear adjacent · TDI ↑\n'
          'Skenario dominan (40%): gray zone → chip/semikonduktor volatile',
    ),
    GeoSignalChip(
      label: 'M: +12%',
      tone: SignalTone.warning,
      tooltip: 'Shock Multiplier (Lapisan M)\n'
          'Komoditas jatuh + El Niño aktif bersamaan → semua probabilitas '
          'konflik naik 12%',
    ),
    GeoSignalChip(
      label: 'TDI ↑ T-21d',
      tone: SignalTone.special,
      tooltip: 'Technology Disruption Index (Lapisan N)\n'
          'Drone swarm baru PLAN diuji pekan lalu → Action Readiness China: '
          'T-21 hari. Pasar semakin sensitif terhadap berita militer.',
    ),
  ];

  // ── Portfolio ringkasan (4-grid) ──────────────────────────
  static const List<({String value, String label, SignalTone tone})> portfolio = [
    (value: 'Rp 847 jt', label: 'Total nilai', tone: SignalTone.neutral),
    (
      value: '−Rp 71 jt',
      label: 'Estimasi dampak skenario negatif',
      tone: SignalTone.danger
    ),
    (value: '6.2/10', label: 'Skor risiko geopolitik', tone: SignalTone.warning),
    (value: 'Emas ↑', label: 'Aset terkuat saat ini', tone: SignalTone.positive),
  ];

  // ── Skenario × Pasar matrix ───────────────────────────────
  static const List<MatrixScenario> matrixScenarios = [
    MatrixScenario(id: 'S1', probability: 43, tone: SignalTone.positive),
    MatrixScenario(id: 'S2', probability: 29, tone: SignalTone.warning),
    MatrixScenario(id: 'S3', probability: 15, tone: SignalTone.danger),
    MatrixScenario(id: 'S4', probability: 9, tone: SignalTone.info),
  ];

  static const String matrixLegend =
      'S1: Tidak eskalasi · S2: Forced alignment · S3: Insiden laut · S4: Mediator';

  static const List<MatrixRow> matrixRows = [
    MatrixRow(label: 'IHSG / Saham', cells: [
      MatrixCell(label: '↑+8%', tone: SignalTone.positive),
      MatrixCell(label: '↓−15%', tone: SignalTone.danger),
      MatrixCell(label: '↓−22%', tone: SignalTone.danger),
      MatrixCell(label: '↑+18%', tone: SignalTone.positive),
    ]),
    MatrixRow(label: 'IDR / USD', cells: [
      MatrixCell(label: '→stabil', tone: SignalTone.neutral),
      MatrixCell(label: '↓16.500', tone: SignalTone.danger),
      MatrixCell(label: '↓17.500', tone: SignalTone.danger),
      MatrixCell(label: '↑14.800', tone: SignalTone.positive),
    ]),
    MatrixRow(label: 'Emas (XAU)', cells: [
      MatrixCell(label: '→netral', tone: SignalTone.neutral),
      MatrixCell(label: '↑safe', tone: SignalTone.positive),
      MatrixCell(label: '↑↑max', tone: SignalTone.positive),
      MatrixCell(label: '→soft', tone: SignalTone.neutral),
    ]),
    MatrixRow(label: 'Nikel / EV', cells: [
      MatrixCell(label: '↑EV', tone: SignalTone.positive),
      MatrixCell(label: '→mix', tone: SignalTone.neutral),
      MatrixCell(label: '↓halt', tone: SignalTone.danger),
      MatrixCell(label: '↑deal', tone: SignalTone.positive),
    ]),
    MatrixRow(label: 'Crypto', cells: [
      MatrixCell(label: '→mix', tone: SignalTone.neutral),
      MatrixCell(label: '↓sell', tone: SignalTone.danger),
      MatrixCell(label: '↓sell', tone: SignalTone.danger),
      MatrixCell(label: '→mild', tone: SignalTone.neutral),
    ]),
  ];

  // ── Geopolitical heatmap ──────────────────────────────────
  static const List<String> heatmapColumns = ['🇮🇩 Natuna', '🌊 LCS', '🇹🇼 Taiwan'];

  static const List<HeatmapRow> heatmapRows = [
    HeatmapRow(label: 'IHSG', levels: [
      HeatLevel.tinggi,
      HeatLevel.tinggi,
      HeatLevel.sangatTinggi,
    ]),
    HeatmapRow(label: 'IDR/USD', levels: [
      HeatLevel.sangatTinggi,
      HeatLevel.tinggi,
      HeatLevel.tinggi,
    ]),
    HeatmapRow(label: 'Emas', levels: [
      HeatLevel.sedang,
      HeatLevel.sedang,
      HeatLevel.tinggi,
    ]),
    HeatmapRow(label: 'Nikel', levels: [
      HeatLevel.sangatTinggi,
      HeatLevel.sedang,
      HeatLevel.rendah,
    ]),
    HeatmapRow(label: 'Chip/Tech', levels: [
      HeatLevel.rendah,
      HeatLevel.sedang,
      HeatLevel.sangatTinggi,
    ]),
  ];

  static const String heatmapFootnote =
      'Intensitas menunjukkan seberapa besar probabilitas skenario di setiap '
      'situasi mempengaruhi pergerakan kelas aset tersebut.';

  // ── Assets ────────────────────────────────────────────────
  static const List<AssetModel> assets = [
    // ─── Saham Indonesia ───
    AssetModel(
      symbol: 'IHSG',
      name: 'IHSG',
      category: AssetCategory.saham,
      subtitle: 'Indeks Harga Saham Gabungan',
      iconLabel: 'IDX',
      iconFg: Color(0xFF4493F8),
      iconBg: Color(0xFF0D1F3C),
      price: '7.284',
      change: '−0.82%',
      changeDirection: PriceDirection.down,
      geoSignalType: SignalTone.danger,
      geoSignalText: '↓ Risiko −12% tertimbang',
      geoSignalDetail:
          'Geopolitical Impact (Weighted)\n\n'
          'Probabilitas tertimbang: S1(43%)×+8% + S2(29%)×−15% + S3(15%)×−22% '
          '+ S4(9%)×+18% = −1.9% expected, dengan downside risk −22% jika S3 '
          'terpicu.',
      sparkline: [0.6, 0.7, 0.55, 0.65, 0.5, 0.45, 0.55, 0.4],
      scenarioImpacts: ['↑+8%', '↓−15%', '↓−22%', '↑+18%'],
      affectedByNatuna: true,
      affectedByTaiwan: true,
    ),
    AssetModel(
      symbol: 'BBCA',
      name: 'Bank BCA',
      category: AssetCategory.saham,
      subtitle: 'Perbankan — sensitif kurs IDR',
      iconLabel: 'BBCA',
      iconFg: Color(0xFF4493F8),
      iconBg: Color(0xFF0D2044),
      price: 'Rp 9.475',
      change: '−1.2%',
      changeDirection: PriceDirection.down,
      geoSignalType: SignalTone.warning,
      geoSignalText: '! Pantau IDR',
      geoSignalDetail:
          'Geopolitical Signal\n\n'
          'BBCA sangat sensitif terhadap pergerakan IDR. Jika S2 terjadi '
          '(IDR 16.500+), saham perbankan tertekan karena cost of fund naik '
          'dan NPL berpotensi meningkat.',
      sparkline: [0.7, 0.65, 0.6, 0.62, 0.55, 0.5, 0.52, 0.48],
      affectedByNatuna: false,
      affectedByTaiwan: false,
    ),
    AssetModel(
      symbol: 'TLKM',
      name: 'Telkom Indonesia',
      category: AssetCategory.saham,
      subtitle: 'Telekomunikasi — defensive',
      iconLabel: 'TLKM',
      iconFg: Color(0xFF4493F8),
      iconBg: Color(0xFF0D2044),
      price: 'Rp 3.210',
      change: '0.00%',
      changeDirection: PriceDirection.neutral,
      geoSignalType: SignalTone.positive,
      geoSignalText: '↑ Defensive stock',
      geoSignalDetail:
          'Geopolitical Signal\n\n'
          'Saham telekomunikasi cenderung defensive — tidak naik banyak tapi '
          'juga tidak jatuh jauh. Di skenario manapun kecuali S5, TLKM relatif '
          'stabil karena revenue berbasis domestik.',
      sparkline: [0.5, 0.52, 0.5, 0.51, 0.5, 0.5, 0.51, 0.5],
    ),
    AssetModel(
      symbol: 'ANTM',
      name: 'Aneka Tambang',
      category: AssetCategory.saham,
      subtitle: 'Nikel & emas — leverage komoditas',
      iconLabel: 'ANTM',
      iconFg: Color(0xFF3FB950),
      iconBg: Color(0xFF0D2818),
      price: 'Rp 1.545',
      change: '−2.8%',
      changeDirection: PriceDirection.down,
      geoSignalType: SignalTone.warning,
      geoSignalText: '! Natuna + Nikel watch',
      geoSignalDetail:
          'Geopolitical Signal (Natuna + LCS)\n\n'
          'Jika S1 (43%): EV demand naik → ANTM rally. Jika S3 (15%): China '
          'halt nikel offtake → ANTM jatuh tajam. Shock Multiplier M (+12%) '
          'aktif meningkatkan volatilitas kedua arah.',
      sparkline: [0.6, 0.7, 0.5, 0.6, 0.45, 0.4, 0.35, 0.3],
      affectedByNatuna: true,
      affectedByTaiwan: false,
    ),
    AssetModel(
      symbol: 'DEF',
      name: 'Sektor Pertahanan',
      category: AssetCategory.saham,
      subtitle: 'PINDAD · LEN · LAPAN — naik di krisis',
      iconLabel: 'DEF',
      iconFg: Color(0xFF9B59B6),
      iconBg: Color(0xFF1C1020),
      price: '+18.4%',
      change: 'YTD',
      changeDirection: PriceDirection.up,
      geoSignalType: SignalTone.positive,
      geoSignalText: '↑ Naik di S2 & S3',
      geoSignalDetail:
          'Geopolitical Signal\n\n'
          'Sektor pertahanan naik ketika eskalasi terjadi karena anggaran '
          'militer naik. S2 (forced alignment): +15%. S3 (insiden laut): +25%. '
          'Korelasi positif dengan ketegangan geopolitik.',
      sparkline: [0.3, 0.4, 0.45, 0.55, 0.6, 0.7, 0.8, 0.9],
      affectedByNatuna: true,
      affectedByTaiwan: true,
    ),

    // ─── Kurs & Mata Uang ───
    AssetModel(
      symbol: 'IDR',
      name: 'USD/IDR',
      category: AssetCategory.kurs,
      subtitle: 'Rupiah — sangat sensitif geopolitik',
      iconLabel: 'IDR',
      iconFg: Color(0xFF3FB950),
      iconBg: Color(0xFF0D2818),
      price: '15.425',
      change: '+125',
      changeDirection: PriceDirection.down,
      geoSignalType: SignalTone.danger,
      geoSignalText: '↓ Downside risk: 17.500',
      geoSignalDetail:
          'Geopolitical Signal\n\n'
          'S1 (43%): stabil 15.000–15.500 · S2 (29%): 16.500+ · S3 (15%): '
          '17.000–17.500 · S4 (9%): 14.800. Weighted expected: 15.380. IDR '
          'adalah barometer paling cepat terhadap perubahan sentimen '
          'geopolitik.',
      sparkline: [0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75],
      affectedByNatuna: true,
      affectedByTaiwan: true,
    ),
    AssetModel(
      symbol: 'CNY',
      name: 'USD/CNY',
      category: AssetCategory.kurs,
      subtitle: 'Yuan China — terkait erat LCS & Taiwan',
      iconLabel: 'CNY',
      iconFg: Color(0xFF4493F8),
      iconBg: Color(0xFF1A2740),
      price: '7.248',
      change: '−0.3%',
      changeDirection: PriceDirection.down,
      geoSignalType: SignalTone.warning,
      geoSignalText: '! Pantau Taiwan TDI',
      geoSignalDetail:
          'Geopolitical Signal (Taiwan + TDI)\n\n'
          'Jika TDI naik dan Taiwan S2 terpicu (blokade): CNY tertekan karena '
          'capital outflow dari China. Jika de-eskalasi: CNY menguat. Indikator '
          'leading untuk sentimen risiko China.',
      sparkline: [0.5, 0.52, 0.5, 0.48, 0.5, 0.49, 0.5, 0.48],
      affectedByTaiwan: true,
    ),
    AssetModel(
      symbol: 'JPY',
      name: 'USD/JPY',
      category: AssetCategory.kurs,
      subtitle: 'Yen Jepang — safe haven Asia',
      iconLabel: 'JPY',
      iconFg: Color(0xFFE3B341),
      iconBg: Color(0xFF2D1B00),
      price: '149.8',
      change: '+0.4%',
      changeDirection: PriceDirection.up,
      geoSignalType: SignalTone.positive,
      geoSignalText: '↑ Safe haven aktif',
      geoSignalDetail:
          'Geopolitical Signal\n\n'
          'JPY menguat saat ketegangan naik — investor global lari ke aset '
          'aman. Jika S3 (insiden Natuna) atau S2 (blokade Taiwan) terpicu: '
          'JPY rally 3–8%. Leading indicator ketakutan pasar global.',
      sparkline: [0.4, 0.42, 0.45, 0.5, 0.55, 0.6, 0.62, 0.65],
      affectedByNatuna: true,
      affectedByTaiwan: true,
    ),

    // ─── Komoditas ───
    AssetModel(
      symbol: 'XAU',
      name: 'Emas (Gold)',
      category: AssetCategory.komoditas,
      subtitle: 'Safe haven terbaik semua skenario',
      iconLabel: 'XAU',
      iconFg: Color(0xFFE3B341),
      iconBg: Color(0xFF2D1B00),
      price: '\$3.324',
      change: '+0.8%',
      changeDirection: PriceDirection.up,
      geoSignalType: SignalTone.positive,
      geoSignalText: '↑ Naik di semua skenario negatif',
      geoSignalDetail:
          'Geopolitical Signal — Optimal Hedge\n\n'
          'S1 (43%): netral · S2 (29%): +8–12% · S3 (15%): +15–20% · S4 (9%): '
          'sedikit turun · S5 (4%): +25%+. Emas adalah satu-satunya aset yang '
          'naik di seluruh skenario negatif secara bersamaan.',
      sparkline: [0.5, 0.55, 0.6, 0.62, 0.68, 0.72, 0.78, 0.82],
      affectedByNatuna: true,
      affectedByTaiwan: true,
    ),
    AssetModel(
      symbol: 'NKL',
      name: 'Nikel (LME)',
      category: AssetCategory.komoditas,
      subtitle: 'Pivot point Natuna — mendekati \$12k',
      iconLabel: 'NKL',
      iconFg: Color(0xFF3FB950),
      iconBg: Color(0xFF0D2818),
      price: '\$12.840',
      change: '−3.1%',
      changeDirection: PriceDirection.down,
      geoSignalType: SignalTone.danger,
      geoSignalText: '⚠ Mendekati Tripwire TW-02',
      geoSignalDetail:
          'Tripwire TW-02 aktif (Lapisan C)\n\n'
          'Nikel <\$12k = Shock Multiplier naik lagi + RFS Indonesia naik +2 '
          'poin. Ini adalah Pivot Watch item kritis — jika terpicu, distribusi '
          'probabilitas semua skenario bermutasi otomatis.',
      sparkline: [0.7, 0.65, 0.6, 0.5, 0.45, 0.4, 0.35, 0.3],
      affectedByNatuna: true,
    ),
    AssetModel(
      symbol: 'WTI',
      name: 'Minyak Mentah (WTI)',
      category: AssetCategory.komoditas,
      subtitle: 'Naik saat jalur LCS terganggu',
      iconLabel: 'CL',
      iconFg: Color(0xFFE3B341),
      iconBg: Color(0xFF1A1208),
      price: '\$79.4',
      change: '+1.4%',
      changeDirection: PriceDirection.up,
      geoSignalType: SignalTone.positive,
      geoSignalText: '↑ LCS escalation premium',
      geoSignalDetail:
          'Geopolitical Signal (LCS)\n\n'
          '30% perdagangan dunia lewat LCS. Jika frozen conflict berlanjut: '
          'harga naik 5–10% karena risk premium. Jika insiden militer terjadi: '
          'naik 20–35% seketika karena gangguan supply.',
      sparkline: [0.45, 0.48, 0.5, 0.55, 0.58, 0.6, 0.63, 0.66],
    ),
    AssetModel(
      symbol: 'WHT',
      name: 'Gandum (Wheat)',
      category: AssetCategory.komoditas,
      subtitle: 'El Niño + LCS supply chain',
      iconLabel: 'WHT',
      iconFg: Color(0xFFE3B341),
      iconBg: Color(0xFF1A1208),
      price: '\$5.42',
      change: '+2.1%',
      changeDirection: PriceDirection.up,
      geoSignalType: SignalTone.warning,
      geoSignalText: '! Shock Multiplier aktif',
      geoSignalDetail:
          'Systemic Shock × Geopolitical (Layer M)\n\n'
          'El Niño mengurangi pasokan global + LCS disruption mengganggu '
          'pengiriman. Kombinasi = risiko pangan naik. Jika kedua faktor '
          'memuncak bersamaan: gandum +15–25%.',
      sparkline: [0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75],
    ),

    // ─── Crypto ───
    AssetModel(
      symbol: 'BTC',
      name: 'Bitcoin',
      category: AssetCategory.crypto,
      subtitle: 'Risk-off di S2 & S3 — hedge di siber',
      iconLabel: 'BTC',
      iconFg: Color(0xFF9B59B6),
      iconBg: Color(0xFF201030),
      price: '\$103.4k',
      change: '−1.8%',
      changeDirection: PriceDirection.down,
      geoSignalType: SignalTone.warning,
      geoSignalText: '! Mixed — tergantung skenario',
      geoSignalDetail:
          'Geopolitical Signal\n\n'
          'S1 (43%): netral · S2 (29%): turun (risk-off, investor jual) · S3 '
          '(15%): turun tajam · Skenario siber: naik (hedge infrastruktur). '
          'BTC bukan safe haven saat geopolitik — reaksi seperti saham '
          'berisiko tinggi.',
      sparkline: [0.6, 0.65, 0.55, 0.6, 0.5, 0.45, 0.5, 0.42],
      affectedByTaiwan: true,
    ),
    AssetModel(
      symbol: 'ETH',
      name: 'Ethereum',
      category: AssetCategory.crypto,
      subtitle: 'Lebih volatil dari BTC saat krisis',
      iconLabel: 'ETH',
      iconFg: Color(0xFF9B59B6),
      iconBg: Color(0xFF201030),
      price: '\$2.487',
      change: '−2.4%',
      changeDirection: PriceDirection.down,
      geoSignalType: SignalTone.danger,
      geoSignalText: '↓ Lebih sensitif dari BTC',
      geoSignalDetail:
          'Geopolitical Signal (Taiwan)\n\n'
          'Jika Taiwan S2 (chip shortage): infrastruktur blockchain ikut '
          'terdampak — server, mining hardware semua pakai chip Taiwan. ETH '
          'lebih terdampak dari BTC karena proof-of-stake memerlukan lebih '
          'banyak komputasi.',
      sparkline: [0.6, 0.62, 0.5, 0.55, 0.45, 0.4, 0.42, 0.35],
      affectedByTaiwan: true,
    ),
  ];

  /// Display titles for each section header (and "see all" affordance).
  static const Map<AssetCategory, ({String title, String action})> sectionMeta = {
    AssetCategory.saham: (title: 'Saham Indonesia', action: 'Lihat semua'),
    AssetCategory.kurs: (title: 'Kurs & Mata Uang', action: 'Detail'),
    AssetCategory.komoditas: (title: 'Komoditas', action: 'Detail'),
    AssetCategory.crypto: (title: 'Crypto', action: 'Detail'),
  };
}
