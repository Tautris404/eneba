import type { HomeShortcut } from '../../types/home';
import { Carousel } from './Carousel';
import styles from './HomeCatalog.module.css';

export function shortcutIcons(shortcuts: HomeShortcut[]) {
  return shortcuts.map((shortcut) => shortcut.icon_url);
}

export function CategoryShortcuts({ shortcuts }: { shortcuts: HomeShortcut[] | undefined }) {
  if (!shortcuts) return null;

  return (
    <nav className={`${styles.container} ${styles.shortcuts}`} aria-label="Store categories">
      <Carousel className={styles.shortcutTrack} label="Store categories">
        {shortcuts.map((shortcut) => (
          <a key={shortcut.name} href={shortcut.link_url}>
            <img src={shortcut.icon_url} alt="" width="32" height="32" />
            {shortcut.name}
          </a>
        ))}
      </Carousel>
    </nav>
  );
}
