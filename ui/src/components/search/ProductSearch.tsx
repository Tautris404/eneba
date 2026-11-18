import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { phoneLayoutQuery } from '../../utils/breakpoints';
import { storeQueryChangeEvent } from '../../utils/storeLinks';
import { BackArrowIcon, CloseIcon, SearchIcon } from '../ui/Icons';
import { addRecentSearch, readRecentSearches, saveRecentSearches } from './recentSearches';
import { SearchPopup } from './SearchPopup';
import { useProductSearch } from './useProductSearch';
import styles from './ProductSearch.module.css';

function currentStoreSearch() {
  if (!/^\/store(?:\/all)?\/?$/.test(window.location.pathname)) return '';
  return new URLSearchParams(window.location.search).get('search') ?? '';
}

export function ProductSearch() {
  const [value, setValue] = useState(currentStoreSearch);
  const [open, setOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(readRecentSearches);
  const input = useRef<HTMLInputElement>(null);
  const savedScrollY = useRef<number | null>(null);
  const popupId = useId();
  const term = value.trim();
  const { result, loading, searching } = useProductSearch(term, open);
  const visibleRecentSearches = searching
    ? recentSearches.filter((entry) => entry.toLowerCase().startsWith(term.toLowerCase()))
    : recentSearches;

  useEffect(() => {
    function syncWithStorePage() {
      setValue(currentStoreSearch());
    }
    window.addEventListener('popstate', syncWithStorePage);
    window.addEventListener(storeQueryChangeEvent, syncWithStorePage);
    return () => {
      window.removeEventListener('popstate', syncWithStorePage);
      window.removeEventListener(storeQueryChangeEvent, syncWithStorePage);
    };
  }, []);

  useLayoutEffect(() => {
    if (open || savedScrollY.current === null) return;
    window.scrollTo({ top: savedScrollY.current, behavior: 'instant' });
    savedScrollY.current = null;
  }, [open]);

  function updateRecentSearches(terms: string[]) {
    setRecentSearches(terms);
    saveRecentSearches(terms);
  }

  function rememberSearch() {
    if (term) updateRecentSearches(addRecentSearch(recentSearches, term));
  }

  function closeSearch() {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    setOpen(false);
    setValue(currentStoreSearch());
  }

  return (
    <>
      {open && (
        <div
          className={styles.backdrop}
          data-empty={!searching && visibleRecentSearches.length === 0 ? '' : undefined}
          aria-hidden="true"
          onClick={closeSearch}
        />
      )}
      <form
        className={styles.search}
        data-product-search=""
        data-open={open ? '' : undefined}
        action="/store/all"
        method="get"
        aria-busy={loading}
        onSubmit={(event) => {
          if (!term) event.preventDefault();
          else rememberSearch();
        }}
      >
        <label className={styles.searchIcon} htmlFor={`${popupId}-input`}><SearchIcon /></label>
        {open && (
          <button className={styles.mobileBack} type="button" aria-label="Back from search" onClick={closeSearch}>
            <BackArrowIcon />
          </button>
        )}
        <div className={styles.searchField}>
          <input
            ref={input}
            id={`${popupId}-input`}
            type="search"
            name="search"
            aria-label="Search"
            aria-controls={open ? popupId : undefined}
            placeholder="Search for games, top-ups and more"
            autoComplete="off"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onFocus={() => {
              if (!open && window.matchMedia(phoneLayoutQuery).matches) {
                savedScrollY.current = window.scrollY;
              }
              setOpen(true);
            }}
          />
          {open && !value && <span className={styles.mobilePlaceholder} aria-hidden="true">Games, top-ups and more</span>}
          {open && (
            <button className={styles.clear} aria-label="Close search" type="button" onClick={closeSearch}>
              <CloseIcon />
            </button>
          )}
        </div>
        <input type="hidden" name="sort" value="popularity" />
        {open && (
          <SearchPopup
            id={popupId}
            recentSearches={visibleRecentSearches}
            loading={loading}
            products={result?.products ?? []}
            message={result?.failed ? 'Could not load search results.' : ''}
            showResults={result !== undefined}
            noMatches={result !== undefined && !result.failed && result.products.length === 0}
            onRemoveRecent={(entry) => {
              input.current?.focus();
              updateRecentSearches(recentSearches.filter((item) => item !== entry));
            }}
            onSelect={rememberSearch}
          />
        )}
      </form>
    </>
  );
}
