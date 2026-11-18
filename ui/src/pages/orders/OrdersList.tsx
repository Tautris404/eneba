import { useEffect, useState } from 'react';
import noResultsIcon from '../../assets/images/no-results.svg';
import { Preloader } from '../../components/ui/Preloader';
import { listOrders } from '../../services/ordersApi';
import type { OrderSummary } from '../../types/order';
import { euros } from '../../utils/currency';
import { deliveryStatusText, formatOrderDate, paymentMethodLabel } from './orderText';
import styles from './Orders.module.css';

export function OrdersList() {
  const [orders, setOrders] = useState<OrderSummary[]>();
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadOrders() {
      try {
        const result = await listOrders(controller.signal);
        if (!controller.signal.aborted) setOrders(result);
      } catch (reason) {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Could not load your orders.');
      }
    }

    setError('');
    loadOrders();
    return () => controller.abort();
  }, [attempt]);

  const searchTerm = search.trim().replace(/^#/, '');
  const matchingOrders = orders?.filter((order) => String(order.id).includes(searchTerm));

  function renderResults() {
    if (error) {
      return (
        <div className={styles.notice}>
          <p>{error}</p>
          <button type="button" onClick={() => setAttempt(attempt + 1)}>Try again</button>
        </div>
      );
    }
    if (!matchingOrders) return <Preloader size="lg" color="white" label="Loading orders" centered />;
    if (matchingOrders.length > 0) return <OrdersTable orders={matchingOrders} />;
    if (searchTerm) {
      return (
        <p className={styles.noResults}>
          <img src={noResultsIcon} alt="" width="16" height="16" />
          No results found
        </p>
      );
    }
    return <p className={styles.notice}>You have no orders yet.</p>;
  }

  return (
    <>
      <div className={styles.filters}>
        <input
          className={styles.search}
          type="text"
          aria-label="Search by order ID"
          placeholder="Search by order ID"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button className={styles.reset} type="button" onClick={() => setSearch('')}>Reset filters</button>
      </div>
      {renderResults()}
    </>
  );
}

function OrdersTable({ orders }: { orders: OrderSummary[] }) {
  return (
    <table className={styles.table} aria-label="Orders">
      <thead>
        <tr>
          <th scope="col">Date</th>
          <th scope="col">Status</th>
          <th scope="col">Order title</th>
          <th scope="col">Order ID</th>
          <th scope="col">Payment method</th>
          <th scope="col">Total amount</th>
          <th scope="col"><span className={styles.srOnly}>Details</span></th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => <OrderRow key={order.id} order={order} />)}
      </tbody>
    </table>
  );
}

function OrderRow({ order }: { order: OrderSummary }) {
  return (
    <tr>
      <td><span className={styles.label}>Date</span><time dateTime={order.date}>{formatOrderDate(order.date)}</time></td>
      <td><span className={styles.label}>Status</span><span className={styles.status} data-status={order.status}>{deliveryStatusText[order.status]}</span></td>
      <td className={styles.title}><span className={styles.label}>Order title</span><span>{order.title}</span></td>
      <td><span className={styles.label}>Order ID</span><span>{order.id}</span></td>
      <td><span className={styles.label}>Payment method</span><span>{paymentMethodLabel(order.payment_method)}</span></td>
      <td className={styles.amount}><span className={styles.label}>Total amount</span><strong>{euros.format(order.total_amount)}</strong></td>
      <td className={styles.details}><a href={`/orders/${order.id}`} aria-label={`Details for order ${order.id}`}>Details</a></td>
    </tr>
  );
}
