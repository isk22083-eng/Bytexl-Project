"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { usePatientId, clearStoredPatientId } from "@/lib/patient";
import { firebaseAuth } from "@/lib/firebase";

export default function Header() {
  const { t, lang, setLang } = useLanguage();
  const router = useRouter();
  const patientId = usePatientId();

  async function handleLogout() {
    try {
      await firebaseAuth.signOut();
    } catch {
      // ignore — clearing local state still logs the user out of the app
    }
    clearStoredPatientId();
    router.push("/login");
  }

  return (
    <header className="border-b border-black/10 dark:border-white/10 print:hidden">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold">
          {t("appName")}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:underline">
            {t("navHome")}
          </Link>
          <Link href="/upload" className="hover:underline">
            {t("navUpload")}
          </Link>
          <Link href="/timeline" className="hover:underline">
            {t("navTimeline")}
          </Link>
          <Link href="/profile" className="hover:underline">
            {t("navProfile")}
          </Link>
          {patientId ? (
            <button type="button" onClick={handleLogout} className="hover:underline">
              {t("navLogout")}
            </button>
          ) : (
            <Link href="/login" className="hover:underline">
              {t("navLogin")}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "te" : "en")}
            className="rounded-full border border-black/20 px-3 py-1 text-xs font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            {t("langToggle")}
          </button>
        </nav>
      </div>
    </header>
  );
}
