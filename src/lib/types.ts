// Loosely FHIR-aligned types (Patient / Observation / MedicationStatement / Condition)
// so the schema is easy to map onto real FHIR resources later for ABDM/ABHA readiness.

export type DocumentType =
  | "prescription"
  | "lab_report"
  | "discharge_summary"
  | "other";

export type Medication = {
  name: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
};

export type LabObservation = {
  testName: string;
  value: string;
  unit: string | null;
  referenceRange: string | null;
  isAbnormal: boolean;
  plainLanguageNote: string | null;
};

export type Diagnosis = {
  description: string;
  date: string | null;
};

export type ExtractionResult = {
  documentType: DocumentType;
  documentDate: string | null;
  patientNameGuess: string | null;
  medications: Medication[];
  labObservations: LabObservation[];
  diagnoses: Diagnosis[];
  summaryEnglish: string;
  summaryTelugu: string | null;
  disclaimer: string;
};

export type HealthRecord = {
  id: string;
  patientId: string;
  documentType: DocumentType;
  documentDate: string | null;
  fileUrl: string | null;
  extraction: ExtractionResult;
  createdAt: string;
};
