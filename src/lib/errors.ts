export function extractErrorMessage(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    const e = error as { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
    if (e.formErrors?.[0]) return e.formErrors[0];
    if (e.fieldErrors) {
      const firstField = Object.values(e.fieldErrors).find((v) => v && v.length > 0);
      if (firstField?.[0]) return firstField[0];
    }
  }
  return "";
}