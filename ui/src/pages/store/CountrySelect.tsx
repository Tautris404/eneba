import { SelectMenu, type SelectOption } from '../../components/ui/SelectMenu';
import type { FilterOption } from '../../types/product';

type CountrySelectProps = {
  value: string;
  countries?: FilterOption[];
  selectedLabel?: string;
  onChange: (value: string) => void;
};

export function CountrySelect({ value, countries = [], selectedLabel, onChange }: CountrySelectProps) {
  const options: SelectOption[] = [{ value: '', label: 'All countries' }, ...countries];
  if (value && !countries.some((option) => option.value === value)) {
    options.push({ value, label: selectedLabel ?? value });
  }

  return <SelectMenu label="Country" value={value} options={options} onChange={onChange} />;
}
