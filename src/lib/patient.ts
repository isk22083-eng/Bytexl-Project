"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "healthCopilot.patientId";

export function getStoredPatientId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

export function setStoredPatientId(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, id);
}

export function clearStoredPatientId() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getServerSnapshot() {
  return null;
}

// Reads the stored patient id reactively (re-renders if changed from
// another tab). Use this in components instead of reading localStorage
// directly in an effect.
export function usePatientId(): string | null {
  return useSyncExternalStore(subscribe, getStoredPatientId, getServerSnapshot);
}
