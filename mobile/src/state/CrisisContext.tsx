import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { parseCrisis, unwrapList, type CrisisDto } from '@/models/api';

import { createResourceContext, type ResourceState } from './createResourceContext';

const resource = createResourceContext<CrisisDto>('Crisis', async () => {
  const res = await apiClient.get(endpoints.crises);
  return unwrapList(res.data).map(parseCrisis);
});

export const CrisisProvider = resource.Provider;

export function useCrises(): ResourceState<CrisisDto> {
  return resource.useResource();
}
