"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { usePatientId, setStoredPatientId } from "@/lib/patient";

type PatientRow = {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  abha_id: string | null;
};

function ProfileForm() {
  const { lang } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/upload";

  const existingId = usePatientId();
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [abhaId, setAbhaId] = useState("");
  const [loading, setLoading] = useState(!!existingId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!existingId) return;

    fetch(`/api/patient?id=${existingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.patient) {
          const p = data.patient as PatientRow;
          setFullName(p.full_name ?? "");
          setDateOfBirth(p.date_of_birth ?? "");
          setGender(p.gender ?? "");
          setAbhaId(p.abha_id ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, [existingId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: existingId,
          fullName,
          dateOfBirth: dateOfBirth || null,
          gender: gender || null,
          abhaId: abhaId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");

      setStoredPatientId(data.patient.id);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-black/60 dark:text-white/60">
        {lang === "te" ? "లోడ్ అవుతోంది..." : "Loading..."}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-black/10 p-6 dark:border-white/10">
      <div>
        <label className="block text-sm font-medium">
          {lang === "te" ? "పూర్తి పేరు" : "Full name"}
        </label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2 text-sm dark:border-white/20 dark:bg-black"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">
            {lang === "te" ? "పుట్టిన తేదీ" : "Date of birth"}
          </label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2 text-sm dark:border-white/20 dark:bg-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            {lang === "te" ? "లింగం" : "Gender"}
          </label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2 text-sm dark:border-white/20 dark:bg-black"
          >
            <option value="">{lang === "te" ? "ఎంచుకోండి" : "Select"}</option>
            <option value="male">{lang === "te" ? "పురుషుడు" : "Male"}</option>
            <option value="female">{lang === "te" ? "స్త్రీ" : "Female"}</option>
            <option value="other">{lang === "te" ? "ఇతర" : "Other"}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">
          {lang === "te" ? "ABHA ID (మాక్)" : "ABHA ID (mock)"}
        </label>
        <input
          type="text"
          placeholder="14-1234-5678-9012"
          value={abhaId}
          onChange={(e) => setAbhaId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2 text-sm dark:border-white/20 dark:bg-black"
        />
        <p className="mt-1 text-xs text-black/50 dark:text-white/50">
          {lang === "te"
            ? "ఇది ప్రదర్శన కోసం మాక్ ID — నిజమైన ABDM ధృవీకరణ కాదు."
            : "This is a mock ID for demo purposes — not a real ABDM verification."}
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {saving
          ? lang === "te" ? "సేవ్ చేస్తోంది..." : "Saving..."
          : lang === "te" ? "ప్రొఫైల్ సేవ్ చేయండి" : "Save profile"}
      </button>
    </form>
  );
}

export default function ProfilePage() {
  const { lang } = useLanguage();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold">
        {lang === "te" ? "నా ప్రొఫైల్" : "My Profile"}
      </h1>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">
        {lang === "te"
          ? "మీ రికార్డులు ఈ ప్రొఫైల్‌కు అనుసంధానించబడతాయి."
          : "Your uploaded records will be linked to this profile."}
      </p>
      <div className="mt-6">
        <Suspense fallback={null}>
          <ProfileForm />
        </Suspense>
      </div>
    </div>
  );
}
