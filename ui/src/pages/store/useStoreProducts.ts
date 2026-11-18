import { useEffect, useState } from 'react';
import { getProducts } from '../../services/productsApi';
import type { FilterOptions, ProductListResponse } from '../../types/product';
import type { FilterLabels } from './filterGroups';

type RequestState = {
  query: string;
  data?: ProductListResponse;
  error?: string;
  pending: boolean;
};

function rememberFilterLabels(previous: FilterLabels, filters: FilterOptions): FilterLabels {
  const next = { ...previous };
  for (const [name, options] of Object.entries(filters)) {
    for (const option of options) next[`${name}:${option.value}`] = option.label;
  }
  return next;
}

export function useStoreProducts(query: string) {
  const [state, setState] = useState<RequestState>({ query, pending: true });
  const [labels, setLabels] = useState<FilterLabels>({});
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const data = await getProducts(query, controller.signal);
        if (controller.signal.aborted) return;
        setState({ query, data, pending: false });
        setLabels((previous) => rememberFilterLabels(previous, data.filters));
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : 'Could not load products. Please try again.';
        setState((previous) => ({ query, data: previous.data, pending: false, error: message }));
      }
    }

    setState((previous) => ({ query, data: previous.data, pending: true }));
    loadProducts();
    return () => controller.abort();
  }, [query, attempt]);

  const isCurrent = state.query === query;

  return {
    data: state.data,
    loading: state.pending || !isCurrent,
    error: isCurrent ? state.error : undefined,
    labels,
    retry: () => setAttempt(attempt + 1),
  };
}
