import { useEffect, useRef, useState } from 'react';
import logo from '../../../assets/images/eneba-logo.svg';
import { logout, useSession } from '../../../state/session';
import { currentPageRef, loginLink, registerLink } from '../../../utils/authRedirect';
import { phoneLayoutQuery } from '../../../utils/breakpoints';
import { lockPageScroll, unlockPageScroll } from '../../../utils/scrollLock';
import { AccountIcon, CloseIcon } from '../../ui/Icons';
import { LogoutIcon, OrdersIcon, StoreIcon } from './AccountIcons';
import headerStyles from './Header.module.css';
import styles from './AccountMenu.module.css';

const avatarUrl = '/uploads/avatars/enebian.svg';

export function AccountMenu() {
  const session = useSession();
  if (session) return <UserMenu email={session.email} />;
  return <GuestMenu />;
}

function useMenu() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setOpen(false);
      trigger.current?.focus();
    }

    document.addEventListener('keydown', closeOnEscape);
    const lockScroll = window.matchMedia(phoneLayoutQuery).matches;
    if (lockScroll) lockPageScroll();
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      if (lockScroll) unlockPageScroll();
    };
  }, [open]);

  return { open, setOpen, trigger };
}

function GuestMenu() {
  const { open, setOpen, trigger } = useMenu();
  const returnPath = currentPageRef();

  return (
    <>
      <div className={headerStyles.desktopAccount}>
        <a href={loginLink(returnPath)}><AccountIcon /> Log in</a>
        <span aria-hidden="true">&nbsp;|&nbsp;</span>
        <a href={registerLink(returnPath)}>Register</a>
      </div>
      <div className={styles.guest}>
        <button
          ref={trigger}
          className={styles.guestTrigger}
          type="button"
          aria-label="Log in"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <AccountIcon />
        </button>
        <button
          className={styles.panelBackdrop}
          data-open={open ? '' : undefined}
          type="button"
          tabIndex={-1}
          aria-label="Close"
          onClick={() => setOpen(false)}
        />
        <div className={styles.panel} data-open={open ? '' : undefined} inert={!open}>
          <div className={styles.panelActions}>
            <a className={styles.loginButton} href={loginLink(returnPath)}>Log in</a>
            <a className={styles.registerButton} href={registerLink(returnPath)}>Register</a>
          </div>
          <button className={styles.panelClose} type="button" aria-label="Close" onClick={() => setOpen(false)}>
            <CloseIcon />
          </button>
        </div>
      </div>
    </>
  );
}

type UserMenuProps = {
  email: string | null;
  onOrdersPage?: boolean;
};

export function UserMenu({ email, onOrdersPage = false }: UserMenuProps) {
  const { open, setOpen, trigger } = useMenu();

  function closeMenu() {
    setOpen(false);
    trigger.current?.focus();
  }

  async function handleLogout() {
    setOpen(false);
    await logout();
    window.location.assign('/login');
  }

  return (
    <div className={onOrdersPage ? `${styles.user} ${styles.ordersUser}` : styles.user}>
      <button
        ref={trigger}
        className={styles.avatarButton}
        type="button"
        aria-label="User menu"
        title={onOrdersPage ? undefined : 'User menu'}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen(!open)}
      >
        {onOrdersPage && email && <span className={styles.triggerEmail} title={email}>{email}</span>}
        <img className={styles.avatar} src={avatarUrl} alt="" />
      </button>
      {open && (
        <>
          <button className={styles.menuBackdrop} type="button" tabIndex={-1} aria-label="Close" onClick={closeMenu} />
          <div className={styles.menu}>
            <div className={styles.menuBox}>
              <div className={styles.menuHeader}>
                <a href="/" aria-label="Eneba home"><img src={logo} width="96" height="30" alt="Eneba" /></a>
                <button type="button" aria-label="Close" onClick={closeMenu}><CloseIcon /></button>
              </div>
              <ul className={styles.menuList}>
                <li>
                  <a className={styles.profile} href="/orders" aria-label={email ? undefined : 'Orders'}>
                    <img className={styles.profileAvatar} src={avatarUrl} width="32" height="32" alt="" />
                    {email && <strong className={styles.profileEmail} title={email}>{email}</strong>}
                  </a>
                </li>
                <li>
                  {onOrdersPage ? (
                    <a className={styles.menuItem} href="/">
                      <StoreIcon />
                      <span>Back to store</span>
                    </a>
                  ) : (
                    <a className={styles.menuItem} href="/orders">
                      <OrdersIcon />
                      <span>Orders</span>
                    </a>
                  )}
                </li>
                <li>
                  <button className={styles.logout} type="button" onClick={handleLogout}>
                    <LogoutIcon />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
            <div className={styles.arrow} aria-hidden="true" />
          </div>
        </>
      )}
    </div>
  );
}
