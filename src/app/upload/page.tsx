"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import type { ExtractionResult } from "@/lib/types";
import { usePatientId } from "@/lib/patient";
import TeluguAudioButton from "@/components/TeluguAudioButton";

export default function UploadPage() {
  const { lang, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [includeTelugu, setIncludeTelugu] = useState(lang === "te");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const patientId = usePatientId();
  const isTelugu = lang === "te";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setFileUrl(null);
    setSaved(false);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("includeTelugu", String(includeTelugu));
      const res = await fetch("/api/extract", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed.");
      setResult(data.extraction as ExtractionResult);
      setFileUrl((data.fileUrl as string | null) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extraction: result, patientId, fileUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Saving failed.");
      setSaved(true);
      setSavedRecordId(data.id as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  function selectFile(nextFile?: File) {
    if (!nextFile) return;
    const valid = nextFile.type.startsWith("image/") || nextFile.type === "application/pdf";
    if (!valid) {
      setError(isTelugu ? "దయచేసి చిత్రం లేదా PDF ఫైల్ ఎంచుకోండి." : "Please choose an image or PDF file.");
      return;
    }
    setFile(nextFile);
    setError(null);
    setResult(null);
    setFileUrl(null);
    setSaved(false);
  }

  return (
    <main className="upload-page">
      <div className="upload-shell">
        <div className="upload-breadcrumb"><Link href="/">{isTelugu ? "హోమ్" : "Home"}</Link><span>/</span><span>{t("navUpload")}</span></div>

        <header className="upload-heading">
          <div className="upload-heading-icon" aria-hidden="true">✚</div>
          <div>
            <p className="upload-eyebrow">{isTelugu ? "మీ ఆరోగ్య ప్రయాణం" : "YOUR HEALTH, ORGANIZED"}</p>
            <h1>{t("navUpload")}</h1>
            <p className="upload-subtitle">{isTelugu ? "మీ వైద్య పత్రాన్ని అప్‌లోడ్ చేయండి. AI సులభంగా అర్థమయ్యే సారాంశాన్ని రూపొందిస్తుంది." : "Upload a medical document and let AI turn it into a clear, easy-to-understand summary."}</p>
          </div>
        </header>

        {!patientId && (
          <div className="upload-profile-notice" role="status">
            <span className="notice-icon" aria-hidden="true">ⓘ</span>
            <p>{isTelugu ? "రికార్డులను సేవ్ చేయడానికి ముందు మీ ప్రొఫైల్‌ను సెటప్ చేయండి." : "Set up your profile before saving records so they can be linked to you."}</p>
            <Link href="/profile?redirect=/upload">{isTelugu ? "ప్రొఫైల్ సెటప్" : "Set up profile"} <span aria-hidden="true">→</span></Link>
          </div>
        )}

        <section className="upload-steps" aria-label={isTelugu ? "అప్‌లోడ్ ప్రక్రియ" : "How it works"}>
          <div className="upload-step"><span className="upload-step-number">1</span><div><strong>{isTelugu ? "పత్రాన్ని అప్‌లోడ్ చేయండి" : "Upload your report"}</strong><small>{isTelugu ? "చిత్రం లేదా PDF" : "Image or PDF"}</small></div></div>
          <span className="upload-step-arrow" aria-hidden="true">›</span>
          <div className="upload-step"><span className="upload-step-number step-two">2</span><div><strong>{isTelugu ? "AI వివరిస్తుంది" : "AI explains it"}</strong><small>{isTelugu ? "సులభమైన పదాల్లో" : "Key details in plain words"}</small></div></div>
          <span className="upload-step-arrow" aria-hidden="true">›</span>
          <div className="upload-step"><span className="upload-step-number step-three">3</span><div><strong>{isTelugu ? "సారాంశాన్ని చూడండి" : "Read your summary"}</strong><small>{isTelugu ? "టైమ్‌లైన్‌లో సేవ్ చేయండి" : "Save it to your timeline"}</small></div></div>
        </section>

        <div className="upload-workspace">
        <form onSubmit={handleSubmit} className="upload-card">
          <div className="upload-card-title">
            <div><span className="step-label">{isTelugu ? "దశ 1" : "STEP 1"}</span><h2>{isTelugu ? "మీ పత్రాన్ని జోడించండి" : "Add your document"}</h2></div>
            <span className="secure-badge"><span aria-hidden="true">▣</span> {isTelugu ? "సురక్షిత అప్‌లోడ్" : "Private upload"}</span>
          </div>

          <input ref={fileInputRef} id="medical-document" type="file" accept="image/*,.pdf,application/pdf" className="upload-hidden-input" onChange={(e) => selectFile(e.target.files?.[0])} />
          <button type="button" className={`upload-dropzone ${file ? "has-file" : ""}`} onClick={() => fileInputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); selectFile(e.dataTransfer.files?.[0]); }}>
            <span className="upload-cloud-icon" aria-hidden="true">↑</span>
            <span className="dropzone-main">{file ? file.name : (isTelugu ? "ఫైల్ ఎంచుకోండి లేదా ఇక్కడికి లాగండి" : "Choose a file or drag it here")}</span>
            <span className="dropzone-sub">{file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB · ${file.type || "Document"}` : (isTelugu ? "ప్రిస్క్రిప్షన్, ల్యాబ్ రిపోర్ట్ లేదా డిశ్చార్జ్ సమరీ" : "Prescription, lab report, or discharge summary")}</span>
            <span className="dropzone-browse">{file ? (isTelugu ? "మరో ఫైల్ ఎంచుకోండి" : "Choose another file") : (isTelugu ? "ఫైల్ బ్రౌజ్ చేయండి" : "Browse files")}</span>
          </button>
          <p className="upload-file-hint">{isTelugu ? "మద్దతు ఉన్న ఫార్మాట్‌లు: JPG, PNG, WEBP, PDF" : "Supported formats: JPG, PNG, WEBP, PDF"}</p>

          <label className="language-option">
            <input type="checkbox" checked={includeTelugu} onChange={(e) => setIncludeTelugu(e.target.checked)} />
            <span className="custom-check" aria-hidden="true">✓</span>
            <span><strong>{isTelugu ? "తెలుగు సారాంశాన్ని కూడా రూపొందించండి" : "Also generate a Telugu summary"}</strong><small>{isTelugu ? "మీ పత్రాన్ని తెలుగులో సులభంగా అర్థం చేసుకోండి." : "Get an additional summary in your preferred language."}</small></span>
          </label>

          <button type="submit" disabled={!file || loading} className="analyze-button">
            {loading ? <><span className="button-spinner" />{isTelugu ? "పత్రాన్ని విశ్లేషిస్తోంది..." : "Analyzing document..."}</> : <>{isTelugu ? "AI తో విశ్లేషించండి" : "Analyze document with AI"}<span aria-hidden="true">→</span></>}
          </button>
          <p className="privacy-note"><span aria-hidden="true">✓</span> {isTelugu ? "AI రూపొందించిన సారాంశం వైద్యుని సలహాకు ప్రత్యామ్నాయం కాదు." : "AI summaries are informational and do not replace professional medical advice."}</p>
        </form>

        <aside className="supported-documents">
          <h2><span aria-hidden="true">▤</span>{isTelugu ? "మద్దతు ఉన్న పత్రాలు" : "Supported documents"}</h2>
          <div className="supported-document"><span className="document-symbol symbol-blue" aria-hidden="true">▤</span><div><strong>{isTelugu ? "ప్రిస్క్రిప్షన్లు" : "Prescriptions"}</strong><small>{isTelugu ? "వైద్యుల సూచనలు, మందుల వివరాలు" : "Doctor prescriptions and patient instructions"}</small></div></div>
          <div className="supported-document"><span className="document-symbol symbol-green" aria-hidden="true">✚</span><div><strong>{isTelugu ? "ల్యాబ్ రిపోర్టులు" : "Lab reports"}</strong><small>{isTelugu ? "రక్త పరీక్షలు, ఇతర ఫలితాలు" : "Blood tests, urine tests, and lab results"}</small></div></div>
          <div className="supported-document"><span className="document-symbol symbol-purple" aria-hidden="true">▤</span><div><strong>{isTelugu ? "డిశ్చార్జ్ సారాంశాలు" : "Discharge summaries"}</strong><small>{isTelugu ? "ఆసుపత్రి నివేదికలు, వైద్య నోట్స్" : "Hospital discharge reports and clinical notes"}</small></div></div>
          <div className="supported-document"><span className="document-symbol symbol-orange" aria-hidden="true">▣</span><div><strong>{isTelugu ? "ఇతర వైద్య పత్రాలు" : "Other medical documents"}</strong><small>{isTelugu ? "స్కాన్లు, చిత్రాలు లేదా PDFలు" : "Scans, images, or PDFs of medical records"}</small></div></div>
          <div className="document-security"><span aria-hidden="true">◆</span><div><strong>{isTelugu ? "మీ డేటా ముఖ్యం" : "Your data matters"}</strong><small>{isTelugu ? "వాస్తవ రోగి డేటాతో డెమోను పరీక్షించవద్దు." : "Use synthetic demo records only. Configure database security before real patient data."}</small></div></div>
        </aside>
        </div>

        {error && <div className="upload-error" role="alert"><strong>{isTelugu ? "ఏదో సమస్య వచ్చింది" : "Something went wrong"}</strong><p>{error}</p></div>}

        {result && <section className="results-stack" aria-live="polite">
          <div className="results-heading"><div><span className="step-label">{isTelugu ? "దశ 2" : "STEP 2"}</span><h2>{isTelugu ? "మీ సారాంశం సిద్ధంగా ఉంది" : "Your summary is ready"}</h2></div><span className="result-ready"><span aria-hidden="true">✓</span> {isTelugu ? "విశ్లేషణ పూర్తయింది" : "Analysis complete"}</span></div>
          <section className="result-card"><h3><span className="result-icon" aria-hidden="true">✧</span>{isTelugu ? "ఆంగ్ల సారాంశం" : "Document summary"}</h3><p className="result-copy">{result.summaryEnglish}</p>{result.summaryTelugu && <><h3 className="telugu-summary-title">తెలుగు సారాంశం</h3><p className="result-copy">{result.summaryTelugu}</p><TeluguAudioButton text={result.summaryTelugu} /></>}<p className="medical-disclaimer">{result.disclaimer}</p></section>
          {result.medications.length > 0 && <section className="result-card"><h3><span className="result-icon" aria-hidden="true">＋</span>{isTelugu ? "మందులు" : "Medications"}</h3><ul className="result-list">{result.medications.map((m, i) => <li key={i}><strong>{m.name}</strong>{m.dosage && ` — ${m.dosage}`}{m.frequency && `, ${m.frequency}`}{m.duration && `, ${m.duration}`}{m.instructions && <p>{m.instructions}</p>}</li>)}</ul></section>}
          {result.labObservations.length > 0 && <section className="result-card"><h3><span className="result-icon" aria-hidden="true">⌁</span>{isTelugu ? "పరీక్ష ఫలితాలు" : "Lab observations"}</h3><ul className="result-list">{result.labObservations.map((o, i) => <li key={i}><strong className={o.isAbnormal ? "abnormal-value" : ""}>{o.testName}: {o.value} {o.unit}</strong>{o.referenceRange && <span> (ref: {o.referenceRange})</span>}{o.plainLanguageNote && <p>{o.plainLanguageNote}</p>}</li>)}</ul></section>}
          {result.diagnoses.length > 0 && <section className="result-card"><h3><span className="result-icon" aria-hidden="true">♡</span>{isTelugu ? "రోగనిర్ధారణలు" : "Diagnoses"}</h3><ul className="result-list">{result.diagnoses.map((d, i) => <li key={i}><strong>{d.description}</strong>{d.date && ` (${d.date})`}</li>)}</ul></section>}
          <div className="save-actions"><button type="button" onClick={handleSave} disabled={saving || saved} className="save-button">{saved ? "✓ " + (isTelugu ? "టైమ్‌లైన్‌లో సేవ్ అయింది" : "Saved to timeline") : saving ? (isTelugu ? "సేవ్ చేస్తోంది..." : "Saving record...") : (isTelugu ? "టైమ్‌లైన్‌కు సేవ్ చేయండి" : "Save to health timeline")}</button>{saved && savedRecordId && <Link href={`/record/${savedRecordId}`} className="view-record-link">{isTelugu ? "రికార్డ్ చూడండి / ప్రింట్ చేయండి" : "View or print record"} →</Link>}</div>
        </section>}

        <div className="upload-help"><span className="help-icon" aria-hidden="true">?</span><div><strong>{isTelugu ? "సహాయం కావాలా?" : "A quick tip"}</strong><p>{isTelugu ? "స్పష్టమైన ఫోటో లేదా PDF అప్‌లోడ్ చేయండి. పత్రంలోని మొత్తం సమాచారం కనిపించేలా చూసుకోండి." : "Use a clear, well-lit photo or PDF. Make sure the text and dates are visible for the best results."}</p></div></div>
      </div>
    </main>
  );
}
