import { CloseIcon } from '../../components/ui/Icons';
import type { FilterKey, FilterOptions } from '../../types/product';
import { euros } from '../../utils/currency';
import { CountrySelect } from './CountrySelect';
import { filterGroups, includeSelectedOptions, type FilterLabels } from './filterGroups';
import { FilterOptionList } from './FilterOptionList';
import { FilterSheet } from './FilterSheet';
import { usePriceRangeDraft } from './usePriceRangeDraft';
import styles from './SelectedFilters.module.css';

type SelectedFiltersProps = {
  className?: string;
  params: URLSearchParams;
  labels: FilterLabels;
  filters?: FilterOptions;
  onToggle: (name: FilterKey, value: string) => void;
  onClearGroup: (name: FilterKey) => void;
  onCountryChange: (value: string) => void;
  onPriceChange: (minimum: string, maximum: string) => void;
  onRemove: (name: string, value: string) => void;
  onClear: () => void;
};

export function SelectedFilters(props: SelectedFiltersProps) {
  const { className, params, labels, filters, onToggle, onClearGroup, onCountryChange, onPriceChange, onRemove, onClear } = props;
  const search = params.get('search');
  const country = params.get('country');
  const minimum = params.get('min_price');
  const maximum = params.get('max_price');
  const deals = params.get('deals') === '1';
  const activeGroups = filterGroups.filter((group) => params.getAll(group.name).length > 0);

  const hasFilters = search || country || minimum || maximum || deals || activeGroups.length > 0;
  if (!hasFilters) return null;

  return (
    <div className={`${styles.filters} ${className ?? ''}`} aria-label="Selected filters">
      {deals && (
        <div className={styles.textChip}>
          <span className={styles.textLabel}>Deals</span>
          <button className={styles.textClear} type="button" onClick={() => onRemove('deals', '1')} aria-label="Clear deals filter">
            <CloseIcon size={12} />
          </button>
        </div>
      )}
      {search && (
        <div className={styles.textChip}>
          <span className={styles.textLabel}>Text:</span>
          <span className={styles.textValue} title={search}>{search}</span>
          <button className={styles.textClear} type="button" onClick={() => onRemove('search', search)} aria-label="Clear search text">
            <CloseIcon size={12} />
          </button>
        </div>
      )}
      {(minimum || maximum) && <PriceChip minimum={minimum ?? ''} maximum={maximum ?? ''} onChange={onPriceChange} />}
      {country && (
        <FilterSheet label="Country (1)" title="Country" clearLabel="Clear country filter" onClear={() => onCountryChange('')}>
          <div className={styles.countryField}>
            <CountrySelect value={country} countries={filters?.country} selectedLabel={labels[`country:${country}`]} onChange={onCountryChange} />
          </div>
        </FilterSheet>
      )}
      {activeGroups.map((group) => {
        const selected = params.getAll(group.name);
        return (
          <FilterSheet
            key={group.name}
            label={`${group.title} (${selected.length})`}
            title={group.title}
            clearLabel={`Clear ${group.title} filters`}
            onClear={() => onClearGroup(group.name)}
            hasOptionList
          >
            <FilterOptionList
              name={group.name}
              title={group.title}
              options={includeSelectedOptions(filters?.[group.name] ?? [], selected, group.name, labels)}
              selected={selected}
              onToggle={onToggle}
              inSheet
            />
          </FilterSheet>
        );
      })}
      <button className={styles.clear} type="button" onClick={onClear}>Clear all</button>
    </div>
  );
}

function priceLabel(minimum: string, maximum: string) {
  if (minimum && maximum) return `${euros.format(Number(minimum))} - ${euros.format(Number(maximum))}`;
  if (minimum) return `> ${euros.format(Number(minimum))}`;
  return `< ${euros.format(Number(maximum))}`;
}

type PriceChipProps = {
  minimum: string;
  maximum: string;
  onChange: (minimum: string, maximum: string) => void;
};

function PriceChip({ minimum, maximum, onChange }: PriceChipProps) {
  const { min, setMin, max, setMax, invalid, applyNow } = usePriceRangeDraft(minimum, maximum, onChange);

  return (
    <FilterSheet
      className={styles.priceGroup}
      label={priceLabel(minimum, maximum)}
      title="Price range"
      clearLabel="Clear price range"
      onClear={() => onChange('', '')}
      onShowResults={applyNow}
    >
      <div className={styles.priceTitle}>Price range (EUR)</div>
      <div className={styles.priceInputs}>
        <input
          aria-label="Price range - Minimum value"
          aria-invalid={invalid}
          inputMode="decimal"
          value={min}
          onChange={(event) => setMin(event.target.value)}
        />
        <strong aria-hidden="true">-</strong>
        <input
          aria-label="Price range - Maximum value"
          aria-invalid={invalid}
          inputMode="decimal"
          value={max}
          onChange={(event) => setMax(event.target.value)}
        />
      </div>
      {invalid && <p className={styles.priceError}>Enter a valid price range.</p>}
    </FilterSheet>
  );
}
