import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Screen from '@/components/Screen';
import LoginForm from '@/components/LoginForm';
import { organization } from '@/data/mock';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/home');
  }

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
        <p className='text-brand-soft text-xs'>Resident Portal</p>
      </div>

      <LoginForm />
    </Screen>
  );
}
