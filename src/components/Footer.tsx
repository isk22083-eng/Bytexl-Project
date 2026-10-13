"use client";

import { useLanguage } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-black/10 dark:border-white/10">
      <div className="mx-auto max-w-5xl px-4 py-4 text-xs text-black/60 dark:text-white/60">
        {t("disclaimer")}
      </div>
    </footer>
  );
}
