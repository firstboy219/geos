import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { parsePasarAsset, unwrapList, type PasarAssetDto } from '@/models/api';

import { createResourceContext, type ResourceState } from './createResourceContext';

const resource = createResourceContext<PasarAssetDto>('Pasar', async () => {
  const res = await apiClient.get(endpoints.pasarAssets);
  return unwrapList(res.data).map(parsePasarAsset);
});

export const PasarProvider = resource.Provider;

export function usePasar(): ResourceState<PasarAssetDto> {
  return resource.useResource();
}
