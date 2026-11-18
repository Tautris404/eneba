import { useEffect, useState } from 'react';

export function useHomeData<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const result = await load(controller.signal);
        if (!controller.signal.aborted) setData(result);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    }

    loadData();
    return () => controller.abort();
  }, [load]);

  return { data, failed };
}
