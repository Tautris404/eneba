import { useEffect, useRef, useState } from 'react';
import enebaMark from '../../assets/images/eneba-mark.svg';
import logo from '../../assets/images/eneba-logo.svg';
import { UserMenu } from '../../components/layout/header/AccountMenu';
import { DrawerCloseIcon, MenuIcon } from '../../components/ui/Icons';
import { phoneLayoutQuery } from '../../utils/breakpoints';
import { lockPageScroll, unlockPageScroll } from '../../utils/scrollLock';
import styles from './Orders.module.css';

type OrdersHeaderProps = {
  email: string | null;
  signedIn: boolean;
};

export function OrdersHeader({ email, signedIn }: OrdersHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const phoneLayout = window.matchMedia(phoneLayoutQuery);
    lockPageScroll();
    closeButton.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      menuButton.current?.focus();
    }

    function closeOnDesktop() {
      if (!phoneLayout.matches) setMenuOpen(false);
    }

    window.addEventListener('keydown', closeOnEscape);
    phoneLayout.addEventListener('change', closeOnDesktop);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      phoneLayout.removeEventListener('change', closeOnDesktop);
      unlockPageScroll();
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    menuButton.current?.focus();
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerStart}>
          <button
            ref={menuButton}
            className={styles.menuTrigger}
            type="button"
            aria-label="Open menu"
            aria-controls="orders-mobile-menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </button>
          <a className={styles.logo} href="/" aria-label="Eneba home">
            <img src={logo} alt="" width="100" height="31" />
          </a>
        </div>
        <div className={styles.headerBar}>
          {signedIn && <UserMenu email={email} onOrdersPage />}
        </div>
        <div className={styles.menuBackdrop} data-open={menuOpen} aria-hidden="true" onClick={closeMenu} />
        <aside id="orders-mobile-menu" className={styles.mobileMenu} data-open={menuOpen} inert={!menuOpen} aria-label="Menu">
          <div className={styles.mobileMenuHeading}>
            <img src={enebaMark} alt="" width="28" height="28" />
            <strong>Menu</strong>
            <button ref={closeButton} type="button" aria-label="Close menu" onClick={closeMenu}><DrawerCloseIcon /></button>
          </div>
          <nav className={styles.navigation} aria-label="Account navigation">
            <OrdersLink />
          </nav>
        </aside>
      </header>
      <nav className={`${styles.navigation} ${styles.desktopNavigation}`} aria-label="Account navigation">
        <OrdersLink />
      </nav>
    </>
  );
}

function OrdersLink() {
  return (
    <a href="/orders" aria-current="page">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M.75 7.09 3.08 14.98a1.5 1.5 0 0 0 1.45 1.11h10.82a1.5 1.5 0 0 0 1.45-1.11L20.04 2.83A2.25 2.25 0 0 1 22.21 1.16h1.04M6.52 7.43l2.03 2.03a1.02 1.02 0 0 0 1.53-.11l3.94-5.25" />
        <circle cx="6.375" cy="20.968" r="1.875" />
        <circle cx="13.875" cy="20.968" r="1.875" />
      </svg>
      Orders
    </a>
  );
}
