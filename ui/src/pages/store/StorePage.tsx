import { useCallback, useEffect, useRef, useState } from 'react';
import filterIcon from '../../assets/images/filter.svg';
import { ProductCard, productCardImages } from '../../components/product/ProductCard';
import { GhostIcon } from '../../components/ui/Icons';
import { Preloader } from '../../components/ui/Preloader';
import { useImagesLoaded } from '../../hooks/useImagesLoaded';
import type { FilterKey, StoreProduct } from '../../types/product';
import { storeLink } from '../../utils/storeLinks';
import { Pagination } from './Pagination';
import { SelectedFilters } from './SelectedFilters';
import { SortSelect } from './SortSelect';
import { StoreFiltersPanel } from './StoreFiltersPanel';
import { useStoreProducts } from './useStoreProducts';
import { useStoreQuery } from './useStoreQuery';
import { MobileFilterDialog } from './MobileFilterDialog';
import styles from './StorePage.module.css';

const filterNames = ['search', 'min_price', 'max_price', 'country', 'product_type', 'operating_system', 'platform', 'genre', 'region', 'deals'];

export function StorePage() {
  const { query, params, updateQuery } = useStoreQuery();
  const { data, loading, error, labels, retry } = useStoreProducts(query);
  const filterDialog = useRef<HTMLDialogElement>(null);
  const search = params.get('search');
  const sort = params.get('sort') ?? 'popularity';
  const noProducts = !loading && !error && data?.products.length === 0;
  const activeFilterCount = Array.from(params.entries()).filter(([key, value]) => key !== 'search' && filterNames.includes(key) && value).length;
  const resultCount = !loading && !error && data ? data.total : null;
  const imagesLoaded = useImagesLoaded(productCardImages(data?.products ?? []));
  const [shownProducts, setShownProducts] = useState<StoreProduct[]>([]);
  const showPreloader = loading || !imagesLoaded || shownProducts !== data?.products;

  useEffect(() => {
    if (data && imagesLoaded) setShownProducts(data.products);
  }, [data, imagesLoaded]);

  function toggleFilter(name: FilterKey, value: string) {
    updateQuery((next) => {
      const selected = next.getAll(name);
      const values = selected.includes(value) ? selected.filter((entry) => entry !== value) : [...selected, value];
      next.delete(name);
      for (const entry of values) next.append(name, entry);
      next.delete('page');
    });
  }

  function changeCountry(value: string) {
    updateQuery((next) => {
      next.delete('country');
      if (value) next.set('country', value);
      next.delete('page');
    });
  }

  const changePrice = useCallback((minimum: string, maximum: string) => {
    updateQuery((next) => {
      next.delete('min_price');
      next.delete('max_price');
      if (minimum) next.set('min_price', minimum);
      if (maximum) next.set('max_price', maximum);
      next.delete('page');
    });
  }, [updateQuery]);

  function changeSort(value: string) {
    updateQuery((next) => {
      next.set('sort', value);
      next.delete('page');
    });
  }

  function clearFilters() {
    updateQuery((next) => {
      for (const name of filterNames) next.delete(name);
      next.delete('page');
    });
  }

  function removeFilter(name: string, value: string) {
    updateQuery((next) => {
      next.delete(name, value);
      next.delete('page');
    });
  }

  function clearFilterGroup(name: FilterKey) {
    updateQuery((next) => {
      next.delete(name);
      next.delete('page');
    });
  }

  function changePage(page: number) {
    updateQuery((next) => next.set('page', String(page)));
    document.getElementById('store-title')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  }

  const filtersPanel = (
    <StoreFiltersPanel
      filters={data?.filters}
      params={params}
      labels={labels}
      onToggle={toggleFilter}
      onCountryChange={changeCountry}
      onPriceChange={changePrice}
    />
  );

  return (
    <div className={styles.page}>
      <h1 id="store-title">Games, Gift Cards, Top-Ups &amp; More | Best Deals</h1>
      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Product filters">{filtersPanel}</aside>

        <div className={styles.results}>
          <div className={styles.toolbar} data-empty={noProducts ? '' : undefined}>
            <p>Results found: <strong>{resultsFoundText(loading, error, data?.total)}</strong></p>
            <div className={styles.desktopSort}><SortSelect value={sort} onChange={changeSort} /></div>
            <div className={styles.filterBar}>
              <button className={styles.mobileFilters} type="button" onClick={() => filterDialog.current?.showModal()}>
                <img src={filterIcon} alt="" width="20" height="21" /> Sort and filter ({activeFilterCount + 1})
              </button>
              <hr className={styles.filterDivider} />
              <SelectedFilters
                className={styles.activeFilters}
                params={params}
                labels={labels}
                filters={data?.filters}
                onToggle={toggleFilter}
                onClearGroup={clearFilterGroup}
                onCountryChange={changeCountry}
                onPriceChange={changePrice}
                onRemove={removeFilter}
                onClear={clearFilters}
              />
            </div>
          </div>

          {error ? (
            <div className={styles.message}>
              <h2>Could not load products</h2>
              <p>{error}</p>
              <button type="button" onClick={retry}>Try again</button>
            </div>
          ) : (
            <div aria-busy={showPreloader} className={styles.catalog} data-loading={showPreloader ? '' : undefined}>
              {showPreloader && (
                <div className={styles.loading}>
                  <Preloader size="lg" color="white" label="Loading products" centered />
                </div>
              )}
              {noProducts && <NoProductsFound search={search} />}
              <div className={styles.grid} inert={showPreloader}>
                {shownProducts.map((product) => <ProductCard key={product.slug} product={product} />)}
              </div>
              {data && <Pagination page={data.page} pageSize={data.page_size} total={data.total} onChange={changePage} />}
            </div>
          )}
        </div>
      </div>

      <MobileFilterDialog dialogRef={filterDialog} sort={sort} onSortChange={changeSort} loading={loading} resultCount={resultCount}>
        {filtersPanel}
      </MobileFilterDialog>
    </div>
  );
}

function resultsFoundText(loading: boolean, error: string | undefined, total: number | undefined) {
  if (loading) return '…';
  if (error) return '—';
  return total ?? 0;
}

function NoProductsFound({ search }: { search: string | null }) {
  return (
    <section className={styles.emptyCatalog} aria-label="No matching products">
      <GhostIcon />
      <div className={styles.emptyCopy}>
        <p>{search ? 'Sorry, we could not find any match to:' : 'Sorry, no matches found'}</p>
        {search && <h2>{search}</h2>}
        <p>Please check your spelling, try different keywords, or browse our product catalog.</p>
      </div>
      <a href={storeLink()}>View popular products</a>
    </section>
  );
}
