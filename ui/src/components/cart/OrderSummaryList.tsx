import { canAddMore } from '../../state/cart';
import { changePurchaseQuantity, removeFromPurchase } from '../../state/checkout';
import type { CartItem } from '../../types/cart';
import { cartTotal } from '../../utils/cartTotals';
import { euros } from '../../utils/currency';
import { productLink } from '../../utils/storeLinks';
import { TrashIcon } from './CartIcons';
import { DigitalProductHelp } from './DigitalProductHelp';
import { QuantityControl } from './QuantityControl';
import styles from './Cart.module.css';

export function OrderSummaryList({ items }: { items: CartItem[] }) {
  const canIncrease = canAddMore(items);

  return (
    <ul className={styles.summaryList}>
      {items.map((item) => (
        <li key={item.offerId}>
          <OrderSummaryItem item={item} canIncrease={canIncrease} />
        </li>
      ))}
    </ul>
  );
}

function OrderSummaryItem({ item, canIncrease }: { item: CartItem; canIncrease: boolean }) {
  const href = productLink(item.slug);

  return (
    <div className={styles.summaryItem}>
      <div className={styles.summarySeller}>
        <span>Sold by</span>
        {item.sellerImage && <img src={item.sellerImage} alt="" width="16" height="16" />}
        <strong>{item.seller}</strong>
      </div>
      {item.image && (
        <a className={styles.coverLink} href={href} tabIndex={-1} aria-hidden="true">
          <img className={styles.summaryCover} src={item.image} alt="" />
        </a>
      )}
      <div className={styles.summaryInfo}>
        <div className={styles.summaryTop}>
          <a className={styles.summaryName} href={href}>{item.name}</a>
          <button className={styles.summaryRemove} type="button" aria-label={`Remove ${item.name}`} onClick={() => removeFromPurchase(item.offerId)}>
            <TrashIcon />
          </button>
        </div>
        <div>
          <small className={styles.summaryDigital}>Digital product <DigitalProductHelp /></small>
          <div className={styles.summaryBottom}>
            <QuantityControl
              className={styles.summaryQuantity}
              productName={item.name}
              quantity={item.quantity}
              canIncrease={canIncrease}
              onChange={(change) => changePurchaseQuantity(item.offerId, change)}
            />
            <strong className={styles.summaryPrice}>{euros.format(cartTotal([item]))}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
