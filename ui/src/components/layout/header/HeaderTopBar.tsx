import logo from '../../../assets/images/eneba-logo.svg';
import { openCart, useCart } from '../../../state/cart';
import { countCartItems } from '../../../utils/cartTotals';
import { ProductSearch } from '../../search/ProductSearch';
import { CartIcon } from '../../ui/Icons';
import { AccountMenu } from './AccountMenu';
import styles from './Header.module.css';

export function HeaderTopBar({ onOpenCategories }: { onOpenCategories: () => void }) {
  const { items } = useCart();
  const quantity = countCartItems(items);
  const cartIconWithCount = (
    <>
      <CartIcon />
      {quantity > 0 && <span className={styles.cartCount} aria-hidden="true">{quantity}</span>}
    </>
  );

  return (
    <div className={styles.topBar}>
      <button
        className={styles.mobileMenu}
        type="button"
        aria-label="Categories"
        aria-haspopup="dialog"
        onClick={onOpenCategories}
      >
        <span className={styles.mobileMenuIcon} aria-hidden="true" />
      </button>
      <a className={styles.logo} href="/" aria-label="Eneba home">
        <img src={logo} width="155" height="48" alt="Eneba" />
      </a>
      <ProductSearch />
      <div className={styles.actions}>
        <button className={styles.cart} type="button" aria-label="My shopping cart" aria-haspopup="dialog" onClick={openCart}>
          {cartIconWithCount}
        </button>
        <a className={`${styles.cart} ${styles.mobileCart}`} href="/checkout" aria-label="My shopping cart">
          {cartIconWithCount}
        </a>
        <AccountMenu />
      </div>
    </div>
  );
}
