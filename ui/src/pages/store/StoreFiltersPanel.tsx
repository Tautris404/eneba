import { Chevron } from '../../components/ui/Chevron';
import type { FilterKey, FilterOptions } from '../../types/product';
import { CountrySelect } from './CountrySelect';
import { FilterGroup } from './FilterGroup';
import { filterGroups, includeSelectedOptions, type FilterLabels } from './filterGroups';
import { PriceRangeFilter } from './PriceRangeFilter';
import styles from './StoreFilters.module.css';

type StoreFiltersPanelProps = {
  filters?: FilterOptions;
  params: URLSearchParams;
  labels: FilterLabels;
  onToggle: (name: FilterKey, value: string) => void;
  onCountryChange: (value: string) => void;
  onPriceChange: (minimum: string, maximum: string) => void;
};

export function StoreFiltersPanel({ filters, params, labels, onToggle, onCountryChange, onPriceChange }: StoreFiltersPanelProps) {
  const country = params.get('country') ?? '';

  return (
    <div className={styles.filters}>
      <PriceRangeFilter
        minimum={params.get('min_price') ?? ''}
        maximum={params.get('max_price') ?? ''}
        onChange={onPriceChange}
      />
      <details className={styles.group} open>
        <summary>Country<Chevron /></summary>
        <div className={styles.groupContent}>
          <CountrySelect value={country} countries={filters?.country} selectedLabel={labels[`country:${country}`]} onChange={onCountryChange} />
        </div>
      </details>
      {filterGroups.map((group) => {
        const selected = params.getAll(group.name);
        const options = includeSelectedOptions(filters?.[group.name] ?? [], selected, group.name, labels);
        return (
          <FilterGroup key={group.name} name={group.name} title={group.title} options={options} selected={selected} onToggle={onToggle} />
        );
      })}
    </div>
  );
}
