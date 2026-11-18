import type { ProductOffer } from '../../types/product';
import { euros } from '../../utils/currency';
import { AddToCartButton, finalPrice, OldPrice } from './OfferCard';
import styles from './ProductPage.module.css';

type BestOfferBoxProps = {
  bestOffer: ProductOffer | undefined;
  otherOffers: ProductOffer[];
  error: string | null;
  onBuy: (offer: ProductOffer) => void;
  onAdd: (offer: ProductOffer) => void;
};

export function BestOfferBox({ bestOffer, otherOffers, error, onBuy, onAdd }: BestOfferBoxProps) {
  if (!bestOffer) {
    return (
      <div className={styles.priceBox}>
        <div className={styles.soldOut}>
          <span className={styles.price}>Sold out</span>
          <p>There are no offers for this product right now.</p>
        </div>
      </div>
    );
  }

  const otherOffersFrom = otherOffers.length > 0 ? Math.min(...otherOffers.map(finalPrice)) : null;

  return (
    <div className={styles.priceBox}>
      <OldPrice offer={bestOffer} />
      <span className={styles.price}>{euros.format(finalPrice(bestOffer))}</span>
      <div className={styles.buyRow}>
        <button className={styles.buyButton} type="button" onClick={() => onBuy(bestOffer)}>
          Buy now
        </button>
        <AddToCartButton onAdd={() => onAdd(bestOffer)} />
      </div>
      {error && <p className={styles.notice}>{error}</p>}
      {otherOffersFrom !== null && (
        <div className={styles.moreOffers}>
          <a href="#offers">
            +{otherOffers.length} {otherOffers.length === 1 ? 'offer' : 'offers'} from {euros.format(otherOffersFrom)}
          </a>
        </div>
      )}
    </div>
  );
}
