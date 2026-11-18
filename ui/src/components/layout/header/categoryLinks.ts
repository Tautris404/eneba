import type { StoreFilters } from '../../../utils/storeLinks';

export type Category = {
  label: string;
  badge?: string;
  filters?: StoreFilters;
  children?: Category[];
};

export const storeShortcuts: Category[] = [
  { label: 'Software', filters: { product_type: 'software' } },
  { label: 'eGift Cards', filters: { product_type: 'top-up' } },
  { label: 'Eneba Gift Cards', filters: { search: 'Eneba Gift Card' } },
];

export const categories: Category[] = [
  { label: 'All offers' },
  { label: 'Games', children: [
    { label: 'All offers', filters: { product_type: 'game' } },
    { label: 'Cheap Steam games', filters: { product_type: 'game', platform: 'steam', sort: 'price_asc' } },
    { label: 'Trending now', badge: 'New', filters: { product_type: 'game' } },
    { label: 'Platforms', children: [
      { label: 'All offers', filters: { product_type: 'game' } },
      { label: 'Steam Games', filters: { product_type: 'game', platform: 'steam' } },
      { label: 'PSN Games', filters: { product_type: 'game', platform: 'psn' } },
      { label: 'Xbox Games', filters: { product_type: 'game', platform: 'xbox' } },
      { label: 'Upcoming Games', filters: { product_type: 'game', sort: 'date_desc' } },
      { label: 'DLCs', filters: { product_type: 'dlc' } },
    ] },
    { label: 'Popular Genres', children: [
      { label: 'Singleplayer', filters: { product_type: 'game', genre: 'single-player-games' } },
      { label: 'Multiplayer', filters: { product_type: 'game', genre: 'multiplayer-games' } },
      { label: 'Action', filters: { product_type: 'game', genre: 'action-games' } },
      { label: 'First Person', filters: { product_type: 'game', genre: 'first-person-games' } },
      { label: 'Third Person', filters: { product_type: 'game', genre: 'third-person-games' } },
      { label: 'Simulation', filters: { product_type: 'game', genre: 'simulation-games' } },
      { label: 'Co-Op', filters: { product_type: 'game', genre: 'co-op-games' } },
      { label: 'FPS/TPS', filters: { product_type: 'game', genre: 'fps-games' } },
      { label: 'Adventure', filters: { product_type: 'game', genre: 'adventure-games' } },
    ] },
    { label: 'Niche Genres', children: [
      { label: 'Virtual Reality', filters: { product_type: 'game', genre: 'virtual-reality-games' } },
      { label: 'Puzzle', filters: { product_type: 'game', genre: 'puzzle-games' } },
    ] },
    { label: 'Skins & Bundles', children: [
      { label: 'Fortnite Bundles', filters: { product_type: ['dlc', 'game-points'], search: 'Fortnite' } },
      { label: 'Fortnite Skins', filters: { product_type: ['dlc', 'game-points'], search: 'Fortnite' } },
      { label: 'CoD Skins', filters: { product_type: ['dlc', 'game-points'], search: 'Call of Duty' } },
      { label: 'Roblox Skins', filters: { product_type: ['dlc', 'game-points'], search: 'Roblox' } },
    ] },
    { label: 'Discover by price', children: [
      { label: 'Games under €2', filters: { product_type: 'game', max_price: '2' } },
      { label: 'Games under €5', filters: { product_type: 'game', max_price: '5' } },
      { label: 'Games under €10', filters: { product_type: 'game', max_price: '10' } },
      { label: 'Games under €25', filters: { product_type: 'game', max_price: '25' } },
      { label: 'Games under €50', filters: { product_type: 'game', max_price: '50' } },
      { label: 'Games for €50 and more', filters: { product_type: 'game', min_price: '50' } },
    ] },
  ] },
  { label: 'Gaming eCards', children: [
    { label: 'All offers', filters: { product_type: 'giftcard' } },
    { label: 'PC Gift Cards', children: [
      { label: 'All offers', filters: { product_type: 'giftcard' } },
      { label: 'Steam Gift Cards', filters: { product_type: 'giftcard', platform: 'steam-gift-card' } },
      { label: 'Fortnite V-Bucks', filters: { product_type: ['giftcard', 'game-points'], search: 'Fortnite V-Bucks' } },
      { label: 'Roblox Robux', filters: { product_type: ['giftcard', 'game-points'], search: 'Roblox Robux' } },
      { label: 'League of Legends', filters: { product_type: ['giftcard', 'game-points'], search: 'League of Legends' } },
      { label: 'Eneba Gift Cards', filters: { product_type: ['giftcard', 'top-up'], search: 'Eneba Gift Card' } },
    ] },
    { label: 'Console Gift Cards', children: [
      { label: 'Xbox Live Gift Cards', filters: { product_type: 'giftcard', platform: 'xbox' } },
    ] },
    { label: 'Gift cards by price', children: [
      { label: 'Gift cards under €10', filters: { product_type: 'giftcard', max_price: '10' } },
      { label: 'Gift cards under €25', filters: { product_type: 'giftcard', max_price: '25' } },
      { label: 'Gift cards under €50', filters: { product_type: 'giftcard', max_price: '50' } },
      { label: 'Gift cards for €50 and more', filters: { product_type: 'giftcard', min_price: '50' } },
    ] },
    { label: 'Game Points', children: [
      { label: 'All offers', filters: { product_type: 'game-points' } },
      { label: 'FC Points', filters: { product_type: 'game-points', search: 'FC Points' } },
      { label: 'Valorant Points (Riot)', filters: { product_type: 'game-points', platform: 'riot-games' } },
      { label: 'PUBG UC', filters: { product_type: 'game-points', search: 'PUBG' } },
    ] },
  ] },
  { label: 'eGift Cards', children: [
    { label: 'All offers', filters: { product_type: 'top-up' } },
    { label: 'Popular eGift Cards', children: [
      { label: 'All offers', filters: { product_type: 'top-up' } },
      { label: 'Eneba Gift Cards', filters: { product_type: ['giftcard', 'top-up'], search: 'Eneba Gift Card' } },
      { label: 'Razer Gold Gift Cards', filters: { product_type: 'top-up', platform: 'razer' } },
      { label: 'Netflix Gift Cards', filters: { product_type: 'top-up', platform: 'netflix' } },
    ] },
    { label: 'Gift cards by price', children: [
      { label: 'Gift cards under €10', filters: { product_type: 'top-up', max_price: '10' } },
      { label: 'Gift cards under €25', filters: { product_type: 'top-up', max_price: '25' } },
      { label: 'Gift cards under €50', filters: { product_type: 'top-up', max_price: '50' } },
    ] },
  ] },
  { label: 'E-money cards', children: [
    { label: 'All offers', filters: { product_type: 'emoney-prepaid' } },
    { label: 'PaysafeCard', filters: { product_type: 'emoney-prepaid', platform: 'paysafecard' } },
    { label: 'Transcash', filters: { product_type: 'emoney-prepaid', platform: 'transcash' } },
    { label: 'Rewup', filters: { product_type: 'emoney-prepaid', platform: 'rewup' } },
    { label: 'Flexepin', filters: { product_type: 'emoney-prepaid', platform: 'flexepin' } },
  ] },
  { label: 'PSN', children: [
    { label: 'All offers', filters: { platform: 'psn' } },
    { label: 'PSN list', children: [
      { label: 'All offers', filters: { platform: 'psn' } },
      { label: 'PSN Games', filters: { product_type: 'game', platform: 'psn' } },
      { label: 'PSN DLCs', filters: { product_type: 'dlc', platform: 'psn' } },
    ] },
  ] },
  { label: 'Xbox', children: [
    { label: 'All offers', filters: { platform: 'xbox' } },
    { label: 'Xbox list', children: [
      { label: 'All offers', filters: { platform: 'xbox' } },
      { label: 'Xbox Games', filters: { product_type: 'game', platform: 'xbox' } },
      { label: 'Xbox Live Gift Cards', filters: { product_type: 'giftcard', platform: 'xbox' } },
      { label: 'Xbox Live DLCs', filters: { product_type: 'dlc', platform: 'xbox' } },
    ] },
    { label: 'Gift cards by price', children: [
      { label: 'Gift cards under €10', filters: { product_type: 'giftcard', platform: 'xbox', max_price: '10' } },
      { label: 'Gift cards under €25', filters: { product_type: 'giftcard', platform: 'xbox', max_price: '25' } },
      { label: 'Gift cards under €50', filters: { product_type: 'giftcard', platform: 'xbox', max_price: '50' } },
    ] },
    { label: 'Games by price', children: [
      { label: 'Games under €10', filters: { product_type: 'game', platform: 'xbox', max_price: '10' } },
      { label: 'Games under €25', filters: { product_type: 'game', platform: 'xbox', max_price: '25' } },
      { label: 'Games under €50', filters: { product_type: 'game', platform: 'xbox', max_price: '50' } },
    ] },
  ] },
  { label: 'Software', children: [
    { label: 'All offers', filters: { product_type: 'software' } },
    { label: 'Windows 11', filters: { product_type: 'software', search: 'Windows 11' } },
    { label: 'Windows 10', filters: { product_type: 'software', search: 'Windows 10' } },
    { label: 'Avast', filters: { product_type: 'software', platform: 'avast' } },
    { label: 'Adobe', filters: { product_type: 'software', platform: 'adobe' } },
    { label: 'McAfee Total Protection', filters: { product_type: 'software', search: 'McAfee Total Protection' } },
    { label: 'Norton', filters: { product_type: 'software', platform: 'norton' } },
    { label: 'Kaspersky', filters: { product_type: 'software', platform: 'kaspersky' } },
  ] },
  { label: 'Mobile recharges', filters: { product_type: 'mobile-recharge' } },
  { label: 'eSIM', children: [
    { label: 'All offers', filters: { product_type: 'esim' } },
    { label: 'Airalo', filters: { product_type: 'esim', platform: 'airalo' } },
    { label: 'GigSky', filters: { product_type: 'esim', platform: 'gigsky' } },
    { label: 'Novyro', filters: { product_type: 'esim', platform: 'novyro' } },
  ] },
  { label: 'Gift Guide', filters: { product_type: ['game', 'giftcard', 'top-up'] } },
];
