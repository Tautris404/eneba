import { storeLink } from '../../../utils/storeLinks';
import { MenuIcon } from '../../ui/Icons';
import { storeShortcuts } from './categoryLinks';
import styles from './Header.module.css';

export function CategoryBar({ onOpenCategories }: { onOpenCategories: () => void }) {
  return (
    <div className={styles.desktopNavigation}>
      <nav className={styles.navigation} aria-label="Store navigation">
        <button type="button" aria-haspopup="dialog" onClick={onOpenCategories}>
          <MenuIcon /> Categories
        </button>
        {storeShortcuts.map((shortcut) => (
          <a key={shortcut.label} href={storeLink(shortcut.filters)}>{shortcut.label}</a>
        ))}
      </nav>
    </div>
  );
}
