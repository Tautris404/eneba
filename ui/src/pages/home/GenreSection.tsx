import { useState } from 'react';
import type { HomeGenre } from '../../types/home';
import { SectionTitle } from './SectionTitle';
import styles from './HomeCatalog.module.css';

const initialGenreCount = 7;

export function genreIcons(genres: HomeGenre[]) {
  const urls: string[] = [];
  for (const genre of genres) {
    if (!urls.includes(genre.icon_url)) urls.push(genre.icon_url);
  }
  return urls;
}

export function GenreSection({ genres }: { genres: HomeGenre[] | undefined }) {
  const [showAll, setShowAll] = useState(false);

  if (!genres) {
    return (
      <section>
        <div className={styles.container}>
          <SectionTitle title="Categories" />
          <p>Could not load categories.</p>
        </div>
      </section>
    );
  }

  const visibleGenres = showAll ? genres : genres.slice(0, initialGenreCount);

  return (
    <section>
      <div className={styles.container}>
        <SectionTitle title="Categories" />
        <div className={styles.genres}>
          {visibleGenres.map((genre) => (
            <a key={genre.link_url} href={genre.link_url}>
              <span>{genre.product_count}</span>
              <img src={genre.icon_url} width="40" height="40" alt="" />
              <span>{genre.name}</span>
            </a>
          ))}
        </div>
        {!showAll && genres.length > initialGenreCount && (
          <div className={styles.sectionAction}>
            <button className={styles.action} type="button" onClick={() => setShowAll(true)}>Load more</button>
          </div>
        )}
      </div>
    </section>
  );
}
