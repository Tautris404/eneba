import { useLayoutEffect, useRef, useState } from 'react';
import styles from './ProductPage.module.css';

const collapsedHeight = 450;

export function ProductDescription({ text }: { text: string }) {
  const content = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isLong, setIsLong] = useState(false);
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== '');
  const collapsed = isLong && !expanded;

  useLayoutEffect(() => {
    const element = content.current;
    if (!element) return;
    const measure = () => setIsLong(element.scrollHeight > collapsedHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text]);

  return (
    <section aria-labelledby="description-heading">
      <h2 id="description-heading" className={styles.detailsHeading}>Description</h2>
      <div className={styles.descriptionBody}>
        <div className={collapsed ? `${styles.descriptionText} ${styles.collapsed}` : styles.descriptionText}>
          <div ref={content}>
            {paragraphs.map((paragraph, index) => (
              <p key={index}>
                {paragraph.split('\n').map((line, lineIndex, lines) => (
                  <span key={lineIndex}>
                    {line}
                    {lineIndex < lines.length - 1 && <br />}
                  </span>
                ))}
              </p>
            ))}
          </div>
          {collapsed && (
            <button className={styles.readMore} type="button" onClick={() => setExpanded(true)}>Read more</button>
          )}
        </div>
      </div>
    </section>
  );
}
