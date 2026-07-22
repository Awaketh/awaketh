import { authClient } from '@/lib/auth-client';

export default function Dashboard() {
  const { data } = authClient.useSession();

  const fullName = data?.user?.name;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard, {fullName}!</p>
    </div>
  );
}
