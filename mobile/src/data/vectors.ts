/**
 * Dummy crisis / impact-vector data for the Vectors feature.
 *
 * These mirror the backend `CrisisDto` / `ScenarioDto` shapes but carry the
 * richer presentation fields the Vectors screens render (impact-vector bars,
 * key indicators, layer chips, asset-impact rows). Numbers are kept internally
 * consistent (scenario probabilities sum to ~100% per crisis).
 */

export type ImpactDirection = 'up' | 'down' | 'flat';

export interface LayerChipData {
  code: string;
  label: string;
  tooltip: string;
  color?: string;
}

export interface ImpactVectorBar {
  /** e.g. "Escalation", "Hybridization", "Duration". */
  label: string;
  /** 0..1 normalised fill. */
  value: number;
  /** Short qualitative tag, e.g. "High", "Rising". */
  tag: string;
  tone: 'positive' | 'warning' | 'negative' | 'accent' | 'critical' | 'neutral';
}

export interface KeyIndicator {
  label: string;
  detail: string;
  tone: 'positive' | 'warning' | 'negative' | 'accent' | 'critical' | 'neutral';
}

export interface ScenarioData {
  /** Single letter A..E. */
  key: string;
  name: string;
  /** 0..1 probability. */
  probability: number;
  /** Escalation ladder rung (1..10+). */
  rung: number;
  /** Narrative shown on the dark-blue panel. */
  narrative: string;
  vectors: ImpactVectorBar[];
  indicators: KeyIndicator[];
}

export interface AssetImpactData {
  ticker: string;
  name: string;
  direction: ImpactDirection;
  /** e.g. "+8%" / "-12%" / "0%". */
  magnitude: string;
  rationale: string;
}

export interface CrisisData {
  id: string;
  title: string;
  subtitle: string;
  region: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  /** Headline stats. */
  tripwires: number;
  actors: number;
  /** Relative "last update" label. */
  lastUpdate: string;
  scenarioCount: number;
  layers: LayerChipData[];
  scenarios: ScenarioData[];
  assetImpacts: AssetImpactData[];
}

const COMMON_LAYERS = (extra: LayerChipData[] = []): LayerChipData[] => [
  {
    code: 'A',
    label: 'Redline',
    tooltip:
      'Redline Index — proximity to a declared or implicit red line that, if crossed, triggers escalation.',
  },
  {
    code: 'K',
    label: 'CSI',
    tooltip:
      'Crisis Stability Index — composite measure of how stable the standoff is against accidental escalation.',
  },
  {
    code: 'M',
    label: 'Misread',
    tooltip:
      'Misread Score — likelihood that one actor misinterprets the intent of another, raising the chance of inadvertent conflict.',
  },
  ...extra,
];

export const CRISES: CrisisData[] = [
  {
    id: 'natuna-zee',
    title: 'Natuna ZEE',
    subtitle: 'Indonesia EEZ — fishing & survey incursions',
    region: 'Laut Natuna Utara',
    risk: 'medium',
    tripwires: 6,
    actors: 4,
    lastUpdate: '2 jam lalu',
    scenarioCount: 5,
    layers: COMMON_LAYERS([
      {
        code: 'G',
        label: 'GrayZone',
        tooltip:
          'Gray-Zone Indicator — coercion below the threshold of open conflict (militia vessels, survey ships).',
        color: '#9B59B6',
      },
    ]),
    scenarios: [
      {
        key: 'A',
        name: 'Status Quo Patroli',
        probability: 0.41,
        rung: 2,
        narrative:
          'Bakamla dan TNI AL mempertahankan patroli rutin. Kapal nelayan asing didampingi keluar ZEE tanpa insiden. Tekanan diplomatik tetap rendah dan jalur ekonomi maritim tidak terganggu.',
        vectors: [
          { label: 'Escalation', value: 0.25, tag: 'Rendah', tone: 'positive' },
          { label: 'Hybridization', value: 0.45, tag: 'Sedang', tone: 'warning' },
          { label: 'Duration', value: 0.7, tag: 'Berlarut', tone: 'warning' },
        ],
        indicators: [
          { label: 'Frekuensi patroli', detail: 'Stabil', tone: 'positive' },
          { label: 'Kapal militia', detail: 'Terpantau', tone: 'warning' },
          { label: 'Nada diplomatik', detail: 'Tenang', tone: 'positive' },
        ],
      },
      {
        key: 'B',
        name: 'Eskalasi Survei Sepihak',
        probability: 0.27,
        rung: 4,
        narrative:
          'Kapal survei asing memasuki blok migas dengan pengawalan coast guard. Indonesia melayangkan nota protes dan menambah aset patroli. Premi risiko energi regional naik.',
        vectors: [
          { label: 'Escalation', value: 0.55, tag: 'Sedang', tone: 'warning' },
          { label: 'Hybridization', value: 0.65, tag: 'Tinggi', tone: 'negative' },
          { label: 'Duration', value: 0.5, tag: 'Sedang', tone: 'warning' },
        ],
        indicators: [
          { label: 'Aktivitas survei', detail: 'Meningkat', tone: 'negative' },
          { label: 'Nota diplomatik', detail: 'Dilayangkan', tone: 'warning' },
          { label: 'Premi energi', detail: '+ Naik', tone: 'warning' },
        ],
      },
      {
        key: 'C',
        name: 'Konfrontasi Coast Guard',
        probability: 0.18,
        rung: 6,
        narrative:
          'Manuver berbahaya antara coast guard memicu tabrakan ringan. Liputan media masif dan eskalasi retorika. Pasar saham dan rupiah bereaksi negatif jangka pendek.',
        vectors: [
          { label: 'Escalation', value: 0.75, tag: 'Tinggi', tone: 'negative' },
          { label: 'Hybridization', value: 0.6, tag: 'Tinggi', tone: 'negative' },
          { label: 'Duration', value: 0.4, tag: 'Singkat', tone: 'accent' },
        ],
        indicators: [
          { label: 'Manuver berbahaya', detail: 'Terjadi', tone: 'negative' },
          { label: 'Retorika', detail: 'Meningkat tajam', tone: 'negative' },
          { label: 'Reaksi pasar', detail: 'Negatif', tone: 'negative' },
        ],
      },
      {
        key: 'D',
        name: 'Insiden Bersenjata Terbatas',
        probability: 0.1,
        rung: 8,
        narrative:
          'Tembakan peringatan mengenai lambung kapal. Korban luka dilaporkan. Krisis diplomatik penuh; asuransi pelayaran melonjak dan rute dialihkan.',
        vectors: [
          { label: 'Escalation', value: 0.88, tag: 'Sangat tinggi', tone: 'critical' },
          { label: 'Hybridization', value: 0.4, tag: 'Menurun', tone: 'accent' },
          { label: 'Duration', value: 0.6, tag: 'Sedang', tone: 'warning' },
        ],
        indicators: [
          { label: 'Penggunaan senjata', detail: 'Terbatas', tone: 'critical' },
          { label: 'Krisis diplomatik', detail: 'Penuh', tone: 'critical' },
          { label: 'Asuransi pelayaran', detail: '++ Melonjak', tone: 'negative' },
        ],
      },
      {
        key: 'E',
        name: 'De-eskalasi Ternegosiasi',
        probability: 0.04,
        rung: 1,
        narrative:
          'Kanal hotline diaktifkan; kedua pihak menarik aset dan menyepakati kode perilaku maritim. Risiko regional turun tajam dan pasar pulih.',
        vectors: [
          { label: 'Escalation', value: 0.1, tag: 'Sangat rendah', tone: 'positive' },
          { label: 'Hybridization', value: 0.2, tag: 'Rendah', tone: 'positive' },
          { label: 'Duration', value: 0.3, tag: 'Singkat', tone: 'accent' },
        ],
        indicators: [
          { label: 'Hotline', detail: 'Aktif', tone: 'positive' },
          { label: 'Kode perilaku', detail: 'Disepakati', tone: 'positive' },
          { label: 'Pemulihan pasar', detail: 'Kuat', tone: 'positive' },
        ],
      },
    ],
    assetImpacts: [
      { ticker: 'MEDC', name: 'Medco Energi', direction: 'down', magnitude: '-9%', rationale: 'Eksposur blok migas Natuna; risiko gangguan survei & produksi.' },
      { ticker: 'PGAS', name: 'Perusahaan Gas Negara', direction: 'down', magnitude: '-5%', rationale: 'Sensitivitas rantai pasok gas regional.' },
      { ticker: 'ANTM', name: 'Aneka Tambang', direction: 'flat', magnitude: '0%', rationale: 'Eksposur tidak langsung; sentimen risiko ringan.' },
      { ticker: 'USD/IDR', name: 'Rupiah', direction: 'up', magnitude: '+1.2%', rationale: 'Pelarian ke safe-haven menekan rupiah saat eskalasi.' },
    ],
  },
  {
    id: 'south-china-sea',
    title: 'South China Sea',
    subtitle: 'Spratly & Scarborough — overlapping claims',
    region: 'Laut China Selatan',
    risk: 'high',
    tripwires: 11,
    actors: 7,
    lastUpdate: '38 menit lalu',
    scenarioCount: 5,
    layers: COMMON_LAYERS([
      {
        code: 'O',
        label: 'OpTempo',
        tooltip:
          'Operational Tempo — intensity and frequency of military operations in the theatre.',
        color: '#E3B341',
      },
      {
        code: 'C',
        label: 'Coalition',
        tooltip:
          'Coalition Signal — degree of allied alignment (FONOPs, joint patrols) shaping the standoff.',
        color: '#4493F8',
      },
    ]),
    scenarios: [
      {
        key: 'A',
        name: 'Gray-Zone Berlanjut',
        probability: 0.38,
        rung: 3,
        narrative:
          'Militia maritim dan coast guard mempertahankan kehadiran di terumbu sengketa. FONOPs sekutu rutin. Ketegangan tinggi namun terkelola; pasar memperhitungkan premi risiko tetap.',
        vectors: [
          { label: 'Escalation', value: 0.5, tag: 'Sedang', tone: 'warning' },
          { label: 'Hybridization', value: 0.8, tag: 'Sangat tinggi', tone: 'critical' },
          { label: 'Duration', value: 0.85, tag: 'Berlarut', tone: 'negative' },
        ],
        indicators: [
          { label: 'Militia maritim', detail: 'Hadir tetap', tone: 'warning' },
          { label: 'FONOPs sekutu', detail: 'Rutin', tone: 'accent' },
          { label: 'Premi risiko', detail: 'Stabil tinggi', tone: 'warning' },
        ],
      },
      {
        key: 'B',
        name: 'Blokade Resupply',
        probability: 0.26,
        rung: 5,
        narrative:
          'Coast guard menghalangi misi resupply ke pos terdepan. Konfrontasi water-cannon. Tekanan diplomatik internasional meningkat dan rantai pasok semikonduktor diawasi ketat.',
        vectors: [
          { label: 'Escalation', value: 0.68, tag: 'Tinggi', tone: 'negative' },
          { label: 'Hybridization', value: 0.7, tag: 'Tinggi', tone: 'negative' },
          { label: 'Duration', value: 0.55, tag: 'Sedang', tone: 'warning' },
        ],
        indicators: [
          { label: 'Blokade resupply', detail: 'Aktif', tone: 'negative' },
          { label: 'Tekanan internasional', detail: 'Meningkat', tone: 'warning' },
          { label: 'Rantai semikonduktor', detail: 'Diawasi', tone: 'warning' },
        ],
      },
      {
        key: 'C',
        name: 'Insiden Udara-Laut',
        probability: 0.2,
        rung: 7,
        narrative:
          'Intersepsi jet tempur jarak dekat dan manuver kapal berisiko tinggi. Risiko salah-baca melonjak. Volatilitas pasar Asia naik signifikan, energi dan logistik terpukul.',
        vectors: [
          { label: 'Escalation', value: 0.8, tag: 'Tinggi', tone: 'negative' },
          { label: 'Hybridization', value: 0.5, tag: 'Sedang', tone: 'warning' },
          { label: 'Duration', value: 0.45, tag: 'Singkat', tone: 'accent' },
        ],
        indicators: [
          { label: 'Intersepsi udara', detail: 'Jarak dekat', tone: 'negative' },
          { label: 'Risiko salah-baca', detail: 'Melonjak', tone: 'critical' },
          { label: 'Volatilitas Asia', detail: '++ Naik', tone: 'negative' },
        ],
      },
      {
        key: 'D',
        name: 'Bentrokan Bersenjata',
        probability: 0.12,
        rung: 9,
        narrative:
          'Pertukaran tembakan terbatas dengan korban. Aktivasi kewajiban aliansi dibahas. Pasar global risk-off tajam; minyak melonjak dan ekuitas terkoreksi.',
        vectors: [
          { label: 'Escalation', value: 0.92, tag: 'Sangat tinggi', tone: 'critical' },
          { label: 'Hybridization', value: 0.35, tag: 'Menurun', tone: 'accent' },
          { label: 'Duration', value: 0.6, tag: 'Sedang', tone: 'warning' },
        ],
        indicators: [
          { label: 'Pertukaran tembakan', detail: 'Terbatas', tone: 'critical' },
          { label: 'Kewajiban aliansi', detail: 'Dibahas', tone: 'critical' },
          { label: 'Pasar global', detail: 'Risk-off tajam', tone: 'negative' },
        ],
      },
      {
        key: 'E',
        name: 'Manajemen Krisis',
        probability: 0.04,
        rung: 2,
        narrative:
          'Pertemuan darurat tingkat tinggi menyepakati mekanisme pencegahan insiden. De-eskalasi bertahap; pasar melepas sebagian premi risiko.',
        vectors: [
          { label: 'Escalation', value: 0.2, tag: 'Rendah', tone: 'positive' },
          { label: 'Hybridization', value: 0.4, tag: 'Sedang', tone: 'warning' },
          { label: 'Duration', value: 0.4, tag: 'Singkat', tone: 'accent' },
        ],
        indicators: [
          { label: 'Pertemuan darurat', detail: 'Disepakati', tone: 'positive' },
          { label: 'Mekanisme cegah-insiden', detail: 'Dibentuk', tone: 'positive' },
          { label: 'Premi risiko', detail: 'Turun', tone: 'positive' },
        ],
      },
    ],
    assetImpacts: [
      { ticker: 'TSM', name: 'TSMC', direction: 'down', magnitude: '-14%', rationale: 'Episentrum risiko rantai pasok semikonduktor.' },
      { ticker: 'BRENT', name: 'Brent Crude', direction: 'up', magnitude: '+11%', rationale: 'Jalur pelayaran energi terancam; premi risiko naik.' },
      { ticker: 'BABA', name: 'Alibaba', direction: 'down', magnitude: '-8%', rationale: 'Sentimen ekuitas China di bawah tekanan eskalasi.' },
      { ticker: 'GOLD', name: 'Emas', direction: 'up', magnitude: '+6%', rationale: 'Aliran safe-haven saat ketegangan memuncak.' },
    ],
  },
  {
    id: 'taiwan-strait',
    title: 'Taiwan Strait',
    subtitle: 'Cross-strait deterrence & blockade risk',
    region: 'Selat Taiwan',
    risk: 'critical',
    tripwires: 14,
    actors: 6,
    lastUpdate: '12 menit lalu',
    scenarioCount: 5,
    layers: COMMON_LAYERS([
      {
        code: 'D',
        label: 'Deterrence',
        tooltip:
          'Deterrence Posture — credibility of the deterrent threat keeping the status quo in place.',
        color: '#4493F8',
      },
      {
        code: 'N',
        label: 'Nuclear',
        tooltip:
          'Nuclear Signal — any signalling involving strategic forces; raises the ceiling of escalation risk.',
        color: '#9B59B6',
      },
    ]),
    scenarios: [
      {
        key: 'A',
        name: 'Tekanan Berkelanjutan',
        probability: 0.34,
        rung: 4,
        narrative:
          'Penerbangan melintasi garis tengah dan latihan rutin berskala besar berlanjut. Deterrence sekutu kredibel. Status quo tegang dipertahankan; pasar memantau ketat.',
        vectors: [
          { label: 'Escalation', value: 0.6, tag: 'Sedang', tone: 'warning' },
          { label: 'Hybridization', value: 0.75, tag: 'Tinggi', tone: 'negative' },
          { label: 'Duration', value: 0.8, tag: 'Berlarut', tone: 'negative' },
        ],
        indicators: [
          { label: 'Lintas garis tengah', detail: 'Sering', tone: 'warning' },
          { label: 'Deterrence sekutu', detail: 'Kredibel', tone: 'accent' },
          { label: 'Status quo', detail: 'Tegang', tone: 'warning' },
        ],
      },
      {
        key: 'B',
        name: 'Karantina Bea Cukai',
        probability: 0.25,
        rung: 6,
        narrative:
          'Inspeksi "bea cukai" terhadap kapal menuju pelabuhan utama. Karantina de-facto sebagian. Asuransi dan tarif angkut melonjak; ekuitas regional tertekan.',
        vectors: [
          { label: 'Escalation', value: 0.72, tag: 'Tinggi', tone: 'negative' },
          { label: 'Hybridization', value: 0.82, tag: 'Sangat tinggi', tone: 'critical' },
          { label: 'Duration', value: 0.6, tag: 'Sedang', tone: 'warning' },
        ],
        indicators: [
          { label: 'Inspeksi kapal', detail: 'Dimulai', tone: 'negative' },
          { label: 'Karantina de-facto', detail: 'Sebagian', tone: 'critical' },
          { label: 'Tarif angkut', detail: '++ Naik', tone: 'negative' },
        ],
      },
      {
        key: 'C',
        name: 'Blokade Penuh',
        probability: 0.22,
        rung: 8,
        narrative:
          'Blokade maritim-udara menyeluruh diumumkan. Rantai pasok global terganggu parah; semikonduktor langka. Pasar mengalami guncangan tajam lintas aset.',
        vectors: [
          { label: 'Escalation', value: 0.85, tag: 'Sangat tinggi', tone: 'critical' },
          { label: 'Hybridization', value: 0.6, tag: 'Tinggi', tone: 'negative' },
          { label: 'Duration', value: 0.7, tag: 'Berlarut', tone: 'negative' },
        ],
        indicators: [
          { label: 'Blokade', detail: 'Menyeluruh', tone: 'critical' },
          { label: 'Pasok semikonduktor', detail: 'Langka', tone: 'critical' },
          { label: 'Guncangan pasar', detail: 'Tajam', tone: 'negative' },
        ],
      },
      {
        key: 'D',
        name: 'Konflik Terbuka',
        probability: 0.14,
        rung: 10,
        narrative:
          'Serangan terhadap aset militer dan pendaratan terbatas. Aktivasi aliansi penuh dan sinyal strategis. Pasar global runtuh sementara; safe-haven melonjak ekstrem.',
        vectors: [
          { label: 'Escalation', value: 0.98, tag: 'Maksimum', tone: 'critical' },
          { label: 'Hybridization', value: 0.3, tag: 'Rendah', tone: 'accent' },
          { label: 'Duration', value: 0.75, tag: 'Berlarut', tone: 'negative' },
        ],
        indicators: [
          { label: 'Serangan militer', detail: 'Terjadi', tone: 'critical' },
          { label: 'Aliansi', detail: 'Aktif penuh', tone: 'critical' },
          { label: 'Sinyal strategis', detail: 'Terdeteksi', tone: 'critical' },
        ],
      },
      {
        key: 'E',
        name: 'Penarikan Mundur',
        probability: 0.05,
        rung: 3,
        narrative:
          'Tekanan internasional dan biaya ekonomi memaksa de-eskalasi. Latihan dikurangi dan jalur pelayaran normal. Pasar memantul kuat dari posisi tertekan.',
        vectors: [
          { label: 'Escalation', value: 0.3, tag: 'Rendah', tone: 'positive' },
          { label: 'Hybridization', value: 0.5, tag: 'Sedang', tone: 'warning' },
          { label: 'Duration', value: 0.4, tag: 'Singkat', tone: 'accent' },
        ],
        indicators: [
          { label: 'Tekanan ekonomi', detail: 'Efektif', tone: 'positive' },
          { label: 'Latihan militer', detail: 'Dikurangi', tone: 'positive' },
          { label: 'Pemulihan pasar', detail: 'Kuat', tone: 'positive' },
        ],
      },
    ],
    assetImpacts: [
      { ticker: 'TSM', name: 'TSMC', direction: 'down', magnitude: '-28%', rationale: 'Eksposur langsung; blokade memutus pasokan chip global.' },
      { ticker: 'NVDA', name: 'NVIDIA', direction: 'down', magnitude: '-19%', rationale: 'Ketergantungan fabrikasi di Taiwan.' },
      { ticker: 'GOLD', name: 'Emas', direction: 'up', magnitude: '+15%', rationale: 'Permintaan safe-haven ekstrem saat konflik terbuka.' },
      { ticker: 'JPY', name: 'Yen Jepang', direction: 'up', magnitude: '+7%', rationale: 'Mata uang lindung nilai regional menguat.' },
    ],
  },
];

export function getCrisis(id: string | undefined): CrisisData | undefined {
  return CRISES.find((c) => c.id === id);
}
