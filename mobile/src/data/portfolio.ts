/**
 * Dummy portfolio fallback data + presentation helpers.
 *
 * Used when the live `usePortfolio()` resource is empty or errored so the
 * Portfolio screens always render something meaningful. Shapes match the live
 * `PortfolioAssetDto` so the UI is identical for live and fallback rows.
 */
import type { PortfolioAssetDto } from '@/models/api';

/** Asset type options offered in the Add-Asset modal (BAB labels). */
export const ASSET_TYPES = [
  'Saham',
  'Crypto',
  'Emas',
  'Properti',
  'Deposito',
  'Komoditas',
] as const;

export type AssetTypeLabel = (typeof ASSET_TYPES)[number];

/** Maps a backend `asset_type` token to a human label (and back). */
const TYPE_LABELS: Record<string, AssetTypeLabel> = {
  stock: 'Saham',
  saham: 'Saham',
  crypto: 'Crypto',
  gold: 'Emas',
  emas: 'Emas',
  property: 'Properti',
  properti: 'Properti',
  deposit: 'Deposito',
  deposito: 'Deposito',
  commodity: 'Komoditas',
  komoditas: 'Komoditas',
};

export function assetTypeLabel(token: string): AssetTypeLabel {
  return TYPE_LABELS[token.toLowerCase().trim()] ?? 'Saham';
}

/** Maps a human label back to the backend token for POST bodies. */
export function assetTypeToken(label: AssetTypeLabel): string {
  switch (label) {
    case 'Saham':
      return 'stock';
    case 'Crypto':
      return 'crypto';
    case 'Emas':
      return 'gold';
    case 'Properti':
      return 'property';
    case 'Deposito':
      return 'deposit';
    case 'Komoditas':
      return 'commodity';
    default:
      return 'stock';
  }
}

export const FALLBACK_PORTFOLIO: PortfolioAssetDto[] = [
  {
    id: 'demo-bbca',
    assetType: 'stock',
    assetName: 'Bank Central Asia',
    ticker: 'BBCA',
    quantity: 200,
    purchasePrice: 9200,
    currentPrice: 10125,
    currency: 'IDR',
  },
  {
    id: 'demo-medc',
    assetType: 'stock',
    assetName: 'Medco Energi',
    ticker: 'MEDC',
    quantity: 1500,
    purchasePrice: 1280,
    currentPrice: 1185,
    currency: 'IDR',
  },
  {
    id: 'demo-btc',
    assetType: 'crypto',
    assetName: 'Bitcoin',
    ticker: 'BTC',
    quantity: 0.15,
    purchasePrice: 980000000,
    currentPrice: 1060000000,
    currency: 'IDR',
  },
  {
    id: 'demo-gold',
    assetType: 'gold',
    assetName: 'Emas Antam',
    ticker: 'XAU',
    quantity: 50,
    purchasePrice: 1150000,
    currentPrice: 1245000,
    currency: 'IDR',
  },
  {
    id: 'demo-depo',
    assetType: 'deposit',
    assetName: 'Deposito Berjangka',
    ticker: 'DEPO',
    quantity: 1,
    purchasePrice: 50000000,
    currentPrice: 51500000,
    currency: 'IDR',
  },
];

/** Compact IDR currency formatting (no decimals). */
export function formatIdr(value: number): string {
  return `Rp${Math.round(value).toLocaleString('id-ID')}`;
}

/** Abbreviated currency for tight spaces (jt / M). */
export function formatIdrShort(value: number): string {
  if (value >= 1_000_000_000) return `Rp${(value / 1_000_000_000).toFixed(1)}M`;
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `Rp${(value / 1_000).toFixed(0)}rb`;
  return `Rp${Math.round(value)}`;
}

// ── Impact matrix (Portfolio Impact screen) ─────────────────
export interface ImpactScenario {
  key: string;
  label: string;
}

export const IMPACT_SCENARIOS: ImpactScenario[] = [
  { key: 'A', label: 'Status Quo' },
  { key: 'B', label: 'Eskalasi' },
  { key: 'C', label: 'Konfrontasi' },
  { key: 'D', label: 'Konflik' },
  { key: 'E', label: 'De-eskalasi' },
];

export interface RebalanceRecommendation {
  title: string;
  action: 'reduce' | 'increase' | 'hold' | 'hedge';
  detail: string;
}

export const RECOMMENDATIONS: RebalanceRecommendation[] = [
  {
    title: 'Kurangi eksposur teknologi & semikonduktor',
    action: 'reduce',
    detail:
      'Sensitivitas tinggi terhadap skenario Selat Taiwan (C/D). Pangkas 15-20% untuk membatasi tail-risk.',
  },
  {
    title: 'Tambah alokasi emas / safe-haven',
    action: 'increase',
    detail:
      'Emas memberikan lindung nilai positif di hampir semua skenario eskalasi. Naikkan menuju 12% portofolio.',
  },
  {
    title: 'Lindung nilai eksposur rupiah',
    action: 'hedge',
    detail:
      'Rupiah melemah pada skenario risk-off. Pertimbangkan instrumen lindung nilai USD parsial.',
  },
  {
    title: 'Pertahankan inti perbankan domestik',
    action: 'hold',
    detail:
      'Eksposur tidak langsung dan fundamental solid. Tahan posisi inti perbankan sebagai jangkar stabilitas.',
  },
];
