import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AuthShell from '@/components/AuthShell';
import LoginForm from '@/components/LoginForm';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect('/home');

  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}
