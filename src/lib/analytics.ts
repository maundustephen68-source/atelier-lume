"use client";

// Fires a custom event to whichever analytics provider is configured.
// Funnel: page_view (automatic) -> lead_form_started -> lead_form_submitted
// -> booking_started -> booking_paid.
export function trackEvent(name: string, props?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  const w = window as any;
  if (w.plausible) {
    w.plausible(name, { props });
  } else if (w.gtag) {
    w.gtag("event", name, props);
  }
}
