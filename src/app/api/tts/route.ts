import { NextRequest, NextResponse } from "next/server";
import { synthesizeTeluguSpeech } from "@/lib/tts";

export async function POST(req: NextRequest) {
  try {
    const { text } = (await req.json()) as { text?: string };

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "No text provided." }, { status: 400 });
    }

    const audio = await synthesizeTeluguSpeech(text);

    return new NextResponse(new Uint8Array(audio), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("TTS failed:", err);
    const message = err instanceof Error ? err.message : "Text-to-speech failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
