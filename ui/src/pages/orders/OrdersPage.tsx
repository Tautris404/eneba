import { Preloader } from '../../components/ui/Preloader';
import { useRequiredSession } from '../../state/session';
import { OrderDetails } from './OrderDetails';
import { OrdersFooter } from './OrdersFooter';
import { OrdersHeader } from './OrdersHeader';
import { OrdersList } from './OrdersList';
import styles from './Orders.module.css';

export function OrdersPage({ orderId }: { orderId?: string }) {
  const session = useRequiredSession(orderId ? `/orders/${orderId}` : '/orders');

  return (
    <div className={styles.layout}>
      <OrdersHeader email={session?.email ?? null} signedIn={session !== null} />
      <main className={orderId ? `${styles.main} ${styles.detailMain}` : styles.main}>
        {!orderId && <h1>Orders</h1>}
        {!session && <Preloader size="lg" color="white" label="Checking your session" centered />}
        {session && orderId && <OrderDetails key={orderId} orderId={orderId} />}
        {session && !orderId && <OrdersList />}
      </main>
      <OrdersFooter />
    </div>
  );
}
