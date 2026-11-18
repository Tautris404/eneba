import { useState } from 'react';
import visaMastercard from '../../assets/images/visa-mastercard.svg';
import { OrderSummaryList } from '../../components/cart/OrderSummaryList';
import { Preloader } from '../../components/ui/Preloader';
import { ApiError } from '../../services/apiClient';
import { createOrder } from '../../services/ordersApi';
import { clearCartForPayment, paymentPagePath, readCheckoutDiscount, rememberPendingOrder, usePurchase } from '../../state/checkout';
import { useRequiredSession } from '../../state/session';
import type { CartItem, Discount } from '../../types/cart';
import { loginLink } from '../../utils/authRedirect';
import { cartTotal, discountedCartTotal } from '../../utils/cartTotals';
import { euros } from '../../utils/currency';
import { CheckoutLayout } from './CheckoutLayout';
import { EmptyCart } from './EmptyCart';
import { FormMessage } from './FormMessage';
import buttonStyles from '../../components/ui/Buttons.module.css';
import styles from './Checkout.module.css';

export function PaymentPage() {
  const session = useRequiredSession(paymentPagePath);
  const purchase = usePurchase();

  return (
    <CheckoutLayout step="payment">
      {!session && <Preloader size="lg" color="white" label="Checking your session" centered />}
      {session && purchase.length > 0 && <PaymentForm items={purchase} />}
      {session && purchase.length === 0 && <EmptyCart />}
    </CheckoutLayout>
  );
}

function PaymentForm({ items }: { items: CartItem[] }) {
  const [discount] = useState<Discount | null>(readCheckoutDiscount);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [summaryOpen, setSummaryOpen] = useState(false);
  const subtotal = cartTotal(items);
  const total = discountedCartTotal(items, discount?.percent ?? 0);

  async function pay() {
    if (paying) return;
    setPaying(true);
    setError('');
    try {
      const order = await createOrder(items, discount?.code);
      rememberPendingOrder(order.id);
      clearCartForPayment();
      window.location.assign(order.checkout_url);
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 401) {
        window.location.replace(loginLink(paymentPagePath));
        return;
      }
      setError(reason instanceof Error ? reason.message : 'Could not start the payment.');
      setPaying(false);
    }
  }

  return (
    <div className={styles.paymentLayout}>
      <section className={styles.paymentMethods} aria-labelledby="payment-title">
        <h1 id="payment-title" className={styles.visuallyHidden}>Payment method</h1>
        <label className={`${styles.paymentOption} ${styles.paymentOptionSelected}`}>
          <input className={styles.paymentRadio} type="radio" name="payment_method" defaultChecked />
          <span className={styles.paymentLogo}><img src={visaMastercard} alt="Visa and Mastercard" width="90" height="30" /></span>
          <span className={styles.paymentText}>
            <strong>Credit or debit card</strong>
            <span>Pay via Visa, Mastercard, or Maestro debit or credit card</span>
          </span>
          <span className={styles.radioMark} aria-hidden="true" />
        </label>
      </section>
      <div className={styles.orderBackdrop} data-open={summaryOpen} onClick={() => setSummaryOpen(false)} aria-hidden="true" />
      <section
        className={`${styles.orderCard} ${summaryOpen ? styles.orderCardOpen : ''}`}
        aria-label="Order summary"
        onKeyDown={(event) => {
          if (event.key === 'Escape') setSummaryOpen(false);
        }}
      >
        <button
          className={styles.cartInfoToggle}
          type="button"
          aria-expanded={summaryOpen}
          aria-controls="order-details"
          onClick={() => setSummaryOpen(!summaryOpen)}
        >
          <span>Cart information</span>
          <span className={styles.cartInfoChevron} aria-hidden="true" />
        </button>
        <div className={styles.orderDetails} id="order-details">
          <OrderSummaryList items={items} />
          <dl className={styles.orderTotals}>
            <div>
              <dt>Sub-total</dt>
              <dd>{euros.format(subtotal)}</dd>
            </div>
            {discount && (
              <div>
                <dt>Discount ({discount.percent}%)</dt>
                <dd>−{euros.format(subtotal - total)}</dd>
              </div>
            )}
          </dl>
        </div>
        <div className={styles.orderTotal}>
          <span>Total:</span>
          <strong>{euros.format(total)}</strong>
        </div>
        <div className={styles.orderAction}>
          <button className={`${buttonStyles.primary} ${styles.continueButton}`} type="button" disabled={paying} onClick={pay}>
            {paying && <Preloader size="sm" color="black" />}
            Continue
          </button>
          {error && <FormMessage type="error">{error}</FormMessage>}
        </div>
      </section>
    </div>
  );
}
