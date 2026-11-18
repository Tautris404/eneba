import { useEffect, type ReactNode } from 'react';
import logo from '../../assets/images/eneba-logo.svg';
import styles from './AuthLayout.module.css';

type AuthLayoutProps = {
  pageTitle: string;
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  headline?: ReactNode;
  verified?: boolean;
};

export function AuthLayout({ pageTitle, title, subtitle, children, headline, verified = false }: AuthLayoutProps) {
  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.logo} href="/" aria-label="Eneba home">
          <img src={logo} width="170" height="53" alt="Eneba" />
        </a>
      </header>
      <main className={styles.main}>
        <h1 className={styles.headline}>{headline ?? <>Hi! <br /> It’s nice to see you!</>}</h1>
        <div className={styles.card}>
          <div>
            <div className={styles.cardHeader}>
              {verified ? (
                <div className={styles.verifyTitle}>
                  <svg viewBox="0 0 36 36" fill="none" aria-hidden="true">
                    <circle cx="18" cy="18" r="16.75" stroke="currentColor" strokeWidth="2.5" />
                    <path d="m11 18.5 4.75 4.75L25.5 13.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h2>{title}</h2>
                </div>
              ) : (
                <h2>{title}</h2>
              )}
              <p>{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </main>
      <footer className={styles.footer}>
        <div className={styles.copyright}>Copyright © {new Date().getFullYear()} Eneba. All Rights Reserved.</div>
      </footer>
    </div>
  );
}
