import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { Preloader } from '../../components/ui/Preloader';
import styles from './AuthLayout.module.css';

export function Notice({ tone, children }: { tone: 'error' | 'success'; children: ReactNode }) {
  const isError = tone === 'error';

  return (
    <div className={`${styles.notice} ${isError ? styles.error : styles.success}`}>
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="7.25" stroke="currentColor" strokeWidth="1.5" />
        {isError ? (
          <>
            <path d="M8 4.5v4.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="11.25" r="0.9" fill="currentColor" />
          </>
        ) : (
          <path d="m5 8.25 2 2 4-4.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
      <span>{children}</span>
    </div>
  );
}

type TextFieldProps = {
  type: 'email' | 'password' | 'text';
  name: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  customValidity?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  title?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
  autoFocus?: boolean;
};

export function TextField({ type, name, placeholder, value, onChange, autoComplete, customValidity = '', ...otherProps }: TextFieldProps) {
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.setCustomValidity(customValidity);
  }, [customValidity]);

  return (
    <input
      ref={input}
      className={styles.input}
      type={type}
      name={name}
      placeholder={placeholder}
      aria-label={placeholder}
      autoComplete={autoComplete}
      autoCorrect="off"
      autoCapitalize="none"
      spellCheck={false}
      required
      value={value}
      onChange={(event) => onChange(event.target.value)}
      {...otherProps}
    />
  );
}

export function SubmitButton({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <button className={styles.primary} type="submit" disabled={pending} aria-busy={pending}>
      {pending && <Preloader size="sm" color="black" />}
      <span>{children}</span>
    </button>
  );
}

export function ShowPasswordButton({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button className={styles.togglePassword} type="button" aria-pressed={visible} onClick={onToggle}>
      <span>{visible ? 'Hide password' : 'Show password'}</span>
    </button>
  );
}
