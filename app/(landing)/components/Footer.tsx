import Image from 'next/image';
import type { LandingData } from '@/app/types';

/** Подвал (раскладка как на оригинале): оба логотипа вместе слева, колонка
    «Офис продаж» + «Режим работы», справа — правовые ссылки; ниже реквизиты. */
export function Footer({ data }: { data: LandingData }) {
  const { content, settings } = data;

  return (
    <footer className="bg-white py-14">
      <div className="container-x">
        <div className="flex flex-col gap-10 xl:flex-row xl:items-start xl:justify-between xl:gap-12">
          {/* оба логотипа вместе */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-10">
            {data.logoUrl && (
              <Image src={data.logoUrl} alt={data.name} width={150} height={59} className="h-[52px] w-auto" unoptimized />
            )}
            {content.devLogo && (
              <Image src={content.devLogo} alt="Унистрой" width={250} height={59} className="h-[52px] w-auto" unoptimized />
            )}
          </div>

          {/* контакты: офис продаж + режим работы (стопкой) */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-[22px] font-medium leading-tight text-body">Офис продаж</p>
              <a
                href={settings.phoneHref}
                className="mt-2 inline-block whitespace-nowrap text-[22px] font-medium transition-colors hover:text-[color:var(--accent-dark)]"
                style={{ color: 'var(--accent)' }}
              >
                {content.phonePrefix}
                {settings.phone}
              </a>
            </div>
            <div>
              <p className="text-[22px] font-medium leading-tight text-body">Режим работы</p>
              <div className="mt-3 flex flex-col gap-2 text-xl">
                {settings.workingHours.map((h) => (
                  <span key={h.label}>
                    {h.label}: {h.value}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* правовые ссылки */}
          <div className="flex flex-shrink-0 flex-col gap-4 text-xl font-medium leading-snug xl:max-w-[26rem]">
            <a href="#" className="transition-colors hover:text-[color:var(--accent-dark)]" style={{ color: 'var(--accent)' }}>
              Подробности акций и условия кредитования
            </a>
            <a href="#" className="transition-colors hover:text-[color:var(--accent-dark)]" style={{ color: 'var(--accent)' }}>
              Политика конфиденциальности
            </a>
            <p className="text-body">
              Проектная декларация и разрешение на строительство на{' '}
              <a href="https://наш.дом.рф" target="_blank" rel="noreferrer noopener" style={{ color: 'var(--accent)' }}>
                наш.дом.рф
              </a>
            </p>
          </div>
        </div>

        {/* реквизиты + дисклеймер */}
        <div className="mt-11 max-w-[1200px]">
          <p className="text-lg leading-relaxed text-body">
            {content.developer}
            {content.legal.map((line) => (
              <span key={line}>
                <br />
                {line}
              </span>
            ))}
          </p>
          <p className="mt-6 text-[18px] leading-snug text-body">
            Все права защищены. Данный интернет-сайт носит информационный и рекламный характер и ни при
            каких условиях не является публичной офертой, которая определяется положениями статьи 437
            Гражданского кодекса РФ.
          </p>
        </div>
      </div>
    </footer>
  );
}
