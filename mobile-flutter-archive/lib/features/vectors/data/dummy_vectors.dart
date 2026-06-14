import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/risk_pill.dart';
import '../models/impact_vector_model.dart';

/// Dummy impact-vector data for the three active crises (Phase 2 — no backend).
abstract final class DummyVectors {
  DummyVectors._();

  static final List<ImpactCrisis> crises = [scs, natuna, taiwan];

  static ImpactCrisis? byId(String id) {
    for (final c in crises) {
      if (c.id == id) return c;
    }
    return crises.isNotEmpty ? crises.first : null;
  }

  // ── South China Sea ──
  static final ImpactCrisis scs = ImpactCrisis(
    id: 'scs',
    flag: '🌊',
    name: 'South China Sea',
    subLocation: 'Laut China Selatan · multi-aktor',
    riskLevel: RiskLevel.high,
    riskLabel: 'Tinggi',
    tripwires: 4,
    actors: 5,
    lastUpdate: '8 mnt lalu',
    layers: const [
      CrisisLayerTag(code: 'A', label: 'Redline 8/10', color: AppColors.danger, tooltip: 'Strategic Depth (Lapisan A): ruang mundur sempit, 8/10 mendekati titik kritis.'),
      CrisisLayerTag(code: 'B', label: 'Misread 7/10', color: AppColors.warning, tooltip: 'Perception Gap (Lapisan B): risiko salah baca tinggi antar banyak aktor.'),
      CrisisLayerTag(code: 'C', label: 'T-60 hari', color: AppColors.warning, tooltip: 'Action Readiness (Lapisan C): kesiapan militer ~60 hari.'),
      CrisisLayerTag(code: 'I', label: 'Non-nuclear', color: AppColors.success, tooltip: 'Nuclear Threshold (Lapisan I): tidak ada sinyal nuklir saat ini.'),
      CrisisLayerTag(code: 'K', label: 'CSI 5/10', color: AppColors.warning, tooltip: 'Cognitive Stress (Lapisan K): tekanan psikologis pemimpin sedang.'),
      CrisisLayerTag(code: 'O', label: 'RFS 5/10', color: AppColors.warning, tooltip: 'Regime Fragility (Lapisan O): kerapuhan rezim moderat.'),
      CrisisLayerTag(code: 'M', label: '+12%', color: AppColors.warning, tooltip: 'Shock Multiplier (Lapisan M): semua probabilitas konflik naik 12%.'),
    ],
    scenarios: [
      VectorScenario(
        code: 'A',
        name: 'Frozen conflict berlanjut',
        probability: 0.42,
        rung: 3,
        narrative:
            'Friksi terus berlangsung di bawah ambang perang terbuka. CCG dan kapal Filipina saling gertak, tapi ketergantungan ekonomi dan kehadiran AS menahan eskalasi penuh.',
        vectors: const [
          ImpactVector(label: 'Eskalasi', value: 0.55, tag: 'Regional', tone: VectorTone.caution),
          ImpactVector(label: 'Hibridisasi', value: 0.7, tag: 'Hybrid', tone: VectorTone.special),
          ImpactVector(label: 'Durasi', value: 0.85, tag: 'Indefinite Limbo', tone: VectorTone.caution),
        ],
        indicators: const [
          KeyIndicator(text: 'Patroli CCG rutin di Scarborough', tone: VectorTone.caution),
          KeyIndicator(text: 'FONOP AS menjaga status quo', tone: VectorTone.neutral),
          KeyIndicator(text: 'COC ASEAN macet', tone: VectorTone.negative),
        ],
        assets: const [
          AssetImpact(name: 'Energi & Migas', sub: 'Eksplorasi terhambat', dir: ImpactDir.up, detail: 'Ketegangan menahan eksplorasi blok sengketa → harga energi regional cenderung naik.'),
          AssetImpact(name: 'Pariwisata', sub: 'Sentimen kawasan', dir: ImpactDir.down, detail: 'Ketegangan berkepanjangan menekan arus wisata lintas kawasan.'),
          AssetImpact(name: 'Pelayaran', sub: 'Premi asuransi', dir: ImpactDir.flat, detail: 'Rute tetap buka; premi asuransi sedikit naik tapi stabil.'),
        ],
      ),
      VectorScenario(
        code: 'B',
        name: 'Insiden CCG vs Filipina',
        probability: 0.27,
        rung: 4,
        narrative:
            'Tabrakan atau water cannon saat misi resupply memicu insiden terbatas. Pasar bereaksi tajam namun jangka pendek.',
        vectors: const [
          ImpactVector(label: 'Eskalasi', value: 0.7, tag: 'Regional', tone: VectorTone.negative),
          ImpactVector(label: 'Hibridisasi', value: 0.45, tag: 'Kinetik', tone: VectorTone.negative),
          ImpactVector(label: 'Durasi', value: 0.3, tag: 'Resolusi cepat', tone: VectorTone.positive),
        ],
        indicators: const [
          KeyIndicator(text: 'Frekuensi resupply naik', tone: VectorTone.negative),
          KeyIndicator(text: 'Retorika keras kedua pihak', tone: VectorTone.caution),
          KeyIndicator(text: 'MDT AS-Filipina aktif', tone: VectorTone.caution),
        ],
        assets: const [
          AssetImpact(name: 'Emas', sub: 'Safe haven', dir: ImpactDir.up, detail: 'Insiden mendorong permintaan aset aman.'),
          AssetImpact(name: 'Saham kawasan', sub: 'Risk-off', dir: ImpactDir.down, detail: 'Aksi jual jangka pendek pada indeks ASEAN.'),
        ],
      ),
      VectorScenario(
        code: 'C',
        name: 'De-eskalasi via ASEAN COC',
        probability: 0.18,
        rung: 2,
        narrative:
            'Terobosan Code of Conduct menurunkan suhu. Skenario terbaik bagi pasar kawasan.',
        vectors: const [
          ImpactVector(label: 'Eskalasi', value: 0.25, tag: 'Bilateral', tone: VectorTone.positive),
          ImpactVector(label: 'Hibridisasi', value: 0.3, tag: 'Ekonomi', tone: VectorTone.neutral),
          ImpactVector(label: 'Durasi', value: 0.6, tag: 'Attrition', tone: VectorTone.neutral),
        ],
        indicators: const [
          KeyIndicator(text: 'Negosiasi COC maju', tone: VectorTone.positive),
          KeyIndicator(text: 'Hotline krisis dibentuk', tone: VectorTone.positive),
          KeyIndicator(text: 'Insiden menurun', tone: VectorTone.positive),
        ],
        assets: const [
          AssetImpact(name: 'Saham kawasan', sub: 'Risk-on', dir: ImpactDir.up, detail: 'De-eskalasi memicu pemulihan indeks ASEAN.'),
        ],
      ),
      VectorScenario(
        code: 'D',
        name: 'Eskalasi melibatkan AS',
        probability: 0.13,
        rung: 5,
        narrative:
            'Insiden menyeret AS langsung. Skenario paling disruptif untuk pasar global.',
        vectors: const [
          ImpactVector(label: 'Eskalasi', value: 0.9, tag: 'Global', tone: VectorTone.negative),
          ImpactVector(label: 'Hibridisasi', value: 0.6, tag: 'Kinetik', tone: VectorTone.negative),
          ImpactVector(label: 'Durasi', value: 0.55, tag: 'Perang proksi', tone: VectorTone.negative),
        ],
        indicators: const [
          KeyIndicator(text: 'Carrier group dikerahkan', tone: VectorTone.negative),
          KeyIndicator(text: 'Sanksi balasan disiapkan', tone: VectorTone.negative),
          KeyIndicator(text: 'Supply chain chip terancam', tone: VectorTone.negative),
        ],
        assets: const [
          AssetImpact(name: 'Emas', sub: 'Hedge maksimal', dir: ImpactDir.up, detail: 'Permintaan safe haven melonjak.'),
          AssetImpact(name: 'Teknologi', sub: 'Supply chain shock', dir: ImpactDir.down, detail: 'Gangguan jalur chip menekan saham teknologi global.'),
        ],
      ),
    ],
  );

  // ── Natuna ──
  static final ImpactCrisis natuna = ImpactCrisis(
    id: 'natuna',
    flag: '🇮🇩',
    name: 'Natuna ZEE',
    subLocation: 'Natuna — Indonesia',
    riskLevel: RiskLevel.medium,
    riskLabel: 'Sedang',
    tripwires: 2,
    actors: 2,
    lastUpdate: '12 mnt lalu',
    layers: const [
      CrisisLayerTag(code: 'A', label: 'Redline 3/10', color: AppColors.accent, tooltip: 'Strategic Depth (Lapisan A): masih banyak ruang negosiasi.'),
      CrisisLayerTag(code: 'B', label: 'Misread 6/10', color: AppColors.warning, tooltip: 'Perception Gap (Lapisan B): China bisa salah baca diam Indonesia.'),
      CrisisLayerTag(code: 'C', label: 'T-365 hari', color: AppColors.success, tooltip: 'Action Readiness (Lapisan C): tak ada persiapan militer.'),
      CrisisLayerTag(code: 'K', label: 'CSI 4/10', color: AppColors.warning, tooltip: 'Cognitive Stress (Lapisan K): tekanan sedang.'),
      CrisisLayerTag(code: 'O', label: 'RFS 5/10', color: AppColors.warning, tooltip: 'Regime Fragility (Lapisan O): tekanan domestik perlu diawasi.'),
      CrisisLayerTag(code: 'M', label: '+12%', color: AppColors.warning, tooltip: 'Shock Multiplier (Lapisan M): semua risiko +12%.'),
    ],
    scenarios: [
      VectorScenario(
        code: 'A',
        name: 'Tidak ada eskalasi',
        probability: 0.43,
        rung: 2,
        narrative:
            'Kemungkinan besar tidak ada konflik fisik. Saling ketergantungan ekonomi menahan kedua pihak; situasi membeku di gray zone bertahun-tahun.',
        vectors: const [
          ImpactVector(label: 'Eskalasi', value: 0.2, tag: 'Bilateral', tone: VectorTone.positive),
          ImpactVector(label: 'Hibridisasi', value: 0.35, tag: 'Ekonomi', tone: VectorTone.neutral),
          ImpactVector(label: 'Durasi', value: 0.9, tag: 'Indefinite Limbo', tone: VectorTone.special),
        ],
        indicators: const [
          KeyIndicator(text: 'Perdagangan bilateral \$127M/thn', tone: VectorTone.positive),
          KeyIndicator(text: 'Diplomasi tenang Jakarta', tone: VectorTone.positive),
          KeyIndicator(text: 'Gray zone persistence aktif', tone: VectorTone.special),
        ],
        assets: const [
          AssetImpact(name: 'Pertambangan & EV', sub: 'Nikel', dir: ImpactDir.up, detail: 'Stabilitas mendukung sektor tambang & baterai.'),
          AssetImpact(name: 'Properti', sub: 'Netral', dir: ImpactDir.flat, detail: 'Tidak ada dampak signifikan.'),
        ],
      ),
      VectorScenario(
        code: 'B',
        name: 'Terpaksa pilih satu blok',
        probability: 0.29,
        rung: 3,
        narrative:
            'Tekanan Taiwan/AS-China memaksa Indonesia menyatakan posisi. IHSG turun 12–20%, IDR tertekan.',
        vectors: const [
          ImpactVector(label: 'Eskalasi', value: 0.6, tag: 'Regional', tone: VectorTone.caution),
          ImpactVector(label: 'Hibridisasi', value: 0.55, tag: 'Ekonomi', tone: VectorTone.caution),
          ImpactVector(label: 'Durasi', value: 0.65, tag: '1–2 tahun', tone: VectorTone.caution),
        ],
        indicators: const [
          KeyIndicator(text: 'Taiwan Strait memanas', tone: VectorTone.negative),
          KeyIndicator(text: 'RFS + rally effect', tone: VectorTone.negative),
          KeyIndicator(text: 'Nikel turun + Shock M', tone: VectorTone.caution),
        ],
        assets: const [
          AssetImpact(name: 'IHSG', sub: 'Saham Indonesia', dir: ImpactDir.down, detail: 'Tekanan jual 12–20% pada skenario ini.'),
          AssetImpact(name: 'Emas', sub: 'Hedge', dir: ImpactDir.up, detail: 'Emas & saham pertahanan diuntungkan.'),
        ],
      ),
      VectorScenario(
        code: 'C',
        name: 'Insiden terbatas di laut',
        probability: 0.15,
        rung: 4,
        narrative:
            'CCG masuk <12nm memicu insiden. IDR melemah 8–12%, IHSG crash 18–25%, emas naik tajam.',
        vectors: const [
          ImpactVector(label: 'Eskalasi', value: 0.7, tag: 'Bilateral', tone: VectorTone.negative),
          ImpactVector(label: 'Hibridisasi', value: 0.4, tag: 'Kinetik', tone: VectorTone.negative),
          ImpactVector(label: 'Durasi', value: 0.4, tag: '3–6 bulan', tone: VectorTone.caution),
        ],
        indicators: const [
          KeyIndicator(text: 'CCG di ZEE 3× bulan ini', tone: VectorTone.negative),
          KeyIndicator(text: 'TDI ↑ Action Readiness T-21', tone: VectorTone.negative),
          KeyIndicator(text: 'Cascade risk 18%', tone: VectorTone.caution),
        ],
        assets: const [
          AssetImpact(name: 'IHSG', sub: 'Crash risk', dir: ImpactDir.down, detail: 'Penurunan 18–25% pada insiden langsung.'),
          AssetImpact(name: 'Pariwisata', sub: 'Turis China −80%', dir: ImpactDir.down, detail: 'Arus turis anjlok drastis.'),
        ],
      ),
      VectorScenario(
        code: 'D',
        name: 'Indonesia jadi mediator',
        probability: 0.09,
        rung: 1,
        narrative:
            'Skenario terbaik. IHSG naik 15–22%, IDR menguat, FDI Eropa & Jepang masuk.',
        vectors: const [
          ImpactVector(label: 'Eskalasi', value: 0.15, tag: 'Regional', tone: VectorTone.positive),
          ImpactVector(label: 'Hibridisasi', value: 0.2, tag: 'Diplomatik', tone: VectorTone.positive),
          ImpactVector(label: 'Durasi', value: 0.7, tag: '2–4 tahun', tone: VectorTone.neutral),
        ],
        indicators: const [
          KeyIndicator(text: 'Prestige diplomatik naik', tone: VectorTone.positive),
          KeyIndicator(text: 'ASEAN centrality kuat', tone: VectorTone.positive),
          KeyIndicator(text: 'FDI masuk', tone: VectorTone.positive),
        ],
        assets: const [
          AssetImpact(name: 'Semua sektor', sub: 'Risk-on', dir: ImpactDir.up, detail: 'Sentimen positif menyeluruh.'),
        ],
      ),
      VectorScenario(
        code: 'E',
        name: 'Tekanan ekonomi (Coercion)',
        probability: 0.04,
        rung: 3,
        narrative:
            'Financial warfare terkoordinasi. IHSG crash 25–35%, IDR tembus 18.000+. Hanya emas bertahan.',
        vectors: const [
          ImpactVector(label: 'Eskalasi', value: 0.8, tag: 'Global', tone: VectorTone.negative),
          ImpactVector(label: 'Hibridisasi', value: 0.85, tag: 'Ekonomi', tone: VectorTone.negative),
          ImpactVector(label: 'Durasi', value: 0.6, tag: '1–3 tahun', tone: VectorTone.negative),
        ],
        indicators: const [
          KeyIndicator(text: 'Embargo nikel', tone: VectorTone.negative),
          KeyIndicator(text: 'Sovereign rating turun', tone: VectorTone.negative),
          KeyIndicator(text: 'Cadangan devisa tertekan', tone: VectorTone.negative),
        ],
        assets: const [
          AssetImpact(name: 'Emas', sub: 'Max hedge', dir: ImpactDir.up, detail: 'Satu-satunya aset yang bertahan.'),
          AssetImpact(name: 'Semua saham', sub: 'Crash', dir: ImpactDir.down, detail: 'Penurunan 25–35% menyeluruh.'),
        ],
      ),
    ],
  );

  // ── Taiwan ──
  static final ImpactCrisis taiwan = ImpactCrisis(
    id: 'taiwan',
    flag: '🇹🇼',
    name: 'Taiwan Strait',
    subLocation: 'Selat Taiwan · nuclear adjacent',
    riskLevel: RiskLevel.high,
    riskLabel: 'Tinggi',
    tripwires: 2,
    actors: 2,
    lastUpdate: '20 mnt lalu',
    layers: const [
      CrisisLayerTag(code: 'A', label: 'Redline 10/10', color: AppColors.danger, tooltip: 'Strategic Depth (Lapisan A): tidak ada ruang mundur — garis merah maksimal.'),
      CrisisLayerTag(code: 'B', label: 'Misread 6/10', color: AppColors.warning, tooltip: 'Perception Gap (Lapisan B): risiko salah baca sedang-tinggi.'),
      CrisisLayerTag(code: 'I', label: 'Nuclear adjacent', color: AppColors.purple, tooltip: 'Nuclear Threshold (Lapisan I): MAD discount diterapkan pada skenario kinetik.'),
      CrisisLayerTag(code: 'K', label: 'CSI 5/10', color: AppColors.warning, tooltip: 'Cognitive Stress (Lapisan K): tekanan psikologis sedang.'),
      CrisisLayerTag(code: 'N', label: 'TDI ↑', color: AppColors.purple, tooltip: 'Tech Disruption (Lapisan N): kapabilitas PLA meningkat, Action Readiness dipercepat.'),
      CrisisLayerTag(code: 'M', label: '+12%', color: AppColors.warning, tooltip: 'Shock Multiplier (Lapisan M): semua risiko +12%.'),
    ],
    scenarios: [
      VectorScenario(
        code: 'A',
        name: 'Gray zone berkepanjangan',
        probability: 0.40,
        rung: 3,
        narrative:
            'Tekanan terus-menerus tanpa invasi penuh. Pasar semikonduktor tetap volatile.',
        vectors: const [
          ImpactVector(label: 'Eskalasi', value: 0.6, tag: 'Regional', tone: VectorTone.caution),
          ImpactVector(label: 'Hibridisasi', value: 0.75, tag: 'Hybrid', tone: VectorTone.special),
          ImpactVector(label: 'Durasi', value: 0.85, tag: 'Indefinite Limbo', tone: VectorTone.caution),
        ],
        indicators: const [
          KeyIndicator(text: 'ADIZ incursion harian', tone: VectorTone.caution),
          KeyIndicator(text: 'Chip supply chain sensitif', tone: VectorTone.negative),
          KeyIndicator(text: 'Status quo diplomatik', tone: VectorTone.neutral),
        ],
        assets: const [
          AssetImpact(name: 'Semikonduktor', sub: 'Volatil', dir: ImpactDir.flat, detail: 'Harga chip berfluktuasi mengikuti retorika lintas selat.'),
          AssetImpact(name: 'Teknologi global', sub: 'Premi risiko', dir: ImpactDir.down, detail: 'Premi risiko menekan valuasi saham teknologi.'),
        ],
      ),
      VectorScenario(
        code: 'B',
        name: 'Blokade / quarantine terbatas',
        probability: 0.28,
        rung: 4,
        narrative:
            'PLA memberlakukan karantina maritim terbatas. Disrupsi rantai pasok chip global signifikan.',
        vectors: const [
          ImpactVector(label: 'Eskalasi', value: 0.75, tag: 'Regional', tone: VectorTone.negative),
          ImpactVector(label: 'Hibridisasi', value: 0.65, tag: 'Hybrid', tone: VectorTone.negative),
          ImpactVector(label: 'Durasi', value: 0.6, tag: 'Attrition', tone: VectorTone.caution),
        ],
        indicators: const [
          KeyIndicator(text: 'Latihan Joint Sword skala besar', tone: VectorTone.negative),
          KeyIndicator(text: 'Asuransi pelayaran melonjak', tone: VectorTone.negative),
          KeyIndicator(text: 'TDI ↑ mempercepat opsi', tone: VectorTone.negative),
        ],
        assets: const [
          AssetImpact(name: 'Semikonduktor', sub: 'Shock', dir: ImpactDir.down, detail: 'Gangguan pasokan menekan tajam.'),
          AssetImpact(name: 'Emas', sub: 'Safe haven', dir: ImpactDir.up, detail: 'Permintaan aset aman naik.'),
        ],
      ),
      VectorScenario(
        code: 'C',
        name: 'Status quo diplomatik',
        probability: 0.20,
        rung: 2,
        narrative:
            'Manajemen krisis menjaga status quo. Volatilitas mereda.',
        vectors: const [
          ImpactVector(label: 'Eskalasi', value: 0.3, tag: 'Bilateral', tone: VectorTone.positive),
          ImpactVector(label: 'Hibridisasi', value: 0.35, tag: 'Ekonomi', tone: VectorTone.neutral),
          ImpactVector(label: 'Durasi', value: 0.6, tag: 'Attrition', tone: VectorTone.neutral),
        ],
        indicators: const [
          KeyIndicator(text: 'Saluran krisis aktif', tone: VectorTone.positive),
          KeyIndicator(text: 'Retorika mereda', tone: VectorTone.positive),
          KeyIndicator(text: 'Insiden menurun', tone: VectorTone.positive),
        ],
        assets: const [
          AssetImpact(name: 'Teknologi global', sub: 'Pemulihan', dir: ImpactDir.up, detail: 'Premi risiko mereda, valuasi pulih.'),
        ],
      ),
      VectorScenario(
        code: 'D',
        name: 'Eskalasi kinetik besar',
        probability: 0.12,
        rung: 5,
        narrative:
            'Konflik kinetik skala besar (probabilitas rendah, dampak ekstrem). MAD discount menahan tapi tail-risk nyata.',
        vectors: const [
          ImpactVector(label: 'Eskalasi', value: 0.95, tag: 'Global', tone: VectorTone.negative),
          ImpactVector(label: 'Hibridisasi', value: 0.7, tag: 'Kinetik', tone: VectorTone.negative),
          ImpactVector(label: 'Durasi', value: 0.5, tag: 'Perang proksi', tone: VectorTone.negative),
        ],
        indicators: const [
          KeyIndicator(text: 'Mobilisasi penuh PLA', tone: VectorTone.negative),
          KeyIndicator(text: 'Intervensi AS-Jepang', tone: VectorTone.negative),
          KeyIndicator(text: 'Nuclear signaling dipantau', tone: VectorTone.special),
        ],
        assets: const [
          AssetImpact(name: 'Pasar global', sub: 'Risk-off ekstrem', dir: ImpactDir.down, detail: 'Aksi jual global menyeluruh.'),
          AssetImpact(name: 'Emas', sub: 'Hedge maksimal', dir: ImpactDir.up, detail: 'Lonjakan permintaan safe haven.'),
        ],
      ),
    ],
  );
}
