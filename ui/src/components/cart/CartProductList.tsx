import { canAddMore, changeCartQuantity, removeFromCart } from '../../state/cart';
import type { CartItem } from '../../types/cart';
import { cartTotal } from '../../utils/cartTotals';
import { euros } from '../../utils/currency';
import { productLink } from '../../utils/storeLinks';
import { TrashIcon } from './CartIcons';
import { DigitalProductHelp } from './DigitalProductHelp';
import { QuantityControl } from './QuantityControl';
import styles from './Cart.module.css';

type CartProductListProps = {
  items: CartItem[];
  isCheckoutPage?: boolean;
};

export function CartProductList({ items, isCheckoutPage = false }: CartProductListProps) {
  const canIncrease = canAddMore(items);
  const listClassName = isCheckoutPage ? `${styles.products} ${styles.pageProducts}` : styles.products;

  return (
    <ul className={listClassName}>
      {items.map((item) => (
        <li key={item.offerId}>
          <CartProductRow item={item} canIncrease={canIncrease} />
        </li>
      ))}
    </ul>
  );
}

function CartProductRow({ item, canIncrease }: { item: CartItem; canIncrease: boolean }) {
  const href = productLink(item.slug);

  return (
    <div className={styles.product}>
      {item.image && (
        <a className={styles.coverLink} href={href} tabIndex={-1} aria-hidden="true">
          <img className={styles.cover} src={item.image} alt="" />
        </a>
      )}
      <div className={styles.productInfo}>
        <small className={styles.seller}>
          <span className={styles.sellerPrefix}>Sold by</span>
          {item.sellerImage && <img src={item.sellerImage} alt="" width="16" height="16" />}
          <strong>{item.seller}</strong>
        </small>
        <a className={styles.productName} href={href}>{item.name}</a>
        <div className={styles.productBottom}>
          <small>Digital product <DigitalProductHelp /></small>
          <QuantityControl
            className={styles.quantity}
            productName={item.name}
            quantity={item.quantity}
            canIncrease={canIncrease}
            onChange={(change) => changeCartQuantity(item.offerId, change)}
          />
          <strong className={styles.price}>{euros.format(cartTotal([item]))}</strong>
        </div>
      </div>
      <button className={styles.remove} type="button" aria-label={`Remove ${item.name}`} onClick={() => removeFromCart(item.offerId)}>
        <TrashIcon />
      </button>
    </div>
  );
}
