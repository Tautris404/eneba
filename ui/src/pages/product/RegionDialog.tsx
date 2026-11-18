import { useEffect, useId, useRef, useState } from 'react';
import { lockPageScroll, unlockPageScroll } from '../../utils/scrollLock';
import { CountrySearchIcon, DialogCloseIcon, GlobeIcon } from './ProductIcons';
import styles from './RegionDialog.module.css';

type RegionDialogProps = {
  region: string;
  countries: string[];
  onClose: () => void;
};

export function RegionDialog({ region, countries, onClose }: RegionDialogProps) {
  const [search, setSearch] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const searchText = search.trim().toLowerCase();
  const visibleCountries = [...countries]
    .sort((first, second) => first.localeCompare(second))
    .filter((country) => country.toLowerCase().includes(searchText));

  useEffect(() => {
    lockPageScroll();
    dialogRef.current?.focus();
    return () => unlockPageScroll();
  }, []);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div ref={dialogRef} className={styles.dialog} tabIndex={-1} aria-modal="true" aria-labelledby={titleId}>
        <div className={styles.header}>
          <GlobeIcon className={styles.icon} />
          <h2 id={titleId} className={styles.title}>Region restrictions</h2>
          <button className={styles.close} type="button" aria-label="Close" onClick={onClose}>
            <DialogCloseIcon />
          </button>
        </div>
        <div className={styles.region}>
          <span>The product region is restricted to:</span>
          <strong>{region}</strong>
        </div>
        <div className={styles.body}>
          <div className={styles.listHeader}>
            <span>List of allowed countries for this product version:</span>
            <label className={styles.search}>
              <CountrySearchIcon className={styles.searchIcon} />
              <input
                type="search"
                placeholder="Search country"
                aria-label="Search country"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>
          <div className={styles.list}>
            {visibleCountries.length > 0 ? (
              <ul>
                {visibleCountries.map((country) => <li key={country}>{country}</li>)}
              </ul>
            ) : (
              <p className={styles.empty}>
                {countries.length > 0 ? 'No countries found.' : 'This product can be activated worldwide.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
