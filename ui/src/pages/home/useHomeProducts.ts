import { useEffect, useState } from 'react';
import { getProducts } from '../../services/productsApi';
import type { ProductListResponse } from '../../types/product';

const shelfSize = 12;

export function useHomeProducts(storeHref: string) {
  const [data, setData] = useState<ProductListResponse>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const query = new URL(storeHref, window.location.origin).searchParams;
    query.set('page_size', String(shelfSize));

    async function loadProducts() {
      try {
        const result = await getProducts(query.toString(), controller.signal);
        if (!controller.signal.aborted) setData(result);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    }

    loadProducts();
    return () => controller.abort();
  }, [storeHref]);

  return { data, failed };
}
