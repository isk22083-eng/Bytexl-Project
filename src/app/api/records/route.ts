import { NextRequest, NextResponse } from "next/server";
import { requireSupabase } from "@/lib/supabaseClient";
import type { ExtractionResult } from "@/lib/types";

const DEMO_PATIENT_NAME = "Demo Patient";

// Fallback only: used if a record is saved before the user has created a
// profile on this browser (see src/lib/patient.ts). Real records should
// always carry a patientId from the client's stored profile.
async function getOrCreateDemoPatient() {
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
    .insert({ full_name: DEMO_PATIENT_NAME })
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
      patientId?: string | null;
    };
    const { extraction, fileUrl, patientId: requestedPatientId } = body;

    const supabase = requireSupabase();
    const patientId = requestedPatientId || (await getOrCreateDemoPatient());

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

export async function GET(req: NextRequest) {
  try {
    const supabase = requireSupabase();
    const patientId = req.nextUrl.searchParams.get("patientId");

    let query = supabase
      .from("health_records")
      .select(
        "*, patients(full_name, date_of_birth, gender, abha_id), medications(*), lab_observations(*), diagnoses(*)",
      )
      .order("document_date", { ascending: false, nullsFirst: false });

    if (patientId) {
      query = query.eq("patient_id", patientId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ records: data });
  } catch (err) {
    console.error("Fetching records failed:", err);
    const message = err instanceof Error ? err.message : "Fetch failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
