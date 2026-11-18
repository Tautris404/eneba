import { EmptyCartIcon } from '../../components/cart/CartIcons';
import { storeLink } from '../../utils/storeLinks';
import buttonStyles from '../../components/ui/Buttons.module.css';
import styles from './Checkout.module.css';

export function EmptyCart() {
  return (
    <section className={styles.emptyCart} aria-labelledby="checkout-empty-title">
      <EmptyCartIcon color="rgb(255 255 255 / 70%)" />
      <h1 id="checkout-empty-title">Your cart is empty</h1>
      <p>It seems you haven't chosen your products yet</p>
      <a className={`${buttonStyles.primary} ${styles.emptyCartButton}`} href={storeLink()}>Shop now</a>
    </section>
  );
}
