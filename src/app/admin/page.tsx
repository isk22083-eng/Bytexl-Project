"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AdminRecord = {
  id: string;
  document_type: string;
  document_date: string | null;
  created_at: string;
  patients: { full_name: string; abha_id: string | null } | null;
  medications: { id: string }[];
  lab_observations: { id: string; is_abnormal: boolean }[];
  diagnoses: { id: string }[];
};

export default function AdminPage() {
  const [records, setRecords] = useState<AdminRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/records")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setRecords(data.records as AdminRecord[]);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load."));
  }, []);

  const patientCount = records
    ? new Set(records.map((r) => r.patients?.full_name ?? "unknown")).size
    : 0;
  const abnormalCount = records
    ? records.filter((r) => r.lab_observations.some((o) => o.is_abnormal)).length
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-bold">Admin &middot; All Records</h1>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">
        Every record saved to the database, across all patients. Internal / reviewer view — not linked from the main navigation.
      </p>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {records && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
            <p className="text-2xl font-bold">{records.length}</p>
            <p className="text-xs text-black/60 dark:text-white/60">Total records</p>
          </div>
          <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
            <p className="text-2xl font-bold">{patientCount}</p>
            <p className="text-xs text-black/60 dark:text-white/60">Patients</p>
          </div>
          <div className="rounded-xl border border-black/10 p-4 dark:border-white/10">
            <p className="text-2xl font-bold">{abnormalCount}</p>
            <p className="text-xs text-black/60 dark:text-white/60">Records with abnormal values</p>
          </div>
        </div>
      )}

      {!records && !error && (
        <p className="mt-6 text-sm text-black/60 dark:text-white/60">Loading...</p>
      )}

      {records && records.length === 0 && (
        <p className="mt-6 text-sm text-black/60 dark:text-white/60">No records yet.</p>
      )}

      {records && records.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-xl border border-black/10 dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/10 bg-black/[0.02] text-xs uppercase tracking-wide text-black/50 dark:border-white/10 dark:bg-white/[0.02] dark:text-white/50">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">ABHA ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Meds</th>
                <th className="px-4 py-3">Diagnoses</th>
                <th className="px-4 py-3">Abnormal</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-black/5 last:border-0 dark:border-white/5">
                  <td className="px-4 py-3">{r.patients?.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-black/60 dark:text-white/60">{r.patients?.abha_id ?? "—"}</td>
                  <td className="px-4 py-3">{r.document_type.replace("_", " ")}</td>
                  <td className="px-4 py-3">{r.document_date ?? new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{r.medications.length}</td>
                  <td className="px-4 py-3">{r.diagnoses.length}</td>
                  <td className="px-4 py-3">
                    {r.lab_observations.some((o) => o.is_abnormal) ? (
                      <span className="font-medium text-red-600 dark:text-red-400">Yes</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/record/${r.id}`} className="underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
