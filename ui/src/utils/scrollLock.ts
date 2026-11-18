let openLocks = 0;
let savedScrollY = 0;

export function lockPageScroll() {
  openLocks += 1;
  if (openLocks > 1) return;

  savedScrollY = window.scrollY;
  const bodyStyle = document.body.style;
  document.documentElement.style.overflowY = 'scroll';
  bodyStyle.position = 'fixed';
  bodyStyle.top = `-${savedScrollY}px`;
  bodyStyle.left = '0';
  bodyStyle.right = '0';
}

export function unlockPageScroll() {
  if (openLocks === 0) return;
  openLocks -= 1;
  if (openLocks > 0) return;

  const bodyStyle = document.body.style;
  bodyStyle.position = '';
  bodyStyle.top = '';
  bodyStyle.left = '';
  bodyStyle.right = '';
  document.documentElement.style.overflowY = '';
  window.scrollTo({ top: savedScrollY, behavior: 'instant' });
}
