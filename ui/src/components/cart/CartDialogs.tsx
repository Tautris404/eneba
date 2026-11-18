import { useEffect, useLayoutEffect, useRef } from 'react';
import { closeCart, useCart } from '../../state/cart';
import { beginCheckout } from '../../state/checkout';
import type { CartItem } from '../../types/cart';
import { cartTotal, countCartItems } from '../../utils/cartTotals';
import { euros } from '../../utils/currency';
import { lockPageScroll, unlockPageScroll } from '../../utils/scrollLock';
import { CloseIcon } from '../ui/Icons';
import { AddedCartIcon, EmptyCartIcon } from './CartIcons';
import { CartProductList } from './CartProductList';
import buttonStyles from '../ui/Buttons.module.css';
import styles from './Cart.module.css';

export function CartDialogs() {
  const { dialog, items } = useCart();
  if (!dialog) return null;
  return <CartDialog mode={dialog} items={items} />;
}

function CartDialog({ mode, items }: { mode: 'cart' | 'added'; items: CartItem[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isAdded = mode === 'added';

  useLayoutEffect(() => {
    if (isAdded) return;
    const dialog = dialogRef.current;

    function placeUnderCartIcon() {
      const icon = document.querySelector('header button[aria-label="My shopping cart"] svg');
      if (!dialog || !icon) return;
      const box = icon.getBoundingClientRect();
      if (box.width === 0) return;
      const right = document.documentElement.clientWidth - (box.left + box.width / 2) - 32;
      dialog.style.setProperty('--mini-cart-top', `${Math.round(box.bottom + 28)}px`);
      dialog.style.setProperty('--mini-cart-right', `${Math.max(12, right)}px`);
    }

    placeUnderCartIcon();
    window.addEventListener('resize', placeUnderCartIcon);
    return () => window.removeEventListener('resize', placeUnderCartIcon);
  }, [isAdded]);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    lockPageScroll();
    return () => {
      dialog?.close();
      unlockPageScroll();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${isAdded ? styles.added : styles.miniCart}`}
      aria-labelledby="cart-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        closeCart();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeCart();
      }}
    >
      {isAdded ? <AddedToCart quantity={countCartItems(items)} /> : <MiniCart items={items} />}
    </dialog>
  );
}

function AddedToCart({ quantity }: { quantity: number }) {
  return (
    <section className={styles.addedContent}>
      <AddedCartIcon />
      <h2 id="cart-dialog-title">Added to cart</h2>
      <p>You have <strong>{quantity} {quantity === 1 ? 'item' : 'items'}</strong> in your cart</p>
      <div className={styles.dialogActions}>
        <button className={buttonStyles.primary} type="button" onClick={closeCart} autoFocus>
          <span>Continue shopping</span>
        </button>
        <a className={buttonStyles.secondary} href="/checkout">
          <span>View cart</span>
        </a>
      </div>
    </section>
  );
}

function MiniCart({ items }: { items: CartItem[] }) {
  return (
    <section>
      <header className={styles.dialogHeader}>
        <h2 id="cart-dialog-title">My shopping cart</h2>
        <button className={styles.close} type="button" onClick={closeCart} aria-label="Close cart" autoFocus>
          <CloseIcon />
        </button>
      </header>
      {items.length > 0 ? (
        <>
          <CartProductList items={items} />
          <div className={styles.dialogFooter}>
            <div className={styles.subtotal}>
              <span>Total</span>
              <strong>{euros.format(cartTotal(items))}</strong>
            </div>
            <a className={buttonStyles.primary} href="/checkout">View cart</a>
            <button className={buttonStyles.secondary} type="button" onClick={() => beginCheckout(items)}>
              Checkout now
            </button>
          </div>
        </>
      ) : (
        <div className={styles.empty}>
          <EmptyCartIcon />
          <h3>Your shopping cart is empty</h3>
          <p>It seems you haven't chosen your products yet</p>
        </div>
      )}
    </section>
  );
}
