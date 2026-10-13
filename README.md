# Personal Health Copilot

AI-powered Personal Health Copilot — built for **HacXLerate 2026 Round 1** (Narasaraopeta Engineering College), challenge by **Altrix Labs**.

Upload a prescription, lab report or discharge summary. The app reads it with AI, extracts medicines, dosages, test values, diagnoses and dates, explains it in plain language (English or Telugu), and organizes everything into a unified health timeline.

## Stack

- **Next.js** (App Router, TypeScript, Tailwind) — single full-stack app
- **Google Gemini API** (`gemini-2.0-flash`, free tier) — multimodal document reading: OCR + structured extraction + plain-language summary in one call
- **Supabase** — Postgres (FHIR-style schema), used as the data store
- Deployed on **Vercel**

## Core features (Round 1 scope)

- Medical record upload → AI extraction of medicines, dosages, test values, diagnoses, dates
- Plain-language summary, including what abnormal lab values mean
- Unified health timeline across all uploaded records
- Telugu language toggle for both the interface and AI-generated summaries (regional-language bonus)
- FHIR-aligned schema (`patients`, `health_records`, `medications`, `lab_observations`, `diagnoses`) with a mock ABHA ID field on the patient record (ABDM-readiness bonus)

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Get a free Gemini API key** at [aistudio.google.com](https://aistudio.google.com) — no credit card required for the free tier.

3. **Create a Supabase project** at [supabase.com](https://supabase.com), then run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor to create the tables.

4. **Set environment variables** — copy `.env.example` to `.env.local` and fill in:
   ```
   GEMINI_API_KEY=
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

5. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Deployment

Deploy to Vercel (`vercel.com` → import this repo), and add the same three environment variables in the Vercel project settings.

## Important notes

- **Demo data only.** This project is built against synthetic/sample medical documents, never real patient data.
- **Not a medical device.** Every AI-generated summary carries a disclaimer and avoids diagnostic or prescriptive language. Always consult a qualified doctor.
- **Hackathon-scope auth:** the Supabase anon key is used directly with RLS left open for demo speed. Not suitable for a real multi-user deployment as-is.
