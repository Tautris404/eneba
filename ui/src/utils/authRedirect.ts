export function loginLink(returnPath: string) {
  return `/login?ref=${encodeURIComponent(returnPath)}`;
}

export function registerLink(returnPath: string) {
  return `/register?ref=${encodeURIComponent(returnPath)}`;
}

export function authLink(path: '/login' | '/register') {
  const ref = new URLSearchParams(window.location.search).get('ref');
  return ref ? `${path}?ref=${encodeURIComponent(ref)}` : path;
}

export function currentPageRef() {
  const { pathname, search } = window.location;
  if (/^\/(login|register)\/?$/.test(pathname)) {
    return new URLSearchParams(search).get('ref') ?? '/';
  }
  return `${pathname}${search}`;
}

export function redirectTarget() {
  const ref = new URLSearchParams(window.location.search).get('ref');
  if (!ref) return '/';
  const isSameSitePath = ref.startsWith('/') && !ref.startsWith('//') && !ref.startsWith('/\\');
  if (!isSameSitePath) return '/';
  if (/^\/(login|register)(?:[/?#]|$)/.test(ref)) return '/';
  return ref;
}
