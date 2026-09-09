import type { IntegrationConfig } from "./types";

const pirschCode = process.env.NEXT_PUBLIC_PIRSCH_CODE?.trim();
const googleAnalyticsMeasurementId = "G-S3N39SCNMN";
const nativeAdKey = "09dbebf1d220505d6fdcaca0131c7a2a";
const adScriptUrl = process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_SCRIPT_URL?.trim()
  || `https://pl31231295.profitableratecpmnetwork.com/${nativeAdKey}/invoke.js`;
const adContainerId = process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_CONTAINER_ID?.trim()
  || `container-${nativeAdKey}`;
const desktopBannerKey = "5a516d034d92ebbe98d880b34b884856";
const mobileBannerKey = "a29de0e03b06fcef9574cef61c67ee86";

export const integrations: IntegrationConfig = {
  analytics: googleAnalyticsMeasurementId
    ? { provider: "google", measurementId: googleAnalyticsMeasurementId }
    : pirschCode
    ? { provider: "pirsch", code: pirschCode }
    : { provider: "none" },
  ads:
    adScriptUrl && adContainerId
      ? {
          provider: "adsterra-native",
          scriptUrl: adScriptUrl,
          containerId: adContainerId,
        }
      : { provider: "none" },
  bannerAds: {
    desktop: {
      key: desktopBannerKey,
      scriptUrl: `https://www.highrevenueformat.com/${desktopBannerKey}/invoke.js`,
      width: 728,
      height: 90,
    },
    mobile: {
      key: mobileBannerKey,
      scriptUrl: `https://www.highrevenueformat.com/${mobileBannerKey}/invoke.js`,
      width: 320,
      height: 50,
    },
  },
  socialBar: {
    scriptUrl: "https://pl31231296.profitableratecpmnetwork.com/74/e7/e5/74e7e5addb40d980b1fa3fb59cf42bd3.js",
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION?.trim() || null,
    bing: process.env.BING_SITE_VERIFICATION?.trim() || null,
  },
};
