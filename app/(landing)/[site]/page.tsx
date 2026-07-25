import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLanding, listSites } from '@/app/lib/quiz';
import { getIntegrations } from '@/app/lib/integrations';
import { buildMetadata, buildJsonLd } from '@/app/lib/seo';
import { SiteThemeProvider } from '@/app/(landing)/components/SiteThemeProvider';
import { QuizModalProvider } from '@/app/(landing)/components/QuizModalProvider';
import { Header } from '@/app/(landing)/components/Header';
import { Hero } from '@/app/(landing)/components/Hero';
import { Footer } from '@/app/(landing)/components/Footer';
import { QuizModal } from '@/app/(landing)/components/QuizModal';
import { Analytics } from '@/app/(landing)/components/Analytics';

type Props = { params: { site: string } };

// Пре-рендер обеих площадок статически.
export async function generateStaticParams() {
  const sites = await listSites();
  return sites.map((s) => ({ site: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getLanding(params.site);
  if (!data) return {};
  const integrations = await getIntegrations(params.site);
  const webmaster = integrations.find((i) => i.type === 'YANDEX_WEBMASTER' && i.enabled);
  return buildMetadata(data, { yandexVerification: webmaster?.config.verification });
}

export default async function LandingPage({ params }: Props) {
  const data = await getLanding(params.site);
  if (!data) notFound();

  const integrations = await getIntegrations(params.site);
  const jsonLd = buildJsonLd(data);

  return (
    <SiteThemeProvider theme={data.theme}>
      {/* Микроразметка Schema.org: RealEstateAgent + Product */}
      {jsonLd.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}

      <Analytics integrations={integrations} />

      <QuizModalProvider>
        <Header data={data} />
        <main>
          <Hero data={data} />
        </main>
        <Footer data={data} />
        <QuizModal data={data} />
      </QuizModalProvider>
    </SiteThemeProvider>
  );
}
