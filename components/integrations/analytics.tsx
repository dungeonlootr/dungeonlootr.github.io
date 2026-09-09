import Script from "next/script";
import { integrations } from "@/config/integrations";

export function Analytics() {
  if (integrations.analytics.provider === "google") {
    const { measurementId } = integrations.analytics;

    return (
      <>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
        <script>{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}</script>
      </>
    );
  }

  if (integrations.analytics.provider !== "pirsch") return null;

  return (
    <Script
      defer
      src="https://api.pirsch.io/pa.js"
      id="pianjs"
      data-code={integrations.analytics.code}
      strategy="afterInteractive"
    />
  );
}
