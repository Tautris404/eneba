import { useEffect, useRef, useState, type RefObject } from 'react';
import logo from '../../../assets/images/eneba-logo.svg';
import { storeLink } from '../../../utils/storeLinks';
import { DrawerCloseIcon } from '../../ui/Icons';
import { AppDownloadLinks } from '../AppDownloadLinks';
import { categories, storeShortcuts, type Category } from './categoryLinks';
import styles from './CategoryDrawer.module.css';

const phoneMenuLinks: Category[] = [{ label: 'Categories', children: categories }, ...storeShortcuts];

type DrawerMenu = {
  openedCategories: Category[];
  depth: number;
};

const startMenu: DrawerMenu = { openedCategories: [], depth: 0 };

type CategoryDrawerProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  showPhoneLinks: boolean;
};

export function CategoryDrawer({ dialogRef, showPhoneLinks }: CategoryDrawerProps) {
  const [menu, setMenu] = useState<DrawerMenu>(startMenu);
  const visibleList = useRef<HTMLElement>(null);
  const currentCategory = menu.openedCategories[menu.depth - 1];
  const lists: (Category | null)[] = [null, ...menu.openedCategories];
  const firstListItems = showPhoneLinks ? phoneMenuLinks : categories;

  useEffect(() => {
    if (dialogRef.current?.open) visibleList.current?.focus({ preventScroll: true });
  }, [dialogRef, menu.depth]);

  function openCategory(category: Category) {
    setMenu((current) => ({
      openedCategories: [...current.openedCategories.slice(0, current.depth), category],
      depth: current.depth + 1,
    }));
  }

  function goBack() {
    setMenu((current) => ({ ...current, depth: current.depth - 1 }));
  }

  return (
    <dialog
      className={styles.drawer}
      ref={dialogRef}
      aria-label="Categories"
      onClose={() => setMenu(startMenu)}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <div className={styles.content}>
        <div className={styles.heading}>
          {currentCategory ? (
            <button type="button" key={currentCategory.label} className={styles.back} onClick={goBack}>
              <span className={styles.chevron} aria-hidden="true" />
              {currentCategory.label}
            </button>
          ) : (
            <a className={styles.logo} href="/" aria-label="Eneba home">
              <img src={logo} width="102" height="32" alt="Eneba" />
            </a>
          )}
          <button className={styles.close} type="button" aria-label="Close categories" onClick={() => dialogRef.current?.close()}>
            <DrawerCloseIcon />
          </button>
        </div>
        <div className={styles.viewport}>
          {lists.map((category, index) => {
            const isVisible = index === menu.depth;
            return (
              <nav
                key={`${index}:${category?.label ?? 'categories'}`}
                className={styles.links}
                data-submenu={index > 0 ? '' : undefined}
                data-offscreen={index > menu.depth ? '' : undefined}
                aria-label={category?.label ?? (showPhoneLinks ? 'Store navigation' : 'Product categories')}
                aria-hidden={!isVisible}
                ref={isVisible ? visibleList : undefined}
                inert={!isVisible}
                tabIndex={-1}
              >
                <CategoryList items={category?.children ?? firstListItems} onOpen={openCategory} />
                {showPhoneLinks && index === 0 && (
                  <section className={styles.downloads} aria-label="Download the Eneba App">
                    <h2>Download the Eneba App</h2>
                    <AppDownloadLinks />
                  </section>
                )}
              </nav>
            );
          })}
        </div>
      </div>
    </dialog>
  );
}

function CategoryList({ items, onOpen }: { items: Category[]; onOpen: (category: Category) => void }) {
  return (
    <ul>
      {items.map((category) => (
        <li key={category.label}>
          {category.children ? (
            <button type="button" onClick={() => onOpen(category)}>
              {category.label}
              <span className={styles.chevron} aria-hidden="true" />
            </button>
          ) : (
            <a href={storeLink(category.filters)}>
              {category.label}
              {category.badge && <span className={styles.badge}>{category.badge}</span>}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
