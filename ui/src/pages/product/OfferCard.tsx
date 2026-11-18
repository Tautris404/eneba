import { PlusIcon } from '../../components/ui/Icons';
import type { ProductOffer } from '../../types/product';
import { euros } from '../../utils/currency';
import { AddToCartIcon } from './ProductIcons';
import styles from './ProductPage.module.css';

export function finalPrice(offer: ProductOffer) {
  return offer.discounted_price ?? offer.price;
}

export function OldPrice({ offer }: { offer: ProductOffer }) {
  if (offer.discounted_price == null) return null;

  return (
    <div className={styles.oldPriceRow}>
      <s className={styles.oldPrice}>{euros.format(offer.price)}</s>
      {offer.discount != null && <span className={styles.discount}>-{offer.discount}%</span>}
    </div>
  );
}

export function AddToCartButton({ onAdd }: { onAdd: () => void }) {
  return (
    <button className={styles.cartButton} type="button" aria-label="Add to cart" onClick={onAdd}>
      <PlusIcon />
      <AddToCartIcon />
    </button>
  );
}

type OfferCardProps = {
  offer: ProductOffer;
  error: string | null;
  onBuy: () => void;
  onAdd: () => void;
};

export function OfferCard({ offer, error, onBuy, onAdd }: OfferCardProps) {
  return (
    <div className={styles.offerCard}>
      <div className={styles.offerRow}>
        <div className={styles.seller}>
          {offer.seller_image_url ? (
            <img className={styles.sellerAvatar} src={offer.seller_image_url} alt="" width="40" height="40" />
          ) : (
            <span className={styles.sellerAvatar} aria-hidden="true">{offer.seller_name.charAt(0).toUpperCase()}</span>
          )}
          <span className={styles.sellerName}>{offer.seller_name}</span>
        </div>
        <div className={styles.offerBuy}>
          <div className={styles.offerPrice}>
            <OldPrice offer={offer} />
            <span className={styles.offerAmount}>{euros.format(finalPrice(offer))}</span>
          </div>
          <div className={styles.offerActions}>
            <div className={styles.cartReveal}>
              <div className={styles.cartRevealInner}>
                <AddToCartButton onAdd={onAdd} />
              </div>
            </div>
            <button className={styles.offerButton} type="button" onClick={onBuy}>
              Buy now
            </button>
          </div>
        </div>
      </div>
      {error && <p className={styles.notice}>{error}</p>}
    </div>
  );
}
