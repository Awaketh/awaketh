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
import { sanitizeWord } from '@/lib/auth-functions/name-sanitization';
import Link from 'next/link';

export function SignUpCard() {
  const tokenRef = useRef<TurnstileInstance | null>(null);

  async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    const { data, error } = await authClient.signUp.email({
      name: sanitizeWord(firstName) + ' ' + sanitizeWord(lastName),
      email: email,
      password: password,
      fetchOptions: {
        headers: {
          'x-captcha-response': tokenRef.current?.getResponse(),
        },
      },
    });

    console.log(error);
    console.log(data);
  }

  return (
    <>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Awaketh account registration</CardTitle>
          <CardDescription>
            Get started with your awaketh experience.
          </CardDescription>
          <CardAction>
            <Button variant="outline">
              <Link href="/auth/sign-in"> Sign In </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form id="login-form" onSubmit={onSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName"> First Name </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="lastName"> Last Name </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
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
              <div className="grid gap-2">
                <Label htmlFor="password"> Password </Label>
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
          <Button form="login-form" type="submit" className="w-full">
            Register
          </Button>
          <Turnstile
            className="mt-4"
            siteKey={process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY!}
            ref={tokenRef}
          />
        </CardFooter>
      </Card>
    </>
  );
}
