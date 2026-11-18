import { useState } from 'react';
import type { HomeBanner } from '../../types/home';
import styles from './HomeBanners.module.css';

export function bannerImages(banners: HomeBanner[]) {
  const urls: string[] = [];
  for (const banner of banners) urls.push(banner.wide_image_url, banner.collapsed_image_url);
  return urls;
}

export function HomeBanners({ banners }: { banners: HomeBanner[] | undefined }) {
  const [activeTitle, setActiveTitle] = useState<string | null>(null);

  if (!banners) return null;

  const expandedTitle = activeTitle ?? banners[0]?.title;

  return (
    <ul className={styles.banners} aria-label="Featured offers">
      {banners.map((banner) => {
        const expanded = banner.title === expandedTitle;
        return (
          <li key={banner.title} className={styles.banner} data-expanded={expanded} style={{ backgroundImage: `url("${banner.wide_image_url}")` }}>
            <div className={styles.artwork} aria-label={banner.title}>
              <img className={styles.mobileArtwork} src={banner.collapsed_image_url} alt="" width="200" height="400" />
            </div>
            <button
              className={styles.preview}
              type="button"
              aria-label={`Expand ${banner.title}`}
              aria-expanded={expanded}
              tabIndex={expanded ? -1 : undefined}
              onClick={() => setActiveTitle(banner.title)}
            >
              <img src={banner.collapsed_image_url} alt="" width="200" height="400" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
