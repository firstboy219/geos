import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import {
  parsePortfolioAsset,
  unwrapList,
  type PortfolioAssetDto,
} from '@/models/api';

import { createResourceContext, type ResourceState } from './createResourceContext';

const resource = createResourceContext<PortfolioAssetDto>('Portfolio', async () => {
  const res = await apiClient.get(endpoints.portfolio);
  return unwrapList(res.data).map(parsePortfolioAsset);
});

export const PortfolioProvider = resource.Provider;

export function usePortfolio(): ResourceState<PortfolioAssetDto> {
  return resource.useResource();
}
