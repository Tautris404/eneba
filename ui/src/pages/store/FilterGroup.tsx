import { Chevron } from '../../components/ui/Chevron';
import { FilterOptionList, type FilterOptionListProps } from './FilterOptionList';
import styles from './StoreFilters.module.css';

export function FilterGroup({ name, title, options, selected, onToggle }: FilterOptionListProps) {
  return (
    <details className={styles.group} open>
      <summary>
        {title}
        {selected.length > 0 && <span className={styles.selectedCount}>{selected.length}</span>}
        <Chevron />
      </summary>
      <div className={styles.groupContent}>
        <FilterOptionList name={name} title={title} options={options} selected={selected} onToggle={onToggle} />
      </div>
    </details>
  );
}
