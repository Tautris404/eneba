import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ApiError } from '../../services/apiClient';
import { Notice, SubmitButton } from './AuthFormControls';
import { describeAuthError, validity } from './authErrors';
import styles from './AuthLayout.module.css';

const resendDelaySeconds = 30;

type VerificationCodeFormProps = {
  flow: 'login' | 'register';
  onSubmit: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onExpired?: (message: string) => void;
};

export function VerificationCodeForm({ flow, onSubmit, onResend, onExpired }: VerificationCodeFormProps) {
  const input = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsUntilResend, setSecondsUntilResend] = useState(0);

  useEffect(() => {
    if (secondsUntilResend <= 0) return;
    const timer = window.setTimeout(() => setSecondsUntilResend(secondsUntilResend - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsUntilResend]);

  function showFailure(reason: unknown) {
    if (reason instanceof ApiError && reason.status === 404 && onExpired) {
      onExpired(reason.message);
      return;
    }
    setError(describeAuthError(reason, flow === 'login' ? 'code' : 'register'));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setPending(true);
    try {
      await onSubmit(code);
    } catch (reason) {
      showFailure(reason);
      setPending(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError('');
    try {
      await onResend();
      setCode('');
      setSecondsUntilResend(resendDelaySeconds);
      input.current?.focus();
    } catch (reason) {
      showFailure(reason);
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        ref={input}
        className={`${styles.input} ${styles.codeInput}`}
        type="text"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label="Verification code"
        aria-invalid={error ? true : undefined}
        maxLength={6}
        pattern="\d{6}"
        title={validity.code}
        required
        autoFocus
        value={code}
        onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
      />
      {error && <Notice tone="error">{error}</Notice>}
      <SubmitButton pending={pending}>Confirm</SubmitButton>
      <div className={styles.resend}>
        {secondsUntilResend > 0 ? (
          <button type="button" disabled>{secondsUntilResend}...Resend</button>
        ) : (
          <>
            Don’t have the code?
            <button type="button" disabled={resending} onClick={handleResend}>Click to resend</button>
          </>
        )}
      </div>
    </form>
  );
}
