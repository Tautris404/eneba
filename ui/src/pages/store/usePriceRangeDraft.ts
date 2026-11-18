import { useEffect, useState } from 'react';

const pricePattern = /^\d{1,8}(\.\d{1,2})?$/;

const applyDelayMs = 400;

function isValidPrice(value: string) {
  return value === '' || pricePattern.test(value);
}

export function usePriceRangeDraft(minimum: string, maximum: string, onChange: (minimum: string, maximum: string) => void) {
  const [min, setMin] = useState(minimum);
  const [max, setMax] = useState(maximum);
  const invalid = !isValidPrice(min) || !isValidPrice(max) || (min !== '' && max !== '' && Number(min) > Number(max));

  useEffect(() => {
    setMin(minimum);
    setMax(maximum);
  }, [minimum, maximum]);

  useEffect(() => {
    const changed = min !== minimum || max !== maximum;
    if (invalid || !changed) return;
    const timer = window.setTimeout(() => onChange(min, max), applyDelayMs);
    return () => window.clearTimeout(timer);
  }, [min, max, minimum, maximum, invalid, onChange]);

  function applyNow() {
    const changed = min !== minimum || max !== maximum;
    if (!invalid && changed) onChange(min, max);
  }

  return { min, setMin, max, setMax, invalid, applyNow };
}
