"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Fires one pageview per pathname change.
 *
 * Visitor ID: persistent random UUID in localStorage. No PII.
 * Also installs a global click listener that captures outbound + [data-track] clicks.
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect DNT
    if (navigator.doNotTrack === "1") return;

    let visitorId = localStorage.getItem("mq_vid");
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("mq_vid", visitorId);
    }

    const path = pathname || "/";
    const locale = path.startsWith("/en") ? "en" : "ar";
    const referrer = document.referrer || undefined;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "pageview",
        path,
        locale,
        visitorId,
        referrer,
      }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (navigator.doNotTrack === "1") return;

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const link = target.closest("a") as HTMLAnchorElement | null;
      const tracked = target.closest("[data-track]") as HTMLElement | null;
      if (!link && !tracked) return;

      const visitorId = localStorage.getItem("mq_vid") || "";
      const path = window.location.pathname;
      const slug = path.replace(/^\/(en\/)?/, "").replace(/\/$/, "") || "__home__";

      let type: "outbound" | "internal" | "cta" | "other" = "other";
      let targetStr = "";

      if (link) {
        const href = link.href;
        targetStr = href;
        try {
          const url = new URL(href, window.location.origin);
          if (url.origin !== window.location.origin) type = "outbound";
          else type = "internal";
        } catch {
          type = "other";
        }
      } else if (tracked) {
        targetStr = tracked.getAttribute("data-track") || tracked.tagName;
        type = "cta";
      }

      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "click", slug, target: targetStr, type, visitorId }),
        keepalive: true,
      }).catch(() => {});
    };

    document.addEventListener("click", onClick, { capture: true, passive: true });
    return () => document.removeEventListener("click", onClick, { capture: true } as unknown as EventListenerOptions);
  }, []);

  return null;
}
