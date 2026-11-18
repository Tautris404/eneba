import { useState } from 'react';
import soldOutIcon from '../../assets/images/sold-out.svg';
import { getProductDetails } from '../../services/productsApi';
import { addToCart, createCartItem } from '../../state/cart';
import type { StoreProduct } from '../../types/product';
import { euros } from '../../utils/currency';
import { productLink } from '../../utils/storeLinks';
import { CartIcon, PlusIcon } from '../ui/Icons';
import styles from './ProductCard.module.css';

type ProductCardProps = {
  product: StoreProduct;
  shelf?: boolean;
};

export function productCardImages(products: StoreProduct[]) {
  const urls: string[] = [];
  for (const product of products) {
    if (product.cover_image_url) urls.push(product.cover_image_url);
    if (product.platform_image_url) urls.push(product.platform_image_url);
    const price = product.discounted_price ?? product.price;
    if (price === null) urls.push(soldOutIcon);
  }
  return urls;
}

export function ProductCard({ product, shelf = false }: ProductCardProps) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const href = productLink(product.slug);
  const price = product.discounted_price ?? product.price;
  const isSoldOut = price === null;

  async function addCheapestOfferToCart() {
    setAdding(true);
    setError('');
    try {
      const details = await getProductDetails(product.slug);
      const cheapestOffer = details.offers[0];
      if (!cheapestOffer) throw new Error('This product is sold out.');
      addToCart(createCartItem(details, cheapestOffer));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not add the product to your cart.');
    } finally {
      setAdding(false);
    }
  }

  return (
    <article className={styles.card} data-shelf={shelf || undefined} data-sold-out={isSoldOut || undefined}>
      <a className={styles.link} href={href}>
        <div className={styles.cover}>
          {product.cover_image_url ? (
            <img className={styles.coverImage} src={product.cover_image_url} alt="" loading="lazy" />
          ) : (
            <span className={styles.noImage}>No image available</span>
          )}
          <div className={styles.platform}>
            {product.platform_image_url && <img src={product.platform_image_url} alt="" width="16" height="16" />}
            <span title={product.platform_name}>{product.platform_name}</span>
          </div>
        </div>
        <div className={styles.information}>
          <h2 className={styles.name} title={product.name}>{product.name}</h2>
          <p className={styles.regions} title={product.regions.join(', ')}>{product.regions.join(', ')}</p>
          {price === null ? (
            <div className={styles.soldOut}>
              <img src={soldOutIcon} width="25" height="25" alt="" />
              <span>Sold out</span>
            </div>
          ) : (
            <ProductPrice product={product} price={price} />
          )}
        </div>
      </a>
      {!isSoldOut && (
        <div className={styles.actions}>
          <button
            className={styles.addToCart}
            type="button"
            aria-label={`Add to cart - ${product.name}`}
            aria-busy={adding}
            disabled={adding}
            onClick={addCheapestOfferToCart}
          >
            <span className={styles.cartIcon} aria-hidden="true"><PlusIcon className={styles.plusIcon} /><CartIcon /></span>
            <span className={styles.cartLabel}>{adding ? 'Adding…' : 'Add to cart'}</span>
          </button>
          <a className={styles.viewOffers} href={href}>View offers</a>
        </div>
      )}
      {error && <p className={styles.cartError}>{error}</p>}
    </article>
  );
}

function ProductPrice({ product, price }: { product: StoreProduct; price: number }) {
  const originalPrice = product.discounted_price != null ? product.price : null;
  const fromClassName = originalPrice !== null ? `${styles.from} ${styles.discounted}` : styles.from;

  return (
    <div className={styles.price}>
      <span className={fromClassName}>
        <span className={styles.fromLabel}>From</span>
        {originalPrice !== null && (
          <>
            <del>{euros.format(originalPrice)}</del>
            {product.discount_percent != null && <span className={styles.discount}>-{product.discount_percent}%</span>}
          </>
        )}
      </span>
      <span className={styles.priceRow}><strong>{euros.format(price)}</strong></span>
    </div>
  );
}
