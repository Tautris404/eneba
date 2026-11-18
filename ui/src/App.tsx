import { useEffect } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { CartPage } from './pages/checkout/CartPage';
import { PaymentAcceptPage } from './pages/checkout/PaymentAcceptPage';
import { PaymentPage } from './pages/checkout/PaymentPage';
import { HomePage } from './pages/home/HomePage';
import { OrdersPage } from './pages/orders/OrdersPage';
import { ProductPage } from './pages/product/ProductPage';
import { StorePage } from './pages/store/StorePage';
import { ensureFreshSession } from './state/session';

const reservedPaths = ['store', 'login', 'register', 'orders', 'checkout', 'payment'];

function pageTitle(path: string) {
  if (path === '/') return 'Buy Games, Gift Cards & Top Ups Cheaper | Eneba';
  if (path === '/store' || path === '/store/all') return 'Games, Gift Cards, Top-Ups & More | Eneba';
  if (path === '/checkout') return 'Your cart | Eneba';
  if (path === '/checkout/payment') return 'Checkout | Eneba';
  if (/^\/payment\/accept\/\d+$/.test(path)) return 'Get your product | Eneba';
  if (path === '/orders') return 'My orders | Eneba';
  if (/^\/orders\/\d+$/.test(path)) return 'Order details | Eneba';
  return null;
}

function productSlugFromPath(path: string) {
  const match = /^\/([^/]+)$/.exec(path);
  if (!match) return null;
  const segment = match[1];
  if (reservedPaths.includes(segment)) return null;
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  useEffect(() => {
    ensureFreshSession();
  }, []);

  useEffect(() => {
    const title = pageTitle(path);
    if (title) document.title = title;
  }, [path]);

  if (path === '/login') return <LoginPage />;
  if (path === '/register') return <RegisterPage />;
  if (path === '/orders') return <OrdersPage />;

  const orderMatch = /^\/orders\/(\d+)$/.exec(path);
  if (orderMatch) return <OrdersPage orderId={orderMatch[1]} />;

  if (path === '/checkout') return <CartPage />;
  if (path === '/checkout/payment') return <PaymentPage />;

  const paidOrderMatch = /^\/payment\/accept\/(\d+)$/.exec(path);
  if (paidOrderMatch) return <PaymentAcceptPage orderId={paidOrderMatch[1]} />;

  if (path === '/') {
    return (
      <MainLayout>
        <HomePage />
      </MainLayout>
    );
  }

  if (path === '/store' || path === '/store/all') {
    return (
      <MainLayout>
        <StorePage />
      </MainLayout>
    );
  }

  const productSlug = productSlugFromPath(path);
  if (productSlug) {
    return (
      <MainLayout>
        <ProductPage key={productSlug} slug={productSlug} />
      </MainLayout>
    );
  }

  return <MainLayout />;
}
