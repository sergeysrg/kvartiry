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
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {session && (
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white">К</span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Панель администратора</p>
                <p className="text-xs text-zinc-500">Подбор квартир</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="hidden text-zinc-500 sm:inline">{session.email}</span>
              <LogoutButton />
            </div>
          </div>
        </header>
      )}
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
