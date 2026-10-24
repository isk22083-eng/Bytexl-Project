"use client";

import { useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";

export default function TeluguAudioButton({ text }: { text: string }) {
  const { lang } = useLanguage();
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  async function handleClick() {
    if (status === "playing" && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setStatus("idle");
      return;
    }

    if (urlRef.current && audioRef.current) {
      audioRef.current.play();
      setStatus("playing");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Text-to-speech failed.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      urlRef.current = url;

      const audio = new Audio(url);
      audio.onended = () => setStatus("idle");
      audioRef.current = audio;

      await audio.play();
      setStatus("playing");
    } catch {
      setStatus("error");
    }
  }

  const label =
    status === "loading"
      ? lang === "te" ? "తయారు చేస్తోంది..." : "Preparing audio..."
      : status === "playing"
        ? lang === "te" ? "ఆపండి" : "Stop"
        : status === "error"
          ? lang === "te" ? "మళ్ళీ ప్రయత్నించండి" : "Retry audio"
          : lang === "te" ? "తెలుగులో వినండి" : "Listen in Telugu";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "loading"}
      className="inline-flex items-center gap-2 rounded-full border border-black/20 px-5 py-2 text-sm font-medium hover:bg-black/5 disabled:opacity-50 dark:border-white/20 dark:hover:bg-white/10"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
        {status === "playing" ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.25h4.5v13.5h-4.5zm9 0h4.5v13.5h-4.5z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
        )}
      </svg>
      {label}
    </button>
  );
}
