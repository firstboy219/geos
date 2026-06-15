/** Treasury (user assets) — types, labels, demo fallback, formatting (F4). */

export interface AssetView {
  id: string;
  asset_type: string;
  name: string;
  symbol: string | null;
  quantity: number;
  currency: string;
  buy_date: string | null;
  buy_price: number;
  current_price: number;
  buy_value: number;
  current_value: number;
  gain_value: number;
  gain_pct: number;
  direction: "up" | "down" | "neutral";
}

export interface TreasuryData {
  items: AssetView[];
  total_buy_value: number;
  total_current_value: number;
  total_gain_value: number;
  total_gain_pct: number;
}

/** asset_type → {label, icon (Material Symbol)} */
export const ASSET_TYPES: { value: string; label: string; icon: string }[] = [
  { value: "house", label: "Rumah", icon: "home" },
  { value: "land", label: "Tanah", icon: "landscape" },
  { value: "car", label: "Mobil", icon: "directions_car" },
  { value: "stock", label: "Saham", icon: "trending_up" },
  { value: "crypto", label: "Crypto", icon: "currency_bitcoin" },
  { value: "forex", label: "Forex / Uang", icon: "payments" },
  { value: "gold", label: "Emas", icon: "toll" },
  { value: "silver", label: "Perak", icon: "radio_button_unchecked" },
  { value: "diamond", label: "Berlian", icon: "diamond" },
  { value: "cash", label: "Tunai", icon: "account_balance_wallet" },
  { value: "other", label: "Lainnya", icon: "category" },
];

export function assetMeta(type: string) {
  return ASSET_TYPES.find((t) => t.value === type) ?? ASSET_TYPES[ASSET_TYPES.length - 1];
}

/** Compact IDR-ish currency: 1.5 M, 250 jt, 12 rb. */
export function fmtMoney(n: number, currency = "IDR"): string {
  const sign = n < 0 ? "-" : "";
  const v = Math.abs(n);
  const unit =
    v >= 1e12 ? [v / 1e12, "T"] : v >= 1e9 ? [v / 1e9, "M"] :
    v >= 1e6 ? [v / 1e6, "jt"] : v >= 1e3 ? [v / 1e3, "rb"] : [v, ""];
  const [num, suf] = unit as [number, string];
  const body = suf ? `${num.toFixed(num >= 100 ? 0 : 1)} ${suf}` : num.toFixed(0);
  return `${sign}${currency === "IDR" ? "Rp" : currency + " "}${body}`;
}

export const DEMO_TREASURY: TreasuryData = {
  items: [
    { id: "d1", asset_type: "house", name: "Rumah Surabaya", symbol: null, quantity: 1, currency: "IDR", buy_date: "2021-01-01", buy_price: 1_200_000_000, current_price: 1_500_000_000, buy_value: 1_200_000_000, current_value: 1_500_000_000, gain_value: 300_000_000, gain_pct: 25, direction: "up" },
    { id: "d2", asset_type: "car", name: "Toyota Avanza", symbol: null, quantity: 1, currency: "IDR", buy_date: "2022-06-01", buy_price: 250_000_000, current_price: 200_000_000, buy_value: 250_000_000, current_value: 200_000_000, gain_value: -50_000_000, gain_pct: -20, direction: "down" },
    { id: "d3", asset_type: "gold", name: "Emas Antam", symbol: "XAU", quantity: 50, currency: "IDR", buy_date: "2023-01-01", buy_price: 1_000_000, current_price: 1_300_000, buy_value: 50_000_000, current_value: 65_000_000, gain_value: 15_000_000, gain_pct: 30, direction: "up" },
  ],
  total_buy_value: 1_500_000_000,
  total_current_value: 1_765_000_000,
  total_gain_value: 265_000_000,
  total_gain_pct: 17.67,
};
