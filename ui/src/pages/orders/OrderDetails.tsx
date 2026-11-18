import { useEffect, useRef, useState } from 'react';
import { Preloader } from '../../components/ui/Preloader';
import { ApiError } from '../../services/apiClient';
import { getOrder } from '../../services/ordersApi';
import type { Order, OrderedProduct, OrderStatus } from '../../types/order';
import { euros } from '../../utils/currency';
import { deliveryStatusText, formatOrderDate, paymentMethodLabel } from './orderText';
import ordersStyles from './Orders.module.css';
import styles from './OrderDetails.module.css';

const paymentStatusText: Record<OrderStatus, { title: string; description: string }> = {
  paid: { title: 'Payment complete', description: 'Payment was completed successfully' },
  pending: { title: 'Payment pending', description: 'We are waiting for payment confirmation from the payment provider' },
  cancelled: { title: 'Payment failed', description: 'Transaction failed' },
};

export function OrderDetails({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order>();
  const [error, setError] = useState('');
  const [canRetry, setCanRetry] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrder() {
      try {
        const result = await getOrder(orderId, controller.signal);
        if (!controller.signal.aborted) setOrder(result);
      } catch (reason) {
        if (controller.signal.aborted) return;
        const notFound = reason instanceof ApiError && [400, 403, 404].includes(reason.status);
        setError(notFound ? 'Order not found.' : 'Could not load your order.');
        setCanRetry(!notFound);
      }
    }

    setError('');
    loadOrder();
    return () => controller.abort();
  }, [orderId, attempt]);

  function renderContent() {
    if (error) {
      return (
        <div className={styles.panel}>
          <p>{error}</p>
          {canRetry && <button type="button" onClick={() => setAttempt(attempt + 1)}>Try again</button>}
        </div>
      );
    }
    if (!order) return <Preloader size="lg" color="white" label="Loading order" centered />;
    return <OrderContents order={order} />;
  }

  return (
    <>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <a href="/orders">Orders</a><span aria-hidden="true">·</span><span aria-current="page">Order</span>
      </nav>
      {renderContent()}
    </>
  );
}

function OrderContents({ order }: { order: Order }) {
  const { status } = order;

  return (
    <div className={styles.order} data-status={status}>
      <header className={styles.heading}>
        <h1>Order {order.id}</h1>
        <p>Placed: <time dateTime={order.date}>{formatOrderDate(order.date)}</time></p>
      </header>
      <section className={styles.products} aria-labelledby="ordered-products">
        <div className={styles.productHeaders}>
          <h2 id="ordered-products">Ordered products</h2>
          <span>Delivery status</span>
        </div>
        {order.ordered_products.map((product, index) => (
          <ProductRow key={index} product={product} status={status} />
        ))}
      </section>
      <section className={styles.panel} aria-labelledby="payment-details">
        <div className={styles.paymentHeader}>
          <h2 id="payment-details">Payment details</h2>
          <StatusIcon status={status} size={30} />
        </div>
        <p className={styles.paymentStatus}>{paymentStatusText[status].title}</p>
        <p className={styles.description}>{paymentStatusText[status].description}</p>
        {status === 'cancelled' && <p className={styles.failure}>Payment process was interrupted or not completed. Please try again.</p>}
        <p className={styles.method}>Payment method: <strong>{paymentMethodLabel(order.payment_method)}</strong></p>
      </section>
      <section className={styles.panel} aria-labelledby="order-summary">
        <h2 id="order-summary">Order summary</h2>
        <p className={styles.total}><span>Total amount:</span><strong>{euros.format(order.total_amount)}</strong></p>
      </section>
    </div>
  );
}

function ProductRow({ product, status }: { product: OrderedProduct; status: OrderStatus }) {
  const [keyRevealed, setKeyRevealed] = useState(false);

  return (
    <div className={styles.productRow}>
      <span className={styles.productLabel}>Ordered products</span>
      <div className={styles.product}>
        {product.image_url && <img src={product.image_url} width="64" height="90" alt="" />}
        <div>
          <h3>{product.name}</h3>
          <p>{euros.format(product.price)}</p>
          <p><span>Vendor:</span> {product.seller}</p>
        </div>
      </div>
      <span className={styles.deliveryLabel}>Delivery status</span>
      <p className={styles.delivery}><StatusIcon status={status} size={15} />{deliveryStatusText[status]}</p>
      {status === 'paid' && product.key && (
        keyRevealed ? (
          <ProductKey value={product.key} productName={product.name} />
        ) : (
          <button className={styles.redeem} type="button" onClick={() => setKeyRevealed(true)}>Redeem key</button>
        )
      )}
    </div>
  );
}

function ProductKey({ value, productName }: { value: string; productName: string }) {
  const field = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState('');
  const copied = feedback === 'Copied';

  useEffect(() => {
    field.current?.focus();
    field.current?.select();
  }, []);

  async function copyKey() {
    try {
      await navigator.clipboard.writeText(value);
      setFeedback('Copied');
    } catch {
      field.current?.focus();
      field.current?.select();
      setFeedback('Press Ctrl+C or ⌘C to copy.');
    }
  }

  return (
    <div>
      <div className={styles.keyControl}>
        <input ref={field} className={styles.keyField} aria-label={`Product key for ${productName}`} value={value} readOnly />
        <button className={styles.copyKey} type="button" onClick={copyKey}>
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
            {copied ? (
              <path d="m3 8 3 3 7-7" />
            ) : (
              <>
                <rect x="5.5" y="5.5" width="8.5" height="8.5" rx="1" />
                <path d="M3.5 10.5H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h6.5a1 1 0 0 1 1 1v.5" />
              </>
            )}
          </svg>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <span className={copied ? ordersStyles.srOnly : styles.copyFeedback}>{feedback}</span>
    </div>
  );
}

function StatusIcon({ status, size }: { status: OrderStatus; size: number }) {
  return (
    <svg width={size} height={size} viewBox={status === 'pending' ? '6 0 12 20' : '0 0 20 20'} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {status === 'pending' ? (
        <path d="M7 1h10v5l-5 4 5 4v5H7v-5l5-4-5-4z" />
      ) : (
        <>
          <circle cx="10" cy="10" r="9" />
          <path d={status === 'paid' ? 'm4.5 10 3.5 3.5L15.5 6' : 'm3.5 16.5 13-13'} />
        </>
      )}
    </svg>
  );
}
