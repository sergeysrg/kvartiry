import type { Metadata } from 'next';
import type { LandingData } from '@/app/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com';

/** URL канонической страницы конкретного лендинга. */
export function canonicalFor(slug: string): string {
  return `${SITE_URL.replace(/\/$/, '')}/${slug}`;
}

/** next/metadata: title/description/OpenGraph/Twitter/canonical. */
export function buildMetadata(data: LandingData, opts?: { yandexVerification?: string }): Metadata {
  const { settings, content, slug } = data;
  const title = settings.metaTitle || content.title;
  const description = settings.metaDescription;
  const url = canonicalFor(slug);
  const image = settings.ogImage || content.images[0] || '';

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    verification: opts?.yandexVerification ? { yandex: opts.yandexVerification } : undefined,
    openGraph: {
      type: 'website',
      locale: 'ru_RU',
      url,
      siteName: data.name,
      title,
      description,
      images: image ? [{ url: image, width: 1600, height: 1200, alt: data.name }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
    robots: { index: true, follow: true },
  };
}

/**
 * JSON-LD Schema.org: RealEstateAgent (организация-продавец)
 * и Product (сам ЖК). Возвращает массив объектов для <script type="application/ld+json">.
 */
export function buildJsonLd(data: LandingData): object[] {
  const url = canonicalFor(data.slug);
  const { settings, content } = data;

  const realEstateAgent = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: data.name,
    url,
    image: settings.ogImage || content.images[0],
    telephone: settings.phone,
    email: settings.email || undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Казань',
      addressRegion: 'Республика Татарстан',
      addressCountry: 'RU',
      streetAddress: settings.address,
    },
    openingHoursSpecification: settings.workingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.label,
      description: h.value,
    })),
  };

  const product = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: content.title,
    description: settings.metaDescription,
    image: content.images,
    brand: { '@type': 'Brand', name: data.name },
    category: 'Недвижимость / Квартиры',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'RUB',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'RealEstateAgent', name: data.name, telephone: settings.phone },
    },
  };

  return [realEstateAgent, product];
}
