'use client';

import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };
  return (
    <button onClick={logout} className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium transition hover:bg-slate-100">
      Выйти
    </button>
  );
}
