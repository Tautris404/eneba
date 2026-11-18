import monsterEnergy from '../../../assets/images/monster-energy.png';
import visaMastercard from '../../../assets/images/visa-mastercard.svg';
import { PcMagBadge } from '../../ui/PcMagBadge';
import { AppDownloadLinks } from '../AppDownloadLinks';
import { SocialLinks } from './SocialLinks';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.payments} aria-label="Payment methods">
        <img src={visaMastercard} alt="Visa and Mastercard" width="66" height="21" />
      </div>

      <div className={styles.container}>
        <div className={styles.sections}>
          <section aria-labelledby="footer-follow-us">
            <h2 className={styles.heading} id="footer-follow-us">Follow us</h2>
            <SocialLinks />
            <div className={styles.partners}>
              <PcMagBadge />
              <img className={styles.monster} src={monsterEnergy} alt="Monster Energy" loading="lazy" />
            </div>
          </section>

          <section aria-labelledby="footer-download-app">
            <h2 className={styles.heading} id="footer-download-app">Download the App</h2>
            <div className={styles.appLinks}>
              <AppDownloadLinks />
            </div>
          </section>
        </div>

        <p className={styles.copyright}>
          Copyright © 2026 Eneba. All Rights Reserved. JSC “Helis play”, Gyneju St. 4-333,
          Vilnius, the Republic of Lithuania
        </p>
      </div>
    </footer>
  );
}
