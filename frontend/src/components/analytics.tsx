import Script from "next/script";
import { siteConfig } from "@/content/site";

/**
 * Analytics integration.
 *
 * Nothing loads unless the corresponding ID is present in the environment, so
 * local development and preview deployments stay untracked and no placeholder
 * ID is ever shipped. Scripts are deferred with `afterInteractive` to keep them
 * out of the critical path.
 */
export function Analytics() {
  const { googleAnalyticsId, clarityProjectId } = siteConfig.analytics;

  return (
    <>
      {googleAnalyticsId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${googleAnalyticsId}',{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}

      {clarityProjectId ? (
        <Script id="clarity-init" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityProjectId}");`}
        </Script>
      ) : null}
    </>
  );
}
