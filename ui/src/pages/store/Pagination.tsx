import { ChevronRightIcon } from '../../components/ui/Icons';
import styles from './StoreControls.module.css';

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
  const pageCount = Math.ceil(total / pageSize);
  if (pageCount <= 1) return null;

  const firstShown = Math.max(1, Math.min(page - 2, pageCount - 4));
  const lastShown = Math.min(pageCount, firstShown + 4);
  const shownPages: number[] = [];
  for (let pageNumber = firstShown; pageNumber <= lastShown; pageNumber += 1) {
    shownPages.push(pageNumber);
  }

  return (
    <nav className={styles.pagination} aria-label="Product pages">
      <button className={styles.pageArrow} type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronRightIcon className={styles.previousArrow} width={10} height={17} />
      </button>
      {firstShown > 1 && <button type="button" aria-label="Go to page 1" onClick={() => onChange(1)}>1</button>}
      {firstShown > 2 && <span aria-hidden="true">…</span>}
      {shownPages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          aria-label={`Go to page ${pageNumber}`}
          aria-current={pageNumber === page ? 'page' : undefined}
          onClick={() => onChange(pageNumber)}
        >
          {pageNumber}
        </button>
      ))}
      {lastShown < pageCount - 1 && <span aria-hidden="true">…</span>}
      {lastShown < pageCount && (
        <button type="button" aria-label={`Go to page ${pageCount}`} onClick={() => onChange(pageCount)}>{pageCount}</button>
      )}
      <button className={styles.pageArrow} type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
        <ChevronRightIcon width={10} height={17} />
      </button>
    </nav>
  );
}
