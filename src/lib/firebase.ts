"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

// Dev-only: mocks the reCAPTCHA check for phone numbers registered as
// "testing" numbers in the Firebase console (Authentication > Sign-in
// method > Phone > Phone numbers for testing). Real phone numbers still
// go through full verification regardless of this flag — it only affects
// numbers the project owner has explicitly whitelisted. Scoped to
// development so the live/demo build always uses real verification.
if (process.env.NODE_ENV === "development") {
  firebaseAuth.settings.appVerificationDisabledForTesting = true;
}
