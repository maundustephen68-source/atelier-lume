const STYLES: Record<string, string> = {
  new: "bg-stone text-ink",
  contacted: "bg-brass/15 text-brassDark",
  converted: "bg-successBg text-success",
  lost: "bg-dangerBg text-danger",
  held: "bg-brass/15 text-brassDark",
  confirmed: "bg-successBg text-success",
  cancelled: "bg-dangerBg text-danger",
  completed: "bg-stone text-ink",
  paid: "bg-successBg text-success",
  pending: "bg-brass/15 text-brassDark",
  failed: "bg-dangerBg text-danger",
  sent: "bg-successBg text-success",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-sm px-2.5 py-1 text-[11px] uppercase tracking-eyebrow ${STYLES[status] || "bg-stone text-ink"}`}>
      {status}
    </span>
  );
}
