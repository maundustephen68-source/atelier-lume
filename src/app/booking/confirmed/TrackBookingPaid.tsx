"use client";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export function TrackBookingPaid({ bookingId }: { bookingId?: string }) {
  useEffect(() => {
    if (bookingId) trackEvent("booking_paid", { bookingId });
  }, [bookingId]);
  return null;
}
