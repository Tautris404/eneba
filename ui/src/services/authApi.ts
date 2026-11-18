import type { TokenPair } from '../types/auth';
import { ApiError, readErrorMessage } from './apiClient';

const fallbackMessage = 'Something went wrong. Please try again.';

function toSentence(message: string | null) {
  if (!message) return fallbackMessage;
  const sentence = message.charAt(0).toUpperCase() + message.slice(1);
  return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
}

async function postToAuth(path: string, body: unknown): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new ApiError(response.status, toSentence(message));
  }
  return response;
}

export async function registerAccount(email: string, password: string): Promise<{ id: string }> {
  const response = await postToAuth('/api/auth/register', { email, password });
  return response.json();
}

export async function confirmRegistration(id: string, code: string): Promise<TokenPair> {
  const response = await postToAuth('/api/auth/register/confirm', { id, code });
  return response.json();
}

export async function resendRegistrationCode(id: string) {
  await postToAuth('/api/auth/register/resend', { id });
}

export async function loginWithPassword(email: string, password: string): Promise<TokenPair> {
  const response = await postToAuth('/api/auth/login', { email, password });
  return response.json();
}

export async function requestLoginCode(email: string): Promise<{ id: string }> {
  const response = await postToAuth('/api/auth/login/code', { email });
  return response.json();
}

export async function confirmLoginCode(id: string, code: string): Promise<TokenPair> {
  const response = await postToAuth('/api/auth/login/code/confirm', { id, code });
  return response.json();
}

export async function resendLoginCode(id: string) {
  await postToAuth('/api/auth/login/code/resend', { id });
}

export async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  const response = await postToAuth('/api/auth/refresh', { refresh_token: refreshToken });
  return response.json();
}

export async function revokeRefreshToken(refreshToken: string) {
  await postToAuth('/api/auth/logout', { refresh_token: refreshToken });
}
