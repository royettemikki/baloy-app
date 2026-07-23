import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Screen from '@/components/Screen';
import RegisterForm from '@/components/RegisterForm';
import { organization } from '@/data/mock';

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
    <Screen>
      <div className='bg-brand-strong flex flex-col items-center justify-center px-8 py-11'>
        <div className='w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-3.5'>
          <span className='text-lg font-semibold text-brand-strong'>
            {organization.logoInitials}
          </span>
        </div>
        <p className='text-white text-lg font-medium mb-1'>
          {organization.name}
        </p>
        <p className='text-brand-soft text-xs'>Create your account</p>
      </div>

      {!token || !homeowner ? (
        <div className='flex-1 px-6 py-8 text-center'>
          <p className='text-sm text-ink-soft'>
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
    </Screen>
  );
}
