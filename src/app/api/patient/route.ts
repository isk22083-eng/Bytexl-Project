import { NextRequest, NextResponse } from "next/server";
import { requireSupabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      id?: string | null;
      fullName: string;
      dateOfBirth: string | null;
      gender: string | null;
      abhaId: string | null;
    };

    const supabase = requireSupabase();
    const row = {
      full_name: body.fullName,
      date_of_birth: body.dateOfBirth,
      gender: body.gender,
      abha_id: body.abhaId,
    };

    if (body.id) {
      const { data, error } = await supabase
        .from("patients")
        .update(row)
        .eq("id", body.id)
        .select("*")
        .single();
      if (error) throw error;
      return NextResponse.json({ patient: data });
    }

    const { data, error } = await supabase
      .from("patients")
      .insert(row)
      .select("*")
      .single();
    if (error) throw error;
    return NextResponse.json({ patient: data });
  } catch (err) {
    console.error("Saving patient failed:", err);
    const message = err instanceof Error ? err.message : "Save failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id." }, { status: 400 });
    }

    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ patient: data });
  } catch (err) {
    console.error("Fetching patient failed:", err);
    const message = err instanceof Error ? err.message : "Fetch failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
