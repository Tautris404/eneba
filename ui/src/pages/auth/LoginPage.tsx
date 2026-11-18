import { useEffect, useState, type FormEvent } from 'react';
import { confirmLoginCode, loginWithPassword, requestLoginCode, resendLoginCode } from '../../services/authApi';
import { startSession, useSession } from '../../state/session';
import { authLink, redirectTarget } from '../../utils/authRedirect';
import { Notice, ShowPasswordButton, SubmitButton, TextField } from './AuthFormControls';
import { AuthLayout } from './AuthLayout';
import { describeAuthError, loginPasswordValidity } from './authErrors';
import { VerificationCodeForm } from './VerificationCodeForm';
import styles from './AuthLayout.module.css';

type Step =
  | { name: 'code' }
  | { name: 'password' }
  | { name: 'verify'; id: string; email: string };

function initialStep(): Step {
  const method = new URLSearchParams(window.location.search).get('method');
  return method === 'password' ? { name: 'password' } : { name: 'code' };
}

function saveMethodInUrl(method: 'password' | null) {
  const url = new URL(window.location.href);
  if (method) url.searchParams.set('method', method);
  else url.searchParams.delete('method');
  window.history.replaceState(null, '', url);
}

export function LoginPage() {
  const session = useSession();
  const [step, setStep] = useState<Step>(initialStep);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const usesPassword = step.name === 'password';

  useEffect(() => {
    if (session) window.location.replace(redirectTarget());
  }, [session]);

  function switchLoginMethod() {
    const nextStep: Step = usesPassword ? { name: 'code' } : { name: 'password' };
    setStep(nextStep);
    setPassword('');
    setShowPassword(false);
    setError('');
    saveMethodInUrl(nextStep.name === 'password' ? 'password' : null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const address = email.trim();
    setPending(true);
    try {
      if (usesPassword) {
        const tokens = await loginWithPassword(address, password);
        startSession(tokens, address);
      } else {
        const { id } = await requestLoginCode(address);
        setStep({ name: 'verify', id, email: address });
      }
    } catch (reason) {
      setError(describeAuthError(reason, usesPassword ? 'login' : 'loginCode'));
    } finally {
      setPending(false);
    }
  }

  if (step.name === 'verify') {
    return (
      <AuthLayout
        pageTitle="Verification"
        headline="Almost there!"
        title="Verify an email"
        verified
        subtitle="Check email inbox for login code and insert it below. You may need to check your spam folder."
      >
        <VerificationCodeForm
          flow="login"
          onSubmit={async (code) => {
            const tokens = await confirmLoginCode(step.id, code);
            startSession(tokens, step.email);
          }}
          onResend={() => resendLoginCode(step.id)}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      pageTitle="Log in"
      title="Log in"
      subtitle={<>New user? <a className={styles.link} href={authLink('/register')}>Create account</a></>}
    >
      <form onSubmit={handleSubmit}>
        <div>
          <TextField type="email" name="email" placeholder="Email" autoComplete="username" value={email} onChange={setEmail} />
          {usesPassword && (
            <>
              <div className={styles.passwordField}>
                <TextField
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  customValidity={loginPasswordValidity(password)}
                  value={password}
                  onChange={setPassword}
                />
              </div>
              <ShowPasswordButton visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
            </>
          )}
        </div>
        {error && <Notice tone="error">{error}</Notice>}
        <SubmitButton pending={pending}>{usesPassword ? 'Log in' : 'Get login code'}</SubmitButton>
        <button className={styles.secondary} type="button" onClick={switchLoginMethod}>
          <span>{usesPassword ? 'Log in with login code' : 'Log in with password'}</span>
        </button>
      </form>
    </AuthLayout>
  );
}
