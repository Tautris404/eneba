import { AppDownloadLinks } from '../../components/layout/AppDownloadLinks';
import { SocialLinks } from '../../components/layout/footer/SocialLinks';
import styles from './Orders.module.css';

export function OrdersFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerSections}>
        <section aria-labelledby="orders-app-title">
          <h2 id="orders-app-title">For the best experience, download the Eneba App</h2>
          <div className={styles.appLinks}>
            <AppDownloadLinks />
          </div>
        </section>
        <section className={styles.follow} aria-labelledby="orders-follow-title">
          <h2 id="orders-follow-title">Follow us</h2>
          <SocialLinks />
        </section>
      </div>
      <p className={styles.copyright}>
        Copyright © {new Date().getFullYear()} Eneba. All Rights Reserved. JSC “Helis play”, Gyneju St. 4-333,
        Vilnius, the Republic of Lithuania
      </p>
    </footer>
  );
}
