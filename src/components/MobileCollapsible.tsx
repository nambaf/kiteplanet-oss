import type { ReactNode } from "react";

// pannello collassato di default su <md, aperto su desktop: due rami SSR esclusivi via Tailwind
// (md:hidden / hidden md:block), <details> nativo, zero JS client, niente flash all'idratazione
interface Props {
  title: ReactNode;
  children: ReactNode;
  className?: string;
  paperCard?: boolean;
  padding?: string;
}

export function MobileCollapsible({
  title,
  children,
  className = "",
  paperCard = true,
  padding = "p-3",
}: Props) {
  const base = paperCard ? `paper-card ${padding}` : "";
  return (
    <>
      <details className={`${base} group md:hidden ${className}`.trim()}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
          <div className="min-w-0 flex-1">{title}</div>
          <span
            aria-hidden
            className="text-2xl leading-none transition-transform group-open:rotate-45"
          >
            +
          </span>
        </summary>
        <div className="mt-3">{children}</div>
      </details>
      <section className={`${base} hidden md:block ${className}`.trim()}>
        <div className="mb-2">{title}</div>
        {children}
      </section>
    </>
  );
}
