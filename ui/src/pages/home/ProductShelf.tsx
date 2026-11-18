import { ProductCard } from '../../components/product/ProductCard';
import type { StoreProduct } from '../../types/product';
import { storeLink, type StoreFilters } from '../../utils/storeLinks';
import { Carousel } from './Carousel';
import { SectionTitle, ShowAllLink } from './SectionTitle';
import styles from './HomeCatalog.module.css';

type ProductShelfProps = {
  title: string;
  info: string;
  filters: StoreFilters;
  products: StoreProduct[] | undefined;
  alternate?: boolean;
};

export function ProductShelf({ title, info, filters, products, alternate = false }: ProductShelfProps) {
  function renderProducts() {
    if (!products) return <p>Could not load products.</p>;
    if (products.length === 0) return <p>No products found.</p>;
    return (
      <Carousel className={`${styles.shelf} ${styles.productShelf}`} label={title}>
        {products.map((product) => (
          <div key={product.slug}>
            <ProductCard product={product} shelf />
          </div>
        ))}
      </Carousel>
    );
  }

  return (
    <section className={alternate ? styles.alternate : undefined}>
      <div className={styles.container}>
        <SectionTitle title={title} info={info} />
        {renderProducts()}
        <ShowAllLink title={title} href={storeLink(filters)} />
      </div>
    </section>
  );
}
