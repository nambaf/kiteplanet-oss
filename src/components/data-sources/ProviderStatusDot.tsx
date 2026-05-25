import type { ProviderStatus } from "@/lib/providers/types";

const COLOR: Record<ProviderStatus, string> = {
  live: "bg-accent",
  cache: "bg-note",
  "requires-key": "bg-muted",
  disabled: "bg-ink/20",
  unavailable: "bg-warm",
  demo: "bg-warm/70",
};

const RING: Record<ProviderStatus, string> = {
  live: "ring-accent/40 animate-pulse",
  cache: "ring-note/40",
  "requires-key": "ring-muted/40",
  disabled: "ring-ink/10",
  unavailable: "ring-warm/40",
  demo: "ring-warm/30",
};

export function ProviderStatusDot({
  status,
  size = "sm",
}: {
  status: ProviderStatus;
  size?: "xs" | "sm" | "md";
}) {
  const dim =
    size === "xs" ? "h-1.5 w-1.5" : size === "md" ? "h-3 w-3" : "h-2 w-2";
  return (
    <span
      className={`inline-block rounded-full ring-2 ${dim} ${COLOR[status]} ${RING[status]}`}
      aria-hidden="true"
    />
  );
}
