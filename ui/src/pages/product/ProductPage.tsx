import { useEffect, useState } from 'react';
import { Preloader } from '../../components/ui/Preloader';
import { getProductDetails } from '../../services/productsApi';
import { addToCart, createCartItem } from '../../state/cart';
import { buyNow } from '../../state/checkout';
import type { ProductDetails, ProductOffer } from '../../types/product';
import { RegionDialog } from './RegionDialog';
import { BestOfferBox } from './BestOfferBox';
import { OfferCard } from './OfferCard';
import { ProductDescription } from './ProductDescription';
import { ProductInfo } from './ProductInfo';
import { SafeCheckout } from './SafeCheckout';
import styles from './ProductPage.module.css';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string; notFound: boolean }
  | { status: 'ready'; product: ProductDetails };

const initialOfferCount = 5;

export function ProductPage({ slug }: { slug: string }) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProduct() {
      try {
        const product = await getProductDetails(slug, controller.signal);
        if (!controller.signal.aborted) setState({ status: 'ready', product });
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : 'Could not load the product.';
        setState({ status: 'error', message, notFound: /not found/i.test(message) });
      }
    }

    setState({ status: 'loading' });
    loadProduct();
    return () => controller.abort();
  }, [slug, attempt]);

  useEffect(() => {
    if (state.status === 'ready') document.title = `${state.product.name} | Eneba`;
  }, [state]);

  if (state.status === 'loading') {
    return (
      <div className={styles.page}>
        <Preloader size="lg" color="white" label="Loading product" centered />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <h1>{state.notFound ? 'Product not found' : 'Something went wrong'}</h1>
          <p>{state.notFound ? 'The product you are looking for does not exist or is no longer available.' : state.message}</p>
          {state.notFound ? (
            <a className={styles.primaryButton} href="/store">Go to store</a>
          ) : (
            <button className={styles.primaryButton} type="button" onClick={() => setAttempt(attempt + 1)}>Try again</button>
          )}
        </div>
      </div>
    );
  }

  return <ProductView product={state.product} />;
}

type CartError = { offerId: number; message: string };

function ProductView({ product }: { product: ProductDetails }) {
  const [regionDialogOpen, setRegionDialogOpen] = useState(false);
  const [cartError, setCartError] = useState<CartError | null>(null);
  const [visibleOfferCount, setVisibleOfferCount] = useState(initialOfferCount);
  const offers = product.offers;
  const bestOffer: ProductOffer | undefined = offers[0];
  const hiddenOfferCount = Math.max(0, offers.length - visibleOfferCount);
  const regionLabel = product.regions.length > 0 ? product.regions.join(', ') : 'Global';

  function selectOffer(offer: ProductOffer, buyImmediately: boolean) {
    setCartError(null);
    try {
      const item = createCartItem(product, offer);
      if (buyImmediately) buyNow(item);
      else addToCart(item);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      setCartError({ offerId: offer.id, message });
    }
  }

  function errorForOffer(offerId: number) {
    return cartError?.offerId === offerId ? cartError.message : null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.image}>
            {product.cover_image_url ? (
              <img src={product.cover_image_url} alt={product.name} width="224" height="320" />
            ) : (
              <div className={styles.noImage} aria-hidden="true" />
            )}
          </div>

          <div className={styles.title}>
            <h1>{product.name}</h1>
          </div>

          <ProductInfo product={product} regionLabel={regionLabel} onShowRegions={() => setRegionDialogOpen(true)} />

          <aside className={styles.cover}>
            <div className={styles.sticky}>
              <BestOfferBox
                bestOffer={bestOffer}
                otherOffers={offers.slice(1)}
                error={bestOffer ? errorForOffer(bestOffer.id) : null}
                onBuy={(offer) => selectOffer(offer, true)}
                onAdd={(offer) => selectOffer(offer, false)}
              />
              <SafeCheckout className={styles.paymentDesktop} />
            </div>
          </aside>

          <div className={styles.offers}>
            <section id="offers" className={styles.offersSection} aria-labelledby="offers-heading">
              <h2 id="offers-heading" className={styles.sectionHeading}>
                <span className={styles.count}>{offers.length}</span> {offers.length === 1 ? 'offer' : 'offers'}
              </h2>
              {offers.length === 0 ? (
                <p className={styles.noOffers}>There are no offers for this product right now.</p>
              ) : (
                <ul className={styles.offerList}>
                  {offers.slice(0, visibleOfferCount).map((offer) => (
                    <li key={offer.id}>
                      <OfferCard
                        offer={offer}
                        error={errorForOffer(offer.id)}
                        onBuy={() => selectOffer(offer, true)}
                        onAdd={() => selectOffer(offer, false)}
                      />
                    </li>
                  ))}
                </ul>
              )}
              {hiddenOfferCount > 0 && (
                <button className={styles.loadMore} type="button" onClick={() => setVisibleOfferCount(offers.length)}>
                  Load {hiddenOfferCount} more {hiddenOfferCount === 1 ? 'offer' : 'offers'}
                </button>
              )}
            </section>
            <SafeCheckout className={styles.paymentMobile} />
          </div>

          <div className={styles.details}>
            {product.genres.length > 0 && (
              <section aria-labelledby="details-heading">
                <h2 id="details-heading" className={styles.detailsHeading}>Product Details</h2>
                <ul className={styles.tags}>
                  {product.genres.map((genre) => (
                    <li key={genre}>
                      <span className={styles.tag}>{genre}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {product.description.trim() && <ProductDescription text={product.description} />}
          </div>
        </div>
      </div>

      {regionDialogOpen && (
        <RegionDialog region={regionLabel} countries={product.countries} onClose={() => setRegionDialogOpen(false)} />
      )}
    </div>
  );
}
