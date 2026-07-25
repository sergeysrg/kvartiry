// Общие типы приложения. Данные приходят из БД (Prisma) и разбираются
// в удобные для UI структуры.

export type ThemeColors = {
  accentColor: string;
  accentDark: string;
  navyColor: string;
  navyDark: string;
  ctaColor: string;
  ctaHover: string;
};

export type HeroStat = { label: string; value: string };
export type HeroBonus = { title: string; image: string; lock?: string };

export type Consultant = {
  name: string;
  role: string;
  photo: string;
  quotes: string[];
};

export type WorkingHour = { label: string; value: string };
export type Social = { type: string; url: string };

export type SiteSettings = {
  phone: string;
  phoneHref: string;
  email: string;
  address: string;
  workingHours: WorkingHour[];
  socials: Social[];
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
};

export type QuizStepKind = 'CARDS' | 'ICONS' | 'LIST' | 'FORM';

export type QuizOption = {
  id: string;
  order: number;
  label: string;
  value: string;
  imageUrl: string | null;
};

export type QuizStep = {
  id: string;
  order: number;
  question: string;
  kind: QuizStepKind;
  gain: string;
  /** name поля формы для радиогруппы (генерится из порядка) */
  name: string;
  options: QuizOption[];
};

export type SiteContent = {
  badge: string;
  title: string;
  subtitle: string;
  features: string[];
  stats: HeroStat[];
  bonuses: HeroBonus[];
  images: string[];
  consultant: Consultant;
  developer: string;
  legal: string[];
  devLogo: string;
  phonePrefix: string;
};

export type LandingData = {
  slug: string;
  name: string;
  domain: string | null;
  logoUrl: string | null;
  theme: ThemeColors;
  content: SiteContent;
  settings: SiteSettings;
  steps: QuizStep[];
};

export type IntegrationType =
  | 'YANDEX_METRIKA'
  | 'YANDEX_WEBMASTER'
  | 'BITRIX24'
  | 'AMOCRM'
  | 'GOOGLE_ANALYTICS';

export type IntegrationConfig = Record<string, string>;

export type IntegrationDTO = {
  id: string;
  type: IntegrationType;
  enabled: boolean;
  config: IntegrationConfig;
};

export type LeadPayload = {
  siteSlug: string;
  name: string;
  phone: string;
  answers: Record<string, string>;
};
