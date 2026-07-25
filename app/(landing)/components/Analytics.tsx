import Script from 'next/script';
import type { IntegrationDTO } from '@/app/types';
import { findConfig } from '@/app/lib/integrations';

/** Инжектит счётчики/верификации из включённых интеграций. */
export function Analytics({ integrations }: { integrations: IntegrationDTO[] }) {
  const metrika = findConfig(integrations, 'YANDEX_METRIKA');
  const ga = findConfig(integrations, 'GOOGLE_ANALYTICS');
  // Верификация Яндекс.Вебмастера отдаётся через metadata API (generateMetadata),
  // поэтому здесь только счётчики.

  return (
    <>
      {metrika?.counterId && (
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
            ym(${metrika.counterId}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true });
          `}
        </Script>
      )}

      {ga?.measurementId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga.measurementId}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga.measurementId}');
            `}
          </Script>
        </>
      )}
    </>
  );
}
