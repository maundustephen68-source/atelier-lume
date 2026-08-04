"use client";
import { useEffect, useState } from "react";

export function useCsrf() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/csrf")
      .then((r) => r.json())
      .then((d) => setToken(d.token))
      .catch(() => setToken(null));
  }, []);
  return token;
}

export function csrfHeaders(token: string | null): Record<string, string> {
  return token ? { "x-csrf-token": token } : {};
}
