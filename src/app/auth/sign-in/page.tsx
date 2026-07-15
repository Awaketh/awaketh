import { SignInCard } from '@/components/auth/sign-in-card';

export default function Page() {
  return (
    <main>
      <div className="flex flex-col flex-1 items-center justify-center bg-muted font-sans">
        <SignInCard />
      </div>
    </main>
  );
}
