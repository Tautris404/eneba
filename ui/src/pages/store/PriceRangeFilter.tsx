import { Chevron } from '../../components/ui/Chevron';
import { usePriceRangeDraft } from './usePriceRangeDraft';
import styles from './StoreFilters.module.css';

type PriceRangeFilterProps = {
  minimum: string;
  maximum: string;
  onChange: (minimum: string, maximum: string) => void;
};

export function PriceRangeFilter({ minimum, maximum, onChange }: PriceRangeFilterProps) {
  const { min, setMin, max, setMax, invalid } = usePriceRangeDraft(minimum, maximum, onChange);

  return (
    <details className={styles.group} open>
      <summary>Price range (EUR)<Chevron /></summary>
      <div className={styles.groupContent}>
        <div className={styles.priceRange}>
          <input
            aria-label="Price range - Minimum value"
            aria-invalid={invalid}
            inputMode="decimal"
            value={min}
            onChange={(event) => setMin(event.target.value)}
          />
          <span aria-hidden="true">-</span>
          <input
            aria-label="Price range - Maximum value"
            aria-invalid={invalid}
            inputMode="decimal"
            value={max}
            onChange={(event) => setMax(event.target.value)}
          />
        </div>
        {invalid && <p className={styles.priceError}>Enter a valid price range.</p>}
      </div>
    </details>
  );
}
