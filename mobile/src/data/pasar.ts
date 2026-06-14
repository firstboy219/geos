/**
 * Static dummy data for the Pasar (Market) screen.
 *
 * Numbers and copy mirror `Knowledge Base/Mockup_mobile/pasar_screen.html` and
 * are ported 1:1 from the Flutter archive (`features/pasar/data/dummy_assets.dart`).
 * When the API lands (KB BAB 5: /pasar/assets, /pasar/matrix, /pasar/heatmap)
 * these constants are merged with provider-fetched models (live `data` wins,
 * dummy is the fallback) — see `pasar.tsx`.
 */
import { tones, type SignalTone } from '@/components';
import { colors } from '@/theme';

// ── Tones ────────────────────────────────────────────────────
/** Extra "info" / "special" tones (the foundation exposes 6 presets). */
export const pasarTones = {
  ...tones,
  /** Blue / informational. Maps to the foundation `accent` tone. */
  info: tones.accent,
  /** Purple / nuclear-adjacent. Maps to the foundation `critical` tone. */
  special: tones.critical,
} as const;

export type PasarToneKey = keyof typeof pasarTones;

// ── Categories & directions ──────────────────────────────────
export type AssetCategory = 'saham' | 'kurs' | 'komoditas' | 'crypto';
export type PriceDirection = 'up' | 'down' | 'neutral';

/** Triangle glyph shown alongside change %. */
export const directionGlyph: Record<PriceDirection, string> = {
  up: '▲',
  down: '▼',
  neutral: '▶',
};

/** Tone applied to a price change by direction. */
export const directionTone: Record<PriceDirection, SignalTone> = {
  up: pasarTones.positive,
  down: pasarTones.negative,
  neutral: pasarTones.neutral,
};

// ── Category tabs (component #1) ──────────────────────────────
/** Tab labels, index 0 = "Semua"; 1..n map onto CATEGORY_ORDER. */
export const CATEGORY_TABS = ['Semua', 'Saham', 'Kurs & Mata Uang', 'Komoditas', 'Crypto'] as const;
export const CATEGORY_ORDER: AssetCategory[] = ['saham', 'kurs', 'komoditas', 'crypto'];

/** Section header title + action label per category. */
export const SECTION_META: Record<AssetCategory, { title: string; action: string }> = {
  saham: { title: 'Saham Indonesia', action: 'Lihat semua' },
  kurs: { title: 'Kurs & Mata Uang', action: 'Detail' },
  komoditas: { title: 'Komoditas', action: 'Detail' },
  crypto: { title: 'Crypto', action: 'Detail' },
};

// ── Geopolitical risk banner (component #2) ───────────────────
export const RISK_BANNER = {
  score: '6.2',
  scoreMax: '/10',
  label: 'Waspada',
  subtitle: 'Berdasarkan 3 situasi aktif · 16 lapisan AI',
  description:
    'Shock Multiplier (+12%) aktif karena harga komoditas jatuh + El Niño. ' +
    'Pasar lebih sensitif dari biasanya terhadap setiap perkembangan geopolitik.',
} as const;

export interface GeoSignalChip {
  label: string;
  tone: SignalTone;
  tooltip: string;
}

export const RISK_CHIPS: GeoSignalChip[] = [
  {
    label: 'Natuna: Sedang',
    tone: pasarTones.positive,
    tooltip:
      'Natuna ZEE\n' +
      'Redline 3/10 · Misread 6/10 · Gray Zone aktif\n' +
      'Skenario dominan (43%): tidak ada eskalasi → pasar cenderung stabil',
  },
  {
    label: 'LCS: Tinggi',
    tone: pasarTones.negative,
    tooltip:
      'Laut China Selatan\n' +
      'Redline 8/10 · Misread 7/10 · Multi-aktor\n' +
      'Skenario dominan (42%): frozen conflict → energi naik, pariwisata turun',
  },
  {
    label: 'Taiwan: Tinggi',
    tone: pasarTones.negative,
    tooltip:
      'Selat Taiwan\n' +
      'Redline 10/10 · Nuclear adjacent · TDI ↑\n' +
      'Skenario dominan (40%): gray zone → chip/semikonduktor volatile',
  },
  {
    label: 'M: +12%',
    tone: pasarTones.warning,
    tooltip:
      'Shock Multiplier (Lapisan M)\n' +
      'Komoditas jatuh + El Niño aktif bersamaan → semua probabilitas konflik naik 12%',
  },
  {
    label: 'TDI ↑ T-21d',
    tone: pasarTones.special,
    tooltip:
      'Technology Disruption Index (Lapisan N)\n' +
      'Drone swarm baru PLAN diuji pekan lalu → Action Readiness China: T-21 hari. ' +
      'Pasar semakin sensitif terhadap berita militer.',
  },
];

// ── Portfolio ringkasan 4-grid (component #3) ─────────────────
export interface PortfolioCell {
  value: string;
  label: string;
  tone: SignalTone;
}

export const PORTFOLIO_CELLS: PortfolioCell[] = [
  { value: 'Rp 847 jt', label: 'Total nilai', tone: pasarTones.neutral },
  { value: '−Rp 71 jt', label: 'Estimasi dampak skenario negatif', tone: pasarTones.negative },
  { value: '6.2/10', label: 'Skor risiko geopolitik', tone: pasarTones.warning },
  { value: 'Emas ↑', label: 'Aset terkuat saat ini', tone: pasarTones.positive },
];

// ── Skenario × Pasar matrix (component #4) ────────────────────
export interface MatrixScenario {
  id: string;
  /** 0–100 weighted probability share. */
  probability: number;
  tone: SignalTone;
}

export interface MatrixCell {
  label: string;
  tone: SignalTone;
}

export interface MatrixRow {
  label: string;
  /** Exactly 4 cells (S1..S4). */
  cells: MatrixCell[];
}

export const MATRIX_SCENARIOS: MatrixScenario[] = [
  { id: 'S1', probability: 43, tone: pasarTones.positive },
  { id: 'S2', probability: 29, tone: pasarTones.warning },
  { id: 'S3', probability: 15, tone: pasarTones.negative },
  { id: 'S4', probability: 9, tone: pasarTones.info },
];

export const MATRIX_LEGEND =
  'S1: Tidak eskalasi · S2: Forced alignment · S3: Insiden laut · S4: Mediator';

export const MATRIX_ROWS: MatrixRow[] = [
  {
    label: 'IHSG / Saham',
    cells: [
      { label: '↑+8%', tone: pasarTones.positive },
      { label: '↓−15%', tone: pasarTones.negative },
      { label: '↓−22%', tone: pasarTones.negative },
      { label: '↑+18%', tone: pasarTones.positive },
    ],
  },
  {
    label: 'IDR / USD',
    cells: [
      { label: '→stabil', tone: pasarTones.neutral },
      { label: '↓16.500', tone: pasarTones.negative },
      { label: '↓17.500', tone: pasarTones.negative },
      { label: '↑14.800', tone: pasarTones.positive },
    ],
  },
  {
    label: 'Emas (XAU)',
    cells: [
      { label: '→netral', tone: pasarTones.neutral },
      { label: '↑safe', tone: pasarTones.positive },
      { label: '↑↑max', tone: pasarTones.positive },
      { label: '→soft', tone: pasarTones.neutral },
    ],
  },
  {
    label: 'Nikel / EV',
    cells: [
      { label: '↑EV', tone: pasarTones.positive },
      { label: '→mix', tone: pasarTones.neutral },
      { label: '↓halt', tone: pasarTones.negative },
      { label: '↑deal', tone: pasarTones.positive },
    ],
  },
  {
    label: 'Crypto',
    cells: [
      { label: '→mix', tone: pasarTones.neutral },
      { label: '↓sell', tone: pasarTones.negative },
      { label: '↓sell', tone: pasarTones.negative },
      { label: '→mild', tone: pasarTones.neutral },
    ],
  },
];

// ── Geopolitical heatmap (component #7) ───────────────────────
export interface HeatLevel {
  label: string;
  cellColor: string;
  textColor: string;
}

export const HEAT_LEVELS = {
  sangatTinggi: { label: 'Sangat', cellColor: '#F85149', textColor: '#FFFFFF' },
  tinggi: { label: 'Tinggi', cellColor: '#E3B341', textColor: '#0D1117' },
  sedang: { label: 'Sedang', cellColor: '#5F6B3A', textColor: '#FFFFFF' },
  rendah: { label: 'Rendah', cellColor: '#30363D', textColor: colors.textSecondary },
} as const satisfies Record<string, HeatLevel>;

export interface HeatmapRow {
  label: string;
  /** Exactly 3 levels — [Natuna, LCS, Taiwan]. */
  levels: HeatLevel[];
}

export const HEATMAP_COLUMNS = ['🇮🇩 Natuna', '🌊 LCS', '🇹🇼 Taiwan'] as const;

export const HEATMAP_ROWS: HeatmapRow[] = [
  { label: 'IHSG', levels: [HEAT_LEVELS.tinggi, HEAT_LEVELS.tinggi, HEAT_LEVELS.sangatTinggi] },
  { label: 'IDR/USD', levels: [HEAT_LEVELS.sangatTinggi, HEAT_LEVELS.tinggi, HEAT_LEVELS.tinggi] },
  { label: 'Emas', levels: [HEAT_LEVELS.sedang, HEAT_LEVELS.sedang, HEAT_LEVELS.tinggi] },
  { label: 'Nikel', levels: [HEAT_LEVELS.sangatTinggi, HEAT_LEVELS.sedang, HEAT_LEVELS.rendah] },
  { label: 'Chip/Tech', levels: [HEAT_LEVELS.rendah, HEAT_LEVELS.sedang, HEAT_LEVELS.sangatTinggi] },
];

export const HEATMAP_FOOTNOTE =
  'Intensitas menunjukkan seberapa besar probabilitas skenario di setiap situasi ' +
  'mempengaruhi pergerakan kelas aset tersebut.';

// ── Assets (component #6) ─────────────────────────────────────
/**
 * A single tradeable asset row with its geopolitical overlay. Mirrors the API
 * `GET /pasar/assets` shape (KB BAB 5 / PasarAssetDto) plus presentation extras.
 */
export interface Asset {
  symbol: string;
  name: string;
  category: AssetCategory;
  subtitle: string;
  /** Short label rendered inside the rounded asset icon (e.g. "IDX", "BBCA"). */
  iconLabel: string;
  iconFg: string;
  iconBg: string;
  /** Pre-formatted price string (e.g. "Rp 9.475", "$3.324", "7.284"). */
  price: string;
  /** Pre-formatted change string (e.g. "−0.82%", "+125", "YTD"). */
  change: string;
  changeDirection: PriceDirection;
  geoSignalTone: SignalTone;
  /** Short badge text (e.g. "↓ Risiko −12% tertimbang"). */
  geoSignalText: string;
  /** Long explanation shown in the bottom sheet on tap. */
  geoSignalDetail: string;
  /** Normalized 0..1 bar heights for the mini sparkline. */
  sparkline: number[];
  affectedByNatuna: boolean;
  affectedByTaiwan: boolean;
}

export const ASSETS: Asset[] = [
  // ─── Saham Indonesia ───
  {
    symbol: 'IHSG',
    name: 'IHSG',
    category: 'saham',
    subtitle: 'Indeks Harga Saham Gabungan',
    iconLabel: 'IDX',
    iconFg: '#4493F8',
    iconBg: '#0D1F3C',
    price: '7.284',
    change: '−0.82%',
    changeDirection: 'down',
    geoSignalTone: pasarTones.negative,
    geoSignalText: '↓ Risiko −12% tertimbang',
    geoSignalDetail:
      'Geopolitical Impact (Weighted)\n\n' +
      'Probabilitas tertimbang: S1(43%)×+8% + S2(29%)×−15% + S3(15%)×−22% ' +
      '+ S4(9%)×+18% = −1.9% expected, dengan downside risk −22% jika S3 terpicu.',
    sparkline: [0.6, 0.7, 0.55, 0.65, 0.5, 0.45, 0.55, 0.4],
    affectedByNatuna: true,
    affectedByTaiwan: true,
  },
  {
    symbol: 'BBCA',
    name: 'Bank BCA',
    category: 'saham',
    subtitle: 'Perbankan — sensitif kurs IDR',
    iconLabel: 'BBCA',
    iconFg: '#4493F8',
    iconBg: '#0D2044',
    price: 'Rp 9.475',
    change: '−1.2%',
    changeDirection: 'down',
    geoSignalTone: pasarTones.warning,
    geoSignalText: '! Pantau IDR',
    geoSignalDetail:
      'Geopolitical Signal\n\n' +
      'BBCA sangat sensitif terhadap pergerakan IDR. Jika S2 terjadi ' +
      '(IDR 16.500+), saham perbankan tertekan karena cost of fund naik ' +
      'dan NPL berpotensi meningkat.',
    sparkline: [0.7, 0.65, 0.6, 0.62, 0.55, 0.5, 0.52, 0.48],
    affectedByNatuna: false,
    affectedByTaiwan: false,
  },
  {
    symbol: 'TLKM',
    name: 'Telkom Indonesia',
    category: 'saham',
    subtitle: 'Telekomunikasi — defensive',
    iconLabel: 'TLKM',
    iconFg: '#4493F8',
    iconBg: '#0D2044',
    price: 'Rp 3.210',
    change: '0.00%',
    changeDirection: 'neutral',
    geoSignalTone: pasarTones.positive,
    geoSignalText: '↑ Defensive stock',
    geoSignalDetail:
      'Geopolitical Signal\n\n' +
      'Saham telekomunikasi cenderung defensive — tidak naik banyak tapi ' +
      'juga tidak jatuh jauh. Di skenario manapun kecuali S5, TLKM relatif ' +
      'stabil karena revenue berbasis domestik.',
    sparkline: [0.5, 0.52, 0.5, 0.51, 0.5, 0.5, 0.51, 0.5],
    affectedByNatuna: false,
    affectedByTaiwan: false,
  },
  {
    symbol: 'ANTM',
    name: 'Aneka Tambang',
    category: 'saham',
    subtitle: 'Nikel & emas — leverage komoditas',
    iconLabel: 'ANTM',
    iconFg: '#3FB950',
    iconBg: '#0D2818',
    price: 'Rp 1.545',
    change: '−2.8%',
    changeDirection: 'down',
    geoSignalTone: pasarTones.warning,
    geoSignalText: '! Natuna + Nikel watch',
    geoSignalDetail:
      'Geopolitical Signal (Natuna + LCS)\n\n' +
      'Jika S1 (43%): EV demand naik → ANTM rally. Jika S3 (15%): China ' +
      'halt nikel offtake → ANTM jatuh tajam. Shock Multiplier M (+12%) ' +
      'aktif meningkatkan volatilitas kedua arah.',
    sparkline: [0.6, 0.7, 0.5, 0.6, 0.45, 0.4, 0.35, 0.3],
    affectedByNatuna: true,
    affectedByTaiwan: false,
  },
  {
    symbol: 'DEF',
    name: 'Sektor Pertahanan',
    category: 'saham',
    subtitle: 'PINDAD · LEN · LAPAN — naik di krisis',
    iconLabel: 'DEF',
    iconFg: '#9B59B6',
    iconBg: '#1C1020',
    price: '+18.4%',
    change: 'YTD',
    changeDirection: 'up',
    geoSignalTone: pasarTones.positive,
    geoSignalText: '↑ Naik di S2 & S3',
    geoSignalDetail:
      'Geopolitical Signal\n\n' +
      'Sektor pertahanan naik ketika eskalasi terjadi karena anggaran ' +
      'militer naik. S2 (forced alignment): +15%. S3 (insiden laut): +25%. ' +
      'Korelasi positif dengan ketegangan geopolitik.',
    sparkline: [0.3, 0.4, 0.45, 0.55, 0.6, 0.7, 0.8, 0.9],
    affectedByNatuna: true,
    affectedByTaiwan: true,
  },

  // ─── Kurs & Mata Uang ───
  {
    symbol: 'IDR',
    name: 'USD/IDR',
    category: 'kurs',
    subtitle: 'Rupiah — sangat sensitif geopolitik',
    iconLabel: 'IDR',
    iconFg: '#3FB950',
    iconBg: '#0D2818',
    price: '15.425',
    change: '+125',
    changeDirection: 'down',
    geoSignalTone: pasarTones.negative,
    geoSignalText: '↓ Downside risk: 17.500',
    geoSignalDetail:
      'Geopolitical Signal\n\n' +
      'S1 (43%): stabil 15.000–15.500 · S2 (29%): 16.500+ · S3 (15%): ' +
      '17.000–17.500 · S4 (9%): 14.800. Weighted expected: 15.380. IDR ' +
      'adalah barometer paling cepat terhadap perubahan sentimen geopolitik.',
    sparkline: [0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75],
    affectedByNatuna: true,
    affectedByTaiwan: true,
  },
  {
    symbol: 'CNY',
    name: 'USD/CNY',
    category: 'kurs',
    subtitle: 'Yuan China — terkait erat LCS & Taiwan',
    iconLabel: 'CNY',
    iconFg: '#4493F8',
    iconBg: '#1A2740',
    price: '7.248',
    change: '−0.3%',
    changeDirection: 'down',
    geoSignalTone: pasarTones.warning,
    geoSignalText: '! Pantau Taiwan TDI',
    geoSignalDetail:
      'Geopolitical Signal (Taiwan + TDI)\n\n' +
      'Jika TDI naik dan Taiwan S2 terpicu (blokade): CNY tertekan karena ' +
      'capital outflow dari China. Jika de-eskalasi: CNY menguat. Indikator ' +
      'leading untuk sentimen risiko China.',
    sparkline: [0.5, 0.52, 0.5, 0.48, 0.5, 0.49, 0.5, 0.48],
    affectedByNatuna: false,
    affectedByTaiwan: true,
  },
  {
    symbol: 'JPY',
    name: 'USD/JPY',
    category: 'kurs',
    subtitle: 'Yen Jepang — safe haven Asia',
    iconLabel: 'JPY',
    iconFg: '#E3B341',
    iconBg: '#2D1B00',
    price: '149.8',
    change: '+0.4%',
    changeDirection: 'up',
    geoSignalTone: pasarTones.positive,
    geoSignalText: '↑ Safe haven aktif',
    geoSignalDetail:
      'Geopolitical Signal\n\n' +
      'JPY menguat saat ketegangan naik — investor global lari ke aset ' +
      'aman. Jika S3 (insiden Natuna) atau S2 (blokade Taiwan) terpicu: ' +
      'JPY rally 3–8%. Leading indicator ketakutan pasar global.',
    sparkline: [0.4, 0.42, 0.45, 0.5, 0.55, 0.6, 0.62, 0.65],
    affectedByNatuna: true,
    affectedByTaiwan: true,
  },

  // ─── Komoditas ───
  {
    symbol: 'XAU',
    name: 'Emas (Gold)',
    category: 'komoditas',
    subtitle: 'Safe haven terbaik semua skenario',
    iconLabel: 'XAU',
    iconFg: '#E3B341',
    iconBg: '#2D1B00',
    price: '$3.324',
    change: '+0.8%',
    changeDirection: 'up',
    geoSignalTone: pasarTones.positive,
    geoSignalText: '↑ Naik di semua skenario negatif',
    geoSignalDetail:
      'Geopolitical Signal — Optimal Hedge\n\n' +
      'S1 (43%): netral · S2 (29%): +8–12% · S3 (15%): +15–20% · S4 (9%): ' +
      'sedikit turun · S5 (4%): +25%+. Emas adalah satu-satunya aset yang ' +
      'naik di seluruh skenario negatif secara bersamaan.',
    sparkline: [0.5, 0.55, 0.6, 0.62, 0.68, 0.72, 0.78, 0.82],
    affectedByNatuna: true,
    affectedByTaiwan: true,
  },
  {
    symbol: 'NKL',
    name: 'Nikel (LME)',
    category: 'komoditas',
    subtitle: 'Pivot point Natuna — mendekati $12k',
    iconLabel: 'NKL',
    iconFg: '#3FB950',
    iconBg: '#0D2818',
    price: '$12.840',
    change: '−3.1%',
    changeDirection: 'down',
    geoSignalTone: pasarTones.negative,
    geoSignalText: '⚠ Mendekati Tripwire TW-02',
    geoSignalDetail:
      'Tripwire TW-02 aktif (Lapisan C)\n\n' +
      'Nikel <$12k = Shock Multiplier naik lagi + RFS Indonesia naik +2 ' +
      'poin. Ini adalah Pivot Watch item kritis — jika terpicu, distribusi ' +
      'probabilitas semua skenario bermutasi otomatis.',
    sparkline: [0.7, 0.65, 0.6, 0.5, 0.45, 0.4, 0.35, 0.3],
    affectedByNatuna: true,
    affectedByTaiwan: false,
  },
  {
    symbol: 'WTI',
    name: 'Minyak Mentah (WTI)',
    category: 'komoditas',
    subtitle: 'Naik saat jalur LCS terganggu',
    iconLabel: 'CL',
    iconFg: '#E3B341',
    iconBg: '#1A1208',
    price: '$79.4',
    change: '+1.4%',
    changeDirection: 'up',
    geoSignalTone: pasarTones.positive,
    geoSignalText: '↑ LCS escalation premium',
    geoSignalDetail:
      'Geopolitical Signal (LCS)\n\n' +
      '30% perdagangan dunia lewat LCS. Jika frozen conflict berlanjut: ' +
      'harga naik 5–10% karena risk premium. Jika insiden militer terjadi: ' +
      'naik 20–35% seketika karena gangguan supply.',
    sparkline: [0.45, 0.48, 0.5, 0.55, 0.58, 0.6, 0.63, 0.66],
    affectedByNatuna: false,
    affectedByTaiwan: false,
  },
  {
    symbol: 'WHT',
    name: 'Gandum (Wheat)',
    category: 'komoditas',
    subtitle: 'El Niño + LCS supply chain',
    iconLabel: 'WHT',
    iconFg: '#E3B341',
    iconBg: '#1A1208',
    price: '$5.42',
    change: '+2.1%',
    changeDirection: 'up',
    geoSignalTone: pasarTones.warning,
    geoSignalText: '! Shock Multiplier aktif',
    geoSignalDetail:
      'Systemic Shock × Geopolitical (Layer M)\n\n' +
      'El Niño mengurangi pasokan global + LCS disruption mengganggu ' +
      'pengiriman. Kombinasi = risiko pangan naik. Jika kedua faktor ' +
      'memuncak bersamaan: gandum +15–25%.',
    sparkline: [0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75],
    affectedByNatuna: false,
    affectedByTaiwan: false,
  },

  // ─── Crypto ───
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    category: 'crypto',
    subtitle: 'Risk-off di S2 & S3 — hedge di siber',
    iconLabel: 'BTC',
    iconFg: '#9B59B6',
    iconBg: '#201030',
    price: '$103.4k',
    change: '−1.8%',
    changeDirection: 'down',
    geoSignalTone: pasarTones.warning,
    geoSignalText: '! Mixed — tergantung skenario',
    geoSignalDetail:
      'Geopolitical Signal\n\n' +
      'S1 (43%): netral · S2 (29%): turun (risk-off, investor jual) · S3 ' +
      '(15%): turun tajam · Skenario siber: naik (hedge infrastruktur). ' +
      'BTC bukan safe haven saat geopolitik — reaksi seperti saham berisiko tinggi.',
    sparkline: [0.6, 0.65, 0.55, 0.6, 0.5, 0.45, 0.5, 0.42],
    affectedByNatuna: false,
    affectedByTaiwan: true,
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    category: 'crypto',
    subtitle: 'Lebih volatil dari BTC saat krisis',
    iconLabel: 'ETH',
    iconFg: '#9B59B6',
    iconBg: '#201030',
    price: '$2.487',
    change: '−2.4%',
    changeDirection: 'down',
    geoSignalTone: pasarTones.negative,
    geoSignalText: '↓ Lebih sensitif dari BTC',
    geoSignalDetail:
      'Geopolitical Signal (Taiwan)\n\n' +
      'Jika Taiwan S2 (chip shortage): infrastruktur blockchain ikut ' +
      'terdampak — server, mining hardware semua pakai chip Taiwan. ETH ' +
      'lebih terdampak dari BTC karena proof-of-stake memerlukan lebih ' +
      'banyak komputasi.',
    sparkline: [0.6, 0.62, 0.5, 0.55, 0.45, 0.4, 0.42, 0.35],
    affectedByNatuna: false,
    affectedByTaiwan: true,
  },
];
