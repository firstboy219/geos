import { AxiosError } from 'axios';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Factory for a simple "list resource" context: { data, loading, error, fetch }.
 *
 * Mirrors the shape of the Flutter feature providers (CrisisProvider, etc.)
 * without duplicating the boilerplate in each one.
 */
export interface ResourceState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  /** Re-fetches the resource. Resolves to true on success. */
  fetch: () => Promise<boolean>;
}

function messageFor(err: unknown): string {
  if (err instanceof AxiosError) {
    const detail = (err.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === 'string') return detail;
    if (!err.response) return 'Cannot reach the server. Check your connection.';
  }
  return 'Something went wrong. Please try again.';
}

export function createResourceContext<T>(
  displayName: string,
  loader: () => Promise<T[]>,
) {
  const Context = createContext<ResourceState<T> | undefined>(undefined);

  function Provider({ children }: { children: ReactNode }) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async (): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        setData(await loader());
        return true;
      } catch (err) {
        setError(messageFor(err));
        return false;
      } finally {
        setLoading(false);
      }
    }, []);

    const value = useMemo<ResourceState<T>>(
      () => ({ data, loading, error, fetch }),
      [data, loading, error, fetch],
    );

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }
  Provider.displayName = `${displayName}Provider`;

  function useResource(): ResourceState<T> {
    const ctx = useContext(Context);
    if (!ctx) throw new Error(`use${displayName} must be used within ${displayName}Provider`);
    return ctx;
  }

  return { Provider, useResource };
}
