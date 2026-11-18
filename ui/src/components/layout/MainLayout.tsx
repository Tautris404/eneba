import type { ReactNode } from 'react';
import { Header } from './header/Header';
import { Footer } from './footer/Footer';
import { CartDialogs } from '../cart/CartDialogs';

export function MainLayout({ children }: { children?: ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDialogs />
    </>
  );
}
