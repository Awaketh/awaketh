import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { SiGoogle } from '@icons-pack/react-simple-icons';
import { KeyRound } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { authClient } from '@/lib/auth-client';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const tokenRef = useRef<TurnstileInstance | null>(null);
  const oneTapRequested = useRef(false);
  const { data: session, isPending: sessionPending } = authClient.useSession();

  useEffect(() => {
    if (sessionPending || session) return;
    // StrictMode mounts effects twice in dev; One Tap rejects a concurrent prompt.
    if (oneTapRequested.current) return;
    oneTapRequested.current = true;

    void (async () => {
      try {
        await authClient.oneTap();
      } catch (error) {
        console.error('One Tap failed', error);
      }
    })();

    // Without this the prompt outlives the component and its FedCM request is
    // aborted by the next mount instead of dismissed.
    return () => {
      window.google?.accounts.id.cancel();
    };
  }, [session, sessionPending]);

  async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    let captchaToken: string;
    try {
      captchaToken = await tokenRef.current!.getResponsePromise();
    } catch {
      tokenRef.current?.reset();
      console.error('Captcha check failed');
      return;
    }

    const { error } = await authClient.signIn.email({
      email: email,
      password: password,
      fetchOptions: {
        headers: {
          'x-captcha-response': captchaToken,
        },
      },
    });

    // Turnstile tokens are single-use, so issue a fresh one for the next attempt.
    tokenRef.current?.reset();

    console.log(error);
  }

  async function onPasskeySignIn() {
    const { data, error } = await authClient.signIn.passkey({
      autoFill: false,
    });

    console.log(data);
    console.log(error);
  }

  async function onGoogleSignIn() {
    const { error } = await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/',
    });

    console.log(error);
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with your Google account or with your passkey.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  onClick={onGoogleSignIn}
                >
                  <SiGoogle className="size-4" />
                  Login with Google
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={onPasskeySignIn}
                >
                  <KeyRound data-icon="inline-start" /> Login with Passkey
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="engineering@example.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </Field>
              <Field>
                <Button type="submit">Login</Button>
                <Turnstile
                  className="*:mx-auto"
                  siteKey={process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY!}
                  options={{ appearance: 'interaction-only' }}
                  ref={tokenRef}
                />
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{' '}
                  <a href="/auth/sign-up">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{' '}
        <a href="/legal/terms">Terms of Service</a> and{' '}
        <a href="/legal/privacy">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
