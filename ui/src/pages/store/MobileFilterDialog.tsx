import type { ReactNode, RefObject } from 'react';
import { Chevron } from '../../components/ui/Chevron';
import { DrawerCloseIcon } from '../../components/ui/Icons';
import { sortOptions } from './SortSelect';
import styles from './StorePage.module.css';

type MobileFilterDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  sort: string;
  onSortChange: (value: string) => void;
  loading: boolean;
  resultCount: number | null;
  children: ReactNode;
};

export function MobileFilterDialog({ dialogRef, sort, onSortChange, loading, resultCount, children }: MobileFilterDialogProps) {
  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <dialog
      className={styles.filterDialog}
      ref={dialogRef}
      aria-labelledby="store-filters-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <div className={styles.filterDialogHeader}>
        <h2 id="store-filters-title">Sort and filter</h2>
        <button type="button" aria-label="Close filters" onClick={closeDialog}><DrawerCloseIcon /></button>
      </div>
      <div className={styles.filterDialogBody}>
        <details className={styles.mobileSort} open>
          <summary>Sort items<Chevron /></summary>
          <fieldset aria-label="Sort items">
            {sortOptions.map((option) => (
              <label key={option.value}>
                <input type="radio" name="mobile-sort" checked={sort === option.value} onChange={() => onSortChange(option.value)} />
                {option.label}
              </label>
            ))}
          </fieldset>
        </details>
        {children}
      </div>
      <div className={styles.filterDialogFooter}>
        <button type="button" disabled={loading} onClick={closeDialog}>
          Show results{resultCount !== null && ` (${resultCount})`}
        </button>
      </div>
    </dialog>
  );
}
