'use client';

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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

type PendingMethod = 'email' | 'passkey' | 'google';

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const tokenRef = useRef<TurnstileInstance | null>(null);
  const [pending, setPending] = useState<PendingMethod | null>(null);

  async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const formData = new FormData(event.currentTarget);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    setPending('email');
    try {
      let captchaToken: string;
      try {
        captchaToken = await tokenRef.current!.getResponsePromise();
      } catch {
        toast.error('Captcha check failed. Please try again.');
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

      if (error) {
        toast.error(error.message ?? 'Could not sign you in.');
        return;
      }

      router.push('/dashboard');
    } finally {
      // Turnstile tokens are single-use, so issue a fresh one for the next attempt.
      tokenRef.current?.reset();
      setPending(null);
    }
  }

  async function onPasskeySignIn() {
    if (pending) return;

    setPending('passkey');
    try {
      const { error } = await authClient.signIn.passkey({
        autoFill: false,
      });

      if (error) {
        toast.error(error.message ?? 'Passkey sign-in failed.');
        return;
      }

      router.push('/dashboard');
    } finally {
      setPending(null);
    }
  }

  async function onGoogleSignIn() {
    if (pending) return;

    setPending('google');

    const { error } = await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/',
    });

    // A successful call navigates away to Google, so the only path back here
    // is a failure — leave the button disabled otherwise.
    if (error) {
      toast.error(error.message ?? 'Google sign-in failed.');
      setPending(null);
    }
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
                  disabled={pending !== null}
                >
                  <SiGoogle className="size-4" />
                  Login with Google
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={onPasskeySignIn}
                  disabled={pending !== null}
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
                  autoComplete="email"
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
                  autoComplete="current-password"
                  placeholder="••••••••"
                  required
                />
              </Field>
              <Field>
                <Button type="submit" disabled={pending !== null}>
                  {pending === 'email' ? 'Logging in…' : 'Login'}
                </Button>
                <Turnstile
                  className="*:mx-auto"
                  siteKey={process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY!}
                  options={{ appearance: 'interaction-only' }}
                  ref={tokenRef}
                />
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/sign-up">Sign up</Link>
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
