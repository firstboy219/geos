import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { parseAlert, unwrapList, type AlertDto } from '@/models/api';

import { createResourceContext, type ResourceState } from './createResourceContext';

const resource = createResourceContext<AlertDto>('Alert', async () => {
  const res = await apiClient.get(endpoints.alerts);
  return unwrapList(res.data).map(parseAlert);
});

export const AlertProvider = resource.Provider;

export function useAlerts(): ResourceState<AlertDto> {
  return resource.useResource();
}
