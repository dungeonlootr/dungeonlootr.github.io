"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { integrations } from "@/config/integrations";

declare global {
  interface Window {
    atOptions?: {
      key: string;
      format: "iframe";
      height: number;
      width: number;
      params: Record<string, never>;
    };
  }
}

/**
 * Loads exactly one Adsterra Banner placement for the current viewport. The
 * matching placement is selected before its script is appended, so a hidden
 * alternative can never initialise or make an additional ad request.
 */
export function ResponsiveBannerAd() {
  const hostRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const bannerAds = integrations.bannerAds;

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !bannerAds) return;

    const viewport = window.matchMedia("(min-width: 768px)");
    let activeScript: HTMLScriptElement | null = null;

    const loadPlacement = () => {
      const placement = viewport.matches ? bannerAds.desktop : bannerAds.mobile;
      host.replaceChildren();

      // This is the object required by the provider's supplied script.
      window.atOptions = {
        key: placement.key,
        format: "iframe",
        height: placement.height,
        width: placement.width,
        params: {},
      };

      const script = document.createElement("script");
      script.async = true;
      script.src = placement.scriptUrl;
      script.dataset.adsterraBanner = placement.key;
      activeScript = script;
      host.appendChild(script);
    };

    loadPlacement();
    viewport.addEventListener("change", loadPlacement);

    return () => {
      viewport.removeEventListener("change", loadPlacement);
      activeScript?.remove();
      host.replaceChildren();
    };
  }, [bannerAds, pathname]);

  if (!bannerAds) return null;

  return (
    <aside aria-label="Advertisement" className="responsive-banner-ad">
      <p className="responsive-banner-ad__label">Advertisement</p>
      <div ref={hostRef} className="responsive-banner-ad__slot" data-responsive-banner-ad />
    </aside>
  );
}
