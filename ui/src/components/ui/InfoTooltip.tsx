import { useId, useRef, type CSSProperties, type ReactNode } from 'react';
import styles from './InfoTooltip.module.css';

type InfoTooltipProps = {
  label: string;
  text: string;
  children: ReactNode;
  gap?: number;
  arrow?: number;
  className?: string;
};

export function InfoTooltip({ label, text, children, gap = 7, arrow = 7, className }: InfoTooltipProps) {
  const tooltip = useRef<HTMLSpanElement>(null);
  const id = useId();

  function show(trigger: HTMLButtonElement) {
    const popup = tooltip.current;
    if (!popup || popup.matches(':popover-open')) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 24);
    const center = rect.left + rect.width / 2;
    const left = Math.max(12, Math.min(center - width / 2, window.innerWidth - width - 12));
    popup.style.setProperty('--tooltip-left', `${left}px`);
    popup.style.setProperty('--tooltip-arrow', `${center - left}px`);
    popup.style.setProperty('--tooltip-bottom', `${window.innerHeight - rect.top + gap}px`);
    popup.showPopover();
  }

  function hide() {
    tooltip.current?.hidePopover();
  }

  return (
    <>
      <button
        type="button"
        className={`${styles.trigger} ${className ?? ''}`}
        aria-label={label}
        aria-describedby={id}
        onPointerEnter={(event) => { if (event.pointerType !== 'touch') show(event.currentTarget); }}
        onPointerLeave={(event) => { if (event.pointerType !== 'touch' && !event.currentTarget.matches(':focus-visible')) hide(); }}
        onFocus={(event) => { if (event.currentTarget.matches(':focus-visible')) show(event.currentTarget); }}
        onBlur={hide}
        onClick={(event) => show(event.currentTarget)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && tooltip.current?.matches(':popover-open')) {
            event.preventDefault();
            event.stopPropagation();
            hide();
          }
        }}
      >
        {children}
      </button>
      <span
        id={id}
        ref={tooltip}
        className={styles.tooltip}
        style={{ '--tooltip-arrow-size': `${arrow}px` } as CSSProperties}
        popover="auto"
      >
        {text}
      </span>
    </>
  );
}
