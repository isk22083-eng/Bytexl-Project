import { NextRequest, NextResponse } from "next/server";
import { requireSupabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { phone } = (await req.json()) as { phone?: string };

    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: "Missing phone number." }, { status: 400 });
    }

    const supabase = requireSupabase();

    const { data: existing, error: findError } = await supabase
      .from("patients")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();

    if (findError) throw findError;

    if (existing) {
      return NextResponse.json({ patient: existing, isNew: false });
    }

    const { data: created, error: createError } = await supabase
      .from("patients")
      .insert({ phone, full_name: "" })
      .select("*")
      .single();

    if (createError) throw createError;

    return NextResponse.json({ patient: created, isNew: true });
  } catch (err) {
    console.error("Phone login failed:", err);
    const message = err instanceof Error ? err.message : "Login failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
