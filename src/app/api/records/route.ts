import { NextRequest, NextResponse } from "next/server";
import { requireSupabase } from "@/lib/supabaseClient";
import type { ExtractionResult } from "@/lib/types";

const DEMO_PATIENT_NAME = "Demo Patient";

async function getOrCreateDemoPatient(abhaId?: string | null) {
  const supabase = requireSupabase();

  const { data: existing, error: findError } = await supabase
    .from("patients")
    .select("id")
    .eq("full_name", DEMO_PATIENT_NAME)
    .limit(1)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing.id as string;

  const { data: created, error: createError } = await supabase
    .from("patients")
    .insert({ full_name: DEMO_PATIENT_NAME, abha_id: abhaId ?? null })
    .select("id")
    .single();

  if (createError) throw createError;
  return created.id as string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      extraction: ExtractionResult;
      fileUrl?: string | null;
      abhaId?: string | null;
    };
    const { extraction, fileUrl, abhaId } = body;

    const supabase = requireSupabase();
    const patientId = await getOrCreateDemoPatient(abhaId);

    const { data: record, error: recordError } = await supabase
      .from("health_records")
      .insert({
        patient_id: patientId,
        document_type: extraction.documentType,
        document_date: extraction.documentDate,
        file_url: fileUrl ?? null,
        patient_name_guess: extraction.patientNameGuess,
        summary_english: extraction.summaryEnglish,
        summary_telugu: extraction.summaryTelugu,
        disclaimer: extraction.disclaimer,
      })
      .select("id")
      .single();

    if (recordError) throw recordError;
    const healthRecordId = record.id as string;

    if (extraction.medications.length > 0) {
      const { error } = await supabase.from("medications").insert(
        extraction.medications.map((m) => ({
          health_record_id: healthRecordId,
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions,
        })),
      );
      if (error) throw error;
    }

    if (extraction.labObservations.length > 0) {
      const { error } = await supabase.from("lab_observations").insert(
        extraction.labObservations.map((o) => ({
          health_record_id: healthRecordId,
          test_name: o.testName,
          value: o.value,
          unit: o.unit,
          reference_range: o.referenceRange,
          is_abnormal: o.isAbnormal,
          plain_language_note: o.plainLanguageNote,
        })),
      );
      if (error) throw error;
    }

    if (extraction.diagnoses.length > 0) {
      const { error } = await supabase.from("diagnoses").insert(
        extraction.diagnoses.map((d) => ({
          health_record_id: healthRecordId,
          description: d.description,
          diagnosis_date: d.date,
        })),
      );
      if (error) throw error;
    }

    return NextResponse.json({ id: healthRecordId });
  } catch (err) {
    console.error("Saving record failed:", err);
    const message = err instanceof Error ? err.message : "Save failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = requireSupabase();

    const { data, error } = await supabase
      .from("health_records")
      .select(
        "*, medications(*), lab_observations(*), diagnoses(*)",
      )
      .order("document_date", { ascending: false, nullsFirst: false });

    if (error) throw error;

    return NextResponse.json({ records: data });
  } catch (err) {
    console.error("Fetching records failed:", err);
    const message = err instanceof Error ? err.message : "Fetch failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
