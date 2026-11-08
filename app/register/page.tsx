import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AuthShell from '@/components/AuthShell';
import RegisterForm from '@/components/RegisterForm';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/home');
  }

  const token = searchParams.token;
  const homeowner = token
    ? await prisma.homeowner.findUnique({ where: { inviteToken: token } })
    : null;

  return (
    <AuthShell>
      {!token || !homeowner ? (
        <div className='py-1 text-center'>
          <h1 className='mb-2 text-xl font-semibold text-ink'>Create account</h1>
          <p className='text-sm leading-relaxed text-ink-soft'>
            This invite link is missing or invalid. Ask your board or property
            manager for a new one.
          </p>
        </div>
      ) : (
        <RegisterForm
          token={token}
          fullName={homeowner.fullName}
          unit={homeowner.unit}
          email={homeowner.email}
        />
      )}
    </AuthShell>
  );
}
