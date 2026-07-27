'use client';

import { useState } from 'react';
import { ContentEditor } from './ContentEditor';
import { QuizEditor } from './QuizEditor';
import { Integrations } from './Integrations';
import { Settings } from './Settings';
import { cn } from './ui';

type SiteRef = { slug: string; name: string };
type Tab = 'content' | 'quiz' | 'integrations' | 'settings';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'content', label: 'Контент', icon: '📝' },
  { id: 'quiz', label: 'Квиз', icon: '🧩' },
  { id: 'integrations', label: 'Интеграции', icon: '🔌' },
  { id: 'settings', label: 'Настройки', icon: '⚙️' },
];

export function AdminDashboard({ sites }: { sites: SiteRef[] }) {
  const [slug, setSlug] = useState(sites[0]?.slug ?? '');
  const [tab, setTab] = useState<Tab>('content');

  return (
    <div className="space-y-6">
      {/* Выбор площадки */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-zinc-500">Площадка</span>
        <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
          {sites.map((s) => (
            <button
              key={s.slug}
              onClick={() => setSlug(s.slug)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition',
                slug === s.slug ? 'bg-zinc-900 text-white shadow' : 'text-zinc-600 hover:bg-zinc-100',
              )}
            >
              {s.name}
            </button>
          ))}
        </div>
        <a
          href={`/${slug}`}
          target="_blank"
          rel="noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
        >
          Открыть сайт <span aria-hidden>↗</span>
        </a>
      </div>

      {/* Вкладки */}
      <div className="inline-flex flex-wrap gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition',
              tab === t.id ? 'bg-zinc-900 text-white shadow' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800',
            )}
          >
            <span aria-hidden>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* key на площадке — перезагрузка данных при смене */}
      <div>
        {tab === 'content' && <ContentEditor key={`content-${slug}`} slug={slug} />}
        {tab === 'quiz' && <QuizEditor key={`quiz-${slug}`} slug={slug} />}
        {tab === 'integrations' && <Integrations key={`int-${slug}`} slug={slug} />}
        {tab === 'settings' && <Settings key={`set-${slug}`} slug={slug} />}
      </div>
    </div>
  );
}
