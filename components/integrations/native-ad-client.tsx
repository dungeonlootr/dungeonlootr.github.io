"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function NativeAdClient({ scriptUrl, containerId }: { scriptUrl: string; containerId: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [isFilled, setIsFilled] = useState(false);

  // Inner pages share this component; load a fresh slot on client-side navigation.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    setIsFilled(false);
    const container = document.createElement("div");
    container.id = containerId;
    host.appendChild(container);

    let activeFrame: HTMLIFrameElement | null = null;
    const revealWhenLoaded = () => setIsFilled(true);
    const observeCreative = () => {
      const frame = container.querySelector("iframe");
      if (!frame || frame === activeFrame) return;

      activeFrame?.removeEventListener("load", revealWhenLoaded);
      activeFrame = frame;
      frame.addEventListener("load", revealWhenLoaded, { once: true });
    };
    const observer = new MutationObserver(observeCreative);
    observer.observe(container, { childList: true, subtree: true });

    const script = document.createElement("script");
    script.async = true;
    script.src = scriptUrl;
    script.dataset.cfasync = "false";
    script.dataset.gameWikiNativeAd = containerId;
    host.insertBefore(script, container);
    observeCreative();

    return () => {
      observer.disconnect();
      activeFrame?.removeEventListener("load", revealWhenLoaded);
      host.replaceChildren();
    };
  }, [containerId, scriptUrl, pathname]);

  return (
    <aside aria-label="Advertisement" className={`native-ad${isFilled ? " native-ad--filled" : ""}`}>
      {isFilled ? <p className="native-ad__label">Advertisement</p> : null}
      <div ref={hostRef} data-native-ad-slot />
    </aside>
  );
}
