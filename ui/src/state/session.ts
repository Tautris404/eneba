import { useEffect, useState, useSyncExternalStore } from 'react';
import { ApiError } from '../services/apiClient';
import { refreshTokens, revokeRefreshToken } from '../services/authApi';
import type { Session, TokenPair } from '../types/auth';
import { loginLink } from '../utils/authRedirect';
import { readStorage, removeFromStorage, writeStorage } from '../utils/storage';
import { isRecord } from '../utils/validation';

const storageKey = 'eneba.session';

const refreshMarginMs = 30_000;

let session: Session | null = readStoredSession();
const listeners = new Set<() => void>();

function readStoredSession(): Session | null {
  const value = readStorage('local', storageKey);
  if (!isRecord(value)) return null;
  if (typeof value.accessToken !== 'string' || typeof value.refreshToken !== 'string') return null;
  return {
    accessToken: value.accessToken,
    refreshToken: value.refreshToken,
    email: typeof value.email === 'string' ? value.email : null,
  };
}

function notifyListeners() {
  for (const listener of listeners) listener();
}

function saveSession(next: Session | null) {
  session = next;
  if (next) writeStorage('local', storageKey, next);
  else removeFromStorage('local', storageKey);
  notifyListeners();
}

window.addEventListener('storage', (event) => {
  if (event.key !== storageKey) return;
  session = readStoredSession();
  notifyListeners();
});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSession() {
  return session;
}

export function useSession() {
  return useSyncExternalStore(subscribe, getSession);
}

export function startSession(tokens: TokenPair, email: string) {
  saveSession({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token, email });
}

function tokenExpiresAt(token: string) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const data: unknown = JSON.parse(atob(payload));
    if (isRecord(data) && typeof data.exp === 'number') return data.exp * 1000;
  } catch {
  }
  return 0;
}

let refreshInProgress: Promise<Session | null> | null = null;

async function requestNewTokens(current: Session): Promise<Session | null> {
  try {
    const tokens = await refreshTokens(current.refreshToken);
    saveSession({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token, email: current.email });
  } catch (error) {
    if (error instanceof ApiError && (error.status === 400 || error.status === 401)) saveSession(null);
  }
  return session;
}

function refreshSession(): Promise<Session | null> {
  if (!session) return Promise.resolve(null);
  if (!refreshInProgress) {
    refreshInProgress = requestNewTokens(session).finally(() => {
      refreshInProgress = null;
    });
  }
  return refreshInProgress;
}

export async function ensureFreshSession(): Promise<Session | null> {
  if (!session) return null;
  const timeLeft = tokenExpiresAt(session.accessToken) - Date.now();
  if (timeLeft > refreshMarginMs) return session;
  return refreshSession();
}

function fetchWithToken(url: string, init: RequestInit, current: Session | null) {
  const headers = new Headers(init.headers);
  if (current) headers.set('Authorization', `Bearer ${current.accessToken}`);
  return fetch(url, { ...init, headers });
}

export async function authFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetchWithToken(url, init, await ensureFreshSession());
  if (response.status !== 401 || !session) return response;
  return fetchWithToken(url, init, await refreshSession());
}

export async function logout() {
  const current = session;
  saveSession(null);
  if (!current) return;
  try {
    await revokeRefreshToken(current.refreshToken);
  } catch {
  }
}

export function useRequiredSession(returnPath: string) {
  const currentSession = useSession();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let isActive = true;
    async function checkSession() {
      await ensureFreshSession();
      if (isActive) setChecked(true);
    }
    checkSession();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (checked && !currentSession) window.location.replace(loginLink(returnPath));
  }, [checked, returnPath, currentSession]);

  return checked ? currentSession : null;
}
