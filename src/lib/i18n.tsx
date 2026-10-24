"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "en" | "te";

const dictionary = {
  en: {
    appName: "Health Copilot",
    tagline: "Understand your health records in plain language.",
    navHome: "Home",
    navUpload: "Upload Record",
    navTimeline: "My Timeline",
    navProfile: "Profile",
    navLogin: "Log In",
    navLogout: "Log Out",
    heroTitle: "Your health records, finally easy to understand.",
    heroBody:
      "Upload a prescription, lab report or discharge summary. Health Copilot reads it with AI, pulls out the medicines, test values and diagnoses, and explains it in plain language — in English or Telugu.",
    ctaUpload: "Upload a Record",
    ctaTimeline: "View My Timeline",
    featureOcrTitle: "AI Reading & Extraction",
    featureOcrBody:
      "Medicines, dosages, test values and dates pulled out automatically, even from handwritten or bilingual documents.",
    featureSummaryTitle: "Plain-Language Summary",
    featureSummaryBody:
      "No medical jargon. Abnormal values are explained simply, in English or Telugu.",
    featureTimelineTitle: "Unified Timeline",
    featureTimelineBody:
      "Every record lives in one place, organized chronologically into a single health profile.",
    disclaimer:
      "Health Copilot provides AI-generated summaries for informational purposes only. This is not a medical diagnosis. Always consult a qualified doctor about your health.",
    langToggle: "తెలుగు",
  },
  te: {
    appName: "హెల్త్ కోపైలట్",
    tagline: "మీ ఆరోగ్య రికార్డులను సులభమైన భాషలో అర్థం చేసుకోండి.",
    navHome: "హోమ్",
    navUpload: "రికార్డ్ అప్‌లోడ్ చేయండి",
    navTimeline: "నా టైమ్‌లైన్",
    navProfile: "ప్రొఫైల్",
    navLogin: "లాగిన్",
    navLogout: "లాగ్ అవుట్",
    heroTitle: "మీ ఆరోగ్య రికార్డులు ఇప్పుడు సులభంగా అర్థమవుతాయి.",
    heroBody:
      "ప్రిస్క్రిప్షన్, ల్యాబ్ రిపోర్ట్ లేదా డిశ్చార్జ్ సమ్మరీని అప్‌లోడ్ చేయండి. హెల్త్ కోపైలట్ AI సహాయంతో దానిని చదివి, మందులు, పరీక్ష విలువలు మరియు రోగనిర్ధారణలను వెలికితీసి, ఆంగ్లంలో లేదా తెలుగులో సులభమైన భాషలో వివరిస్తుంది.",
    ctaUpload: "రికార్డ్ అప్‌లోడ్ చేయండి",
    ctaTimeline: "నా టైమ్‌లైన్ చూడండి",
    featureOcrTitle: "AI రీడింగ్ & ఎక్స్‌ట్రాక్షన్",
    featureOcrBody:
      "చేతిరాత లేదా ద్విభాషా పత్రాల నుండి కూడా మందులు, డోసేజ్‌లు, పరీక్ష విలువలు మరియు తేదీలు స్వయంచాలకంగా వెలికితీయబడతాయి.",
    featureSummaryTitle: "సులభమైన భాషలో సారాంశం",
    featureSummaryBody:
      "వైద్య పరిభాష లేకుండా. అసాధారణ విలువలు ఆంగ్లంలో లేదా తెలుగులో సరళంగా వివరించబడతాయి.",
    featureTimelineTitle: "ఏకీకృత టైమ్‌లైన్",
    featureTimelineBody:
      "ప్రతి రికార్డ్ ఒకే చోట, కాలక్రమానుసారంగా ఒకే ఆరోగ్య ప్రొఫైల్‌గా నిర్వహించబడుతుంది.",
    disclaimer:
      "హెల్త్ కోపైలట్ అందించే AI సారాంశాలు సమాచార ప్రయోజనాల కోసం మాత్రమే. ఇది వైద్య రోగనిర్ధారణ కాదు. మీ ఆరోగ్యం గురించి ఎల్లప్పుడూ అర్హత కలిగిన వైద్యుడిని సంప్రదించండి.",
    langToggle: "English",
  },
} as const;

export type DictKey = keyof (typeof dictionary)["en"];

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: DictKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = (key: DictKey) => dictionary[lang][key];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
