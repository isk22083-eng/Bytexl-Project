"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export default function Header() {
  const { t, lang, setLang } = useLanguage();

  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold">
          {t("appName")}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:underline">
            {t("navHome")}
          </Link>
          <Link href="/upload" className="hover:underline">
            {t("navUpload")}
          </Link>
          <Link href="/timeline" className="hover:underline">
            {t("navTimeline")}
          </Link>
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "te" : "en")}
            className="rounded-full border border-black/20 px-3 py-1 text-xs font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            {t("langToggle")}
          </button>
        </nav>
      </div>
    </header>
  );
}
