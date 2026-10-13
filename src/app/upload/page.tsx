"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import type { ExtractionResult } from "@/lib/types";
import { usePatientId } from "@/lib/patient";

export default function UploadPage() {
  const { lang, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [includeTelugu, setIncludeTelugu] = useState(lang === "te");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const patientId = usePatientId();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("includeTelugu", String(includeTelugu));

      const res = await fetch("/api/extract", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Extraction failed.");
      }

      setResult(data.extraction as ExtractionResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extraction: result, patientId }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Saving failed.");
      }

      setSaved(true);
      setSavedRecordId(data.id as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold">{t("navUpload")}</h1>

      {!patientId && (
        <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          {lang === "te" ? (
            <>
              రికార్డులను సేవ్ చేయడానికి ముందు దయచేసి మీ ప్రొఫైల్‌ను సెటప్ చేయండి.{" "}
              <Link href="/profile?redirect=/upload" className="underline">
                ఇక్కడ క్లిక్ చేయండి
              </Link>
            </>
          ) : (
            <>
              Set up your profile before saving records so they&apos;re linked to you.{" "}
              <Link href="/profile?redirect=/upload" className="underline">
                Set up profile
              </Link>
            </>
          )}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-black/10 p-6 dark:border-white/10">
        <div>
          <label className="block text-sm font-medium">
            {lang === "te" ? "పత్రం (చిత్రం) ఎంచుకోండి" : "Choose a document image"}
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-2 block w-full text-sm"
            required
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={includeTelugu}
            onChange={(e) => setIncludeTelugu(e.target.checked)}
          />
          {lang === "te" ? "తెలుగులో కూడా సారాంశం ఇవ్వండి" : "Also generate Telugu summary"}
        </label>

        <button
          type="submit"
          disabled={!file || loading}
          className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {loading
            ? lang === "te"
              ? "విశ్లేషిస్తోంది..."
              : "Analyzing..."
            : lang === "te"
              ? "AI తో విశ్లేషించండి"
              : "Analyze with AI"}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          <section className="rounded-xl border border-black/10 p-6 dark:border-white/10">
            <h2 className="font-semibold">
              {lang === "te" ? "ఆంగ్ల సారాంశం" : "Summary"}
            </h2>
            <p className="mt-2 text-sm">{result.summaryEnglish}</p>
            {result.summaryTelugu && (
              <>
                <h2 className="mt-4 font-semibold">తెలుగు సారాంశం</h2>
                <p className="mt-2 text-sm">{result.summaryTelugu}</p>
              </>
            )}
            <p className="mt-4 text-xs text-black/60 dark:text-white/60">{result.disclaimer}</p>
          </section>

          {result.medications.length > 0 && (
            <section className="rounded-xl border border-black/10 p-6 dark:border-white/10">
              <h2 className="font-semibold">
                {lang === "te" ? "మందులు" : "Medications"}
              </h2>
              <ul className="mt-2 space-y-2 text-sm">
                {result.medications.map((m, i) => (
                  <li key={i} className="border-b border-black/5 pb-2 last:border-0 dark:border-white/5">
                    <strong>{m.name}</strong>
                    {m.dosage && ` — ${m.dosage}`}
                    {m.frequency && `, ${m.frequency}`}
                    {m.duration && `, ${m.duration}`}
                    {m.instructions && (
                      <div className="text-black/60 dark:text-white/60">{m.instructions}</div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.labObservations.length > 0 && (
            <section className="rounded-xl border border-black/10 p-6 dark:border-white/10">
              <h2 className="font-semibold">
                {lang === "te" ? "పరీక్ష ఫలితాలు" : "Lab Observations"}
              </h2>
              <ul className="mt-2 space-y-2 text-sm">
                {result.labObservations.map((o, i) => (
                  <li key={i} className="border-b border-black/5 pb-2 last:border-0 dark:border-white/5">
                    <span className={o.isAbnormal ? "font-semibold text-red-600 dark:text-red-400" : ""}>
                      {o.testName}: {o.value} {o.unit}
                    </span>
                    {o.referenceRange && (
                      <span className="text-black/50 dark:text-white/50"> (ref: {o.referenceRange})</span>
                    )}
                    {o.plainLanguageNote && <div className="text-black/60 dark:text-white/60">{o.plainLanguageNote}</div>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.diagnoses.length > 0 && (
            <section className="rounded-xl border border-black/10 p-6 dark:border-white/10">
              <h2 className="font-semibold">
                {lang === "te" ? "రోగనిర్ధారణలు" : "Diagnoses"}
              </h2>
              <ul className="mt-2 space-y-1 text-sm">
                {result.diagnoses.map((d, i) => (
                  <li key={i}>{d.description}{d.date && ` (${d.date})`}</li>
                ))}
              </ul>
            </section>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || saved}
              className="rounded-full border border-black/20 px-6 py-2.5 text-sm font-medium hover:bg-black/5 disabled:opacity-50 dark:border-white/20 dark:hover:bg-white/10"
            >
              {saved
                ? lang === "te" ? "టైమ్‌లైన్‌కు సేవ్ చేయబడింది" : "Saved to timeline"
                : saving
                  ? lang === "te" ? "సేవ్ చేస్తోంది..." : "Saving..."
                  : lang === "te" ? "టైమ్‌లైన్‌కు సేవ్ చేయండి" : "Save to timeline"}
            </button>

            {saved && savedRecordId && (
              <Link href={`/record/${savedRecordId}`} className="text-sm underline">
                {lang === "te" ? "రికార్డ్ చూడండి / ప్రింట్ చేయండి" : "View / Print this record"}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
