import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white p-6 text-center">
      <p className="text-6xl font-bold text-slate-900">404</p>
      <p className="text-lg text-slate-500">Страница не найдена</p>
      <Link href="/" className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white hover:bg-slate-700">
        На главную
      </Link>
    </div>
  );
}
