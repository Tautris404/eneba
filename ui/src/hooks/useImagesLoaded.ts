import { useEffect, useState } from 'react';

function loadImage(url: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = url;
  });
}

export function useImagesLoaded(urls: string[]) {
  const urlsKey = urls.join('\n');
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    const list = urlsKey === '' ? [] : urlsKey.split('\n');

    async function loadAll() {
      await Promise.all(list.map(loadImage));
      if (isActive) setLoadedKey(urlsKey);
    }

    loadAll();
    return () => {
      isActive = false;
    };
  }, [urlsKey]);

  return loadedKey === urlsKey;
}
