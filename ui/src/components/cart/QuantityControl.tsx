type QuantityControlProps = {
  className: string;
  productName: string;
  quantity: number;
  canIncrease: boolean;
  onChange: (change: number) => void;
};

export function QuantityControl({ className, productName, quantity, canIncrease, onChange }: QuantityControlProps) {
  return (
    <div className={className}>
      <button type="button" aria-label={`Decrease quantity of ${productName}`} disabled={quantity <= 1} onClick={() => onChange(-1)}>
        <span>-</span>
      </button>
      <span aria-label="Quantity">{quantity}</span>
      <button type="button" aria-label={`Increase quantity of ${productName}`} disabled={!canIncrease} onClick={() => onChange(1)}>
        <span>+</span>
      </button>
    </div>
  );
}
