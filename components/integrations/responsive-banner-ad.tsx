"use client";

import { useEffect, useRef, useState } from "react";
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
  const [isFilled, setIsFilled] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !bannerAds) return;

    const viewport = window.matchMedia("(min-width: 768px)");
    let activeScript: HTMLScriptElement | null = null;
    let activeFrame: HTMLIFrameElement | null = null;

    const revealWhenLoaded = () => setIsFilled(true);

    const observeCreative = () => {
      const frame = host.querySelector("iframe");
      if (!frame || frame === activeFrame) return;

      activeFrame?.removeEventListener("load", revealWhenLoaded);
      activeFrame = frame;
      frame.addEventListener("load", revealWhenLoaded, { once: true });
    };

    const observer = new MutationObserver(observeCreative);
    observer.observe(host, { childList: true, subtree: true });

    const loadPlacement = () => {
      const placement = viewport.matches ? bannerAds.desktop : bannerAds.mobile;
      host.replaceChildren();
      activeFrame = null;
      setIsFilled(false);

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
      observeCreative();
    };

    loadPlacement();
    viewport.addEventListener("change", loadPlacement);

    return () => {
      viewport.removeEventListener("change", loadPlacement);
      observer.disconnect();
      activeFrame?.removeEventListener("load", revealWhenLoaded);
      activeScript?.remove();
      host.replaceChildren();
    };
  }, [bannerAds, pathname]);

  if (!bannerAds) return null;

  return (
    <aside aria-label="Advertisement" className={`responsive-banner-ad${isFilled ? " responsive-banner-ad--filled" : ""}`}>
      {isFilled ? <p className="responsive-banner-ad__label">Advertisement</p> : null}
      <div ref={hostRef} className="responsive-banner-ad__slot" data-responsive-banner-ad />
    </aside>
  );
}
