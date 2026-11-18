import { NoticeErrorIcon, NoticeSuccessIcon } from './CheckoutIcons';
import styles from './Checkout.module.css';

export function FormMessage({ type, children }: { type: 'error' | 'success'; children: string }) {
  const isError = type === 'error';

  return (
    <div className={`${styles.notice} ${isError ? styles.noticeError : styles.noticeSuccess}`}>
      <div className={styles.noticeRow}>
        {isError ? <NoticeErrorIcon /> : <NoticeSuccessIcon />}
        <p>{children}</p>
      </div>
    </div>
  );
}
