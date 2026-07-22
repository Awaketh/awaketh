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
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { sanitizeWord } from '@/lib/auth-functions/name-sanitization';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const router = useRouter();
  const tokenRef = useRef<TurnstileInstance | null>(null);

  async function onSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    let captchaToken: string;
    try {
      captchaToken = await tokenRef.current!.getResponsePromise();
    } catch {
      tokenRef.current?.reset();
      toast.error('Captcha check failed. Please try again.');
      return;
    }

    const { error } = await authClient.signUp.email({
      name: sanitizeWord(firstName) + ' ' + sanitizeWord(lastName),
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

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      'Account created successfully! Please check your email to verify your account.',
    );

    router.push('/');
  }
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your information to get started with Awaketh.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    required
                  />
                </Field>
              </div>
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
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      required
                    />
                  </Field>
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit">Create Account</Button>
                <Turnstile
                  className="*:mx-auto"
                  siteKey={process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY!}
                  options={{ appearance: 'interaction-only' }}
                  ref={tokenRef}
                />
                <FieldDescription className="text-center">
                  Already have an account? <a href="/auth/sign-in">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By signing up, you agree to our{' '}
        <a href="/legal/terms">Terms of Service</a> and{' '}
        <a href="/legal/privacy">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
