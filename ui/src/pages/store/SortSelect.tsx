import sortIcon from '../../assets/images/sort.svg';
import { SelectMenu } from '../../components/ui/SelectMenu';
import type { SortOrder } from '../../utils/storeLinks';

export const sortOptions: { value: SortOrder; label: string }[] = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'date_desc', label: 'Date: Newest First' },
  { value: 'date_asc', label: 'Date: Oldest First' },
  { value: 'popularity', label: 'Popularity: Most popular' },
  { value: 'alphabet_asc', label: 'Alphabet: A-Z' },
  { value: 'alphabet_desc', label: 'Alphabet: Z-A' },
];

export function SortSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <SelectMenu label="Sort by" value={value} options={sortOptions} onChange={onChange} variant="sort" icon={sortIcon} />;
}
