"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function NativeAdClient({ scriptUrl, containerId }: { scriptUrl: string; containerId: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Inner pages share this component; load a fresh slot on client-side navigation.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const container = document.createElement("div");
    container.id = containerId;
    host.appendChild(container);

    const script = document.createElement("script");
    script.async = true;
    script.src = scriptUrl;
    script.dataset.cfasync = "false";
    script.dataset.gameWikiNativeAd = containerId;
    host.insertBefore(script, container);

    return () => {
      host.replaceChildren();
    };
  }, [containerId, scriptUrl, pathname]);

  return (
    <aside aria-label="Advertisement" className="mt-8 min-w-0">
      <p className="mb-3 text-center text-xs uppercase tracking-widest text-muted-foreground">Advertisement</p>
      <div ref={hostRef} data-native-ad-slot />
    </aside>
  );
}
