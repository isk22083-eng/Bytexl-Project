import { NextRequest, NextResponse } from "next/server";
import { extractFromDocument } from "@/lib/gemini";

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
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const extraction = await extractFromDocument({
      base64Data,
      mimeType: file.type || "image/jpeg",
      includeTelugu,
    });

    return NextResponse.json({ extraction });
  } catch (err) {
    console.error("Extraction failed:", err);
    const message = err instanceof Error ? err.message : "Extraction failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
