import { useId, useState } from 'react';
import { Chevron } from '../../components/ui/Chevron';
import { SearchIcon } from '../../components/ui/Icons';
import type { FilterKey, FilterOption } from '../../types/product';
import styles from './StoreFilters.module.css';

const collapsedOptionCount = 8;

export type FilterOptionListProps = {
  name: FilterKey;
  title: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (name: FilterKey, value: string) => void;
};

export function FilterOptionList({ name, title, options, selected, onToggle, inSheet = false }: FilterOptionListProps & { inSheet?: boolean }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const searchText = search.trim().toLowerCase();
  const matching = options.filter((option) => option.label.toLowerCase().includes(searchText));
  const showEveryOption = inSheet || expanded || search !== '';
  const visible = showEveryOption ? matching : matching.slice(0, collapsedOptionCount);
  const hasSearch = name !== 'operating_system';

  return (
    <>
      {hasSearch && (
        <div className={styles.optionSearch} data-in-menu={inSheet ? '' : undefined}>
          <input
            type="search"
            aria-label={`Search filter options - ${title}`}
            placeholder={inSheet ? 'Search...' : undefined}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            autoComplete="off"
          />
          <SearchIcon />
        </div>
      )}
      <ul className={styles.options}>
        {visible.map((option) => {
          const inputId = `${id}-${option.value}`;
          return (
            <li key={option.value}>
              <label htmlFor={inputId}>
                <input
                  id={inputId}
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => onToggle(name, option.value)}
                />
                <span>{option.label}</span>
                {option.count != null && <span className={styles.count}>{option.count}</span>}
              </label>
            </li>
          );
        })}
      </ul>
      {matching.length === 0 && <p className={styles.noOptions}>No matches found</p>}
      {!inSheet && search === '' && matching.length > collapsedOptionCount && (
        <button className={styles.showMore} type="button" data-expanded={expanded ? '' : undefined} onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show less' : `${matching.length - collapsedOptionCount} more`}
          <Chevron />
        </button>
      )}
    </>
  );
}
