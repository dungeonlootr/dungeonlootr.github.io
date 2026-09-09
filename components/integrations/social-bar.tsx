import Script from "next/script";
import { integrations } from "@/config/integrations";

export function SocialBar() {
  if (!integrations.socialBar) return null;

  return (
    <Script
      id="adsterra-social-bar"
      src={integrations.socialBar.scriptUrl}
      strategy="afterInteractive"
    />
  );
}
