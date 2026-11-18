import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronRightIcon } from '../../components/ui/Icons';
import styles from './HomeCatalog.module.css';

type CarouselProps = {
  children: ReactNode;
  className: string;
  label: string;
};

export function Carousel({ children, className, label }: CarouselProps) {
  const track = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState({ previous: false, next: false });

  function updateArrows() {
    const element = track.current;
    if (!element) return;
    setCanScroll({
      previous: element.scrollLeft > 1,
      next: element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
    });
  }

  useEffect(() => {
    const observer = new ResizeObserver(updateArrows);
    if (track.current) observer.observe(track.current);
    return () => observer.disconnect();
  }, []);

  function scrollItems(direction: 1 | -1) {
    const element = track.current;
    const firstItem = element?.firstElementChild;
    if (!element || !firstItem) return;
    const gap = parseFloat(getComputedStyle(element).columnGap) || 0;
    const itemWidth = firstItem.getBoundingClientRect().width + gap;
    const visibleItems = Math.max(1, Math.floor((element.clientWidth + gap) / itemWidth));
    const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
    element.scrollBy({ left: direction * visibleItems * itemWidth, behavior });
  }

  function makeRoomForScrollbar() {
    const element = track.current;
    if (!element) return;
    element.style.removeProperty('padding-bottom');
    const padding = parseFloat(getComputedStyle(element).paddingBottom) || 0;
    if (padding === 0) return;
    const scrollbarHeight = element.offsetHeight - element.clientHeight;
    if (scrollbarHeight > 0) element.style.paddingBottom = `${Math.max(0, padding - scrollbarHeight)}px`;
  }

  function resetScrollbarRoom() {
    track.current?.style.removeProperty('padding-bottom');
  }

  return (
    <div
      className={styles.carousel}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') requestAnimationFrame(makeRoomForScrollbar);
      }}
      onPointerLeave={resetScrollbarRoom}
    >
      <div className={`${styles.track} ${className}`} ref={track} onScroll={updateArrows}>{children}</div>
      <button className={styles.previous} type="button" aria-label={`Previous – ${label}`} disabled={!canScroll.previous} onClick={() => scrollItems(-1)}>
        <ChevronRightIcon />
      </button>
      <button className={styles.next} type="button" aria-label={`Next – ${label}`} disabled={!canScroll.next} onClick={() => scrollItems(1)}>
        <ChevronRightIcon />
      </button>
    </div>
  );
}
