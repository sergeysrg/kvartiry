import type { MetadataRoute } from 'next';
import { listSites } from '@/app/lib/quiz';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com').replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sites = await listSites();
  return sites.map((s) => ({
    url: `${SITE_URL}/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: 'weekly',
    priority: s.isDefault ? 1 : 0.8,
  }));
}
