import type { Metadata } from 'next';
import { getSession } from '@/app/lib/auth';
import { LogoutButton } from './components/LogoutButton';

export const metadata: Metadata = {
  title: 'Админ-панель',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {session && (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold">Панель администратора</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-500">{session.email}</span>
            <LogoutButton />
          </div>
        </header>
      )}
      <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
    </div>
  );
}
