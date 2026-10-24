const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

export async function synthesizeTeluguSpeech(text: string): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;

  if (!apiKey || !voiceId) {
    throw new Error(
      "ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID is not set in the environment.",
    );
  }

  const res = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_v4",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`ElevenLabs TTS failed (${res.status}): ${detail}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
