import { SignUpCard } from '@/components/auth/registration-card';

export default function Page() {
  return (
    <main>
      <div className="flex flex-col flex-1 items-center justify-center bg-muted font-sans">
        <SignUpCard />
      </div>
    </main>
  );
}
