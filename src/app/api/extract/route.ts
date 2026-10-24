import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { extractFromDocument } from "@/lib/gemini";
import { ensureRecordsBucket, requireSupabaseAdmin, RECORDS_BUCKET } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const includeTelugu = formData.get("includeTelugu") === "true";

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file uploaded under the 'file' field." },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";

    const [extraction, fileUrl] = await Promise.all([
      extractFromDocument({ base64Data, mimeType, includeTelugu }),
      uploadOriginalFile(buffer, mimeType, file.name),
    ]);

    return NextResponse.json({ extraction, fileUrl });
  } catch (err) {
    console.error("Extraction failed:", err);
    const message = err instanceof Error ? err.message : "Extraction failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function uploadOriginalFile(
  buffer: Buffer,
  mimeType: string,
  originalName: string,
): Promise<string | null> {
  try {
    await ensureRecordsBucket();
    const supabase = requireSupabaseAdmin();

    const extension = originalName.includes(".") ? originalName.split(".").pop() : "bin";
    const path = `${randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from(RECORDS_BUCKET)
      .upload(path, buffer, { contentType: mimeType, upsert: false });

    if (error) throw error;

    const { data } = supabase.storage.from(RECORDS_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    // Non-fatal: extraction still works without the original file saved.
    console.error("Storing original file failed:", err);
    return null;
  }
}
