'use client';

import { useState } from 'react';
import { ContentEditor } from './ContentEditor';
import { QuizEditor } from './QuizEditor';
import { Integrations } from './Integrations';
import { Settings } from './Settings';

type SiteRef = { slug: string; name: string };
type Tab = 'content' | 'quiz' | 'integrations' | 'settings';

const TABS: { id: Tab; label: string }[] = [
  { id: 'content', label: 'Контент' },
  { id: 'quiz', label: 'Квиз' },
  { id: 'integrations', label: 'Интеграции' },
  { id: 'settings', label: 'Настройки' },
];

export function AdminDashboard({ sites }: { sites: SiteRef[] }) {
  const [slug, setSlug] = useState(sites[0]?.slug ?? '');
  const [tab, setTab] = useState<Tab>('content');

  return (
    <div className="space-y-6">
      {/* Выбор площадки */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-slate-500">Площадка:</span>
        <div className="flex gap-2">
          {sites.map((s) => (
            <button
              key={s.slug}
              onClick={() => setSlug(s.slug)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                slug === s.slug ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
        <a
          href={`/${slug}`}
          target="_blank"
          rel="noreferrer"
          className="ml-auto rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-100"
        >
          Открыть сайт ↗
        </a>
      </div>

      {/* Вкладки */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition ${
              tab === t.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Контент вкладок — key заставляет перезагрузить данные при смене площадки */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {tab === 'content' && <ContentEditor key={`content-${slug}`} slug={slug} />}
        {tab === 'quiz' && <QuizEditor key={`quiz-${slug}`} slug={slug} />}
        {tab === 'integrations' && <Integrations key={`int-${slug}`} slug={slug} />}
        {tab === 'settings' && <Settings key={`set-${slug}`} slug={slug} />}
      </div>
    </div>
  );
}
