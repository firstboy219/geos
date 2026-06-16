/**
 * Dummy analysis + feed data for the Home screen, ported from the Flutter
 * archive (`features/home/data/dummy_data.dart`). Numbers match the mockup
 * (`Knowledge Base/Mockup_mobile/Home_screen.html`): Natuna 43/29/15/9/4%,
 * redline 3, misread 6, CSI 4, RFS 5, credibility 87%, etc.
 *
 * Phase 6 wiring renders live `CrisisDto`/`AlertDto` where fields map and
 * falls back to this content otherwise.
 */
import type { SignalTone } from '@/components';
import { tones } from '@/components';
import type { RiskLevel } from '@/components';

// ── Tone helper ─────────────────────────────────────────────
/** The tone keys used across the analysis UI (mirrors Flutter `SignalTone`). */
export type ToneKey =
  | 'positive'
  | 'neutral'
  | 'warning'
  | 'danger'
  | 'info'
  | 'special';

/** Resolve a ToneKey onto a concrete {fg,bg,border} SignalTone. */
export function toneFor(key: ToneKey): SignalTone {
  switch (key) {
    case 'positive':
      return tones.positive;
    case 'warning':
      return tones.warning;
    case 'danger':
      return tones.negative;
    case 'info':
      return tones.accent;
    case 'special':
      return tones.critical;
    case 'neutral':
    default:
      return tones.neutral;
  }
}

// ── Models ──────────────────────────────────────────────────
export interface CrisisLayerChipData {
  code: string;
  label: string;
  tooltip: string;
  tone: ToneKey;
}

export interface PerceptionRead {
  actor: string;
  reading: string;
  verdict: string;
  tone: ToneKey;
}

export interface ActorScore {
  label: string;
  tooltip: string;
  tone: ToneKey;
}

export interface ActorModel {
  initials: string;
  name: string;
  stressLabel: string;
  /** Filled dots out of 5. */
  stressLevel: number;
  stressTone: ToneKey;
  scores: ActorScore[];
}

export interface PivotWatch {
  text: string;
  badge: string;
  tone: ToneKey;
  /** Ionicons glyph name. */
  icon: string;
}

export interface ProbabilityBar {
  label: string;
  percent: number;
  tone: ToneKey;
}

export interface ScenarioTag {
  label: string;
  tooltip: string;
  tone: ToneKey;
}

export interface Evidence {
  icon: string;
  tone: ToneKey;
  text: string;
  source: string;
  tag: string;
}

export type ImpactDirection = 'up' | 'down' | 'neutral' | 'watch';

export interface IndustryImpact {
  label: string;
  direction: ImpactDirection;
}

export interface DominoEffect {
  label: string;
  tone: ToneKey;
}

export interface FinancialWeapon {
  flag: string;
  text: string;
  asymmetry: string;
  tone: ToneKey;
}

export interface NuclearIndicator {
  label: string;
  value: string;
  tone: ToneKey;
}

export interface ScenarioModel {
  name: string;
  probability: number;
  tone: ToneKey;
  rung?: string;
  duration?: string;
  hint: string;
  confidenceScore: number;
  confidenceFormula: string;
  tags: ScenarioTag[];
  evidences: Evidence[];
  dominoEffects: DominoEffect[];
  industryImpacts: IndustryImpact[];
  financialWeapons: FinancialWeapon[];
  nuclearIndicators: NuclearIndicator[];
}

export interface CrisisModel {
  id: string;
  flag: string;
  title: string;
  location: string;
  riskLevel: RiskLevel;
  riskLabel: string;
  statusText: string;
  statusTone: ToneKey;
  credibilityScore: number;
  credibilityNote: string;
  grayZone: boolean;
  redlineIndex: number;
  misreadScore: number;
  csiScore: number;
  rfsScore: number;
  summaryText: string;
  cascadeNote: string;
  /** A1 — region bucket for filtering: 'Internasional'|'Regional'|'Nasional'. */
  region?: string;
  layerChips: CrisisLayerChipData[];
  perceptions: PerceptionRead[];
  actors: ActorModel[];
  pivotWatches: PivotWatch[];
  probabilityBars: ProbabilityBar[];
  scenarios: ScenarioModel[];
}

export interface NewsArticle {
  source: string;
  time: string;
  sourceTone: ToneKey;
  headline: string;
  category: string;
  credibilityLabel: string;
  credibilityTone: ToneKey;
  tripwire?: string;
}

export interface SocialPost {
  source: string;
  time: string;
  tone: ToneKey;
  headline: string;
  note: string;
  badge: string;
}

// ── Banners / hero / framework strip ────────────────────────
export const SHOCK_BANNER = {
  emoji: '⚡',
  title: 'Pengali Syok Sistemik (Shock Multiplier)',
  subtitle: 'semua probabilitas konflik naik',
  body:
    '2 krisis non-militer aktif bersamaan: harga komoditas jatuh + cuaca ' +
    'ekstrem El Niño. Keduanya meningkatkan tekanan domestik di setiap ' +
    'negara yang terlibat.',
  chips: [
    { label: 'Komoditas turun aktif', tone: 'warning' as ToneKey },
    { label: 'El Niño aktif', tone: 'warning' as ToneKey },
    { label: 'Semua risiko +12%', tone: 'danger' as ToneKey },
  ],
};

export const TDI_BANNER = {
  emoji: '🤖',
  title: 'Technology Disruption Index (TDI) naik',
  subtitle: 'kapabilitas militer China meningkat',
  bodyPrefix:
    'Drone swarm terbaru PLAN diuji pekan lalu → Action Readiness ' +
    '(kesiapan bertindak) diperbarui dari T-90 hari menjadi ',
  bodyHighlight: 'T-21 hari',
  bodySuffix: ' — China bisa bergerak jauh lebih cepat dari perkiraan.',
  chips: [
    { label: 'TDI ↑ Naik', tone: 'special' as ToneKey },
    { label: 'Action Readiness: T-21 hari', tone: 'danger' as ToneKey },
  ],
};

export const WORLD_STATUS = {
  label: 'STATUS KEAMANAN DUNIA SAAT INI',
  statusText: 'Waspada — Perlu Perhatian',
  description:
    'Ada 3 situasi aktif yang bisa berdampak ke investasi Anda. Shock ' +
    'Multiplier aktif meningkatkan semua risiko +12%.',
  cells: [
    { value: '7', label: 'Situasi aktif dipantau', color: 'warning' as ToneKey },
    { value: '3', label: 'Butuh perhatian segera', color: 'danger' as ToneKey },
    { value: '16', label: 'Lapisan AI aktif', color: 'special' as ToneKey },
    { value: '−8%', label: 'Estimasi dampak portofolio', color: 'warning' as ToneKey },
  ],
};

/** 16-layer framework strip chips. `{P}` is replaced with the active period. */
export const FRAMEWORK_CHIPS: { label: string; tone: ToneKey }[] = [
  { label: '1 · Data Ingestion (9 domain)', tone: 'info' },
  { label: '2 · Grouping & Situasi', tone: 'positive' },
  { label: 'A · Redline Index', tone: 'danger' },
  { label: 'B · Perception Gap', tone: 'warning' },
  { label: 'C · Military Logistics', tone: 'danger' },
  { label: '3 · Escalation Ladder', tone: 'warning' },
  { label: 'D · Pivot Watch', tone: 'info' },
  { label: '4 · Probabilitas Bayesian', tone: 'positive' },
  { label: 'E · 2nd & 3rd Order', tone: 'info' },
  { label: 'F · Gray Zone', tone: 'special' },
  { label: 'G · NSA Engine', tone: 'warning' },
  { label: 'H · N×N Perception', tone: 'danger' },
  { label: 'I · Nuclear Threshold', tone: 'special' },
  { label: 'J · Financial Warfare', tone: 'warning' },
  { label: 'K · Cognitive Stress', tone: 'warning' },
  { label: 'L · Info Integrity', tone: 'special' },
  { label: 'M · Shock Multiplier ×1.12', tone: 'warning' },
  { label: 'N · Tech Disruption ↑', tone: 'special' },
  { label: 'O · Regime Fragility', tone: 'danger' },
  { label: 'P · Temporal: {P}', tone: 'info' },
];

export const PORTFOLIO_NUDGE_ROWS: { label: string; impact: string; tone: ToneKey }[] = [
  { label: 'IHSG / Saham Indonesia', impact: 'Risiko turun −12%', tone: 'danger' },
  { label: 'Emas', impact: 'Peluang naik — hedge terbaik ↑', tone: 'positive' },
  { label: 'IDR / Deposito', impact: 'Pantau kurs — potensi tekanan', tone: 'warning' },
];

export interface AlertItem {
  icon: string;
  title: string;
  meta: string;
  badge: string;
  tone: ToneKey;
}

export const DUMMY_ALERTS: AlertItem[] = [
  {
    icon: 'boat-outline',
    title: 'Kapal China masuk perairan Natuna',
    meta: 'Militer · Lapisan C: Action Readiness diperbarui · 12 mnt lalu',
    badge: 'Pantau',
    tone: 'danger',
  },
  {
    icon: 'trending-down-outline',
    title: 'Nikel mendekati $12k — Shock Multiplier aktif',
    meta: 'Ekonomi · Lapisan M: semua risiko +12% · 38 mnt lalu',
    badge: 'Siaga',
    tone: 'warning',
  },
  {
    icon: 'eye-off-outline',
    title: 'Deepfake video pejabat Taiwan terdeteksi AI',
    meta: 'Lapisan L: Info Integrity · Uncertainty buffer ±15% aktif · 2 jam lalu',
    badge: 'L ⚠',
    tone: 'special',
  },
];

// ── CRISIS 1 — NATUNA ───────────────────────────────────────
const NATUNA: CrisisModel = {
  id: 'natuna',
  flag: '🇮🇩',
  title: 'Natuna — Indonesia',
  location: 'Kapal China masuk perairan ZEE Indonesia berulang kali',
  riskLevel: 'medium',
  riskLabel: 'Sedang',
  statusText:
    'Kemungkinan besar tidak akan ada konflik fisik. Indonesia sedang ' +
    'mempertahankan posisi diplomatik dengan tenang.',
  statusTone: 'positive',
  credibilityScore: 87,
  credibilityNote:
    'Semua sinyal masuk sudah diverifikasi, tidak ada disinformasi atau ' +
    'deepfake terdeteksi',
  grayZone: true,
  redlineIndex: 3,
  misreadScore: 6,
  csiScore: 4,
  rfsScore: 5,
  summaryText:
    'Kapal penjaga pantai China (CCG) terus masuk Zona Ekonomi Eksklusif ' +
    'Indonesia di Kepulauan Natuna. China mengklaim lewat "9-dash line" ' +
    'yang ditolak Indonesia. TNI AL sudah dikerahkan. Kedua pihak tidak ' +
    'inginkan eskalasi besar karena saling bergantung secara ekonomi.',
  cascadeNote:
    'Risiko spiral (Lapisan H — Cascade Detection): China salah baca diam ' +
    'Indonesia sebagai persetujuan → China terus maju → Indonesia terpaksa ' +
    'merespons keras → spiral eskalasi. Probabilitas cascade: 18% dalam 24 ' +
    'bulan.',
  layerChips: [
    {
      code: 'A',
      label: 'Redline 3/10',
      tone: 'info',
      tooltip:
        'Redline Index (Lapisan A) — Seberapa jauh Indonesia bisa mundur ' +
        'sebelum terpaksa bertindak ekstrem. 3/10 = masih banyak ruang ' +
        'negosiasi. Makin mendekati 10 = makin berbahaya.',
    },
    {
      code: 'B',
      label: 'Misread 6/10',
      tone: 'warning',
      tooltip:
        'Misread Score (Lapisan B) — Seberapa besar kemungkinan satu pihak ' +
        'salah membaca niat pihak lain. 6/10 = risiko tinggi. China ' +
        'kemungkinan mengira diam Indonesia = persetujuan diam-diam.',
    },
    {
      code: 'C',
      label: 'T-365 hari',
      tone: 'positive',
      tooltip:
        'Action Readiness (Lapisan C) — Perkiraan waktu sebelum pihak ' +
        'tertentu siap bertindak secara militer. T-365 hari = Indonesia ' +
        'tidak menunjukkan persiapan militer apapun.',
    },
    {
      code: 'K',
      label: 'CSI 4/10',
      tone: 'danger',
      tooltip:
        'Cognitive Stress Index (Lapisan K) — Tingkat tekanan psikologis ' +
        'pemimpin. CSI tinggi = keputusan lebih impulsif. 4/10 = tekanan ' +
        'sedang, masih terkendali.',
    },
    {
      code: 'O',
      label: 'RFS 5/10',
      tone: 'danger',
      tooltip:
        'Regime Fragility Score (Lapisan O) — Seberapa rapuh rezim dilihat ' +
        'dari legitimasi politik, kohesi sosial, loyalitas militer, dan ' +
        'tekanan ekonomi. 5/10 = sedang. Ada tekanan dalam negeri.',
    },
    {
      code: 'F',
      label: 'Gray Zone',
      tone: 'special',
      tooltip:
        'Gray Zone Persistence (Lapisan F) — Situasi di bawah ambang batas ' +
        'perang terbuka tapi tidak pernah selesai damai. Aktif = situasi ' +
        'Natuna kemungkinan terus seperti ini tanpa resolusi.',
    },
    {
      code: 'M',
      label: '+12%',
      tone: 'warning',
      tooltip:
        'Shock Multiplier (Lapisan M) — Faktor pengali ketika krisis ' +
        'non-militer berjalan paralel. Aktif: harga komoditas jatuh + El ' +
        'Niño → semua probabilitas konflik naik 12%.',
    },
  ],
  perceptions: [
    {
      actor: '🇨🇳 China membaca Indonesia',
      reading: 'Diam = setuju secara diam-diam',
      verdict: 'Misread ⚠ — sangat berbahaya',
      tone: 'danger',
    },
    {
      actor: '🇮🇩 Indonesia membaca China',
      reading: 'Provokasi terukur, bukan niat perang',
      verdict: 'Misread rendah ✓',
      tone: 'positive',
    },
    {
      actor: '🇺🇸 Amerika membaca Indonesia',
      reading: 'Bisa dijadikan anchor Indo-Pasifik',
      verdict: 'Misread sedang',
      tone: 'warning',
    },
    {
      actor: '🌏 ASEAN membaca Indonesia',
      reading: 'Akan tetap memimpin kawasan',
      verdict: 'Misread rendah ✓',
      tone: 'positive',
    },
  ],
  actors: [
    {
      initials: 'XI',
      name: 'Xi Jinping · China',
      stressLabel: 'Sedang',
      stressLevel: 3,
      stressTone: 'warning',
      scores: [
        {
          label: 'RCS 85/100',
          tone: 'danger',
          tooltip:
            'Rhetorical Consistency Score — Seberapa sering ucapan diikuti ' +
            'tindakan. 85 = hampir selalu. Jika Xi bicara keras, dia serius.',
        },
        {
          label: 'CSI 4/10',
          tone: 'warning',
          tooltip:
            'Cognitive Stress Index — Tekanan psikologis dari OSINT: ' +
            'frekuensi pidato, perubahan inner circle, rotasi jenderal. ' +
            '4/10 = tekanan sedang.',
        },
        {
          label: 'RFS 6/10',
          tone: 'warning',
          tooltip:
            'Regime Fragility Score — Kerapuhan posisi Xi di dalam negeri. ' +
            '6/10 = mulai tertekan — krisis properti + pengangguran muda.',
        },
        {
          label: 'Ideological',
          tone: 'info',
          tooltip:
            'Decision Style — Ideological = keputusan berbasis prinsip ' +
            'ideologis, bukan kalkulasi cost-benefit. Sulit diubah dengan ' +
            'tekanan ekonomi saja.',
        },
      ],
    },
    {
      initials: 'PW',
      name: 'Prabowo Subianto · Indonesia',
      stressLabel: 'Sedang — mulai naik',
      stressLevel: 3,
      stressTone: 'warning',
      scores: [
        {
          label: 'RCS 72/100',
          tone: 'info',
          tooltip:
            'Rhetorical Consistency Score — 72 = cukup konsisten. "Teman ' +
            'semua, musuh tidak ada" diikuti kebijakan selaras. Bisa ' +
            'diprediksi namun ada ruang untuk kejutan.',
        },
        {
          label: 'CSI 4/10',
          tone: 'warning',
          tooltip:
            'Cognitive Stress Index — 4/10 = tekanan sedang. Polarisasi ' +
            'domestik naik, tapi kepemimpinan masih stabil.',
        },
        {
          label: 'RFS 5/10',
          tone: 'warning',
          tooltip:
            'Regime Fragility Score — 5/10 = moderate. Youth unemployment ' +
            'naik, polarisasi pasca-2024. RFS tinggi cenderung gunakan isu ' +
            'luar negeri untuk alihkan perhatian (Rally Effect).',
        },
        {
          label: 'Pragmatic',
          tone: 'positive',
          tooltip:
            'Decision Style: Pragmatic — Keputusan berbasis untung-rugi. ' +
            'Lebih mudah dipengaruhi insentif ekonomi. Cenderung mencari ' +
            'jalan tengah daripada konfrontasi.',
        },
      ],
    },
  ],
  pivotWatches: [
    {
      text:
        'CCG masuk <12nm dari Natuna (perairan teritorial) → trigger ' +
        'insiden langsung',
      badge: 'Sangat kritis',
      tone: 'danger',
      icon: 'boat-outline',
    },
    {
      text:
        'Harga nikel turun di bawah $10k → tekanan fiskal RI naik → RFS ' +
        'naik +2 poin',
      badge: 'Perlu diawasi',
      tone: 'warning',
      icon: 'trending-down-outline',
    },
    {
      text:
        'Taiwan Strait memburuk → Indonesia dipaksa pilih antara Amerika ' +
        'atau China',
      badge: 'Perlu diawasi',
      tone: 'warning',
      icon: 'earth-outline',
    },
  ],
  probabilityBars: [
    { label: 'Tidak ada eskalasi', percent: 43, tone: 'positive' },
    { label: 'Indonesia terpaksa pilih satu blok', percent: 29, tone: 'warning' },
    { label: 'Insiden terbatas di laut', percent: 15, tone: 'danger' },
    { label: 'Indonesia jadi mediator', percent: 9, tone: 'positive' },
    { label: 'Tekanan ekonomi dari luar', percent: 4, tone: 'danger' },
  ],
  scenarios: [
    {
      name: 'Skenario 1 — Tidak ada eskalasi',
      probability: 43,
      tone: 'positive',
      rung: 'Rung 2 — Posturing',
      duration: 'Gray Zone >3 thn',
      hint:
        'Portofolio aman. Sektor pertambangan dan EV cenderung naik. Situasi ' +
        'membeku — tegang tapi tidak meledak selama bertahun-tahun.',
      confidenceScore: 82,
      confidenceFormula:
        'Formula: P = Bayesian × Rung weight × Misread × Redline × RFS × ' +
        'Shock Multiplier',
      tags: [
        {
          label: 'Rung 2 — Posturing',
          tone: 'info',
          tooltip:
            'Escalation Rung 2 (Lapisan 3) — Tangga 1–6: Rung 2 = posturing ' +
            'dan sinyal diplomatik. Belum ada tindakan nyata.',
        },
        {
          label: 'Durasi: Gray Zone >3 thn',
          tone: 'positive',
          tooltip:
            'Vektor Durasi (Lapisan F) — Gray Zone Persistence: situasi tidak ' +
            'selesai cepat. Pola historis menunjukkan tahunan tanpa resolusi.',
        },
        {
          label: 'F: Indefinite Limbo',
          tone: 'special',
          tooltip:
            'Gray Zone — Indefinite Limbo: konflik yang tidak eskalasi jadi ' +
            'perang tapi juga tidak pernah selesai. Akan terus "bermain" di ' +
            'zona ini.',
        },
      ],
      evidences: [
        {
          icon: 'cash-outline',
          tone: 'info',
          text:
            'Perdagangan bilateral Indonesia–China mencapai $127 miliar/tahun ' +
            '(2023). China adalah mitra dagang terbesar RI — tidak ada ' +
            'insentif ekonomi untuk eskalasi.',
          source: 'Sumber: BPS / Kemendag RI 2023',
          tag: 'Faktor penahan ekonomi (Anachronism Filter)',
        },
        {
          icon: 'time-outline',
          tone: 'positive',
          text:
            'Insiden Natuna 2019–2020 diselesaikan lewat jalur diplomatik ' +
            'tanpa satu tembakan. Historical Pattern Match: kedua pihak selalu ' +
            'mundur sebelum titik kritis. Similarity score: 81%.',
          source: 'Sumber: Historical Pattern Matching (Lapisan 1)',
          tag: 'Preseden historis — similarity 81%',
        },
        {
          icon: 'business-outline',
          tone: 'info',
          text:
            'Investasi China lewat OBOR aktif $6.8 miliar di Indonesia. ' +
            'Konflik akan membekukan seluruh pipeline ini — biaya bagi China ' +
            'sangat tinggi.',
          source: 'Sumber: BKPM / AEI Data 2024',
          tag: 'Leverage ekonomi & Financial Warfare cost (Lapisan J)',
        },
        {
          icon: 'infinite-outline',
          tone: 'special',
          text:
            'Lapisan F (Gray Zone Persistence) aktif: berdasarkan pola ' +
            'sub-threshold, situasi kemungkinan terus "membeku" selama 3+ ' +
            'tahun ke depan.',
          source: 'Sumber: Gray Zone Persistence Engine (Lapisan F)',
          tag: 'Gray Zone analysis — F',
        },
      ],
      dominoEffects: [
        { label: 'FDI naik dari kedua blok', tone: 'positive' },
        { label: 'Vietnam juga diuntungkan', tone: 'positive' },
        { label: 'IDR relatif stabil', tone: 'neutral' },
        { label: 'ASEAN tetap terpecah', tone: 'special' },
      ],
      industryImpacts: [
        { label: 'Pertambangan', direction: 'up' },
        { label: 'Perbankan', direction: 'up' },
        { label: 'EV & Baterai', direction: 'up' },
        { label: 'Properti', direction: 'neutral' },
        { label: 'Konsumer', direction: 'neutral' },
      ],
      financialWeapons: [],
      nuclearIndicators: [],
    },
    {
      name: 'Skenario 2 — Indonesia terpaksa pilih satu blok',
      probability: 29,
      tone: 'warning',
      rung: 'Rung 3 — Ekonomi',
      duration: '1–2 tahun',
      hint:
        'IHSG turun 12–20%. IDR tertekan ke 16.500+. Emas dan saham ' +
        'pertahanan diuntungkan.',
      confidenceScore: 71,
      confidenceFormula: 'Bayesian × Rung × Misread × Redline × RFS × M',
      tags: [
        {
          label: 'Rung 3 — Ekonomi',
          tone: 'warning',
          tooltip:
            'Escalation Rung 3 — Sanksi, embargo, dan tekanan ekonomi sebagai ' +
            'senjata. Belum kinetik, tapi dampak ke pasar langsung terasa.',
        },
        {
          label: 'Durasi: 1–2 tahun',
          tone: 'warning',
          tooltip:
            'Vektor Durasi — Situasi seperti ini biasanya 1–2 tahun sebelum ' +
            'resolusi atau eskalasi lebih lanjut.',
        },
        {
          label: 'O: RFS trigger',
          tone: 'danger',
          tooltip:
            'Regime Fragility Score trigger (Lapisan O) — RFS 5/10 + tekanan ' +
            'ekonomi = pemimpin rapuh cenderung gunakan isu luar negeri untuk ' +
            'konsolidasi (Rally Effect).',
        },
      ],
      financialWeapons: [
        {
          flag: '🇨🇳',
          tone: 'danger',
          text:
            'China: stop nikel offtake + freeze OBOR disbursement $6.8M + ' +
            'kurangi turis',
          asymmetry:
            'Asymmetry Score: Berat — RI sangat bergantung pada offtake nikel ' +
            'China',
        },
        {
          flag: '🇺🇸',
          tone: 'warning',
          text:
            'AS: cabut GSP (tarif preferensial) + IMF conditionality pressure ' +
            '+ SWIFT pressure',
          asymmetry:
            'Asymmetry Score: Sedang — RI punya leverage dari komoditas kritis ' +
            '(nikel, dll)',
        },
      ],
      evidences: [
        {
          icon: 'warning-outline',
          tone: 'warning',
          text:
            'Krisis Taiwan Strait semakin intens 2024–2025. Jika meledak, ' +
            'Indonesia ditekan dari dua arah — AS dan China — untuk menyatakan ' +
            'posisi eksplisit.',
          source: 'CSIS Taiwan Risk Assessment 2024',
          tag: 'Pemicu eksternal (Counterfactual — Lapisan D)',
        },
        {
          icon: 'people-outline',
          tone: 'danger',
          text:
            'RFS 5/10 + CSI 4/10: Polarisasi domestik & youth unemployment ' +
            'naik. Pemimpin dengan tekanan tinggi cenderung pakai isu luar ' +
            'negeri untuk konsolidasi — "Rally-the-Flag Effect".',
          source: 'Lapisan O (RFS) + K (CSI) + Historical pattern',
          tag: 'Fragilitas rezim + rally effect',
        },
        {
          icon: 'trending-down-outline',
          tone: 'warning',
          text:
            'Nikel turun 45% sejak 2022 + Shock Multiplier (Layer M) aktif ' +
            '+12%. Kombinasi ini menaikkan probabilitas dari 25% menjadi 29%.',
          source: 'LME Nickel Data 2024 + Layer M calculation',
          tag: 'Tekanan ekonomi × Shock Multiplier',
        },
      ],
      dominoEffects: [
        { label: 'ASEAN split makin dalam', tone: 'danger' },
        { label: 'Capital outflow 30–90 hari', tone: 'danger' },
        { label: 'Investor pindah ke Vietnam', tone: 'warning' },
        { label: 'Refugee pressure regional', tone: 'danger' },
      ],
      industryImpacts: [
        { label: 'Teknologi', direction: 'down' },
        { label: 'Telekomunikasi', direction: 'down' },
        { label: 'Pariwisata', direction: 'down' },
        { label: 'Pertahanan', direction: 'up' },
        { label: 'Emas & Logam', direction: 'up' },
        { label: 'Perbankan', direction: 'watch' },
      ],
      nuclearIndicators: [],
    },
    {
      name: 'Skenario 3 — Insiden terbatas di laut',
      probability: 15,
      tone: 'danger',
      rung: 'Rung 4 — Kinetik lokal',
      duration: '3–6 bulan',
      hint:
        'IDR melemah 8–12%. Turis China minus 80%. IHSG crash 18–25%. Emas ' +
        'naik drastis sebagai aset aman.',
      confidenceScore: 63,
      confidenceFormula:
        'Bayesian × Rung × Misread(6/10) × Redline(3/10) × RFS(5/10) × ' +
        'M(×1.12)',
      tags: [
        {
          label: 'Rung 4 — Kinetik lokal',
          tone: 'danger',
          tooltip:
            'Escalation Rung 4 — Konflik fisik terbatas (tembak-menembak / ' +
            'tabrakan kapal) tapi belum deklarasi perang. Sangat disruptif ' +
            'untuk pasar.',
        },
        {
          label: 'Durasi: 3–6 bulan',
          tone: 'info',
          tooltip:
            'Vektor Durasi — Insiden terbatas biasanya selesai 3–6 bulan, ' +
            'tapi dampak ekonominya langsung terasa sejak hari pertama.',
        },
        {
          label: 'H: Cascade risk aktif',
          tone: 'warning',
          tooltip:
            'N×N Cascade Detection (Lapisan H) — Risiko salah baca China ' +
            'terhadap Indonesia menciptakan spiral eskalasi tak disengaja.',
        },
      ],
      evidences: [
        {
          icon: 'boat-outline',
          tone: 'danger',
          text:
            'CCG masuk ZEE Natuna 3× bulan ini — lebih tinggi dari rata-rata. ' +
            'Layer N (TDI naik): drone swarm baru → Action Readiness China ' +
            'T-21 hari. Frekuensi + kapabilitas = risiko insiden naik.',
          source: 'OSINT MarineTraffic + Layer N TDI update',
          tag: 'Sinyal militer + TDI escalation',
        },
        {
          icon: 'eye-outline',
          tone: 'warning',
          text:
            'Misread Score 6/10 (Lapisan B): China membaca "diam Indonesia" ' +
            'sebagai persetujuan. N×N Cascade: probabilitas spiral 18% dalam ' +
            '24 bulan jika tidak ada koreksi eksplisit dari Jakarta.',
          source: 'Perception Gap Engine + N×N Matrix (Lapisan B & H)',
          tag: 'Cascade risk 18%',
        },
        {
          icon: 'time-outline',
          tone: 'danger',
          text:
            'Historical Pattern Match: Scarborough Shoal 2012 (Filipina vs ' +
            'China) berpola identik — CCG masuk perlahan, China akhirnya ' +
            'kuasai tanpa tembakan. Similarity score: 74%.',
          source: 'Historical Matching (1) + Anachronism Filter (2)',
          tag: 'Pattern match 74% — preseden Scarborough Shoal',
        },
      ],
      dominoEffects: [
        { label: 'Turis China −80%', tone: 'danger' },
        { label: 'OBOR Indonesia freeze', tone: 'danger' },
        { label: 'IDR −8–12% dalam 30 hari', tone: 'danger' },
        { label: 'Emas rally tajam', tone: 'positive' },
        { label: 'Supply chain nikel terganggu global', tone: 'warning' },
      ],
      industryImpacts: [
        { label: 'Pariwisata', direction: 'down' },
        { label: 'Penerbangan', direction: 'down' },
        { label: 'Impor & Ritel', direction: 'down' },
        { label: 'Perbankan', direction: 'down' },
        { label: 'Emas & Logam', direction: 'up' },
        { label: 'Pertahanan', direction: 'up' },
      ],
      financialWeapons: [],
      nuclearIndicators: [],
    },
    {
      name: 'Skenario 4 — Indonesia jadi mediator',
      probability: 9,
      tone: 'positive',
      rung: 'Rung 1–2 — De-eskalasi',
      duration: '2–4 tahun',
      hint:
        'Skenario terbaik. IHSG naik 15–22%, IDR menguat ke 14.800–15.000, ' +
        'FDI dari Eropa dan Jepang masuk.',
      confidenceScore: 55,
      confidenceFormula: 'Base rate rendah — butuh 3 kondisi simultan',
      tags: [
        {
          label: 'Rung 1–2 — De-eskalasi',
          tone: 'positive',
          tooltip:
            'Escalation Rung 1–2 — Penurunan tensi lewat diplomasi aktif. ' +
            'Indonesia mengambil peran penengah.',
        },
        {
          label: 'Durasi: 2–4 tahun',
          tone: 'info',
          tooltip:
            'Vektor Durasi — Proses mediasi membutuhkan waktu panjang namun ' +
            'memberi stabilitas jangka menengah.',
        },
        {
          label: 'Peluang terbaik portofolio',
          tone: 'positive',
          tooltip:
            'Skenario dengan dampak portofolio paling positif — semua sektor ' +
            'cenderung naik.',
        },
      ],
      evidences: [],
      dominoEffects: [
        { label: 'FDI Eropa & Jepang masuk', tone: 'positive' },
        { label: 'ASEAN centrality diperkuat', tone: 'positive' },
        { label: 'Prestige diplomatik RI naik', tone: 'positive' },
      ],
      industryImpacts: [
        { label: 'Semua Sektor', direction: 'up' },
        { label: 'Keuangan & Bank', direction: 'up' },
        { label: 'Pertambangan', direction: 'up' },
        { label: 'Properti', direction: 'up' },
        { label: 'Pertahanan', direction: 'neutral' },
      ],
      financialWeapons: [],
      nuclearIndicators: [],
    },
    {
      name: 'Skenario 5 — Tekanan ekonomi dari luar (Coercion)',
      probability: 4,
      tone: 'danger',
      rung: 'Rung 3 — Financial warfare',
      duration: '1–3 tahun',
      hint:
        'IHSG crash 25–35%. IDR tembus 18.000+. Deposito pun merugi karena ' +
        'inflasi. Hanya emas yang bertahan.',
      confidenceScore: 58,
      confidenceFormula: 'Probabilitas rendah tapi dampak ekstrem',
      tags: [
        {
          label: 'Rung 3 — Financial warfare',
          tone: 'danger',
          tooltip:
            'Financial Warfare (Lapisan J) — Senjata ekonomi ditembakkan ' +
            'terkoordinasi: embargo nikel, pembekuan aset, tekanan rating.',
        },
        {
          label: 'Durasi: 1–3 tahun',
          tone: 'warning',
          tooltip:
            'Vektor Durasi — Tekanan ekonomi sistemik bisa berlangsung ' +
            '1–3 tahun dengan dampak berkepanjangan.',
        },
        {
          label: 'Skenario paling merusak ekonomi',
          tone: 'danger',
          tooltip:
            'Probabilitas paling rendah namun dengan dampak paling merusak ' +
            'terhadap stabilitas ekonomi nasional.',
        },
      ],
      evidences: [],
      dominoEffects: [
        { label: 'Sovereign rating turun 1–2 notch', tone: 'danger' },
        { label: 'Cost of borrowing APBN naik', tone: 'danger' },
        { label: 'Cadangan devisa tertekan', tone: 'danger' },
        { label: 'Emas ↑↑↑ max hedge', tone: 'positive' },
      ],
      industryImpacts: [
        { label: 'Semua saham', direction: 'down' },
        { label: 'Pertambangan', direction: 'down' },
        { label: 'Perbankan', direction: 'down' },
        { label: 'Emas & Logam', direction: 'up' },
        { label: 'Deposito IDR', direction: 'watch' },
      ],
      financialWeapons: [],
      nuclearIndicators: [],
    },
  ],
};

// ── CRISIS 2 — SOUTH CHINA SEA ──────────────────────────────
const SOUTH_CHINA_SEA: CrisisModel = {
  id: 'scs',
  flag: '🌊',
  title: 'Laut China Selatan',
  location: 'Konfrontasi Filipina–China di Second Thomas Shoal',
  riskLevel: 'high',
  riskLabel: 'Tinggi',
  statusText:
    'Konfrontasi berulang di Second Thomas Shoal. Risiko insiden kinetik ' +
    'lebih tinggi dari Natuna — water cannon & blokade sudah terjadi.',
  statusTone: 'danger',
  credibilityScore: 79,
  credibilityNote:
    'Sebagian besar sinyal terverifikasi; beberapa klaim sepihak masih ' +
    'menunggu konfirmasi independen',
  grayZone: true,
  redlineIndex: 6,
  misreadScore: 5,
  csiScore: 5,
  rfsScore: 6,
  summaryText:
    'China memblokade misi resupply Filipina ke BRP Sierra Madre. AS terikat ' +
    'Mutual Defense Treaty dengan Filipina, sehingga insiden kecil bisa ' +
    'menyeret kekuatan besar. Tensi tertinggi di kawasan saat ini.',
  cascadeNote:
    'Risiko spiral: water cannon → korban jiwa Filipina → invokasi MDT AS → ' +
    'keterlibatan langsung AS. Probabilitas cascade: 24% dalam 18 bulan.',
  layerChips: [
    {
      code: 'A',
      label: 'Redline 6/10',
      tone: 'warning',
      tooltip:
        'Redline Index (Lapisan A) — 6/10: ruang manuver Filipina menyempit. ' +
        'Korban jiwa akan memaksa respons keras.',
    },
    {
      code: 'B',
      label: 'Misread 5/10',
      tone: 'warning',
      tooltip:
        'Misread Score (Lapisan B) — 5/10: kedua pihak relatif memahami ' +
        'niat lawan, namun salah hitung taktis tetap mungkin.',
    },
    {
      code: 'C',
      label: 'T-120 hari',
      tone: 'warning',
      tooltip:
        'Action Readiness (Lapisan C) — T-120 hari: postur militer regional ' +
        'meningkat, kesiapan lebih cepat dari Natuna.',
    },
    {
      code: 'K',
      label: 'CSI 5/10',
      tone: 'warning',
      tooltip:
        'Cognitive Stress Index (Lapisan K) — 5/10: tekanan domestik ' +
        'Marcos & nasionalisme China membuat keputusan lebih reaktif.',
    },
    {
      code: 'O',
      label: 'RFS 6/10',
      tone: 'danger',
      tooltip:
        'Regime Fragility Score (Lapisan O) — 6/10: tekanan ekonomi China + ' +
        'koalisi domestik Filipina yang rapuh.',
    },
    {
      code: 'F',
      label: 'Gray Zone',
      tone: 'special',
      tooltip:
        'Gray Zone Persistence (Lapisan F) — Taktik abu-abu (blokade, water ' +
        'cannon) di bawah ambang perang terbuka, berlangsung tahunan.',
    },
    {
      code: 'M',
      label: '+12%',
      tone: 'warning',
      tooltip:
        'Shock Multiplier (Lapisan M) — Semua probabilitas konflik naik ' +
        '12% akibat krisis non-militer paralel.',
    },
  ],
  perceptions: [
    {
      actor: '🇨🇳 China membaca Filipina',
      reading: 'Proksi AS yang bisa ditekan',
      verdict: 'Misread sedang',
      tone: 'warning',
    },
    {
      actor: '🇵🇭 Filipina membaca China',
      reading: 'Akan terus eskalasi bertahap',
      verdict: 'Misread rendah ✓',
      tone: 'positive',
    },
    {
      actor: '🇺🇸 Amerika membaca China',
      reading: 'Menguji kredibilitas aliansi AS',
      verdict: 'Misread rendah ✓',
      tone: 'positive',
    },
    {
      actor: '🌏 ASEAN membaca konflik',
      reading: 'Hindari keberpihakan terbuka',
      verdict: 'Misread sedang',
      tone: 'warning',
    },
  ],
  actors: [
    {
      initials: 'XI',
      name: 'Xi Jinping · China',
      stressLabel: 'Sedang',
      stressLevel: 3,
      stressTone: 'warning',
      scores: [
        {
          label: 'RCS 85/100',
          tone: 'danger',
          tooltip:
            'Rhetorical Consistency Score — 85: tindakan hampir selalu ' +
            'mengikuti retorika keras China atas klaim maritim.',
        },
        {
          label: 'CSI 5/10',
          tone: 'warning',
          tooltip:
            'Cognitive Stress Index — 5/10: tekanan ekonomi domestik China ' +
            'meningkatkan kebutuhan akan kemenangan nasionalis.',
        },
        {
          label: 'RFS 6/10',
          tone: 'warning',
          tooltip:
            'Regime Fragility Score — 6/10: krisis properti + pengangguran ' +
            'muda menambah insentif pengalihan eksternal.',
        },
      ],
    },
    {
      initials: 'BM',
      name: 'Bongbong Marcos · Filipina',
      stressLabel: 'Sedang — naik',
      stressLevel: 3,
      stressTone: 'warning',
      scores: [
        {
          label: 'RCS 70/100',
          tone: 'info',
          tooltip:
            'Rhetorical Consistency Score — 70: kebijakan pro-AS konsisten, ' +
            'namun manuver domestik kadang mengejutkan.',
        },
        {
          label: 'CSI 5/10',
          tone: 'warning',
          tooltip:
            'Cognitive Stress Index — 5/10: rivalitas dengan faksi Duterte ' +
            'menambah tekanan keputusan.',
        },
        {
          label: 'RFS 6/10',
          tone: 'warning',
          tooltip:
            'Regime Fragility Score — 6/10: koalisi rapuh, sentimen ' +
            'nasionalis tinggi atas isu maritim.',
        },
      ],
    },
  ],
  pivotWatches: [
    {
      text:
        'Korban jiwa personel Filipina akibat manuver CCG → trigger invokasi ' +
        'MDT dengan AS',
      badge: 'Sangat kritis',
      tone: 'danger',
      icon: 'warning-outline',
    },
    {
      text:
        'AS kirim aset angkatan laut untuk escort resupply → eskalasi ' +
        'langsung dengan China',
      badge: 'Sangat kritis',
      tone: 'danger',
      icon: 'boat-outline',
    },
    {
      text:
        'Putusan arbitrase baru / deklarasi ADIZ China → resetting seluruh ' +
        'kalkulasi kawasan',
      badge: 'Perlu diawasi',
      tone: 'warning',
      icon: 'earth-outline',
    },
  ],
  probabilityBars: [
    { label: 'Gray zone berlanjut tanpa korban', percent: 38, tone: 'warning' },
    { label: 'Insiden kinetik terbatas', percent: 31, tone: 'danger' },
    { label: 'AS terlibat via MDT', percent: 18, tone: 'danger' },
    { label: 'De-eskalasi negosiasi', percent: 13, tone: 'positive' },
  ],
  scenarios: [
    {
      name: 'Skenario 1 — Gray zone berlanjut tanpa korban',
      probability: 38,
      tone: 'warning',
      rung: 'Rung 3 — Tekanan terukur',
      duration: 'Gray Zone >2 thn',
      hint:
        'Pasar regional volatil tapi tanpa shock besar. Premi risiko ' +
        'maritim & asuransi pelayaran naik bertahap.',
      confidenceScore: 74,
      confidenceFormula: 'Bayesian × Rung × Misread × Redline × RFS × M',
      tags: [
        {
          label: 'Rung 3 — Tekanan terukur',
          tone: 'warning',
          tooltip:
            'Escalation Rung 3 — Blokade & water cannon tanpa korban jiwa; ' +
            'tekanan terukur di bawah ambang kinetik penuh.',
        },
        {
          label: 'Durasi: Gray Zone >2 thn',
          tone: 'special',
          tooltip:
            'Vektor Durasi (Lapisan F) — Pola sub-threshold berlanjut ' +
            'tahunan tanpa resolusi tegas.',
        },
      ],
      evidences: [
        {
          icon: 'water-outline',
          tone: 'warning',
          text:
            'Pola 2023–2024: blokade & water cannon berulang tanpa korban ' +
            'jiwa. Kedua pihak menahan diri dari eskalasi mematikan.',
          source: 'OSINT AMTI / CSIS Asia Maritime',
          tag: 'Pola historis terukur',
        },
        {
          icon: 'hand-left-outline',
          tone: 'positive',
          text:
            'Saluran komunikasi krisis Manila–Beijing masih aktif meski ' +
            'tegang, mengurangi risiko miskalkulasi fatal.',
          source: 'Pernyataan DFA Filipina 2024',
          tag: 'Faktor penahan diplomatik',
        },
      ],
      dominoEffects: [
        { label: 'Premi asuransi pelayaran naik', tone: 'warning' },
        { label: 'Rerouting logistik regional', tone: 'neutral' },
        { label: 'ASEAN tetap berhati-hati', tone: 'special' },
      ],
      industryImpacts: [
        { label: 'Logistik & Pelayaran', direction: 'watch' },
        { label: 'Energi', direction: 'neutral' },
        { label: 'Pertahanan', direction: 'up' },
      ],
      financialWeapons: [],
      nuclearIndicators: [],
    },
    {
      name: 'Skenario 2 — Insiden kinetik terbatas',
      probability: 31,
      tone: 'danger',
      rung: 'Rung 4 — Kinetik lokal',
      duration: '2–5 bulan',
      hint:
        'Shock pasar regional tajam jangka pendek. Saham pertahanan & emas ' +
        'naik; ekuitas ASEAN tertekan.',
      confidenceScore: 66,
      confidenceFormula: 'Bayesian × Rung × Misread × Redline(6) × RFS × M',
      tags: [
        {
          label: 'Rung 4 — Kinetik lokal',
          tone: 'danger',
          tooltip:
            'Escalation Rung 4 — Bentrokan fisik terbatas (tabrakan kapal / ' +
            'tembakan peringatan) tanpa perang terbuka.',
        },
        {
          label: 'H: Cascade risk aktif',
          tone: 'warning',
          tooltip:
            'N×N Cascade Detection (Lapisan H) — Korban jiwa bisa memicu ' +
            'rantai eskalasi yang menyeret AS.',
        },
      ],
      evidences: [
        {
          icon: 'boat-outline',
          tone: 'danger',
          text:
            'Frekuensi tabrakan & manuver agresif CCG meningkat tajam ' +
            '2024. Probabilitas korban jiwa per insiden naik.',
          source: 'OSINT MarineTraffic + AMTI',
          tag: 'Sinyal militer meningkat',
        },
        {
          icon: 'shield-outline',
          tone: 'danger',
          text:
            'Mutual Defense Treaty AS–Filipina membuat insiden kecil ' +
            'berpotensi menyeret kekuatan besar.',
          source: 'US-PH MDT 1951 + pernyataan Pentagon 2024',
          tag: 'Risiko alliance entanglement',
        },
      ],
      dominoEffects: [
        { label: 'Risk-off pasar ASEAN', tone: 'danger' },
        { label: 'Premi energi & freight melonjak', tone: 'danger' },
        { label: 'Emas rally', tone: 'positive' },
      ],
      industryImpacts: [
        { label: 'Pelayaran & Logistik', direction: 'down' },
        { label: 'Pariwisata', direction: 'down' },
        { label: 'Pertahanan', direction: 'up' },
        { label: 'Emas & Logam', direction: 'up' },
      ],
      financialWeapons: [],
      nuclearIndicators: [],
    },
    {
      name: 'Skenario 3 — AS terlibat via MDT',
      probability: 18,
      tone: 'danger',
      rung: 'Rung 5 — Internasionalisasi',
      duration: '6–18 bulan',
      hint:
        'Risk-off global. Volatilitas tinggi di seluruh aset Asia; safe ' +
        'haven (USD, emas, treasuries) menguat.',
      confidenceScore: 60,
      confidenceFormula: 'Bayesian × Rung × Misread × Redline × RFS × M',
      tags: [
        {
          label: 'Rung 5 — Internasionalisasi',
          tone: 'danger',
          tooltip:
            'Escalation Rung 5 — Keterlibatan kekuatan besar (AS) mengubah ' +
            'konflik bilateral menjadi krisis internasional.',
        },
      ],
      evidences: [],
      dominoEffects: [
        { label: 'Risk-off global', tone: 'danger' },
        { label: 'USD & treasuries menguat', tone: 'positive' },
        { label: 'Disrupsi rantai pasok chip', tone: 'danger' },
      ],
      industryImpacts: [
        { label: 'Ekuitas Asia', direction: 'down' },
        { label: 'Semikonduktor', direction: 'down' },
        { label: 'Pertahanan', direction: 'up' },
        { label: 'Emas & Logam', direction: 'up' },
      ],
      financialWeapons: [],
      nuclearIndicators: [],
    },
    {
      name: 'Skenario 4 — De-eskalasi negosiasi',
      probability: 13,
      tone: 'positive',
      rung: 'Rung 1–2 — De-eskalasi',
      duration: '1–3 tahun',
      hint:
        'Stabilitas kembali. Ekuitas ASEAN rebound, premi risiko maritim ' +
        'turun.',
      confidenceScore: 52,
      confidenceFormula: 'Base rate rendah — butuh konsesi bilateral',
      tags: [
        {
          label: 'Rung 1–2 — De-eskalasi',
          tone: 'positive',
          tooltip:
            'Escalation Rung 1–2 — Code of Conduct ASEAN-China disepakati / ' +
            'mekanisme manajemen krisis baru.',
        },
      ],
      evidences: [],
      dominoEffects: [
        { label: 'Ekuitas ASEAN rebound', tone: 'positive' },
        { label: 'Premi risiko maritim turun', tone: 'positive' },
      ],
      industryImpacts: [
        { label: 'Pelayaran & Logistik', direction: 'up' },
        { label: 'Pariwisata', direction: 'up' },
        { label: 'Pertahanan', direction: 'neutral' },
      ],
      financialWeapons: [],
      nuclearIndicators: [],
    },
  ],
};

// ── CRISIS 3 — TAIWAN STRAIT ────────────────────────────────
const TAIWAN: CrisisModel = {
  id: 'taiwan',
  flag: '🇹🇼',
  title: 'Selat Taiwan',
  location: 'Tekanan militer China meningkat, deepfake terdeteksi',
  riskLevel: 'critical',
  riskLabel: 'Kritis',
  statusText:
    'Situasi paling berbahaya secara global. Latihan militer skala besar + ' +
    'disinformasi terkoordinasi. Uncertainty buffer ±15% aktif (Layer L).',
  statusTone: 'danger',
  credibilityScore: 64,
  credibilityNote:
    'Deepfake & disinformasi terdeteksi — uncertainty buffer ±15% ' +
    'diterapkan pada semua probabilitas Taiwan',
  grayZone: true,
  redlineIndex: 7,
  misreadScore: 7,
  csiScore: 6,
  rfsScore: 6,
  summaryText:
    'China meningkatkan tekanan militer (drone swarm, latihan blokade) di ' +
    'sekitar Taiwan. Layer N (TDI) menaikkan Action Readiness ke T-21 hari. ' +
    'Video deepfake "pejabat Taiwan" beredar — Layer L menerapkan buffer ' +
    'ketidakpastian sampai terverifikasi.',
  cascadeNote:
    'Risiko spiral nuklir-konvensional: blokade → intervensi AS → ' +
    'ambang nuklir (Lapisan I) terdorong. Probabilitas cascade: 12% dalam ' +
    '36 bulan, namun dampaknya katastrofik.',
  layerChips: [
    {
      code: 'A',
      label: 'Redline 7/10',
      tone: 'danger',
      tooltip:
        'Redline Index (Lapisan A) — 7/10: deklarasi kemerdekaan Taiwan / ' +
        'pengakuan formal AS adalah garis merah China yang mendekat.',
    },
    {
      code: 'B',
      label: 'Misread 7/10',
      tone: 'danger',
      tooltip:
        'Misread Score (Lapisan B) — 7/10: ambiguitas strategis AS dapat ' +
        'disalahbaca oleh Beijing sebagai kelemahan komitmen.',
    },
    {
      code: 'I',
      label: 'Nuclear Watch',
      tone: 'special',
      tooltip:
        'Nuclear Threshold (Lapisan I) — Memantau ambang penggunaan senjata ' +
        'nuklir taktis jika konflik konvensional gagal bagi salah satu ' +
        'pihak.',
    },
    {
      code: 'K',
      label: 'CSI 6/10',
      tone: 'danger',
      tooltip:
        'Cognitive Stress Index (Lapisan K) — 6/10: tekanan ekonomi & ' +
        'legacy politik Xi meningkatkan kebutuhan akan hasil tegas.',
    },
    {
      code: 'N',
      label: 'TDI ↑ T-21',
      tone: 'special',
      tooltip:
        'Technology Disruption Index (Lapisan N) — Drone swarm PLAN baru ' +
        'memangkas Action Readiness dari T-90 ke T-21 hari.',
    },
    {
      code: 'L',
      label: 'Deepfake ±15%',
      tone: 'special',
      tooltip:
        'Information Integrity (Lapisan L) — Disinformasi terkoordinasi & ' +
        'deepfake terdeteksi → uncertainty buffer ±15% pada semua ' +
        'probabilitas Taiwan.',
    },
    {
      code: 'M',
      label: '+12%',
      tone: 'warning',
      tooltip:
        'Shock Multiplier (Lapisan M) — Semua probabilitas konflik naik ' +
        '12% akibat krisis non-militer paralel.',
    },
  ],
  perceptions: [
    {
      actor: '🇨🇳 China membaca AS',
      reading: 'Komitmen AS ambigu, bisa diuji',
      verdict: 'Misread ⚠ — berbahaya',
      tone: 'danger',
    },
    {
      actor: '🇺🇸 Amerika membaca China',
      reading: 'Belum siap invasi penuh',
      verdict: 'Misread sedang',
      tone: 'warning',
    },
    {
      actor: '🇹🇼 Taiwan membaca China',
      reading: 'Tekanan akan terus meningkat',
      verdict: 'Misread rendah ✓',
      tone: 'positive',
    },
    {
      actor: '🇯🇵 Jepang membaca konflik',
      reading: 'Ancaman langsung ke keamanan Jepang',
      verdict: 'Misread rendah ✓',
      tone: 'positive',
    },
  ],
  actors: [
    {
      initials: 'XI',
      name: 'Xi Jinping · China',
      stressLabel: 'Tinggi',
      stressLevel: 4,
      stressTone: 'danger',
      scores: [
        {
          label: 'RCS 88/100',
          tone: 'danger',
          tooltip:
            'Rhetorical Consistency Score — 88: "reunifikasi" adalah komitmen ' +
            'inti; retorika Xi sangat mungkin diikuti tindakan.',
        },
        {
          label: 'CSI 6/10',
          tone: 'danger',
          tooltip:
            'Cognitive Stress Index — 6/10: tekanan ekonomi + dimensi ' +
            'legacy politik menaikkan stres pengambilan keputusan.',
        },
        {
          label: 'RFS 6/10',
          tone: 'warning',
          tooltip:
            'Regime Fragility Score — 6/10: kerapuhan domestik menambah ' +
            'godaan pengalihan via isu Taiwan.',
        },
      ],
    },
    {
      initials: 'LC',
      name: 'Lai Ching-te · Taiwan',
      stressLabel: 'Tinggi',
      stressLevel: 4,
      stressTone: 'danger',
      scores: [
        {
          label: 'RCS 75/100',
          tone: 'info',
          tooltip:
            'Rhetorical Consistency Score — 75: stance pro-kedaulatan ' +
            'konsisten namun berhati-hati menghindari garis merah eksplisit.',
        },
        {
          label: 'CSI 6/10',
          tone: 'danger',
          tooltip:
            'Cognitive Stress Index — 6/10: tekanan militer harian + ' +
            'parlemen terbelah meningkatkan stres.',
        },
        {
          label: 'RFS 5/10',
          tone: 'warning',
          tooltip:
            'Regime Fragility Score — 5/10: pemerintahan minoritas di ' +
            'legislatif membatasi ruang gerak.',
        },
      ],
    },
  ],
  pivotWatches: [
    {
      text:
        'Pengumuman blokade / karantina maritim PLA → eskalasi langsung & ' +
        'invokasi keterlibatan AS',
      badge: 'Sangat kritis',
      tone: 'danger',
      icon: 'ban-outline',
    },
    {
      text:
        'Verifikasi deepfake "mobilisasi Taiwan" → jika valid, Tripwire ' +
        'aktif & buffer dilepas',
      badge: 'Sangat kritis',
      tone: 'danger',
      icon: 'eye-off-outline',
    },
    {
      text:
        'Perubahan postur nuklir / alert level (Lapisan I) → reset seluruh ' +
        'kalkulasi global',
      badge: 'Sangat kritis',
      tone: 'danger',
      icon: 'nuclear-outline',
    },
  ],
  probabilityBars: [
    { label: 'Tekanan berlanjut tanpa invasi', percent: 41, tone: 'warning' },
    { label: 'Blokade / karantina', percent: 27, tone: 'danger' },
    { label: 'Invasi skala penuh', percent: 14, tone: 'danger' },
    { label: 'De-eskalasi status quo', percent: 18, tone: 'positive' },
  ],
  scenarios: [
    {
      name: 'Skenario 1 — Tekanan berlanjut tanpa invasi',
      probability: 41,
      tone: 'warning',
      rung: 'Rung 3 — Tekanan terukur',
      duration: '1–3 tahun',
      hint:
        'Volatilitas tinggi tapi tanpa shock terminal. Premi risiko ' +
        'semikonduktor & shipping naik bertahap.',
      confidenceScore: 70,
      confidenceFormula:
        'Bayesian × Rung × Misread × Redline × RFS × M × L-buffer(±15%)',
      tags: [
        {
          label: 'Rung 3 — Tekanan terukur',
          tone: 'warning',
          tooltip:
            'Escalation Rung 3 — Latihan militer & zona abu-abu berulang ' +
            'tanpa kontak kinetik penuh.',
        },
        {
          label: 'L: buffer ±15%',
          tone: 'special',
          tooltip:
            'Information Integrity (Lapisan L) — Disinformasi aktif → ' +
            'estimasi diberi buffer ketidakpastian ±15%.',
        },
      ],
      evidences: [
        {
          icon: 'airplane-outline',
          tone: 'warning',
          text:
            'Insursi ADIZ harian PLA mencapai rekor 2024 namun tetap di ' +
            'bawah ambang serangan langsung — pola tekanan terukur.',
          source: 'Taiwan MND daily reports 2024',
          tag: 'Pola tekanan sub-threshold',
        },
        {
          icon: 'hardware-chip-outline',
          tone: 'info',
          text:
            '"Silicon Shield": TSMC memasok >60% chip canggih dunia. ' +
            'Invasi akan menghancurkan ekonomi global termasuk China — ' +
            'faktor penahan kuat.',
          source: 'TrendForce / SEMI 2024',
          tag: 'Faktor penahan ekonomi (Silicon Shield)',
        },
      ],
      dominoEffects: [
        { label: 'Premi risiko chip naik', tone: 'warning' },
        { label: 'Diversifikasi fab ke luar Taiwan', tone: 'neutral' },
        { label: 'Belanja pertahanan Asia naik', tone: 'warning' },
      ],
      industryImpacts: [
        { label: 'Semikonduktor', direction: 'watch' },
        { label: 'Pelayaran', direction: 'watch' },
        { label: 'Pertahanan', direction: 'up' },
      ],
      financialWeapons: [],
      nuclearIndicators: [],
    },
    {
      name: 'Skenario 2 — Blokade / karantina maritim',
      probability: 27,
      tone: 'danger',
      rung: 'Rung 5 — Blokade',
      duration: '3–12 bulan',
      hint:
        'Shock global parah. Rantai pasok semikonduktor terputus; resesi ' +
        'teknologi global; risk-off ekstrem.',
      confidenceScore: 62,
      confidenceFormula:
        'Bayesian × Rung × Misread(7) × Redline(7) × RFS × M × L-buffer',
      tags: [
        {
          label: 'Rung 5 — Blokade',
          tone: 'danger',
          tooltip:
            'Escalation Rung 5 — Blokade/karantina maritim memutus akses ' +
            'ekonomi Taiwan tanpa invasi darat langsung.',
        },
        {
          label: 'I: Nuclear watch',
          tone: 'special',
          tooltip:
            'Nuclear Threshold (Lapisan I) — Intervensi AS pada blokade ' +
            'menaikkan risiko menuju ambang nuklir.',
        },
      ],
      evidences: [
        {
          icon: 'ban-outline',
          tone: 'danger',
          text:
            'Latihan "Joint Sword" PLA telah melatih skenario blokade ' +
            'penuh pulau — kapabilitas sudah terdemonstrasi.',
          source: 'PLA Eastern Theater Command drills 2024',
          tag: 'Kapabilitas blokade terbukti',
        },
        {
          icon: 'hardware-chip-outline',
          tone: 'special',
          text:
            'Layer N: drone swarm baru memangkas Action Readiness ke T-21 ' +
            'hari — China bisa bergerak jauh lebih cepat dari perkiraan.',
          source: 'Layer N TDI update + OSINT',
          tag: 'TDI escalation — T-21 hari',
        },
      ],
      nuclearIndicators: [
        { label: 'Postur nuklir China', value: 'No First Use (dipertanyakan)', tone: 'special' },
        { label: 'Risiko ambang (Lapisan I)', value: 'Rendah-sedang, naik', tone: 'special' },
        { label: 'Pemicu utama', value: 'Intervensi langsung AS', tone: 'special' },
      ],
      dominoEffects: [
        { label: 'Resesi teknologi global', tone: 'danger' },
        { label: 'Harga chip melonjak', tone: 'danger' },
        { label: 'Risk-off ekstrem', tone: 'danger' },
        { label: 'Emas & USD melonjak', tone: 'positive' },
      ],
      industryImpacts: [
        { label: 'Semikonduktor', direction: 'down' },
        { label: 'Teknologi', direction: 'down' },
        { label: 'Otomotif', direction: 'down' },
        { label: 'Emas & Logam', direction: 'up' },
        { label: 'Pertahanan', direction: 'up' },
      ],
      financialWeapons: [],
    },
    {
      name: 'Skenario 3 — Invasi skala penuh',
      probability: 14,
      tone: 'danger',
      rung: 'Rung 6 — Perang terbuka',
      duration: 'Tak tentu',
      hint:
        'Skenario terburuk global. Perang besar AS–China; depresi ekonomi ' +
        'global; ambang nuklir aktif.',
      confidenceScore: 56,
      confidenceFormula: 'Probabilitas rendah tapi dampak katastrofik',
      tags: [
        {
          label: 'Rung 6 — Perang terbuka',
          tone: 'danger',
          tooltip:
            'Escalation Rung 6 — Konflik bersenjata penuh; titik tertinggi ' +
            'tangga eskalasi.',
        },
        {
          label: 'I: Nuclear threshold',
          tone: 'special',
          tooltip:
            'Nuclear Threshold (Lapisan I) — Skenario ini membawa risiko ' +
            'penggunaan senjata nuklir taktis paling tinggi.',
        },
      ],
      evidences: [],
      nuclearIndicators: [
        { label: 'Risiko nuklir taktis', value: 'Sedang — bila AS terlibat', tone: 'special' },
        { label: 'Eskalasi tak terkendali', value: 'Tinggi', tone: 'special' },
        { label: 'Dampak global', value: 'Katastrofik', tone: 'special' },
      ],
      dominoEffects: [
        { label: 'Depresi ekonomi global', tone: 'danger' },
        { label: 'Blok ekonomi terpecah total', tone: 'danger' },
        { label: 'Hanya safe-haven bertahan', tone: 'positive' },
      ],
      industryImpacts: [
        { label: 'Semua ekuitas', direction: 'down' },
        { label: 'Teknologi', direction: 'down' },
        { label: 'Emas & Logam', direction: 'up' },
        { label: 'Pertahanan', direction: 'up' },
      ],
      financialWeapons: [],
    },
    {
      name: 'Skenario 4 — De-eskalasi status quo',
      probability: 18,
      tone: 'positive',
      rung: 'Rung 1–2 — Status quo',
      duration: '3–5 tahun',
      hint:
        'Stabilitas relatif kembali. Ekuitas teknologi rebound, premi ' +
        'risiko Selat Taiwan turun.',
      confidenceScore: 50,
      confidenceFormula: 'Base rate — bergantung pada manajemen krisis AS–China',
      tags: [
        {
          label: 'Rung 1–2 — Status quo',
          tone: 'positive',
          tooltip:
            'Escalation Rung 1–2 — Kembali ke ambiguitas strategis & ' +
            'manajemen krisis; status quo dipertahankan.',
        },
      ],
      evidences: [],
      dominoEffects: [
        { label: 'Ekuitas teknologi rebound', tone: 'positive' },
        { label: 'Premi risiko turun', tone: 'positive' },
      ],
      industryImpacts: [
        { label: 'Semikonduktor', direction: 'up' },
        { label: 'Teknologi', direction: 'up' },
        { label: 'Pertahanan', direction: 'neutral' },
      ],
      financialWeapons: [],
      nuclearIndicators: [],
    },
  ],
};

export const DUMMY_CRISES: CrisisModel[] = [NATUNA, SOUTH_CHINA_SEA, TAIWAN];

// ── LIVE MAPPING ────────────────────────────────────────────
// Minimal shape of the live `CrisisDto` fields this module consumes (kept
// structural to avoid importing the API layer into the data module).
export interface CrisisLike {
  id: string;
  title: string;
  region: string;
  subRegion: string;
  status: string;
  severityLevel: number;
  redlineIndex: number;
  misreadScore: number;
  csiAverage: number;
  rfsAverage: number;
  credibilityScore: number; // 0..1
  grayZone: boolean;
}

/** Maps a 0–10 backend severity onto the four RiskPill levels. */
function severityToRisk(level: number): { level: RiskLevel; label: string } {
  if (level >= 8) return { level: 'critical', label: 'Kritis' };
  if (level >= 6) return { level: 'high', label: 'Tinggi' };
  if (level >= 4) return { level: 'medium', label: 'Sedang' };
  return { level: 'low', label: 'Rendah' };
}

/**
 * Builds a {@link CrisisModel} from a live situation using ONLY real backend
 * fields. The deep analysis sections the API does not yet expose
 * (perceptions/actors/pivotWatches/probabilityBars/scenarios/layerChips) are
 * returned EMPTY — the UI shows an honest "sedang diproses" placeholder rather
 * than unrelated dummy (Natuna) content. They populate once AI generation runs.
 *
 * Live-mapped: title, location (region/sub-region), risk level (severity),
 * redline/misread/CSI/RFS scores, credibility, gray-zone flag, region.
 */
export function crisisFromLive(live: CrisisLike, _index: number): CrisisModel {
  const risk = severityToRisk(live.severityLevel);
  const credibility = Math.round(live.credibilityScore * 100);
  return {
    id: live.id,
    flag: '🌐',
    title: live.title,
    location: live.subRegion || live.region || '',
    riskLevel: risk.level,
    riskLabel: risk.label,
    statusText: '',
    statusTone: 'neutral',
    credibilityScore: credibility > 0 ? credibility : 0,
    credibilityNote: '',
    grayZone: live.grayZone,
    redlineIndex: live.redlineIndex,
    misreadScore: live.misreadScore,
    csiScore: live.csiAverage,
    rfsScore: live.rfsAverage,
    summaryText: '',
    cascadeNote: '',
    region: live.region || '',
    layerChips: [],
    perceptions: [],
    actors: [],
    pivotWatches: [],
    probabilityBars: [],
    scenarios: [],
  };
}

/** Minimal shape of the live `AlertDto` fields consumed here. */
export interface AlertLike {
  type: string;
  severity: string;
  title: string;
  body: string;
  createdAt: Date | null;
}

function alertToneFromSeverity(severity: string): ToneKey {
  switch (severity.toLowerCase()) {
    case 'critical':
    case 'high':
    case 'danger':
      return 'danger';
    case 'medium':
    case 'warning':
      return 'warning';
    case 'special':
      return 'special';
    default:
      return 'info';
  }
}

function alertIconFromType(type: string): string {
  switch (type.toLowerCase()) {
    case 'military':
    case 'militer':
      return 'boat-outline';
    case 'economy':
    case 'ekonomi':
      return 'trending-down-outline';
    case 'info':
    case 'integrity':
      return 'eye-off-outline';
    default:
      return 'notifications-outline';
  }
}

function relativeTime(date: Date | null): string {
  if (!date) return '';
  const mins = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (mins < 60) return `${mins} mnt lalu`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  return `${Math.round(hrs / 24)} hari lalu`;
}

/** Maps a live alert onto the {@link AlertItem} presentation shape. */
export function alertFromLive(live: AlertLike): AlertItem {
  const tone = alertToneFromSeverity(live.severity);
  const time = relativeTime(live.createdAt);
  const meta = [live.body, time].filter(Boolean).join(' · ');
  return {
    icon: alertIconFromType(live.type),
    title: live.title,
    meta,
    badge: tone === 'danger' ? 'Pantau' : tone === 'warning' ? 'Siaga' : 'Info',
    tone,
  };
}

// ── FEED — NEWS & SOCIAL ────────────────────────────────────
export const DUMMY_NEWS: NewsArticle[] = [
  {
    source: 'REUTERS',
    time: '12 mnt lalu',
    sourceTone: 'info',
    headline:
      'Kapal penjaga pantai China masuki perairan Natuna untuk ketiga ' +
      'kalinya bulan ini',
    category: 'Indo-Pasifik · Militer',
    credibilityLabel: 'Credibility 91% ✓',
    credibilityTone: 'positive',
    tripwire: 'Memicu Tripwire TW-01',
  },
  {
    source: 'BLOOMBERG',
    time: '1 jam lalu',
    sourceTone: 'warning',
    headline:
      'Harga nikel LME mendekati $12.000 — tekanan fiskal Indonesia ' +
      'meningkat',
    category: 'Ekonomi · Komoditas',
    credibilityLabel: 'Credibility 88% ✓',
    credibilityTone: 'positive',
  },
  {
    source: 'AP NEWS',
    time: '3 jam lalu',
    sourceTone: 'info',
    headline: 'PLA gelar latihan blokade skala besar di sekitar Selat Taiwan',
    category: 'Asia Timur · Militer',
    credibilityLabel: 'Credibility 84% ✓',
    credibilityTone: 'positive',
    tripwire: 'Memicu Tripwire TW-07',
  },
];

export const DUMMY_SOCIAL: SocialPost[] = [
  {
    source: 'OSINT MONITOR',
    time: '2 jam lalu',
    tone: 'special',
    headline:
      'Video viral "pejabat Taiwan umumkan mobilisasi" teridentifikasi ' +
      'sebagai AI-generated deepfake',
    note:
      'Lapisan L aktif: uncertainty buffer ±15% diterapkan pada semua ' +
      'probabilitas skenario Taiwan sampai terverifikasi. Tripwire tidak ' +
      'diaktifkan karena sumber tidak valid.',
    badge: '⚠ Deepfake terdeteksi',
  },
  {
    source: 'X TRENDING',
    time: '4 jam lalu',
    tone: 'info',
    headline:
      '#Natuna trending — narasi terkoordinasi terdeteksi dari klaster ' +
      'akun baru',
    note:
      'Narrative Origin Trace (Lapisan L): 38% engagement berasal dari akun ' +
      '<30 hari. Credibility diturunkan; sinyal tidak dijadikan basis ' +
      'tripwire.',
    badge: 'Narrative trace aktif',
  },
];

export const FEED_INTEGRITY_NOTE = {
  title: 'Lapisan L — Information Integrity Engine aktif',
  body:
    'Setiap sinyal masuk diberi Credibility Score dan dilacak asal-usul ' +
    'narasinya (Narrative Origin Trace). Video dan audio dicek apakah ' +
    'buatan AI (deepfake detection). Jika disinformasi terkoordinasi ' +
    'terdeteksi, semua probabilitas mendapat uncertainty buffer ±15%.',
};
