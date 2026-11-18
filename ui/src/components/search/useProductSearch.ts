import { useEffect, useState } from 'react';
import { searchProducts } from '../../services/productsApi';
import type { SearchProduct } from '../../types/product';

const minimumSearchLength = 3;
const searchDelayMs = 180;

type SearchResult = {
  term: string;
  products: SearchProduct[];
  failed: boolean;
};

export function useProductSearch(term: string, open: boolean) {
  const [result, setResult] = useState<SearchResult>();
  const searching = Array.from(term).length >= minimumSearchLength;
  const currentResult = result?.term === term ? result : undefined;

  useEffect(() => {
    if (!open || !searching) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const products = await searchProducts(term, controller.signal);
        if (!controller.signal.aborted) setResult({ term, products, failed: false });
      } catch {
        if (!controller.signal.aborted) setResult({ term, products: [], failed: true });
      }
    }, searchDelayMs);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, searching, term]);

  return {
    result: currentResult,
    loading: open && searching && !currentResult,
    searching,
  };
}
