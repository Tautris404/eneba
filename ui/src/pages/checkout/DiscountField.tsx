import { useId, useState, type FormEvent } from 'react';
import { Preloader } from '../../components/ui/Preloader';
import { validateDiscount } from '../../services/ordersApi';
import type { Discount } from '../../types/cart';
import { DiscountChevronIcon, DiscountCodeIcon } from './CheckoutIcons';
import { FormMessage } from './FormMessage';
import buttonStyles from '../../components/ui/Buttons.module.css';
import styles from './Checkout.module.css';

type DiscountFieldProps = {
  discount: Discount | null;
  onApply: (discount: Discount | null) => void;
};

export function DiscountField({ discount, onApply }: DiscountFieldProps) {
  const [open, setOpen] = useState(discount !== null);
  const [code, setCode] = useState(discount?.code ?? '');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const panelId = useId();

  async function applyCode() {
    if (checking) return;
    setError('');
    onApply(null);
    const value = code.trim();
    if (!value) {
      setError('Invalid code');
      return;
    }

    setChecking(true);
    try {
      const result = await validateDiscount(value);
      onApply({ code: value, percent: result.discount_percent });
    } catch (reason) {
      setError(reason instanceof Error ? capitalize(reason.message) : 'Could not validate the discount code.');
    } finally {
      setChecking(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyCode();
  }

  return (
    <div className={`${styles.discount} ${open ? styles.discountOpen : ''}`}>
      <button
        className={styles.discountToggle}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        <DiscountCodeIcon />
        <span>Got discount code?</span>
        <DiscountChevronIcon />
      </button>
      <div className={styles.discountPanel} id={panelId} inert={!open}>
        <div className={styles.discountBody}>
          <form className={styles.discountForm} noValidate onSubmit={handleSubmit}>
            <div className={styles.field}>
              <input
                aria-label="Discount code"
                name="discountCode"
                autoComplete="off"
                value={code}
                disabled={checking}
                onChange={(event) => {
                  setCode(event.target.value);
                  setError('');
                  onApply(null);
                }}
              />
            </div>
            <button className={`${buttonStyles.secondary} ${styles.applyButton}`} type="submit" disabled={checking} aria-busy={checking}>
              {checking && <Preloader size="sm" color="white" />}
              Apply
            </button>
          </form>
          {error && <FormMessage type="error">{error}</FormMessage>}
          {discount && <FormMessage type="success">{`${discount.percent}% discount applied`}</FormMessage>}
        </div>
      </div>
    </div>
  );
}

function capitalize(message: string) {
  return message.charAt(0).toUpperCase() + message.slice(1);
}
