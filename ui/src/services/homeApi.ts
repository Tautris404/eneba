import type { HomeBanner, HomeGenre, HomeGiftCard, HomeShortcut } from '../types/home';
import { checkResponse } from './apiClient';

const homeErrorMessage = 'Could not load the home page. Please try again.';

export async function getHomeBanners(signal: AbortSignal): Promise<HomeBanner[]> {
  const response = await fetch('/api/home/banners', { signal });
  await checkResponse(response, homeErrorMessage);
  return response.json();
}

export async function getHomeShortcuts(signal: AbortSignal): Promise<HomeShortcut[]> {
  const response = await fetch('/api/home/shortcuts', { signal });
  await checkResponse(response, homeErrorMessage);
  return response.json();
}

export async function getHomeGiftCards(signal: AbortSignal): Promise<HomeGiftCard[]> {
  const response = await fetch('/api/home/gift-cards', { signal });
  await checkResponse(response, homeErrorMessage);
  return response.json();
}

export async function getHomeGenres(signal: AbortSignal): Promise<HomeGenre[]> {
  const response = await fetch('/api/home/genres', { signal });
  await checkResponse(response, homeErrorMessage);
  return response.json();
}
