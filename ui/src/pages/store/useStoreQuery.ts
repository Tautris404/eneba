import { useCallback, useEffect, useState } from 'react';
import { storeQueryChangeEvent } from '../../utils/storeLinks';

export function useStoreQuery() {
  const [query, setQuery] = useState(() => window.location.search.slice(1));

  useEffect(() => {
    function readQueryFromUrl() {
      setQuery(window.location.search.slice(1));
    }
    window.addEventListener('popstate', readQueryFromUrl);
    return () => window.removeEventListener('popstate', readQueryFromUrl);
  }, []);

  const updateQuery = useCallback((update: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(window.location.search);
    update(params);
    const nextQuery = params.toString();
    if (nextQuery === window.location.search.slice(1)) return;
    window.history.pushState(null, '', `/store/all${nextQuery ? `?${nextQuery}` : ''}`);
    setQuery(nextQuery);
    window.dispatchEvent(new Event(storeQueryChangeEvent));
  }, []);

  return { query, params: new URLSearchParams(query), updateQuery };
}
