"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { setStoredPatientId } from "@/lib/patient";
import { useLanguage } from "@/lib/i18n";

function LoginForm() {
  const { lang } = useLanguage();
  const isTelugu = lang === "te";
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/upload";

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError(isTelugu ? "దయచేసి 10 అంకెల మొబైల్ నంబర్ ఇవ్వండి." : "Please enter a 10-digit mobile number.");
      return;
    }

    setLoading(true);
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(firebaseAuth, "recaptcha-container", {
          size: "invisible",
        });
      }

      const fullPhone = `+91${digits}`;
      const confirmation = await signInWithPhoneNumber(firebaseAuth, fullPhone, recaptchaRef.current);
      confirmationRef.current = confirmation;
      setStage("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong sending the OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!confirmationRef.current) {
      setError(isTelugu ? "సెషన్ గడువు ముగిసింది, మళ్ళీ OTP పంపండి." : "Session expired — please resend the OTP.");
      setStage("phone");
      return;
    }

    setLoading(true);
    try {
      const result = await confirmationRef.current.confirm(otp);
      const verifiedPhone = result.user.phoneNumber;

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: verifiedPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");

      setStoredPatientId(data.patient.id);
      router.push(data.isNew ? `/profile?redirect=${encodeURIComponent(redirectTo)}` : redirectTo);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isTelugu ? "తప్పు OTP. మళ్ళీ ప్రయత్నించండి." : "Incorrect OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">{isTelugu ? "లాగిన్" : "Log In"}</h1>
      <p className="mt-2 text-sm text-black/60 dark:text-white/60">
        {isTelugu
          ? "మీ మొబైల్ నంబర్‌తో లాగిన్ అవ్వండి. OTP పంపుతాము."
          : "Log in with your mobile number. We'll send you an OTP."}
      </p>

      {stage === "phone" && (
        <form onSubmit={sendOtp} className="mt-6 space-y-4 rounded-xl border border-black/10 p-6 dark:border-white/10">
          <div>
            <label className="block text-sm font-medium">
              {isTelugu ? "మొబైల్ నంబర్" : "Mobile number"}
            </label>
            <div className="mt-2 flex items-center overflow-hidden rounded-lg border border-black/20 dark:border-white/20">
              <span className="bg-black/5 px-3 py-2 text-sm text-black/60 dark:bg-white/5 dark:text-white/60">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full bg-transparent px-3 py-2 text-sm outline-none"
                required
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {loading
              ? isTelugu ? "పంపుతోంది..." : "Sending..."
              : isTelugu ? "OTP పంపండి" : "Send OTP"}
          </button>
        </form>
      )}

      {stage === "otp" && (
        <form onSubmit={verifyOtp} className="mt-6 space-y-4 rounded-xl border border-black/10 p-6 dark:border-white/10">
          <div>
            <label className="block text-sm font-medium">
              {isTelugu ? "OTP ఎంటర్ చేయండి" : "Enter the OTP"}
            </label>
            <p className="mt-1 text-xs text-black/50 dark:text-white/50">
              {isTelugu ? `+91${phone.replace(/\D/g, "")} కు పంపబడింది` : `Sent to +91${phone.replace(/\D/g, "")}`}
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="mt-2 w-full rounded-lg border border-black/20 px-3 py-2 text-sm dark:border-white/20 dark:bg-black"
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {loading
              ? isTelugu ? "ధృవీకరిస్తోంది..." : "Verifying..."
              : isTelugu ? "ధృవీకరించండి" : "Verify"}
          </button>

          <button
            type="button"
            onClick={() => {
              setStage("phone");
              setOtp("");
              setError(null);
            }}
            className="w-full text-center text-sm underline"
          >
            {isTelugu ? "నంబర్ మార్చండి" : "Change number"}
          </button>
        </form>
      )}

      <div id="recaptcha-container" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
