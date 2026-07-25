import { prisma } from './db';
import type {
  LandingData,
  QuizStep,
  SiteContent,
  SiteSettings,
  ThemeColors,
  HeroStat,
  HeroBonus,
  Consultant,
} from '@/app/types';

// Безопасный парсинг JSON-строк из БД с фолбэком.
function parse<T>(raw: string | undefined, fallback: T): T {
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function contentMap(rows: { key: string; value: string }[]): Record<string, string> {
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

/** Сборка полной модели лендинга по slug. Возвращает null, если сайта нет. */
export async function getLanding(slug: string): Promise<LandingData | null> {
  const site = await prisma.site.findUnique({
    where: { slug },
    include: {
      contents: true,
      settings: true,
      quizSteps: { orderBy: { order: 'asc' }, include: { options: { orderBy: { order: 'asc' } } } },
    },
  });
  if (!site) return null;

  const c = contentMap(site.contents);

  const content: SiteContent = {
    badge: c['hero.badge'] ?? '',
    title: c['hero.title'] ?? '',
    subtitle: c['hero.subtitle'] ?? '',
    features: parse<string[]>(c['hero.features'], []),
    stats: parse<HeroStat[]>(c['hero.stats'], []),
    bonuses: parse<HeroBonus[]>(c['hero.bonuses'], []),
    images: parse<string[]>(c['hero.images'], []),
    consultant: {
      name: c['consultant.name'] ?? '',
      role: c['consultant.role'] ?? '',
      photo: c['consultant.photo'] ?? '',
      quotes: parse<string[]>(c['consultant.quotes'], []),
    } satisfies Consultant,
    developer: c['footer.developer'] ?? '',
    legal: parse<string[]>(c['footer.legal'], []),
    devLogo: c['footer.devLogo'] ?? '',
    phonePrefix: c['footer.phonePrefix'] ?? '',
  };

  const theme: ThemeColors = {
    accentColor: site.accentColor,
    accentDark: site.accentDark,
    navyColor: site.navyColor,
    navyDark: site.navyDark,
    ctaColor: site.ctaColor,
    ctaHover: site.ctaHover,
  };

  const settings: SiteSettings = {
    phone: site.settings?.phone ?? '',
    phoneHref: site.settings?.phoneHref ?? '',
    email: site.settings?.email ?? '',
    address: site.settings?.address ?? '',
    workingHours: (site.settings?.workingHours as SiteSettings['workingHours']) ?? [],
    socials: (site.settings?.socials as SiteSettings['socials']) ?? [],
    metaTitle: site.settings?.metaTitle ?? '',
    metaDescription: site.settings?.metaDescription ?? '',
    ogImage: site.settings?.ogImage ?? '',
  };

  const steps: QuizStep[] = site.quizSteps.map((s) => ({
    id: s.id,
    order: s.order,
    question: s.question,
    kind: s.kind,
    gain: s.gain,
    name: `step_${s.order}`,
    options: s.options.map((o) => ({
      id: o.id,
      order: o.order,
      label: o.label,
      value: o.value,
      imageUrl: o.imageUrl,
    })),
  }));

  return {
    slug: site.slug,
    name: site.name,
    domain: site.domain,
    logoUrl: site.logoUrl,
    theme,
    content,
    settings,
    steps,
  };
}

/** Список всех сайтов (для главной-навигатора и админки). */
export async function listSites() {
  return prisma.site.findMany({ orderBy: { createdAt: 'asc' }, include: { settings: true } });
}

/** Slug сайта по умолчанию (для редиректа с «/»). */
export async function getDefaultSlug(): Promise<string> {
  const def = await prisma.site.findFirst({ where: { isDefault: true } });
  if (def) return def.slug;
  const first = await prisma.site.findFirst({ orderBy: { createdAt: 'asc' } });
  return first?.slug ?? 'unicum';
}
