"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export default function Home() {
  const { t } = useLanguage();

  const features = [
    { title: t("featureOcrTitle"), body: t("featureOcrBody") },
    { title: t("featureSummaryTitle"), body: t("featureSummaryBody") },
    { title: t("featureTimelineTitle"), body: t("featureTimelineBody") },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <section className="text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">{t("heroTitle")}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-black/70 dark:text-white/70">
          {t("heroBody")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/upload"
            className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
          >
            {t("ctaUpload")}
          </Link>
          <Link
            href="/timeline"
            className="rounded-full border border-black/20 px-6 py-3 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            {t("ctaTimeline")}
          </Link>
        </div>
      </section>

      <section className="mt-20 grid gap-8 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-xl border border-black/10 p-6 dark:border-white/10">
            <h2 className="font-semibold">{f.title}</h2>
            <p className="mt-2 text-sm text-black/70 dark:text-white/70">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
