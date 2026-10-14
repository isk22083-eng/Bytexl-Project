# AI Health Copilot

An AI-assisted medical-document demo built for **HacXLerate 2026 Round 1** at Narasaraopeta Engineering College. The application accepts a prescription, laboratory report, or discharge summary, extracts key information with Google Gemini, explains the document in plain language, and organizes saved results into a health timeline.

> **Demo and safety notice:** Use synthetic/sample documents only. This project is not a medical device and its output is not a diagnosis or treatment recommendation. Verify all extracted details with a qualified healthcare professional. Do not use this demo with real patient information.

## Highlights

- Responsive Home, Upload Record, Timeline, Profile, and record-detail pages.
- Upload an image or PDF of a medical document.
- AI extraction of summaries, medications, diagnoses, lab observations, and related details.
- English interface and optional Telugu summary/interface support.
- Save extracted records and review them in the health timeline.
- Supabase/Postgres data store with a FHIR-inspired schema.
- Vercel-compatible Next.js App Router application.

## Technology stack

- **Next.js App Router** and **React** for the full-stack web app.
- **TypeScript** for application code.
- **Tailwind CSS** and custom CSS for responsive styling.
- **Google Gemini API** (`@google/genai`) for multimodal document extraction and plain-language summaries.
- **Supabase / PostgreSQL** for patient and record data.
- **Vercel** for hosting and deployment.

## Project structure

```text
.
├── public/                 # Static assets
├── samples/                # Synthetic sample prescription for demo/testing
├── src/
│   ├── app/
│   │   ├── api/            # Extraction, patient, and record API routes
│   │   ├── profile/        # Patient profile page
│   │   ├── record/[id]/    # Individual record details
│   │   ├── timeline/       # Saved health-record timeline
│   │   ├── upload/         # Medical-document upload and AI results
│   │   ├── globals.css     # Global styles and responsive UI
│   │   ├── layout.tsx      # Root layout and navigation
│   │   └── page.tsx        # Home page
│   ├── components/         # Shared header/footer
│   └── lib/                # Gemini, Supabase, language, patient, and type helpers
├── supabase/schema.sql     # Database schema
├── .env.example            # Required environment-variable names (no secrets)
├── package.json
└── README.md
```

## Requirements

- Node.js **20.9 or newer** (recommended for Next.js 16).
- npm.
- A Google AI Studio API key.
- A Supabase project for database-backed features.

## Run locally

1. **Clone your GitHub repository** or extract the project ZIP.

   ```bash
   git clone <YOUR_GITHUB_REPOSITORY_URL>
   cd <YOUR_PROJECT_FOLDER>
   ```

   If you downloaded a ZIP, open the extracted folder that contains `package.json`. Do not run npm commands from its parent folder.

2. **Install dependencies.**

   ```bash
   npm install
   ```

3. **Create local environment settings.** Copy `.env.example` to `.env.local` and add your own values:

   ```env
   GEMINI_API_KEY=your_gemini_api_key
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
   ```

   Obtain a Gemini key from [Google AI Studio](https://aistudio.google.com/). Find the project URL and browser-safe publishable/anon key in your Supabase project settings. Never put a Gemini key in a `NEXT_PUBLIC_` variable.

4. **Create the database.** Open the Supabase SQL Editor and run the contents of [`supabase/schema.sql`](supabase/schema.sql).

5. **Start the development server.**

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000). The upload page is at [http://localhost:3000/upload](http://localhost:3000/upload).

7. Before sharing the app, run the production checks:

   ```bash
   npm run lint
   npm run build
   ```

## Deploy to Vercel

### Option A — Deploy from GitHub (recommended)

1. Commit and push the project to your GitHub repository. Confirm that `.env.local` is ignored by Git and is **not** committed.
2. Sign in to [Vercel](https://vercel.com/).
3. Choose **Add New → Project**, import the correct GitHub repository, and select the project root containing `package.json`.
4. Keep the framework preset as **Next.js**. The standard build command is `npm run build`; the output directory should be managed by Next.js (do not set a custom output directory for a normal Next.js deployment).
5. In the Vercel project, open **Settings → Environment Variables** and add all three variables below. Add them for each environment you use (Production, Preview, and Development as appropriate):

   | Name | Value |
   | --- | --- |
   | `GEMINI_API_KEY` | Your private Google AI Studio API key |
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase publishable/anon key |

6. Save the variables and trigger a fresh deployment from **Deployments → Redeploy**, or push a new commit. Environment-variable changes do not update an already-built deployment until it is redeployed.
7. Open the assigned `*.vercel.app` URL. Test `/`, `/upload`, `/profile`, and `/timeline`. Upload only the provided synthetic sample document and verify the AI extraction and save flow.

### Option B — Deploy using the Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

Follow the prompts to link the local folder to the correct Vercel project. Add environment variables in the Vercel dashboard as described above, then deploy to production:

```bash
vercel --prod
```

If this folder is linked to the wrong Vercel project, stop and check the project link before deploying.

## Environment variables

| Variable | Used for | Exposure |
| --- | --- | --- |
| `GEMINI_API_KEY` | Server-side Gemini API calls | **Secret — never expose in browser code or Git** |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project endpoint | Public configuration |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-side Supabase access | Public/publishable key; database permissions must still be secure |

`.env.local` is intentionally ignored by Git. Share `.env.example`, not your populated `.env.local`. If a private key has been exposed in a screenshot, chat, commit, or public repository, revoke/rotate it immediately and update local/Vercel settings.

## Common problems

- **`ENOENT: package.json not found`** — use `cd` to enter the actual project folder containing `package.json`, then run npm commands.
- **`next is not recognized` / `next: not found`** — run `npm install` in the project root and check that Node.js/npm are installed.
- **`GEMINI_API_KEY is not set`** — add `GEMINI_API_KEY` to `.env.local` locally or Vercel Environment Variables in the deployment environment, then restart/redeploy.
- **Supabase request errors** — verify the URL and publishable/anon key, run `supabase/schema.sql`, and inspect the API error in the browser/terminal.
- **Works locally but not on Vercel** — confirm all environment variables exist for the deployment environment and redeploy after changing them.
- **Build fails** — run `npm run build` locally and fix the first TypeScript or lint/build error shown in the terminal.

## Security and production-readiness checklist

This is a hackathon prototype, not a production medical-record system. Before any real-world deployment:

- Enable and test Supabase Row Level Security (RLS) policies for every table; never leave patient data readable/writable by everyone.
- Add real authentication and enforce authorization on every API route.
- Keep Gemini credentials server-side and rotate any credential that was exposed.
- Define retention/deletion, consent, logging, rate limiting, upload size limits, and file validation policies.
- Do not log uploaded document contents or sensitive patient data.
- Have appropriate security, privacy, and clinical experts review the system before handling real patient data.

## License

No license is specified yet. Add a `LICENSE` file before accepting external contributions or defining reuse permissions.
