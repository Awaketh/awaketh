import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { SiGoogle } from '@icons-pack/react-simple-icons';
import { KeyRound } from "lucide-react";
import React, {useRef} from "react";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { authClient } from "@/lib/auth-client";


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
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
                <Button variant="outline" type="button">
                  <SiGoogle className="size-4" />
                  Login with Google
                </Button>
                <Button variant="outline" type="button">
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
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="/auth/sign-up">Sign up</a>
                </FieldDescription>
                {/*<div className="flex mt-4 items-center">*/}
                {/*  <Turnstile*/}
                {/*    siteKey={process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY!}*/}
                {/*    ref={tokenRef}*/}
                {/*  />*/}
                {/*</div>*/}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
