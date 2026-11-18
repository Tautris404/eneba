import safeCheckoutIcon from '../../assets/images/safe-checkout.svg';
import visaMastercard from '../../assets/images/visa-mastercard.svg';
import { PcMagBadge } from '../../components/ui/PcMagBadge';
import styles from './ProductPage.module.css';

export function SafeCheckout({ className }: { className: string }) {
  return (
    <div className={`${styles.payment} ${className}`}>
      <h2 className={styles.paymentHeading}>Safe Checkout Guaranteed</h2>
      <div className={styles.paymentPanel}>
        <div className={styles.paymentSection}>
          <span className={styles.paymentTitle}>Trusted Payment Methods</span>
          <ul className={styles.paymentIcons}>
            <li><img src={visaMastercard} alt="Visa and Mastercard" width="66" height="21" /></li>
          </ul>
        </div>
        <div className={styles.paymentBadges}>
          <div className={styles.safeCheckout}>
            <img src={safeCheckoutIcon} alt="" width="28" height="29" />
            <div>Safe Checkout<span>Guaranteed</span></div>
          </div>
          <PcMagBadge />
        </div>
      </div>
    </div>
  );
}
