import { ApiError } from '../../services/apiClient';

export const validity = {
  passwordSymbol: 'Password must contain at least one number or special character.',
  passwordTooLong: 'Password is too long.',
  passwordMismatch: 'Passwords do not match.',
  code: 'Please enter the 6-digit code from the email.',
};

function isPasswordTooLong(password: string) {
  return new TextEncoder().encode(password).length > 72;
}

export function newPasswordValidity(password: string) {
  if (!password || [...password].length < 8) return '';
  if (isPasswordTooLong(password)) return validity.passwordTooLong;
  if (!/[\p{N}\p{P}\p{S}]/u.test(password)) return validity.passwordSymbol;
  return '';
}

export function loginPasswordValidity(password: string) {
  return isPasswordTooLong(password) ? validity.passwordTooLong : '';
}

export function repeatPasswordValidity(password: string, repeatedPassword: string) {
  return repeatedPassword && password !== repeatedPassword ? validity.passwordMismatch : '';
}

type AuthErrorContext = 'login' | 'loginCode' | 'register' | 'code';

export function describeAuthError(reason: unknown, context: AuthErrorContext) {
  if (!(reason instanceof ApiError)) return 'Something went wrong. Please try again.';

  const text = reason.message.toLowerCase();
  if (text.includes('invalid email address')) return 'Please enter a valid email address.';
  if (text.includes('already registered')) return 'This email is already registered. Please log in.';
  if (text.includes('already pending')) return 'A confirmation code has already been sent to this email. Please check your inbox.';
  if (text.includes('at least 8 characters') || text.includes('at most 72 bytes')) return 'Password must be at least 8 characters long.';
  if (text.includes('digit or special character')) return validity.passwordSymbol;
  if (text.includes('confirmation code is invalid') || text.includes('six-digit')) return 'The code is invalid or has expired.';
  if (text.includes('invalid email or credentials')) {
    if (context === 'login') return 'Invalid credentials given';
    if (context === 'loginCode') return "We couldn't find an account with this email.";
    return 'The code is invalid or has expired.';
  }
  return reason.message;
}
