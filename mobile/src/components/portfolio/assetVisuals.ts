import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { colors } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/** Icon + accent color for each backend asset_type token. */
export function assetVisual(assetType: string): { icon: IoniconName; color: string } {
  switch (assetType.toLowerCase().trim()) {
    case 'crypto':
      return { icon: 'logo-bitcoin', color: colors.warning };
    case 'gold':
    case 'emas':
      return { icon: 'diamond-outline', color: colors.warning };
    case 'property':
    case 'properti':
      return { icon: 'business-outline', color: colors.accent };
    case 'deposit':
    case 'deposito':
      return { icon: 'cash-outline', color: colors.success };
    case 'commodity':
    case 'komoditas':
      return { icon: 'cube-outline', color: colors.purple };
    case 'stock':
    case 'saham':
    default:
      return { icon: 'trending-up-outline', color: colors.accent };
  }
}
