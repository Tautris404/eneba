import { useEffect, useState } from 'react';
import paymentAcceptedIcon from '../../assets/images/payment-accepted.svg';
import { Preloader } from '../../components/ui/Preloader';
import { ApiError } from '../../services/apiClient';
import { getOrder } from '../../services/ordersApi';
import { finishPurchase, forgetPendingOrder, isPendingOrder } from '../../state/checkout';
import { useRequiredSession } from '../../state/session';
import type { Order } from '../../types/order';
import { CheckoutLayout } from './CheckoutLayout';
import buttonStyles from '../../components/ui/Buttons.module.css';
import styles from './PaymentAccept.module.css';

const checkAgainAfterMs = 2000;
const keepCheckingForMs = 45000;

function leaveToHomepage() {
  window.location.replace('/');
}

export function PaymentAcceptPage({ orderId }: { orderId: string }) {
  const session = useRequiredSession(`/payment/accept/${orderId}${window.location.search}`);

  return (
    <CheckoutLayout step="complete">
      {session ? <PaidOrder orderId={orderId} /> : <Waiting text="Checking your session" />}
    </CheckoutLayout>
  );
}

function Waiting({ text }: { text: string }) {
  return (
    <div className={styles.waiting}>
      <Preloader size="lg" color="white" centered />
      <p>{text}</p>
    </div>
  );
}

function PaidOrder({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order>();
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const cameFromStripe = new URLSearchParams(window.location.search).get('payment') === 'success';
    const startedAt = Date.now();
    let timer: number | undefined;

    async function loadOrder() {
      try {
        const result = await getOrder(orderId, controller.signal);
        if (controller.signal.aborted) return;

        if (result.status === 'paid') {
          if (cameFromStripe && isPendingOrder(orderId)) {
            finishPurchase();
            forgetPendingOrder();
          }
          window.history.replaceState(null, '', window.location.pathname);
          setOrder(result);
          return;
        }

        const stillWaiting = Date.now() - startedAt < keepCheckingForMs;
        if (result.status === 'pending' && cameFromStripe && stillWaiting) {
          timer = window.setTimeout(loadOrder, checkAgainAfterMs);
          return;
        }
        leaveToHomepage();
      } catch (reason) {
        if (controller.signal.aborted) return;
        if (reason instanceof ApiError && (reason.status === 404 || reason.status === 400)) {
          leaveToHomepage();
          return;
        }
        setError(reason instanceof Error ? reason.message : 'Could not load your order.');
      }
    }

    setError('');
    loadOrder();
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [orderId, attempt]);

  if (error) {
    return (
      <div className={styles.waiting}>
        <p className={styles.errorText}>{error}</p>
        <button className={`${buttonStyles.secondary} ${styles.retry}`} type="button" onClick={() => setAttempt(attempt + 1)}>
          Try again
        </button>
      </div>
    );
  }

  if (!order) return <Waiting text="Confirming your payment" />;

  return (
    <section className={styles.success} aria-labelledby="payment-success-title">
      <img src={paymentAcceptedIcon} width="70" height="46" alt="" />
      <h1 id="payment-success-title">Thank you for your order</h1>
      <p>Your order <strong>#{order.id}</strong> has been placed successfully</p>
      <a className={`${buttonStyles.primary} ${styles.detailsLink}`} href={`/orders/${order.id}`}>
        View order details
      </a>
    </section>
  );
}
