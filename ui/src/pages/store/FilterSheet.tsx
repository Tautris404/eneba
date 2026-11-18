import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Chevron } from '../../components/ui/Chevron';
import { CloseIcon } from '../../components/ui/Icons';
import { lockPageScroll, unlockPageScroll } from '../../utils/scrollLock';
import styles from './SelectedFilters.module.css';

const bottomSheetQuery = '(max-width: 870px)';

type FilterSheetProps = {
  label: string;
  title: string;
  clearLabel: string;
  onClear: () => void;
  onShowResults?: () => void;
  hasOptionList?: boolean;
  className?: string;
  children: ReactNode;
};

export function FilterSheet({ label, title, clearLabel, onClear, onShowResults, hasOptionList = false, className, children }: FilterSheetProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setOpen(false);
      trigger.current?.focus();
    }

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    const lockScroll = window.matchMedia(bottomSheetQuery).matches;
    if (lockScroll) lockPageScroll();
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
      if (lockScroll) unlockPageScroll();
    };
  }, [open]);

  function closeSheet() {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }

  return (
    <div className={className ? `${styles.group} ${className}` : styles.group} ref={root} data-open={open ? '' : undefined}>
      <button
        className={styles.trigger}
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
      >
        {label}<Chevron />
      </button>
      <button className={styles.sheetBackdrop} type="button" tabIndex={-1} aria-label={`Close ${title}`} onClick={closeSheet} />
      <div
        className={hasOptionList ? `${styles.menu} ${styles.optionsMenu}` : styles.menu}
        id={menuId}
        aria-label={title}
        inert={!open}
      >
        <div className={styles.sheetHeader}>
          <span>{title}</span>
          <button type="button" aria-label="Close" onClick={closeSheet}>
            <CloseIcon size={14} />
          </button>
        </div>
        {children}
        <div className={styles.menuFooter}>
          <button className={styles.clear} type="button" aria-label={clearLabel} onClick={onClear}>Clear all</button>
          <button
            className={styles.showResults}
            type="button"
            onClick={() => {
              onShowResults?.();
              closeSheet();
            }}
          >
            Show results
          </button>
        </div>
      </div>
    </div>
  );
}
