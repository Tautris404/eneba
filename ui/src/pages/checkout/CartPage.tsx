import { useState } from 'react';
import { CartProductList } from '../../components/cart/CartProductList';
import { useCart } from '../../state/cart';
import { beginCheckout, paymentPagePath } from '../../state/checkout';
import { useSession } from '../../state/session';
import type { CartItem, Discount } from '../../types/cart';
import { loginLink } from '../../utils/authRedirect';
import { cartTotal, countCartItems, discountedCartTotal } from '../../utils/cartTotals';
import { euros } from '../../utils/currency';
import { CheckoutLayout } from './CheckoutLayout';
import { DiscountField } from './DiscountField';
import { EmptyCart } from './EmptyCart';
import buttonStyles from '../../components/ui/Buttons.module.css';
import styles from './Checkout.module.css';

export function CartPage() {
  const { items } = useCart();
  const session = useSession();
  const [discount, setDiscount] = useState<Discount | null>(null);

  function proceedToCheckout() {
    const nextPage = session ? paymentPagePath : loginLink(paymentPagePath);
    beginCheckout(items, nextPage, discount);
  }

  if (items.length === 0) {
    return (
      <CheckoutLayout step="cart">
        <EmptyCart />
      </CheckoutLayout>
    );
  }

  return (
    <CheckoutLayout step="cart">
      <div className={styles.grid}>
        <section className={`${styles.panel} ${styles.cartPanel}`} aria-labelledby="checkout-cart-title">
          <h1 id="checkout-cart-title">My cart</h1>
          <CartProductList items={items} isCheckoutPage />
        </section>
        <aside>
          <section className={`${styles.panel} ${styles.summary}`}>
            <h2>Summary</h2>
            <button className={`${buttonStyles.primary} ${styles.wide}`} type="button" onClick={proceedToCheckout}>
              Proceed to checkout
            </button>
            <CartTotals items={items} discount={discount} />
            <DiscountField discount={discount} onApply={setDiscount} />
          </section>
        </aside>
      </div>
    </CheckoutLayout>
  );
}

function CartTotals({ items, discount }: { items: CartItem[]; discount: Discount | null }) {
  const quantity = countCartItems(items);
  const subtotal = cartTotal(items);
  const total = discountedCartTotal(items, discount?.percent ?? 0);

  return (
    <dl className={styles.totals}>
      <div>
        <dt>{quantity} {quantity === 1 ? 'product' : 'products'}</dt>
        <dd>{euros.format(subtotal)}</dd>
      </div>
      {discount && (
        <div>
          <dt>Discount ({discount.percent}%)</dt>
          <dd>−{euros.format(subtotal - total)}</dd>
        </div>
      )}
      <div className={styles.total}>
        <dt>Total</dt>
        <dd>{euros.format(total)}</dd>
      </div>
    </dl>
  );
}
