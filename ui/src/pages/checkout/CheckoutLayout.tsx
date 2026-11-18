import type { ReactNode } from 'react';
import enebaMark from '../../assets/images/eneba-mark.svg';
import logo from '../../assets/images/eneba-logo.svg';
import visaMastercard from '../../assets/images/visa-mastercard.svg';
import { BackArrowIcon } from '../../components/ui/Icons';
import styles from './Checkout.module.css';

type CheckoutStep = 'cart' | 'payment' | 'complete';

const steps: { name: CheckoutStep; label: string; path: string | null }[] = [
  { name: 'cart', label: 'Cart', path: '/checkout' },
  { name: 'payment', label: 'Payment', path: '/checkout/payment' },
  { name: 'complete', label: 'Get your product', path: null },
];

const pageClassNames: Record<CheckoutStep, string> = {
  cart: styles.cartPage,
  payment: styles.paymentPage,
  complete: styles.completePage,
};

export function CheckoutLayout({ step, children }: { step: CheckoutStep; children: ReactNode }) {
  return (
    <div className={`${styles.shell} ${pageClassNames[step]}`}>
      <CheckoutHeader step={step} />
      <main className={styles.main}>{children}</main>
      {step !== 'complete' && <CheckoutFooter />}
    </div>
  );
}

function CheckoutHeader({ step }: { step: CheckoutStep }) {
  const currentIndex = steps.findIndex((item) => item.name === step);
  const isLastStep = currentIndex === steps.length - 1;

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <a href="/" aria-label="Eneba home"><img src={logo} width="155" height="48" alt="Eneba" /></a>
        <nav aria-label="Checkout progress">
          <ol className={styles.steps}>
            {steps.map((item, index) => {
              const isDone = index < currentIndex;
              const linkBack = isDone && !isLastStep ? item.path : null;
              const content = <><strong aria-hidden="true">{index + 1}</strong>{item.label}</>;

              return (
                <li
                  key={item.name}
                  data-completed={isDone}
                  data-locked={index > currentIndex && item.path === null}
                  aria-current={index === currentIndex ? 'step' : undefined}
                >
                  {linkBack ? (
                    <a className={styles.step} href={linkBack}>{content}</a>
                  ) : (
                    <span className={styles.step}>{content}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
      <MobileBar step={step} />
    </header>
  );
}

function MobileBar({ step }: { step: CheckoutStep }) {
  const currentStep = steps.find((item) => item.name === step);

  return (
    <div className={styles.mobileBar}>
      {step === 'payment' ? (
        <a className={styles.mobileBack} href="/checkout" aria-label="Back to cart">
          <BackArrowIcon />
        </a>
      ) : (
        <a className={styles.mobileMark} href="/" aria-label="Eneba home">
          <img src={enebaMark} width="31" height="31" alt="" />
        </a>
      )}
      <span className={styles.mobileTitle}>{currentStep?.label}</span>
    </div>
  );
}

function CheckoutFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerPayments}>
        <ul aria-label="Payment methods">
          <li><img src={visaMastercard} width="66" height="21" alt="Visa and Mastercard" /></li>
        </ul>
      </div>
      <div className={styles.footerInfo}>
        <p className={styles.footerTitle}>Shopping on Eneba is risk-free &amp; easy!</p>
        <hr className={styles.footerDivider} />
        <p className={styles.footerCopyright}>
          Copyright © {new Date().getFullYear()} Eneba. All Rights Reserved. JSC “Helis play”, Gyneju St. 4-333, Vilnius,
          the Republic of Lithuania
        </p>
      </div>
    </footer>
  );
}
