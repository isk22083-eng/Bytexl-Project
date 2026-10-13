-- Personal Health Copilot — hackathon schema
-- Loosely FHIR-aligned so it can map onto real FHIR resources later
-- (Patient, DocumentReference, Observation, MedicationStatement, Condition)
-- for ABDM/ABHA readiness.

create extension if not exists "pgcrypto";

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  abha_id text,                 -- mock ABHA ID for this hackathon; a real
                                 -- integration would verify this against the
                                 -- ABDM sandbox instead of storing it as free text
  date_of_birth date,
  gender text,
  created_at timestamptz not null default now()
);

-- Safe to re-run against an already-created database: adds the column
-- without touching existing rows if it's missing, no-ops if it's already there.
alter table patients add column if not exists gender text;

create table if not exists health_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  document_type text not null check (document_type in ('prescription', 'lab_report', 'discharge_summary', 'other')),
  document_date date,
  file_url text,                -- Supabase Storage URL for the original upload
  patient_name_guess text,
  summary_english text not null,
  summary_telugu text,
  disclaimer text not null,
  created_at timestamptz not null default now()
);

create table if not exists medications (
  id uuid primary key default gen_random_uuid(),
  health_record_id uuid not null references health_records(id) on delete cascade,
  name text not null,
  dosage text,
  frequency text,
  duration text,
  instructions text
);

create table if not exists lab_observations (
  id uuid primary key default gen_random_uuid(),
  health_record_id uuid not null references health_records(id) on delete cascade,
  test_name text not null,
  value text not null,
  unit text,
  reference_range text,
  is_abnormal boolean not null default false,
  plain_language_note text
);

create table if not exists diagnoses (
  id uuid primary key default gen_random_uuid(),
  health_record_id uuid not null references health_records(id) on delete cascade,
  description text not null,
  diagnosis_date date
);

-- Demo-only: RLS left disabled so the hackathon anon key can read/write
-- freely. Enable and write real policies before any non-demo use.
