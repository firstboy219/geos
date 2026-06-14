import 'package:flutter/material.dart';

import '../../../core/widgets/risk_pill.dart';
import '../models/crisis_model.dart';
import '../models/scenario_model.dart';

/// Dummy analysis data mirroring `Mockup_mobile/Home_screen.html`.
///
/// Phase 2-A uses this hardcoded content; Phase 6 will replace it with live
/// API data. Numbers match the mockup (Natuna 43/29/15/9/4%, redline 3,
/// misread 6, CSI 4, RFS 5, credibility 87%, …).
abstract final class DummyData {
  DummyData._();

  static const List<CrisisModel> crises = [_natuna, _southChinaSea, _taiwan];

  // ─────────────────────────────────────────────────────────────────────────
  // CRISIS 1 — NATUNA (full framework)
  // ─────────────────────────────────────────────────────────────────────────
  static const CrisisModel _natuna = CrisisModel(
    id: 'natuna',
    flag: '🇮🇩',
    title: 'Natuna — Indonesia',
    location: 'Kapal China masuk perairan ZEE Indonesia berulang kali',
    riskLevel: RiskLevel.medium,
    riskLabel: 'Sedang',
    statusText:
        'Kemungkinan besar tidak akan ada konflik fisik. Indonesia sedang '
        'mempertahankan posisi diplomatik dengan tenang.',
    statusTone: SignalTone.positive,
    credibilityScore: 87,
    credibilityNote:
        'Semua sinyal masuk sudah diverifikasi, tidak ada disinformasi atau '
        'deepfake terdeteksi',
    redlineIndex: 3,
    misreadScore: 6,
    csiScore: 4,
    rfsScore: 5,
    summaryText:
        'Kapal penjaga pantai China (CCG) terus masuk Zona Ekonomi Eksklusif '
        'Indonesia di Kepulauan Natuna. China mengklaim lewat "9-dash line" '
        'yang ditolak Indonesia. TNI AL sudah dikerahkan. Kedua pihak tidak '
        'inginkan eskalasi besar karena saling bergantung secara ekonomi.',
    cascadeNote:
        'Risiko spiral (Lapisan H — Cascade Detection): China salah baca diam '
        'Indonesia sebagai persetujuan → China terus maju → Indonesia terpaksa '
        'merespons keras → spiral eskalasi. Probabilitas cascade: 18% dalam 24 '
        'bulan.',
    layerChips: [
      CrisisLayerChip(
        code: 'A',
        label: 'Redline 3/10',
        tone: SignalTone.info,
        tooltip:
            'Redline Index (Lapisan A) — Seberapa jauh Indonesia bisa mundur '
            'sebelum terpaksa bertindak ekstrem. 3/10 = masih banyak ruang '
            'negosiasi. Makin mendekati 10 = makin berbahaya.',
      ),
      CrisisLayerChip(
        code: 'B',
        label: 'Misread 6/10',
        tone: SignalTone.warning,
        tooltip:
            'Misread Score (Lapisan B) — Seberapa besar kemungkinan satu pihak '
            'salah membaca niat pihak lain. 6/10 = risiko tinggi. China '
            'kemungkinan mengira diam Indonesia = persetujuan diam-diam.',
      ),
      CrisisLayerChip(
        code: 'C',
        label: 'T-365 hari',
        tone: SignalTone.positive,
        tooltip:
            'Action Readiness (Lapisan C) — Perkiraan waktu sebelum pihak '
            'tertentu siap bertindak secara militer. T-365 hari = Indonesia '
            'tidak menunjukkan persiapan militer apapun.',
      ),
      CrisisLayerChip(
        code: 'K',
        label: 'CSI 4/10',
        tone: SignalTone.danger,
        tooltip:
            'Cognitive Stress Index (Lapisan K) — Tingkat tekanan psikologis '
            'pemimpin. CSI tinggi = keputusan lebih impulsif. 4/10 = tekanan '
            'sedang, masih terkendali.',
      ),
      CrisisLayerChip(
        code: 'O',
        label: 'RFS 5/10',
        tone: SignalTone.danger,
        tooltip:
            'Regime Fragility Score (Lapisan O) — Seberapa rapuh rezim dilihat '
            'dari legitimasi politik, kohesi sosial, loyalitas militer, dan '
            'tekanan ekonomi. 5/10 = sedang. Ada tekanan dalam negeri.',
      ),
      CrisisLayerChip(
        code: 'F',
        label: 'Gray Zone',
        tone: SignalTone.special,
        tooltip:
            'Gray Zone Persistence (Lapisan F) — Situasi di bawah ambang batas '
            'perang terbuka tapi tidak pernah selesai damai. Aktif = situasi '
            'Natuna kemungkinan terus seperti ini tanpa resolusi.',
      ),
      CrisisLayerChip(
        code: 'M',
        label: '+12%',
        tone: SignalTone.warning,
        tooltip:
            'Shock Multiplier (Lapisan M) — Faktor pengali ketika krisis '
            'non-militer berjalan paralel. Aktif: harga komoditas jatuh + El '
            'Niño → semua probabilitas konflik naik 12%.',
      ),
    ],
    perceptions: [
      PerceptionRead(
        actor: '🇨🇳 China membaca Indonesia',
        reading: 'Diam = setuju secara diam-diam',
        verdict: 'Misread ⚠ — sangat berbahaya',
        tone: SignalTone.danger,
      ),
      PerceptionRead(
        actor: '🇮🇩 Indonesia membaca China',
        reading: 'Provokasi terukur, bukan niat perang',
        verdict: 'Misread rendah ✓',
        tone: SignalTone.positive,
      ),
      PerceptionRead(
        actor: '🇺🇸 Amerika membaca Indonesia',
        reading: 'Bisa dijadikan anchor Indo-Pasifik',
        verdict: 'Misread sedang',
        tone: SignalTone.warning,
      ),
      PerceptionRead(
        actor: '🌏 ASEAN membaca Indonesia',
        reading: 'Akan tetap memimpin kawasan',
        verdict: 'Misread rendah ✓',
        tone: SignalTone.positive,
      ),
    ],
    actors: [
      ActorModel(
        initials: 'XI',
        name: 'Xi Jinping · China',
        stressLabel: 'Sedang',
        stressLevel: 3,
        stressTone: SignalTone.warning,
        scores: [
          ActorScore(
            label: 'RCS 85/100',
            tone: SignalTone.danger,
            tooltip:
                'Rhetorical Consistency Score — Seberapa sering ucapan diikuti '
                'tindakan. 85 = hampir selalu. Jika Xi bicara keras, dia serius.',
          ),
          ActorScore(
            label: 'CSI 4/10',
            tone: SignalTone.warning,
            tooltip:
                'Cognitive Stress Index — Tekanan psikologis dari OSINT: '
                'frekuensi pidato, perubahan inner circle, rotasi jenderal. '
                '4/10 = tekanan sedang.',
          ),
          ActorScore(
            label: 'RFS 6/10',
            tone: SignalTone.warning,
            tooltip:
                'Regime Fragility Score — Kerapuhan posisi Xi di dalam negeri. '
                '6/10 = mulai tertekan — krisis properti + pengangguran muda.',
          ),
          ActorScore(
            label: 'Ideological',
            tone: SignalTone.info,
            tooltip:
                'Decision Style — Ideological = keputusan berbasis prinsip '
                'ideologis, bukan kalkulasi cost-benefit. Sulit diubah dengan '
                'tekanan ekonomi saja.',
          ),
        ],
      ),
      ActorModel(
        initials: 'PW',
        name: 'Prabowo Subianto · Indonesia',
        stressLabel: 'Sedang — mulai naik',
        stressLevel: 3,
        stressTone: SignalTone.warning,
        scores: [
          ActorScore(
            label: 'RCS 72/100',
            tone: SignalTone.info,
            tooltip:
                'Rhetorical Consistency Score — 72 = cukup konsisten. "Teman '
                'semua, musuh tidak ada" diikuti kebijakan selaras. Bisa '
                'diprediksi namun ada ruang untuk kejutan.',
          ),
          ActorScore(
            label: 'CSI 4/10',
            tone: SignalTone.warning,
            tooltip:
                'Cognitive Stress Index — 4/10 = tekanan sedang. Polarisasi '
                'domestik naik, tapi kepemimpinan masih stabil.',
          ),
          ActorScore(
            label: 'RFS 5/10',
            tone: SignalTone.warning,
            tooltip:
                'Regime Fragility Score — 5/10 = moderate. Youth unemployment '
                'naik, polarisasi pasca-2024. RFS tinggi cenderung gunakan isu '
                'luar negeri untuk alihkan perhatian (Rally Effect).',
          ),
          ActorScore(
            label: 'Pragmatic',
            tone: SignalTone.positive,
            tooltip:
                'Decision Style: Pragmatic — Keputusan berbasis untung-rugi. '
                'Lebih mudah dipengaruhi insentif ekonomi. Cenderung mencari '
                'jalan tengah daripada konfrontasi.',
          ),
        ],
      ),
    ],
    pivotWatches: [
      PivotWatch(
        text:
            'CCG masuk <12nm dari Natuna (perairan teritorial) → trigger '
            'insiden langsung',
        badge: 'Sangat kritis',
        tone: SignalTone.danger,
        icon: Icons.directions_boat_outlined,
      ),
      PivotWatch(
        text:
            'Harga nikel turun di bawah \$10k → tekanan fiskal RI naik → RFS '
            'naik +2 poin',
        badge: 'Perlu diawasi',
        tone: SignalTone.warning,
        icon: Icons.trending_down,
      ),
      PivotWatch(
        text:
            'Taiwan Strait memburuk → Indonesia dipaksa pilih antara Amerika '
            'atau China',
        badge: 'Perlu diawasi',
        tone: SignalTone.warning,
        icon: Icons.public,
      ),
    ],
    probabilityBars: [
      ProbabilityBar('Tidak ada eskalasi', 43, SignalTone.positive),
      ProbabilityBar('Indonesia terpaksa pilih satu blok', 29, SignalTone.warning),
      ProbabilityBar('Insiden terbatas di laut', 15, SignalTone.danger),
      ProbabilityBar('Indonesia jadi mediator', 9, SignalTone.positive),
      ProbabilityBar('Tekanan ekonomi dari luar', 4, SignalTone.danger),
    ],
    scenarios: _natunaScenarios,
  );

  static const List<ScenarioModel> _natunaScenarios = [
    // SCN 1
    ScenarioModel(
      name: 'Skenario 1 — Tidak ada eskalasi',
      probability: 43,
      tone: SignalTone.positive,
      rung: 'Rung 2 — Posturing',
      duration: 'Gray Zone >3 thn',
      hint:
          'Portofolio aman. Sektor pertambangan dan EV cenderung naik. Situasi '
          'membeku — tegang tapi tidak meledak selama bertahun-tahun.',
      confidenceScore: 82,
      confidenceFormula:
          'Formula: P = Bayesian × Rung weight × Misread × Redline × RFS × '
          'Shock Multiplier',
      tags: [
        ScenarioTag(
          label: 'Rung 2 — Posturing',
          tone: SignalTone.info,
          tooltip:
              'Escalation Rung 2 (Lapisan 3) — Tangga 1–6: Rung 2 = posturing '
              'dan sinyal diplomatik. Belum ada tindakan nyata.',
        ),
        ScenarioTag(
          label: 'Durasi: Gray Zone >3 thn',
          tone: SignalTone.positive,
          tooltip:
              'Vektor Durasi (Lapisan F) — Gray Zone Persistence: situasi tidak '
              'selesai cepat. Pola historis menunjukkan tahunan tanpa resolusi.',
        ),
        ScenarioTag(
          label: 'F: Indefinite Limbo',
          tone: SignalTone.special,
          tooltip:
              'Gray Zone — Indefinite Limbo: konflik yang tidak eskalasi jadi '
              'perang tapi juga tidak pernah selesai. Akan terus "bermain" di '
              'zona ini.',
        ),
      ],
      evidences: [
        Evidence(
          icon: Icons.attach_money,
          tone: SignalTone.info,
          text:
              'Perdagangan bilateral Indonesia–China mencapai \$127 miliar/tahun '
              '(2023). China adalah mitra dagang terbesar RI — tidak ada '
              'insentif ekonomi untuk eskalasi.',
          source: 'Sumber: BPS / Kemendag RI 2023',
          tag: 'Faktor penahan ekonomi (Anachronism Filter)',
        ),
        Evidence(
          icon: Icons.history,
          tone: SignalTone.positive,
          text:
              'Insiden Natuna 2019–2020 diselesaikan lewat jalur diplomatik '
              'tanpa satu tembakan. Historical Pattern Match: kedua pihak selalu '
              'mundur sebelum titik kritis. Similarity score: 81%.',
          source: 'Sumber: Historical Pattern Matching (Lapisan 1)',
          tag: 'Preseden historis — similarity 81%',
        ),
        Evidence(
          icon: Icons.business,
          tone: SignalTone.info,
          text:
              'Investasi China lewat OBOR aktif \$6.8 miliar di Indonesia. '
              'Konflik akan membekukan seluruh pipeline ini — biaya bagi China '
              'sangat tinggi.',
          source: 'Sumber: BKPM / AEI Data 2024',
          tag: 'Leverage ekonomi & Financial Warfare cost (Lapisan J)',
        ),
        Evidence(
          icon: Icons.all_inclusive,
          tone: SignalTone.special,
          text:
              'Lapisan F (Gray Zone Persistence) aktif: berdasarkan pola '
              'sub-threshold, situasi kemungkinan terus "membeku" selama 3+ '
              'tahun ke depan.',
          source: 'Sumber: Gray Zone Persistence Engine (Lapisan F)',
          tag: 'Gray Zone analysis — F',
        ),
      ],
      dominoEffects: [
        DominoEffect('FDI naik dari kedua blok', SignalTone.positive),
        DominoEffect('Vietnam juga diuntungkan', SignalTone.positive),
        DominoEffect('IDR relatif stabil', SignalTone.neutral),
        DominoEffect('ASEAN tetap terpecah', SignalTone.special),
      ],
      industryImpacts: [
        IndustryImpact('Pertambangan', ImpactDirection.up),
        IndustryImpact('Perbankan', ImpactDirection.up),
        IndustryImpact('EV & Baterai', ImpactDirection.up),
        IndustryImpact('Properti', ImpactDirection.neutral),
        IndustryImpact('Konsumer', ImpactDirection.neutral),
      ],
    ),
    // SCN 2
    ScenarioModel(
      name: 'Skenario 2 — Indonesia terpaksa pilih satu blok',
      probability: 29,
      tone: SignalTone.warning,
      rung: 'Rung 3 — Ekonomi',
      duration: '1–2 tahun',
      hint:
          'IHSG turun 12–20%. IDR tertekan ke 16.500+. Emas dan saham '
          'pertahanan diuntungkan.',
      confidenceScore: 71,
      confidenceFormula: 'Bayesian × Rung × Misread × Redline × RFS × M',
      tags: [
        ScenarioTag(
          label: 'Rung 3 — Ekonomi',
          tone: SignalTone.warning,
          tooltip:
              'Escalation Rung 3 — Sanksi, embargo, dan tekanan ekonomi sebagai '
              'senjata. Belum kinetik, tapi dampak ke pasar langsung terasa.',
        ),
        ScenarioTag(
          label: 'Durasi: 1–2 tahun',
          tone: SignalTone.warning,
          tooltip:
              'Vektor Durasi — Situasi seperti ini biasanya 1–2 tahun sebelum '
              'resolusi atau eskalasi lebih lanjut.',
        ),
        ScenarioTag(
          label: 'O: RFS trigger',
          tone: SignalTone.danger,
          tooltip:
              'Regime Fragility Score trigger (Lapisan O) — RFS 5/10 + tekanan '
              'ekonomi = pemimpin rapuh cenderung gunakan isu luar negeri untuk '
              'konsolidasi (Rally Effect).',
        ),
      ],
      financialWeapons: [
        FinancialWeapon(
          flag: '🇨🇳',
          tone: SignalTone.danger,
          text:
              'China: stop nikel offtake + freeze OBOR disbursement \$6.8M + '
              'kurangi turis',
          asymmetry:
              'Asymmetry Score: Berat — RI sangat bergantung pada offtake nikel '
              'China',
        ),
        FinancialWeapon(
          flag: '🇺🇸',
          tone: SignalTone.warning,
          text:
              'AS: cabut GSP (tarif preferensial) + IMF conditionality pressure '
              '+ SWIFT pressure',
          asymmetry:
              'Asymmetry Score: Sedang — RI punya leverage dari komoditas kritis '
              '(nikel, dll)',
        ),
      ],
      evidences: [
        Evidence(
          icon: Icons.warning_amber,
          tone: SignalTone.warning,
          text:
              'Krisis Taiwan Strait semakin intens 2024–2025. Jika meledak, '
              'Indonesia ditekan dari dua arah — AS dan China — untuk menyatakan '
              'posisi eksplisit.',
          source: 'CSIS Taiwan Risk Assessment 2024',
          tag: 'Pemicu eksternal (Counterfactual — Lapisan D)',
        ),
        Evidence(
          icon: Icons.groups_outlined,
          tone: SignalTone.danger,
          text:
              'RFS 5/10 + CSI 4/10: Polarisasi domestik & youth unemployment '
              'naik. Pemimpin dengan tekanan tinggi cenderung pakai isu luar '
              'negeri untuk konsolidasi — "Rally-the-Flag Effect".',
          source: 'Lapisan O (RFS) + K (CSI) + Historical pattern',
          tag: 'Fragilitas rezim + rally effect',
        ),
        Evidence(
          icon: Icons.trending_down,
          tone: SignalTone.warning,
          text:
              'Nikel turun 45% sejak 2022 + Shock Multiplier (Layer M) aktif '
              '+12%. Kombinasi ini menaikkan probabilitas dari 25% menjadi 29%.',
          source: 'LME Nickel Data 2024 + Layer M calculation',
          tag: 'Tekanan ekonomi × Shock Multiplier',
        ),
      ],
      dominoEffects: [
        DominoEffect('ASEAN split makin dalam', SignalTone.danger),
        DominoEffect('Capital outflow 30–90 hari', SignalTone.danger),
        DominoEffect('Investor pindah ke Vietnam', SignalTone.warning),
        DominoEffect('Refugee pressure regional', SignalTone.danger),
      ],
      industryImpacts: [
        IndustryImpact('Teknologi', ImpactDirection.down),
        IndustryImpact('Telekomunikasi', ImpactDirection.down),
        IndustryImpact('Pariwisata', ImpactDirection.down),
        IndustryImpact('Pertahanan', ImpactDirection.up),
        IndustryImpact('Emas & Logam', ImpactDirection.up),
        IndustryImpact('Perbankan', ImpactDirection.watch),
      ],
    ),
    // SCN 3
    ScenarioModel(
      name: 'Skenario 3 — Insiden terbatas di laut',
      probability: 15,
      tone: SignalTone.danger,
      rung: 'Rung 4 — Kinetik lokal',
      duration: '3–6 bulan',
      hint:
          'IDR melemah 8–12%. Turis China minus 80%. IHSG crash 18–25%. Emas '
          'naik drastis sebagai aset aman.',
      confidenceScore: 63,
      confidenceFormula:
          'Bayesian × Rung × Misread(6/10) × Redline(3/10) × RFS(5/10) × '
          'M(×1.12)',
      tags: [
        ScenarioTag(
          label: 'Rung 4 — Kinetik lokal',
          tone: SignalTone.danger,
          tooltip:
              'Escalation Rung 4 — Konflik fisik terbatas (tembak-menembak / '
              'tabrakan kapal) tapi belum deklarasi perang. Sangat disruptif '
              'untuk pasar.',
        ),
        ScenarioTag(
          label: 'Durasi: 3–6 bulan',
          tone: SignalTone.info,
          tooltip:
              'Vektor Durasi — Insiden terbatas biasanya selesai 3–6 bulan, '
              'tapi dampak ekonominya langsung terasa sejak hari pertama.',
        ),
        ScenarioTag(
          label: 'H: Cascade risk aktif',
          tone: SignalTone.warning,
          tooltip:
              'N×N Cascade Detection (Lapisan H) — Risiko salah baca China '
              'terhadap Indonesia menciptakan spiral eskalasi tak disengaja.',
        ),
      ],
      evidences: [
        Evidence(
          icon: Icons.directions_boat_outlined,
          tone: SignalTone.danger,
          text:
              'CCG masuk ZEE Natuna 3× bulan ini — lebih tinggi dari rata-rata. '
              'Layer N (TDI naik): drone swarm baru → Action Readiness China '
              'T-21 hari. Frekuensi + kapabilitas = risiko insiden naik.',
          source: 'OSINT MarineTraffic + Layer N TDI update',
          tag: 'Sinyal militer + TDI escalation',
        ),
        Evidence(
          icon: Icons.visibility_outlined,
          tone: SignalTone.warning,
          text:
              'Misread Score 6/10 (Lapisan B): China membaca "diam Indonesia" '
              'sebagai persetujuan. N×N Cascade: probabilitas spiral 18% dalam '
              '24 bulan jika tidak ada koreksi eksplisit dari Jakarta.',
          source: 'Perception Gap Engine + N×N Matrix (Lapisan B & H)',
          tag: 'Cascade risk 18%',
        ),
        Evidence(
          icon: Icons.history,
          tone: SignalTone.danger,
          text:
              'Historical Pattern Match: Scarborough Shoal 2012 (Filipina vs '
              'China) berpola identik — CCG masuk perlahan, China akhirnya '
              'kuasai tanpa tembakan. Similarity score: 74%.',
          source: 'Historical Matching (1) + Anachronism Filter (2)',
          tag: 'Pattern match 74% — preseden Scarborough Shoal',
        ),
      ],
      dominoEffects: [
        DominoEffect('Turis China −80%', SignalTone.danger),
        DominoEffect('OBOR Indonesia freeze', SignalTone.danger),
        DominoEffect('IDR −8–12% dalam 30 hari', SignalTone.danger),
        DominoEffect('Emas rally tajam', SignalTone.positive),
        DominoEffect('Supply chain nikel terganggu global', SignalTone.warning),
      ],
      industryImpacts: [
        IndustryImpact('Pariwisata', ImpactDirection.down),
        IndustryImpact('Penerbangan', ImpactDirection.down),
        IndustryImpact('Impor & Ritel', ImpactDirection.down),
        IndustryImpact('Perbankan', ImpactDirection.down),
        IndustryImpact('Emas & Logam', ImpactDirection.up),
        IndustryImpact('Pertahanan', ImpactDirection.up),
      ],
    ),
    // SCN 4
    ScenarioModel(
      name: 'Skenario 4 — Indonesia jadi mediator',
      probability: 9,
      tone: SignalTone.positive,
      rung: 'Rung 1–2 — De-eskalasi',
      duration: '2–4 tahun',
      hint:
          'Skenario terbaik. IHSG naik 15–22%, IDR menguat ke 14.800–15.000, '
          'FDI dari Eropa dan Jepang masuk.',
      confidenceScore: 55,
      confidenceFormula: 'Base rate rendah — butuh 3 kondisi simultan',
      tags: [
        ScenarioTag(
          label: 'Rung 1–2 — De-eskalasi',
          tone: SignalTone.positive,
          tooltip:
              'Escalation Rung 1–2 — Penurunan tensi lewat diplomasi aktif. '
              'Indonesia mengambil peran penengah.',
        ),
        ScenarioTag(
          label: 'Durasi: 2–4 tahun',
          tone: SignalTone.info,
          tooltip:
              'Vektor Durasi — Proses mediasi membutuhkan waktu panjang namun '
              'memberi stabilitas jangka menengah.',
        ),
        ScenarioTag(
          label: 'Peluang terbaik portofolio',
          tone: SignalTone.positive,
          tooltip:
              'Skenario dengan dampak portofolio paling positif — semua sektor '
              'cenderung naik.',
        ),
      ],
      dominoEffects: [
        DominoEffect('FDI Eropa & Jepang masuk', SignalTone.positive),
        DominoEffect('ASEAN centrality diperkuat', SignalTone.positive),
        DominoEffect('Prestige diplomatik RI naik', SignalTone.positive),
      ],
      industryImpacts: [
        IndustryImpact('Semua Sektor', ImpactDirection.up),
        IndustryImpact('Keuangan & Bank', ImpactDirection.up),
        IndustryImpact('Pertambangan', ImpactDirection.up),
        IndustryImpact('Properti', ImpactDirection.up),
        IndustryImpact('Pertahanan', ImpactDirection.neutral),
      ],
    ),
    // SCN 5
    ScenarioModel(
      name: 'Skenario 5 — Tekanan ekonomi dari luar (Coercion)',
      probability: 4,
      tone: SignalTone.danger,
      rung: 'Rung 3 — Financial warfare',
      duration: '1–3 tahun',
      hint:
          'IHSG crash 25–35%. IDR tembus 18.000+. Deposito pun merugi karena '
          'inflasi. Hanya emas yang bertahan.',
      confidenceScore: 58,
      confidenceFormula: 'Probabilitas rendah tapi dampak ekstrem',
      tags: [
        ScenarioTag(
          label: 'Rung 3 — Financial warfare',
          tone: SignalTone.danger,
          tooltip:
              'Financial Warfare (Lapisan J) — Senjata ekonomi ditembakkan '
              'terkoordinasi: embargo nikel, pembekuan aset, tekanan rating.',
        ),
        ScenarioTag(
          label: 'Durasi: 1–3 tahun',
          tone: SignalTone.warning,
          tooltip:
              'Vektor Durasi — Tekanan ekonomi sistemik bisa berlangsung '
              '1–3 tahun dengan dampak berkepanjangan.',
        ),
        ScenarioTag(
          label: 'Skenario paling merusak ekonomi',
          tone: SignalTone.danger,
          tooltip:
              'Probabilitas paling rendah namun dengan dampak paling merusak '
              'terhadap stabilitas ekonomi nasional.',
        ),
      ],
      dominoEffects: [
        DominoEffect('Sovereign rating turun 1–2 notch', SignalTone.danger),
        DominoEffect('Cost of borrowing APBN naik', SignalTone.danger),
        DominoEffect('Cadangan devisa tertekan', SignalTone.danger),
        DominoEffect('Emas ↑↑↑ max hedge', SignalTone.positive),
      ],
      industryImpacts: [
        IndustryImpact('Semua saham', ImpactDirection.down),
        IndustryImpact('Pertambangan', ImpactDirection.down),
        IndustryImpact('Perbankan', ImpactDirection.down),
        IndustryImpact('Emas & Logam', ImpactDirection.up),
        IndustryImpact('Deposito IDR', ImpactDirection.watch),
      ],
    ),
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // CRISIS 2 — SOUTH CHINA SEA
  // ─────────────────────────────────────────────────────────────────────────
  static const CrisisModel _southChinaSea = CrisisModel(
    id: 'scs',
    flag: '🌊',
    title: 'Laut China Selatan',
    location: 'Konfrontasi Filipina–China di Second Thomas Shoal',
    riskLevel: RiskLevel.high,
    riskLabel: 'Tinggi',
    statusText:
        'Konfrontasi berulang di Second Thomas Shoal. Risiko insiden kinetik '
        'lebih tinggi dari Natuna — water cannon & blokade sudah terjadi.',
    statusTone: SignalTone.danger,
    credibilityScore: 79,
    credibilityNote:
        'Sebagian besar sinyal terverifikasi; beberapa klaim sepihak masih '
        'menunggu konfirmasi independen',
    redlineIndex: 6,
    misreadScore: 5,
    csiScore: 5,
    rfsScore: 6,
    summaryText:
        'China memblokade misi resupply Filipina ke BRP Sierra Madre. AS terikat '
        'Mutual Defense Treaty dengan Filipina, sehingga insiden kecil bisa '
        'menyeret kekuatan besar. Tensi tertinggi di kawasan saat ini.',
    cascadeNote:
        'Risiko spiral: water cannon → korban jiwa Filipina → invokasi MDT AS → '
        'keterlibatan langsung AS. Probabilitas cascade: 24% dalam 18 bulan.',
    layerChips: [
      CrisisLayerChip(
        code: 'A',
        label: 'Redline 6/10',
        tone: SignalTone.warning,
        tooltip:
            'Redline Index (Lapisan A) — 6/10: ruang manuver Filipina menyempit. '
            'Korban jiwa akan memaksa respons keras.',
      ),
      CrisisLayerChip(
        code: 'B',
        label: 'Misread 5/10',
        tone: SignalTone.warning,
        tooltip:
            'Misread Score (Lapisan B) — 5/10: kedua pihak relatif memahami '
            'niat lawan, namun salah hitung taktis tetap mungkin.',
      ),
      CrisisLayerChip(
        code: 'C',
        label: 'T-120 hari',
        tone: SignalTone.warning,
        tooltip:
            'Action Readiness (Lapisan C) — T-120 hari: postur militer regional '
            'meningkat, kesiapan lebih cepat dari Natuna.',
      ),
      CrisisLayerChip(
        code: 'K',
        label: 'CSI 5/10',
        tone: SignalTone.warning,
        tooltip:
            'Cognitive Stress Index (Lapisan K) — 5/10: tekanan domestik '
            'Marcos & nasionalisme China membuat keputusan lebih reaktif.',
      ),
      CrisisLayerChip(
        code: 'O',
        label: 'RFS 6/10',
        tone: SignalTone.danger,
        tooltip:
            'Regime Fragility Score (Lapisan O) — 6/10: tekanan ekonomi China + '
            'koalisi domestik Filipina yang rapuh.',
      ),
      CrisisLayerChip(
        code: 'F',
        label: 'Gray Zone',
        tone: SignalTone.special,
        tooltip:
            'Gray Zone Persistence (Lapisan F) — Taktik abu-abu (blokade, water '
            'cannon) di bawah ambang perang terbuka, berlangsung tahunan.',
      ),
      CrisisLayerChip(
        code: 'M',
        label: '+12%',
        tone: SignalTone.warning,
        tooltip:
            'Shock Multiplier (Lapisan M) — Semua probabilitas konflik naik '
            '12% akibat krisis non-militer paralel.',
      ),
    ],
    perceptions: [
      PerceptionRead(
        actor: '🇨🇳 China membaca Filipina',
        reading: 'Proksi AS yang bisa ditekan',
        verdict: 'Misread sedang',
        tone: SignalTone.warning,
      ),
      PerceptionRead(
        actor: '🇵🇭 Filipina membaca China',
        reading: 'Akan terus eskalasi bertahap',
        verdict: 'Misread rendah ✓',
        tone: SignalTone.positive,
      ),
      PerceptionRead(
        actor: '🇺🇸 Amerika membaca China',
        reading: 'Menguji kredibilitas aliansi AS',
        verdict: 'Misread rendah ✓',
        tone: SignalTone.positive,
      ),
      PerceptionRead(
        actor: '🌏 ASEAN membaca konflik',
        reading: 'Hindari keberpihakan terbuka',
        verdict: 'Misread sedang',
        tone: SignalTone.warning,
      ),
    ],
    actors: [
      ActorModel(
        initials: 'XI',
        name: 'Xi Jinping · China',
        stressLabel: 'Sedang',
        stressLevel: 3,
        stressTone: SignalTone.warning,
        scores: [
          ActorScore(
            label: 'RCS 85/100',
            tone: SignalTone.danger,
            tooltip:
                'Rhetorical Consistency Score — 85: tindakan hampir selalu '
                'mengikuti retorika keras China atas klaim maritim.',
          ),
          ActorScore(
            label: 'CSI 5/10',
            tone: SignalTone.warning,
            tooltip:
                'Cognitive Stress Index — 5/10: tekanan ekonomi domestik China '
                'meningkatkan kebutuhan akan kemenangan nasionalis.',
          ),
          ActorScore(
            label: 'RFS 6/10',
            tone: SignalTone.warning,
            tooltip:
                'Regime Fragility Score — 6/10: krisis properti + pengangguran '
                'muda menambah insentif pengalihan eksternal.',
          ),
        ],
      ),
      ActorModel(
        initials: 'BM',
        name: 'Bongbong Marcos · Filipina',
        stressLabel: 'Sedang — naik',
        stressLevel: 3,
        stressTone: SignalTone.warning,
        scores: [
          ActorScore(
            label: 'RCS 70/100',
            tone: SignalTone.info,
            tooltip:
                'Rhetorical Consistency Score — 70: kebijakan pro-AS konsisten, '
                'namun manuver domestik kadang mengejutkan.',
          ),
          ActorScore(
            label: 'CSI 5/10',
            tone: SignalTone.warning,
            tooltip:
                'Cognitive Stress Index — 5/10: rivalitas dengan faksi Duterte '
                'menambah tekanan keputusan.',
          ),
          ActorScore(
            label: 'RFS 6/10',
            tone: SignalTone.warning,
            tooltip:
                'Regime Fragility Score — 6/10: koalisi rapuh, sentimen '
                'nasionalis tinggi atas isu maritim.',
          ),
        ],
      ),
    ],
    pivotWatches: [
      PivotWatch(
        text:
            'Korban jiwa personel Filipina akibat manuver CCG → trigger invokasi '
            'MDT dengan AS',
        badge: 'Sangat kritis',
        tone: SignalTone.danger,
        icon: Icons.warning_amber,
      ),
      PivotWatch(
        text:
            'AS kirim aset angkatan laut untuk escort resupply → eskalasi '
            'langsung dengan China',
        badge: 'Sangat kritis',
        tone: SignalTone.danger,
        icon: Icons.directions_boat_outlined,
      ),
      PivotWatch(
        text:
            'Putusan arbitrase baru / deklarasi ADIZ China → resetting seluruh '
            'kalkulasi kawasan',
        badge: 'Perlu diawasi',
        tone: SignalTone.warning,
        icon: Icons.public,
      ),
    ],
    probabilityBars: [
      ProbabilityBar('Gray zone berlanjut tanpa korban', 38, SignalTone.warning),
      ProbabilityBar('Insiden kinetik terbatas', 31, SignalTone.danger),
      ProbabilityBar('AS terlibat via MDT', 18, SignalTone.danger),
      ProbabilityBar('De-eskalasi negosiasi', 13, SignalTone.positive),
    ],
    scenarios: [
      ScenarioModel(
        name: 'Skenario 1 — Gray zone berlanjut tanpa korban',
        probability: 38,
        tone: SignalTone.warning,
        rung: 'Rung 3 — Tekanan terukur',
        duration: 'Gray Zone >2 thn',
        hint:
            'Pasar regional volatil tapi tanpa shock besar. Premi risiko '
            'maritim & asuransi pelayaran naik bertahap.',
        confidenceScore: 74,
        confidenceFormula: 'Bayesian × Rung × Misread × Redline × RFS × M',
        tags: [
          ScenarioTag(
            label: 'Rung 3 — Tekanan terukur',
            tone: SignalTone.warning,
            tooltip:
                'Escalation Rung 3 — Blokade & water cannon tanpa korban jiwa; '
                'tekanan terukur di bawah ambang kinetik penuh.',
          ),
          ScenarioTag(
            label: 'Durasi: Gray Zone >2 thn',
            tone: SignalTone.special,
            tooltip:
                'Vektor Durasi (Lapisan F) — Pola sub-threshold berlanjut '
                'tahunan tanpa resolusi tegas.',
          ),
        ],
        evidences: [
          Evidence(
            icon: Icons.water_drop_outlined,
            tone: SignalTone.warning,
            text:
                'Pola 2023–2024: blokade & water cannon berulang tanpa korban '
                'jiwa. Kedua pihak menahan diri dari eskalasi mematikan.',
            source: 'OSINT AMTI / CSIS Asia Maritime',
            tag: 'Pola historis terukur',
          ),
          Evidence(
            icon: Icons.handshake_outlined,
            tone: SignalTone.positive,
            text:
                'Saluran komunikasi krisis Manila–Beijing masih aktif meski '
                'tegang, mengurangi risiko miskalkulasi fatal.',
            source: 'Pernyataan DFA Filipina 2024',
            tag: 'Faktor penahan diplomatik',
          ),
        ],
        dominoEffects: [
          DominoEffect('Premi asuransi pelayaran naik', SignalTone.warning),
          DominoEffect('Rerouting logistik regional', SignalTone.neutral),
          DominoEffect('ASEAN tetap berhati-hati', SignalTone.special),
        ],
        industryImpacts: [
          IndustryImpact('Logistik & Pelayaran', ImpactDirection.watch),
          IndustryImpact('Energi', ImpactDirection.neutral),
          IndustryImpact('Pertahanan', ImpactDirection.up),
        ],
      ),
      ScenarioModel(
        name: 'Skenario 2 — Insiden kinetik terbatas',
        probability: 31,
        tone: SignalTone.danger,
        rung: 'Rung 4 — Kinetik lokal',
        duration: '2–5 bulan',
        hint:
            'Shock pasar regional tajam jangka pendek. Saham pertahanan & emas '
            'naik; ekuitas ASEAN tertekan.',
        confidenceScore: 66,
        confidenceFormula: 'Bayesian × Rung × Misread × Redline(6) × RFS × M',
        tags: [
          ScenarioTag(
            label: 'Rung 4 — Kinetik lokal',
            tone: SignalTone.danger,
            tooltip:
                'Escalation Rung 4 — Bentrokan fisik terbatas (tabrakan kapal / '
                'tembakan peringatan) tanpa perang terbuka.',
          ),
          ScenarioTag(
            label: 'H: Cascade risk aktif',
            tone: SignalTone.warning,
            tooltip:
                'N×N Cascade Detection (Lapisan H) — Korban jiwa bisa memicu '
                'rantai eskalasi yang menyeret AS.',
          ),
        ],
        evidences: [
          Evidence(
            icon: Icons.directions_boat_outlined,
            tone: SignalTone.danger,
            text:
                'Frekuensi tabrakan & manuver agresif CCG meningkat tajam '
                '2024. Probabilitas korban jiwa per insiden naik.',
            source: 'OSINT MarineTraffic + AMTI',
            tag: 'Sinyal militer meningkat',
          ),
          Evidence(
            icon: Icons.gavel_outlined,
            tone: SignalTone.danger,
            text:
                'Mutual Defense Treaty AS–Filipina membuat insiden kecil '
                'berpotensi menyeret kekuatan besar.',
            source: 'US-PH MDT 1951 + pernyataan Pentagon 2024',
            tag: 'Risiko alliance entanglement',
          ),
        ],
        dominoEffects: [
          DominoEffect('Risk-off pasar ASEAN', SignalTone.danger),
          DominoEffect('Premi energi & freight melonjak', SignalTone.danger),
          DominoEffect('Emas rally', SignalTone.positive),
        ],
        industryImpacts: [
          IndustryImpact('Pelayaran & Logistik', ImpactDirection.down),
          IndustryImpact('Pariwisata', ImpactDirection.down),
          IndustryImpact('Pertahanan', ImpactDirection.up),
          IndustryImpact('Emas & Logam', ImpactDirection.up),
        ],
      ),
      ScenarioModel(
        name: 'Skenario 3 — AS terlibat via MDT',
        probability: 18,
        tone: SignalTone.danger,
        rung: 'Rung 5 — Internasionalisasi',
        duration: '6–18 bulan',
        hint:
            'Risk-off global. Volatilitas tinggi di seluruh aset Asia; safe '
            'haven (USD, emas, treasuries) menguat.',
        confidenceScore: 60,
        confidenceFormula: 'Bayesian × Rung × Misread × Redline × RFS × M',
        tags: [
          ScenarioTag(
            label: 'Rung 5 — Internasionalisasi',
            tone: SignalTone.danger,
            tooltip:
                'Escalation Rung 5 — Keterlibatan kekuatan besar (AS) mengubah '
                'konflik bilateral menjadi krisis internasional.',
          ),
        ],
        dominoEffects: [
          DominoEffect('Risk-off global', SignalTone.danger),
          DominoEffect('USD & treasuries menguat', SignalTone.positive),
          DominoEffect('Disrupsi rantai pasok chip', SignalTone.danger),
        ],
        industryImpacts: [
          IndustryImpact('Ekuitas Asia', ImpactDirection.down),
          IndustryImpact('Semikonduktor', ImpactDirection.down),
          IndustryImpact('Pertahanan', ImpactDirection.up),
          IndustryImpact('Emas & Logam', ImpactDirection.up),
        ],
      ),
      ScenarioModel(
        name: 'Skenario 4 — De-eskalasi negosiasi',
        probability: 13,
        tone: SignalTone.positive,
        rung: 'Rung 1–2 — De-eskalasi',
        duration: '1–3 tahun',
        hint:
            'Stabilitas kembali. Ekuitas ASEAN rebound, premi risiko maritim '
            'turun.',
        confidenceScore: 52,
        confidenceFormula: 'Base rate rendah — butuh konsesi bilateral',
        tags: [
          ScenarioTag(
            label: 'Rung 1–2 — De-eskalasi',
            tone: SignalTone.positive,
            tooltip:
                'Escalation Rung 1–2 — Code of Conduct ASEAN-China disepakati / '
                'mekanisme manajemen krisis baru.',
          ),
        ],
        dominoEffects: [
          DominoEffect('Ekuitas ASEAN rebound', SignalTone.positive),
          DominoEffect('Premi risiko maritim turun', SignalTone.positive),
        ],
        industryImpacts: [
          IndustryImpact('Pelayaran & Logistik', ImpactDirection.up),
          IndustryImpact('Pariwisata', ImpactDirection.up),
          IndustryImpact('Pertahanan', ImpactDirection.neutral),
        ],
      ),
    ],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // CRISIS 3 — TAIWAN STRAIT (nuclear sub-card)
  // ─────────────────────────────────────────────────────────────────────────
  static const CrisisModel _taiwan = CrisisModel(
    id: 'taiwan',
    flag: '🇹🇼',
    title: 'Selat Taiwan',
    location: 'Tekanan militer China meningkat, deepfake terdeteksi',
    riskLevel: RiskLevel.critical,
    riskLabel: 'Kritis',
    statusText:
        'Situasi paling berbahaya secara global. Latihan militer skala besar + '
        'disinformasi terkoordinasi. Uncertainty buffer ±15% aktif (Layer L).',
    statusTone: SignalTone.danger,
    credibilityScore: 64,
    credibilityNote:
        'Deepfake & disinformasi terdeteksi — uncertainty buffer ±15% '
        'diterapkan pada semua probabilitas Taiwan',
    redlineIndex: 7,
    misreadScore: 7,
    csiScore: 6,
    rfsScore: 6,
    summaryText:
        'China meningkatkan tekanan militer (drone swarm, latihan blokade) di '
        'sekitar Taiwan. Layer N (TDI) menaikkan Action Readiness ke T-21 hari. '
        'Video deepfake "pejabat Taiwan" beredar — Layer L menerapkan buffer '
        'ketidakpastian sampai terverifikasi.',
    cascadeNote:
        'Risiko spiral nuklir-konvensional: blokade → intervensi AS → '
        'ambang nuklir (Lapisan I) terdorong. Probabilitas cascade: 12% dalam '
        '36 bulan, namun dampaknya katastrofik.',
    layerChips: [
      CrisisLayerChip(
        code: 'A',
        label: 'Redline 7/10',
        tone: SignalTone.danger,
        tooltip:
            'Redline Index (Lapisan A) — 7/10: deklarasi kemerdekaan Taiwan / '
            'pengakuan formal AS adalah garis merah China yang mendekat.',
      ),
      CrisisLayerChip(
        code: 'B',
        label: 'Misread 7/10',
        tone: SignalTone.danger,
        tooltip:
            'Misread Score (Lapisan B) — 7/10: ambiguitas strategis AS dapat '
            'disalahbaca oleh Beijing sebagai kelemahan komitmen.',
      ),
      CrisisLayerChip(
        code: 'I',
        label: 'Nuclear Watch',
        tone: SignalTone.special,
        tooltip:
            'Nuclear Threshold (Lapisan I) — Memantau ambang penggunaan senjata '
            'nuklir taktis jika konflik konvensional gagal bagi salah satu '
            'pihak.',
      ),
      CrisisLayerChip(
        code: 'K',
        label: 'CSI 6/10',
        tone: SignalTone.danger,
        tooltip:
            'Cognitive Stress Index (Lapisan K) — 6/10: tekanan ekonomi & '
            'legacy politik Xi meningkatkan kebutuhan akan hasil tegas.',
      ),
      CrisisLayerChip(
        code: 'N',
        label: 'TDI ↑ T-21',
        tone: SignalTone.special,
        tooltip:
            'Technology Disruption Index (Lapisan N) — Drone swarm PLAN baru '
            'memangkas Action Readiness dari T-90 ke T-21 hari.',
      ),
      CrisisLayerChip(
        code: 'L',
        label: 'Deepfake ±15%',
        tone: SignalTone.special,
        tooltip:
            'Information Integrity (Lapisan L) — Disinformasi terkoordinasi & '
            'deepfake terdeteksi → uncertainty buffer ±15% pada semua '
            'probabilitas Taiwan.',
      ),
      CrisisLayerChip(
        code: 'M',
        label: '+12%',
        tone: SignalTone.warning,
        tooltip:
            'Shock Multiplier (Lapisan M) — Semua probabilitas konflik naik '
            '12% akibat krisis non-militer paralel.',
      ),
    ],
    perceptions: [
      PerceptionRead(
        actor: '🇨🇳 China membaca AS',
        reading: 'Komitmen AS ambigu, bisa diuji',
        verdict: 'Misread ⚠ — berbahaya',
        tone: SignalTone.danger,
      ),
      PerceptionRead(
        actor: '🇺🇸 Amerika membaca China',
        reading: 'Belum siap invasi penuh',
        verdict: 'Misread sedang',
        tone: SignalTone.warning,
      ),
      PerceptionRead(
        actor: '🇹🇼 Taiwan membaca China',
        reading: 'Tekanan akan terus meningkat',
        verdict: 'Misread rendah ✓',
        tone: SignalTone.positive,
      ),
      PerceptionRead(
        actor: '🇯🇵 Jepang membaca konflik',
        reading: 'Ancaman langsung ke keamanan Jepang',
        verdict: 'Misread rendah ✓',
        tone: SignalTone.positive,
      ),
    ],
    actors: [
      ActorModel(
        initials: 'XI',
        name: 'Xi Jinping · China',
        stressLabel: 'Tinggi',
        stressLevel: 4,
        stressTone: SignalTone.danger,
        scores: [
          ActorScore(
            label: 'RCS 88/100',
            tone: SignalTone.danger,
            tooltip:
                'Rhetorical Consistency Score — 88: "reunifikasi" adalah komitmen '
                'inti; retorika Xi sangat mungkin diikuti tindakan.',
          ),
          ActorScore(
            label: 'CSI 6/10',
            tone: SignalTone.danger,
            tooltip:
                'Cognitive Stress Index — 6/10: tekanan ekonomi + dimensi '
                'legacy politik menaikkan stres pengambilan keputusan.',
          ),
          ActorScore(
            label: 'RFS 6/10',
            tone: SignalTone.warning,
            tooltip:
                'Regime Fragility Score — 6/10: kerapuhan domestik menambah '
                'godaan pengalihan via isu Taiwan.',
          ),
        ],
      ),
      ActorModel(
        initials: 'LC',
        name: 'Lai Ching-te · Taiwan',
        stressLabel: 'Tinggi',
        stressLevel: 4,
        stressTone: SignalTone.danger,
        scores: [
          ActorScore(
            label: 'RCS 75/100',
            tone: SignalTone.info,
            tooltip:
                'Rhetorical Consistency Score — 75: stance pro-kedaulatan '
                'konsisten namun berhati-hati menghindari garis merah eksplisit.',
          ),
          ActorScore(
            label: 'CSI 6/10',
            tone: SignalTone.danger,
            tooltip:
                'Cognitive Stress Index — 6/10: tekanan militer harian + '
                'parlemen terbelah meningkatkan stres.',
          ),
          ActorScore(
            label: 'RFS 5/10',
            tone: SignalTone.warning,
            tooltip:
                'Regime Fragility Score — 5/10: pemerintahan minoritas di '
                'legislatif membatasi ruang gerak.',
          ),
        ],
      ),
    ],
    pivotWatches: [
      PivotWatch(
        text:
            'Pengumuman blokade / karantina maritim PLA → eskalasi langsung & '
            'invokasi keterlibatan AS',
        badge: 'Sangat kritis',
        tone: SignalTone.danger,
        icon: Icons.block,
      ),
      PivotWatch(
        text:
            'Verifikasi deepfake "mobilisasi Taiwan" → jika valid, Tripwire '
            'aktif & buffer dilepas',
        badge: 'Sangat kritis',
        tone: SignalTone.danger,
        icon: Icons.visibility_off_outlined,
      ),
      PivotWatch(
        text:
            'Perubahan postur nuklir / alert level (Lapisan I) → reset seluruh '
            'kalkulasi global',
        badge: 'Sangat kritis',
        tone: SignalTone.danger,
        icon: Icons.dangerous_outlined,
      ),
    ],
    probabilityBars: [
      ProbabilityBar('Tekanan berlanjut tanpa invasi', 41, SignalTone.warning),
      ProbabilityBar('Blokade / karantina', 27, SignalTone.danger),
      ProbabilityBar('Invasi skala penuh', 14, SignalTone.danger),
      ProbabilityBar('De-eskalasi status quo', 18, SignalTone.positive),
    ],
    scenarios: [
      ScenarioModel(
        name: 'Skenario 1 — Tekanan berlanjut tanpa invasi',
        probability: 41,
        tone: SignalTone.warning,
        rung: 'Rung 3 — Tekanan terukur',
        duration: '1–3 tahun',
        hint:
            'Volatilitas tinggi tapi tanpa shock terminal. Premi risiko '
            'semikonduktor & shipping naik bertahap.',
        confidenceScore: 70,
        confidenceFormula:
            'Bayesian × Rung × Misread × Redline × RFS × M × L-buffer(±15%)',
        tags: [
          ScenarioTag(
            label: 'Rung 3 — Tekanan terukur',
            tone: SignalTone.warning,
            tooltip:
                'Escalation Rung 3 — Latihan militer & zona abu-abu berulang '
                'tanpa kontak kinetik penuh.',
          ),
          ScenarioTag(
            label: 'L: buffer ±15%',
            tone: SignalTone.special,
            tooltip:
                'Information Integrity (Lapisan L) — Disinformasi aktif → '
                'estimasi diberi buffer ketidakpastian ±15%.',
          ),
        ],
        evidences: [
          Evidence(
            icon: Icons.flight_outlined,
            tone: SignalTone.warning,
            text:
                'Insursi ADIZ harian PLA mencapai rekor 2024 namun tetap di '
                'bawah ambang serangan langsung — pola tekanan terukur.',
            source: 'Taiwan MND daily reports 2024',
            tag: 'Pola tekanan sub-threshold',
          ),
          Evidence(
            icon: Icons.memory,
            tone: SignalTone.info,
            text:
                '"Silicon Shield": TSMC memasok >60% chip canggih dunia. '
                'Invasi akan menghancurkan ekonomi global termasuk China — '
                'faktor penahan kuat.',
            source: 'TrendForce / SEMI 2024',
            tag: 'Faktor penahan ekonomi (Silicon Shield)',
          ),
        ],
        dominoEffects: [
          DominoEffect('Premi risiko chip naik', SignalTone.warning),
          DominoEffect('Diversifikasi fab ke luar Taiwan', SignalTone.neutral),
          DominoEffect('Belanja pertahanan Asia naik', SignalTone.warning),
        ],
        industryImpacts: [
          IndustryImpact('Semikonduktor', ImpactDirection.watch),
          IndustryImpact('Pelayaran', ImpactDirection.watch),
          IndustryImpact('Pertahanan', ImpactDirection.up),
        ],
      ),
      ScenarioModel(
        name: 'Skenario 2 — Blokade / karantina maritim',
        probability: 27,
        tone: SignalTone.danger,
        rung: 'Rung 5 — Blokade',
        duration: '3–12 bulan',
        hint:
            'Shock global parah. Rantai pasok semikonduktor terputus; resesi '
            'teknologi global; risk-off ekstrem.',
        confidenceScore: 62,
        confidenceFormula:
            'Bayesian × Rung × Misread(7) × Redline(7) × RFS × M × L-buffer',
        tags: [
          ScenarioTag(
            label: 'Rung 5 — Blokade',
            tone: SignalTone.danger,
            tooltip:
                'Escalation Rung 5 — Blokade/karantina maritim memutus akses '
                'ekonomi Taiwan tanpa invasi darat langsung.',
          ),
          ScenarioTag(
            label: 'I: Nuclear watch',
            tone: SignalTone.special,
            tooltip:
                'Nuclear Threshold (Lapisan I) — Intervensi AS pada blokade '
                'menaikkan risiko menuju ambang nuklir.',
          ),
        ],
        evidences: [
          Evidence(
            icon: Icons.block,
            tone: SignalTone.danger,
            text:
                'Latihan "Joint Sword" PLA telah melatih skenario blokade '
                'penuh pulau — kapabilitas sudah terdemonstrasi.',
            source: 'PLA Eastern Theater Command drills 2024',
            tag: 'Kapabilitas blokade terbukti',
          ),
          Evidence(
            icon: Icons.smart_toy_outlined,
            tone: SignalTone.special,
            text:
                'Layer N: drone swarm baru memangkas Action Readiness ke T-21 '
                'hari — China bisa bergerak jauh lebih cepat dari perkiraan.',
            source: 'Layer N TDI update + OSINT',
            tag: 'TDI escalation — T-21 hari',
          ),
        ],
        nuclearIndicators: [
          NuclearIndicator('Postur nuklir China', 'No First Use (dipertanyakan)'),
          NuclearIndicator('Risiko ambang (Lapisan I)', 'Rendah-sedang, naik'),
          NuclearIndicator('Pemicu utama', 'Intervensi langsung AS'),
        ],
        dominoEffects: [
          DominoEffect('Resesi teknologi global', SignalTone.danger),
          DominoEffect('Harga chip melonjak', SignalTone.danger),
          DominoEffect('Risk-off ekstrem', SignalTone.danger),
          DominoEffect('Emas & USD melonjak', SignalTone.positive),
        ],
        industryImpacts: [
          IndustryImpact('Semikonduktor', ImpactDirection.down),
          IndustryImpact('Teknologi', ImpactDirection.down),
          IndustryImpact('Otomotif', ImpactDirection.down),
          IndustryImpact('Emas & Logam', ImpactDirection.up),
          IndustryImpact('Pertahanan', ImpactDirection.up),
        ],
      ),
      ScenarioModel(
        name: 'Skenario 3 — Invasi skala penuh',
        probability: 14,
        tone: SignalTone.danger,
        rung: 'Rung 6 — Perang terbuka',
        duration: 'Tak tentu',
        hint:
            'Skenario terburuk global. Perang besar AS–China; depresi ekonomi '
            'global; ambang nuklir aktif.',
        confidenceScore: 56,
        confidenceFormula: 'Probabilitas rendah tapi dampak katastrofik',
        tags: [
          ScenarioTag(
            label: 'Rung 6 — Perang terbuka',
            tone: SignalTone.danger,
            tooltip:
                'Escalation Rung 6 — Konflik bersenjata penuh; titik tertinggi '
                'tangga eskalasi.',
          ),
          ScenarioTag(
            label: 'I: Nuclear threshold',
            tone: SignalTone.special,
            tooltip:
                'Nuclear Threshold (Lapisan I) — Skenario ini membawa risiko '
                'penggunaan senjata nuklir taktis paling tinggi.',
          ),
        ],
        nuclearIndicators: [
          NuclearIndicator('Risiko nuklir taktis', 'Sedang — bila AS terlibat'),
          NuclearIndicator('Eskalasi tak terkendali', 'Tinggi'),
          NuclearIndicator('Dampak global', 'Katastrofik'),
        ],
        dominoEffects: [
          DominoEffect('Depresi ekonomi global', SignalTone.danger),
          DominoEffect('Blok ekonomi terpecah total', SignalTone.danger),
          DominoEffect('Hanya safe-haven bertahan', SignalTone.positive),
        ],
        industryImpacts: [
          IndustryImpact('Semua ekuitas', ImpactDirection.down),
          IndustryImpact('Teknologi', ImpactDirection.down),
          IndustryImpact('Emas & Logam', ImpactDirection.up),
          IndustryImpact('Pertahanan', ImpactDirection.up),
        ],
      ),
      ScenarioModel(
        name: 'Skenario 4 — De-eskalasi status quo',
        probability: 18,
        tone: SignalTone.positive,
        rung: 'Rung 1–2 — Status quo',
        duration: '3–5 tahun',
        hint:
            'Stabilitas relatif kembali. Ekuitas teknologi rebound, premi '
            'risiko Selat Taiwan turun.',
        confidenceScore: 50,
        confidenceFormula: 'Base rate — bergantung pada manajemen krisis AS–China',
        tags: [
          ScenarioTag(
            label: 'Rung 1–2 — Status quo',
            tone: SignalTone.positive,
            tooltip:
                'Escalation Rung 1–2 — Kembali ke ambiguitas strategis & '
                'manajemen krisis; status quo dipertahankan.',
          ),
        ],
        dominoEffects: [
          DominoEffect('Ekuitas teknologi rebound', SignalTone.positive),
          DominoEffect('Premi risiko turun', SignalTone.positive),
        ],
        industryImpacts: [
          IndustryImpact('Semikonduktor', ImpactDirection.up),
          IndustryImpact('Teknologi', ImpactDirection.up),
          IndustryImpact('Pertahanan', ImpactDirection.neutral),
        ],
      ),
    ],
  );

  // ─────────────────────────────────────────────────────────────────────────
  // FEED — NEWS & SOCIAL
  // ─────────────────────────────────────────────────────────────────────────
  static const List<NewsArticle> news = [
    NewsArticle(
      source: 'REUTERS',
      time: '12 mnt lalu',
      sourceTone: SignalTone.info,
      headline:
          'Kapal penjaga pantai China masuki perairan Natuna untuk ketiga '
          'kalinya bulan ini',
      category: 'Indo-Pasifik · Militer',
      credibilityLabel: 'Credibility 91% ✓',
      credibilityTone: SignalTone.positive,
      tripwire: 'Memicu Tripwire TW-01',
    ),
    NewsArticle(
      source: 'BLOOMBERG',
      time: '1 jam lalu',
      sourceTone: SignalTone.warning,
      headline:
          'Harga nikel LME mendekati \$12.000 — tekanan fiskal Indonesia '
          'meningkat',
      category: 'Ekonomi · Komoditas',
      credibilityLabel: 'Credibility 88% ✓',
      credibilityTone: SignalTone.positive,
    ),
    NewsArticle(
      source: 'AP NEWS',
      time: '3 jam lalu',
      sourceTone: SignalTone.info,
      headline:
          'PLA gelar latihan blokade skala besar di sekitar Selat Taiwan',
      category: 'Asia Timur · Militer',
      credibilityLabel: 'Credibility 84% ✓',
      credibilityTone: SignalTone.positive,
      tripwire: 'Memicu Tripwire TW-07',
    ),
  ];

  static const List<SocialPost> social = [
    SocialPost(
      source: 'OSINT MONITOR',
      time: '2 jam lalu',
      tone: SignalTone.special,
      headline:
          'Video viral "pejabat Taiwan umumkan mobilisasi" teridentifikasi '
          'sebagai AI-generated deepfake',
      note:
          'Lapisan L aktif: uncertainty buffer ±15% diterapkan pada semua '
          'probabilitas skenario Taiwan sampai terverifikasi. Tripwire tidak '
          'diaktifkan karena sumber tidak valid.',
      badge: '⚠ Deepfake terdeteksi',
    ),
    SocialPost(
      source: 'X TRENDING',
      time: '4 jam lalu',
      tone: SignalTone.info,
      headline:
          '#Natuna trending — narasi terkoordinasi terdeteksi dari klaster '
          'akun baru',
      note:
          'Narrative Origin Trace (Lapisan L): 38% engagement berasal dari akun '
          '<30 hari. Credibility diturunkan; sinyal tidak dijadikan basis '
          'tripwire.',
      badge: 'Narrative trace aktif',
    ),
  ];
}
