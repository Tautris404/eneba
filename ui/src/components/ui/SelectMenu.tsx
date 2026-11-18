import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Chevron } from './Chevron';
import styles from './SelectMenu.module.css';

export type SelectOption = { value: string; label: string };

type SelectMenuProps = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  variant?: 'sort' | 'country';
  icon?: string;
};

export function SelectMenu({ label, value, options, onChange, variant = 'country', icon }: SelectMenuProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const id = useId();
  const searchable = variant === 'country';
  const selected = options.find((option) => option.value === value);
  const matching = options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    if (!open) return;
    function closeOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', closeOnOutsideClick);
    if (searchable) searchInput.current?.focus();
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [open, searchable]);

  useEffect(() => {
    if (open) document.getElementById(`${id}-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex, id]);

  function choose(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
    setSearch('');
    trigger.current?.focus();
  }

  function openWithKeyboard() {
    setSearch('');
    const selectedIndex = options.findIndex((option) => option.value === value);
    setActiveIndex(searchable ? 0 : Math.max(0, selectedIndex));
    setOpen(true);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      trigger.current?.focus();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        openWithKeyboard();
        return;
      }
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((current) => Math.max(0, Math.min(matching.length - 1, current + step)));
      return;
    }

    if (event.key === 'Enter' && open) {
      event.preventDefault();
      const activeOption = matching[activeIndex];
      if (activeOption) choose(activeOption.value);
      return;
    }

    if (event.key === 'Tab') setOpen(false);
  }

  return (
    <div
      className={styles.select}
      data-variant={variant}
      data-open={open ? '' : undefined}
      ref={root}
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        className={styles.trigger}
        ref={trigger}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        onClick={() => {
          setSearch('');
          setActiveIndex(searchable ? 0 : -1);
          setOpen(!open);
        }}
      >
        {icon && <span className={styles.icon} aria-hidden="true" style={{ maskImage: `url("${icon}")` }} />}
        <span className={styles.value}>{selected?.label ?? value}</span>
        {searchable ? (
          <svg className={styles.countryChevron} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M4.516 7.548c.436-.446 1.043-.481 1.576 0L10 11.295l3.908-3.747c.533-.481 1.141-.446 1.574 0 .436.445.408 1.197 0 1.615-.406.418-4.695 4.502-4.695 4.502-.217.223-.502.335-.787.335s-.57-.112-.789-.335c0 0-4.287-4.084-4.695-4.502s-.436-1.17 0-1.615z" />
          </svg>
        ) : (
          <Chevron />
        )}
      </button>
      {open && (
        <>
          {searchable && (
            <input
              ref={searchInput}
              className={styles.search}
              aria-label={`Search ${label.toLowerCase()}`}
              aria-autocomplete="list"
              aria-expanded="true"
              aria-controls={`${id}-list`}
              aria-activedescendant={matching[activeIndex] ? `${id}-option-${activeIndex}` : undefined}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setActiveIndex(0);
              }}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
            />
          )}
          <ul className={styles.menu} id={`${id}-list`} aria-label={label}>
            {matching.map((option, index) => (
              <li key={option.value}>
                <button
                  className={styles.option}
                  id={`${id}-option-${index}`}
                  type="button"
                  aria-selected={option.value === value}
                  data-active={index === activeIndex ? '' : undefined}
                  onPointerMove={searchable ? () => setActiveIndex(index) : undefined}
                  onClick={() => choose(option.value)}
                >
                  {option.label}
                  {variant === 'sort' && option.value === value && <span className={styles.check} aria-hidden="true" />}
                </button>
              </li>
            ))}
            {matching.length === 0 && <li className={styles.empty}>No matches found</li>}
          </ul>
        </>
      )}
    </div>
  );
}
