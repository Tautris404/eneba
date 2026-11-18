import { readStorage, writeStorage } from '../../utils/storage';

const storageKey = 'eneba.recentSearches';
const maxRecentSearches = 6;

export function readRecentSearches(): string[] {
  const saved = readStorage('local', storageKey);
  if (!Array.isArray(saved)) return [];

  const terms: string[] = [];
  for (const term of saved) {
    if (typeof term === 'string') terms.push(term);
  }
  return terms.slice(0, maxRecentSearches);
}

export function saveRecentSearches(terms: string[]) {
  writeStorage('local', storageKey, terms);
}

export function addRecentSearch(terms: string[], term: string) {
  const otherTerms = terms.filter((recent) => recent.toLowerCase() !== term.toLowerCase());
  return [term, ...otherTerms].slice(0, maxRecentSearches);
}
