import type { HomeGiftCard } from '../../types/home';
import { storeLink } from '../../utils/storeLinks';
import { Carousel } from './Carousel';
import { SectionTitle, ShowAllLink } from './SectionTitle';
import styles from './HomeCatalog.module.css';

export function giftCardImages(giftCards: HomeGiftCard[]) {
  return giftCards.map((giftCard) => giftCard.image_url);
}

type GiftCardShelfProps = {
  title: string;
  info: string;
  giftCards: HomeGiftCard[] | undefined;
};

export function GiftCardShelf({ title, info, giftCards }: GiftCardShelfProps) {
  return (
    <section className={styles.alternate}>
      <div className={`${styles.container} ${styles.giftSection}`}>
        <SectionTitle title={title} info={info} />
        {giftCards ? (
          <Carousel className={styles.shelf} label={title}>
            {giftCards.map((giftCard) => (
              <a key={giftCard.name} className={styles.giftCard} href={giftCard.link_url}>
                <img src={giftCard.image_url} alt={`${giftCard.name} gift cards`} width="200" height="280" loading="lazy" />
              </a>
            ))}
          </Carousel>
        ) : (
          <p>Could not load gift cards.</p>
        )}
        <ShowAllLink title={title} href={storeLink({ product_type: 'top-up' })} />
      </div>
    </section>
  );
}
