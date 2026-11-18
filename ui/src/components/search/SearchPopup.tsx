import type { SearchProduct } from '../../types/product';
import { euros } from '../../utils/currency';
import { storeLink } from '../../utils/storeLinks';
import { CloseIcon, GhostIcon } from '../ui/Icons';
import { Preloader } from '../ui/Preloader';
import styles from './SearchPopup.module.css';

type SearchPopupProps = {
  id: string;
  recentSearches: string[];
  loading: boolean;
  products: SearchProduct[];
  message: string;
  showResults: boolean;
  noMatches: boolean;
  onRemoveRecent: (term: string) => void;
  onSelect: () => void;
};

export function SearchPopup({ id, recentSearches, loading, products, message, showResults, noMatches, onRemoveRecent, onSelect }: SearchPopupProps) {
  return (
    <div className={styles.popup} id={id}>
      {recentSearches.length > 0 && (
        <section aria-label="Recent searches">
          <h2 className={styles.heading}>Recent searches</h2>
          <ul>
            {recentSearches.map((term) => (
              <li className={styles.recent} key={term}>
                <a href={storeLink({ search: term })}>
                  <HistoryIcon />
                  {term}
                </a>
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={`Remove ${term} from recent searches`}
                  onClick={() => onRemoveRecent(term)}
                >
                  <CloseIcon />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {loading && <Preloader size="lg" color="white" label="Loading search results" centered />}
      {showResults && noMatches && <EmptySearch />}
      {showResults && !noMatches && (
        <section className={styles.results} aria-label="Product results">
          <span className={styles.status}>{message}</span>
          <ul>
            {products.map((product) => (
              <li key={product.slug}>
                <SearchProductLink product={product} onSelect={onSelect} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function EmptySearch() {
  return (
    <section className={styles.empty} aria-label="No search matches">
      <GhostIcon className={styles.ghost} />
      <div>
        <strong>Sorry, no matches found</strong>
        <br />
        <span>Please check your spelling, try different keywords, or browse our product catalog.</span>
      </div>
      <a className={styles.popularLink} href={storeLink()}>View popular products</a>
    </section>
  );
}

function SearchProductLink({ product, onSelect }: { product: SearchProduct; onSelect: () => void }) {
  const price = product.discounted_price ?? product.price;

  return (
    <a className={styles.product} href={storeLink({ product: product.slug })} onClick={onSelect}>
      <span className={styles.cover}>
        {product.cover_image_url && <img src={product.cover_image_url} alt="" />}
      </span>
      <span className={styles.description}>
        <span className={styles.badge}>Digital good</span>
        <span className={styles.name}>{product.name}</span>
      </span>
      <span className={styles.price}>
        {price !== null && (
          <span className={styles.originalPrice}>
            From
            {product.discounted_price != null && product.price != null && (
              <>
                <del>{euros.format(product.price)}</del>
                <span className={styles.priceInfo} title="Original price" aria-hidden="true"><PriceInfoIcon /></span>
              </>
            )}
          </span>
        )}
        <strong>{price === null ? 'Sold out' : euros.format(price)}</strong>
      </span>
    </a>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.16299 17.603L12.162 14.603L12.163 9.60303" />
      <path d="M14.158 6.85303L10.158 3.60303L14.658 0.853027" />
      <path d="M3.707 18.5999C4.66653 20.1041 6.01709 21.3191 7.61409 22.1146C9.2111 22.9102 10.9944 23.2564 12.7731 23.1163C14.5518 22.9761 16.2588 22.3548 17.7115 21.319C19.1642 20.2831 20.3078 18.8716 21.0199 17.2357C21.732 15.5998 21.9858 13.801 21.754 12.0319C21.5223 10.2628 20.8137 8.5901 19.7043 7.1928C18.5948 5.79549 17.1262 4.72624 15.4558 4.09951C13.7853 3.47279 11.9758 3.31219 10.221 3.63492" />
      <path d="M6.85199 4.93701C5.6394 5.68685 4.60173 6.68803 3.80899 7.87301" />
      <path d="M2.33601 11.5C2.0839 12.9026 2.12818 14.3425 2.46601 15.727" />
    </svg>
  );
}

function PriceInfoIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" fillRule="evenodd" clipRule="evenodd" aria-hidden="true">
      <path d="M5.69 6.13c0-.25.2-.44.43-.44h.44a.88.88 0 0 1 .88.87v2.19a.44.44 0 0 0 .43.44h.44a.44.44 0 0 1 0 .87h-.44a1.31 1.31 0 0 1-1.3-1.31V6.56h-.45a.44.44 0 0 1-.43-.43ZM6.42 3.61a.66.66 0 1 1 .73 1.1.66.66 0 0 1-.73-1.1Zm.44.75a.22.22 0 1 0-.16-.4.22.22 0 0 0 .16.4Z" />
      <path d="M2.05 2.05a7 7 0 1 1 9.9 9.9 7 7 0 0 1-9.9-9.9ZM7 .88a6.13 6.13 0 1 0 0 12.25A6.13 6.13 0 0 0 7 .87Z" />
    </svg>
  );
}
