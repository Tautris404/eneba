import { useEffect, useState, type FormEvent } from 'react';
import { confirmRegistration, registerAccount, resendRegistrationCode } from '../../services/authApi';
import { startSession, useSession } from '../../state/session';
import { authLink, redirectTarget } from '../../utils/authRedirect';
import { Notice, ShowPasswordButton, SubmitButton, TextField } from './AuthFormControls';
import { AuthLayout } from './AuthLayout';
import { describeAuthError, newPasswordValidity, repeatPasswordValidity } from './authErrors';
import { VerificationCodeForm } from './VerificationCodeForm';
import styles from './AuthLayout.module.css';

type Step = { name: 'details' } | { name: 'verify'; id: string; email: string };

export function RegisterPage() {
  const session = useSession();
  const [step, setStep] = useState<Step>({ name: 'details' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatedPassword, setRepeatedPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (session) window.location.replace(redirectTarget());
  }, [session]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const address = email.trim();
    setPending(true);
    try {
      const { id } = await registerAccount(address, password);
      setStep({ name: 'verify', id, email: address });
    } catch (reason) {
      setError(describeAuthError(reason, 'register'));
    } finally {
      setPending(false);
    }
  }

  function startOver(message = '') {
    setStep({ name: 'details' });
    setPassword('');
    setRepeatedPassword('');
    setError(message);
  }

  if (step.name === 'verify') {
    return (
      <AuthLayout
        pageTitle="Verification"
        headline="Almost there!"
        title="Verify an email"
        verified
        subtitle="Check email inbox for verification code and insert it below. You may need to check your spam folder."
      >
        <VerificationCodeForm
          flow="register"
          onSubmit={async (code) => {
            const tokens = await confirmRegistration(step.id, code);
            startSession(tokens, step.email);
          }}
          onResend={() => resendRegistrationCode(step.id)}
          onExpired={(message) => startOver(`${message} Please register again.`)}
        />
      </AuthLayout>
    );
  }

  const passwordType = showPassword ? 'text' : 'password';

  return (
    <AuthLayout
      pageTitle="Create account"
      title="Create account"
      subtitle={<>Already have an account? <a className={styles.link} href={authLink('/login')}>Login</a></>}
    >
      <form onSubmit={handleSubmit}>
        <div>
          <TextField type="email" name="email" placeholder="Email" autoComplete="email" value={email} onChange={setEmail} />
          <TextField
            type={passwordType}
            name="new-password"
            placeholder="Password"
            autoComplete="new-password"
            minLength={8}
            customValidity={newPasswordValidity(password)}
            value={password}
            onChange={setPassword}
          />
          <TextField
            type={passwordType}
            name="repeat-password"
            placeholder="Repeat password"
            autoComplete="new-password"
            customValidity={repeatPasswordValidity(password, repeatedPassword)}
            value={repeatedPassword}
            onChange={setRepeatedPassword}
          />
          <ShowPasswordButton visible={showPassword} onToggle={() => setShowPassword(!showPassword)} />
        </div>
        {error && <Notice tone="error">{error}</Notice>}
        <SubmitButton pending={pending}>Continue with email</SubmitButton>
      </form>
    </AuthLayout>
  );
}
