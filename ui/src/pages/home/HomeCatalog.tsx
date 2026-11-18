import { productCardImages } from '../../components/product/ProductCard';
import { Preloader } from '../../components/ui/Preloader';
import { useImagesLoaded } from '../../hooks/useImagesLoaded';
import { getHomeBanners, getHomeGenres, getHomeGiftCards, getHomeShortcuts } from '../../services/homeApi';
import { storeLink, type StoreFilters } from '../../utils/storeLinks';
import { HomeBanners, bannerImages } from './HomeBanners';
import { ProductShelf } from './ProductShelf';
import { CategoryShortcuts, shortcutIcons } from './CategoryShortcuts';
import { GenreSection, genreIcons } from './GenreSection';
import { GiftCardShelf, giftCardImages } from './GiftCardShelf';
import { useHomeData } from './useHomeData';
import { useHomeProducts } from './useHomeProducts';
import styles from './HomeCatalog.module.css';

const bestSellersInfo = 'Recommendations based on most purchased products by our users';
const dealsInfo = 'Discounted products selected by relevance';
const topGamesFilters: StoreFilters = { product_type: 'game' };
const giftCardProductsFilters: StoreFilters = { product_type: ['giftcard', 'game-points'] };
const dealsFilters: StoreFilters = { deals: '1' };

function isFinished(result: { data?: unknown; failed: boolean }) {
  return result.failed || result.data !== undefined;
}

export function HomeCatalog() {
  const banners = useHomeData(getHomeBanners);
  const shortcuts = useHomeData(getHomeShortcuts);
  const giftCards = useHomeData(getHomeGiftCards);
  const genres = useHomeData(getHomeGenres);
  const topGames = useHomeProducts(storeLink(topGamesFilters));
  const giftCardProducts = useHomeProducts(storeLink(giftCardProductsFilters));
  const deals = useHomeProducts(storeLink(dealsFilters));

  const allImages = [
    ...bannerImages(banners.data ?? []),
    ...shortcutIcons(shortcuts.data ?? []),
    ...productCardImages(topGames.data?.products ?? []),
    ...giftCardImages(giftCards.data ?? []),
    ...productCardImages(giftCardProducts.data?.products ?? []),
    ...productCardImages(deals.data?.products ?? []),
    ...genreIcons(genres.data ?? []),
  ];
  const imagesLoaded = useImagesLoaded(allImages);
  const dataLoaded = [banners, shortcuts, giftCards, genres, topGames, giftCardProducts, deals].every(isFinished);

  if (!dataLoaded || !imagesLoaded) {
    return (
      <div className={styles.catalog}>
        <Preloader size="lg" color="white" label="Loading home page" centered />
      </div>
    );
  }

  return (
    <div className={styles.catalog}>
      <HomeBanners banners={banners.data} />
      <CategoryShortcuts shortcuts={shortcuts.data} />
      <ProductShelf title="Top games" info={bestSellersInfo} filters={topGamesFilters} products={topGames.data?.products} />
      <GiftCardShelf title="Best selling eGift Cards" info={bestSellersInfo} giftCards={giftCards.data} />
      <ProductShelf
        title="Best selling gift cards"
        info={bestSellersInfo}
        filters={giftCardProductsFilters}
        products={giftCardProducts.data?.products}
      />
      <ProductShelf title="Deals" info={dealsInfo} filters={dealsFilters} products={deals.data?.products} alternate />
      <GenreSection genres={genres.data} />
    </div>
  );
}
