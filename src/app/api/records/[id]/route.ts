import { NextRequest, NextResponse } from "next/server";
import { requireSupabase } from "@/lib/supabaseClient";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = requireSupabase();

    const { data, error } = await supabase
      .from("health_records")
      .select(
        "*, patients(full_name, date_of_birth, gender, abha_id), medications(*), lab_observations(*), diagnoses(*)",
      )
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: "Record not found." }, { status: 404 });
    }

    return NextResponse.json({ record: data });
  } catch (err) {
    console.error("Fetching record failed:", err);
    const message = err instanceof Error ? err.message : "Fetch failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
