import { useRef, useState } from 'react';
import { CategoryBar } from './CategoryBar';
import { CategoryDrawer } from './CategoryDrawer';
import { HeaderTopBar } from './HeaderTopBar';
import styles from './Header.module.css';

export function Header() {
  const drawerRef = useRef<HTMLDialogElement>(null);
  const [showPhoneLinks, setShowPhoneLinks] = useState(false);

  function openCategories(fromPhoneMenu: boolean) {
    setShowPhoneLinks(fromPhoneMenu);
    drawerRef.current?.showModal();
  }

  return (
    <header className={styles.header}>
      <HeaderTopBar onOpenCategories={() => openCategories(true)} />
      <CategoryBar onOpenCategories={() => openCategories(false)} />
      <CategoryDrawer dialogRef={drawerRef} showPhoneLinks={showPhoneLinks} />
    </header>
  );
}
