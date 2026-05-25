import Link from "next/link";
import { Header } from "@/components/Header";
import { LanguageToggle } from "@/components/data-sources/LanguageToggle";
import { ProviderCard } from "@/components/data-sources/ProviderCard";
import { getLang } from "@/lib/i18n/get-t";
import { PAGE_COPY } from "@/lib/providers/copy";
import { PROVIDER_IDS } from "@/lib/providers/registry";

export const revalidate = 3600;

export default async function DataSourcesIndex() {
  const lang = await getLang();
  const copy = PAGE_COPY[lang];

  return (
    <main className="mx-auto max-w-5xl pb-16">
      <Header />

      <div className="px-4 md:px-8 mt-2 flex items-center justify-between gap-3">
        <Link href="/" className="text-sm text-ink/60 hover:text-ink">
          {lang === "it" ? "← globo" : "← globe"}
        </Link>
        <LanguageToggle current={lang} />
      </div>

      <header className="px-4 md:px-8 mt-4">
        <h1 className="font-scribble text-5xl md:text-6xl">{copy.pageTitle}</h1>
        <p className="text-ink/70 mt-2 max-w-3xl">{copy.pageIntro}</p>
      </header>

      <section className="px-4 md:px-8 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROVIDER_IDS.map((id) => (
          <ProviderCard key={id} id={id} lang={lang} />
        ))}
      </section>
    </main>
  );
}
