import type { FilterKey, FilterOption } from '../../types/product';

export const filterGroups: { name: FilterKey; title: string }[] = [
  { name: 'product_type', title: 'Product type' },
  { name: 'operating_system', title: 'Operating system' },
  { name: 'platform', title: 'Platforms' },
  { name: 'genre', title: 'Genres' },
  { name: 'region', title: 'Regions' },
];

export type FilterLabels = Record<string, string>;

function compareOptions(first: FilterOption, second: FilterOption) {
  const countDifference = (second.count ?? 0) - (first.count ?? 0);
  if (countDifference !== 0) return countDifference;
  return first.label.localeCompare(second.label);
}

export function includeSelectedOptions(available: FilterOption[], selected: string[], name: FilterKey, labels: FilterLabels) {
  const missingValues = selected.filter((value) => !available.some((option) => option.value === value));
  const missingOptions = missingValues.map((value) => ({ value, label: labels[`${name}:${value}`] ?? value, count: 0 }));
  return [...available, ...missingOptions].sort(compareOptions);
}
