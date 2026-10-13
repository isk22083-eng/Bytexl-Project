"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";

type StoredRecord = {
  id: string;
  document_type: string;
  document_date: string | null;
  summary_english: string;
  summary_telugu: string | null;
  created_at: string;
  medications: { id: string; name: string; dosage: string | null }[];
  lab_observations: {
    id: string;
    test_name: string;
    value: string;
    unit: string | null;
    is_abnormal: boolean;
  }[];
  diagnoses: { id: string; description: string }[];
};

export default function TimelinePage() {
  const { lang, t } = useLanguage();
  const [records, setRecords] = useState<StoredRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/records")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setRecords(data.records as StoredRecord[]);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load."));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold">{t("navTimeline")}</h1>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {!records && !error && (
        <p className="mt-4 text-sm text-black/60 dark:text-white/60">
          {lang === "te" ? "లోడ్ అవుతోంది..." : "Loading..."}
        </p>
      )}

      {records && records.length === 0 && (
        <p className="mt-4 text-sm text-black/60 dark:text-white/60">
          {lang === "te"
            ? "ఇంకా రికార్డులు లేవు. ఒక రికార్డ్ అప్‌లోడ్ చేసి సేవ్ చేయండి."
            : "No records yet. Upload and save a record to build your timeline."}
        </p>
      )}

      <div className="mt-8 space-y-6">
        {records?.map((r) => (
          <div key={r.id} className="rounded-xl border border-black/10 p-6 dark:border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-black/50 dark:text-white/50">
                {r.document_type.replace("_", " ")}
              </span>
              <span className="text-xs text-black/50 dark:text-white/50">
                {r.document_date ?? new Date(r.created_at).toLocaleDateString()}
              </span>
            </div>

            <p className="mt-3 text-sm">
              {lang === "te" && r.summary_telugu ? r.summary_telugu : r.summary_english}
            </p>

            {r.lab_observations.some((o) => o.is_abnormal) && (
              <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                {lang === "te" ? "అసాధారణ విలువలు కనుగొనబడ్డాయి" : "Abnormal values found"}
              </p>
            )}

            {r.medications.length > 0 && (
              <p className="mt-2 text-xs text-black/60 dark:text-white/60">
                {(lang === "te" ? "మందులు: " : "Medications: ") +
                  r.medications.map((m) => m.name).join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
