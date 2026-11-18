import fallbackPlatformImage from '../../assets/images/platform-other.svg';
import type { ProductDetails } from '../../types/product';
import { GlobeIcon, KeyIcon, RefundIcon } from './ProductIcons';
import styles from './ProductPage.module.css';

type ProductInfoProps = {
  product: ProductDetails;
  regionLabel: string;
  onShowRegions: () => void;
};

export function ProductInfo({ product, regionLabel, onShowRegions }: ProductInfoProps) {
  return (
    <div className={styles.info}>
      <ul className={styles.infoList}>
        <li>
          <GlobeIcon className={styles.infoIcon} />
          <div>
            <strong className={styles.infoTitle}>{regionLabel}</strong>
            <span className={styles.infoText}>
              <span className={styles.check}>
                Check{' '}
                <button className={styles.linkButton} type="button" onClick={onShowRegions}>
                  region restrictions
                </button>
              </span>
            </span>
          </div>
        </li>
        {product.platforms.map((platform) => (
          <li key={platform.name}>
            <img
              className={styles.infoIcon}
              src={platform.image_url || fallbackPlatformImage}
              alt=""
              width="35"
              height="35"
              onError={(event) => {
                const image = event.currentTarget;
                if (image.dataset.fallback) return;
                image.dataset.fallback = 'true';
                image.src = fallbackPlatformImage;
              }}
            />
            <div>
              <strong className={styles.infoTitle}>{platform.name}</strong>
              <span className={styles.infoText}>
                Activate/redeem on{' '}
                {platform.website_url ? (
                  <a className={styles.platformLink} href={platform.website_url} target="_blank" rel="noreferrer">
                    {platform.name}
                  </a>
                ) : (
                  <span>{platform.name}</span>
                )}
              </span>
            </div>
          </li>
        ))}
        <li>
          <KeyIcon className={styles.infoIcon} />
          <div>
            <strong className={styles.infoTitle}>Digital key</strong>
            <span className={styles.infoText}>This is a digital edition of the product (CD-KEY)</span>
            <span className={`${styles.infoText} ${styles.instant}`}>Instant delivery</span>
          </div>
        </li>
        <li>
          <RefundIcon className={styles.infoIcon} />
          <div>
            <strong className={styles.infoTitle}>Instant refunds</strong>
            <span className={`${styles.infoText} ${styles.refundText}`}>
              Unlike other marketplaces, Eneba allows you to get an instant refund for unviewed keys.
            </span>
          </div>
        </li>
      </ul>
      {product.operating_systems.length > 0 && (
        <div className={styles.worksOn}>
          <span className={styles.worksLabel}>Works on:</span>
          <ul>
            {product.operating_systems.map((system) => <li key={system}>{system}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
