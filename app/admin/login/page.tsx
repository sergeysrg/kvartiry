'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      router.push(params.get('from') ?? '/admin');
      router.refresh();
    } else {
      setError(data.error ?? 'Ошибка входа');
    }
  };

  const input =
    'w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5';

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-base font-bold text-white">К</span>
          <div className="leading-tight">
            <h1 className="text-lg font-semibold text-zinc-900">Вход в админку</h1>
            <p className="text-xs text-zinc-500">Панель управления сайтами</p>
          </div>
        </div>

        <label className="mb-1.5 block text-sm font-medium text-zinc-700">Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={`${input} mb-4`} placeholder="admin@example.com" />

        <label className="mb-1.5 block text-sm font-medium text-zinc-700">Пароль</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={`${input} mb-6`} placeholder="••••••••" />

        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-zinc-900 py-3 font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
        >
          {loading ? 'Входим…' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
