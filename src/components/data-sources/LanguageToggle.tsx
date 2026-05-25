"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Lang } from "@/lib/providers/types";

export function LanguageToggle({ current }: { current: Lang }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const next: Lang = current === "it" ? "en" : "it";

  function onClick() {
    start(async () => {
      await fetch("/api/lang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: next }),
      });
      router.refresh();
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="rounded-full border border-ink/30 bg-paper px-3 py-1 font-mono text-xs text-ink/80 hover:border-ink hover:text-ink transition-colors disabled:opacity-60"
      aria-label={`switch language to ${next}`}
      title={`switch to ${next}`}
    >
      {current.toUpperCase()} · {next.toUpperCase()}
    </button>
  );
}
