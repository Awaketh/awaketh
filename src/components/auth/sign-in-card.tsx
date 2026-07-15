'use client';

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { KeyRound } from 'lucide-react';
import Link from 'next/link';

export function SignInCard() {
  const tokenRef = useRef<TurnstileInstance | null>(null);

  async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await authClient.signIn.email({
      email: email,
      password: password,
      fetchOptions: {
        headers: {
          'x-captcha-response': tokenRef.current?.getResponse(),
        },
      },
    });

    console.log(error);
  }

  async function onPasskeySignIn() {
    const { data, error } = await authClient.signIn.passkey({
      autoFill: false,
    });

    console.log(data);
    console.log(error);
  }

  return (
    <>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Log into your Awaketh account</CardTitle>
          <CardDescription>
            Enter your email below to log into your account.
          </CardDescription>
          <CardAction>
            <Button variant="outline">
              <Link href="/auth/sign-up"> Sign Up </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form id="login-form" onSubmit={onSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email"> Email </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="engineering@example.com"
                  required
                />
              </div>
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
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
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <div>
            <Button form="login-form" type="submit" className="w-full">
              Sign In
            </Button>
            <Button className="w-full mt-2" onClick={onPasskeySignIn}>
              <KeyRound data-icon="inline-start" /> Passkey
            </Button>

            <div className="mt-4">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY!}
                ref={tokenRef}
              />
            </div>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
