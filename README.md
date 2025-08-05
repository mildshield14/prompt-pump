# PromptPump 🏃⚡

PromptPump is a free, non-commercial web app that helps any Strava athlete turn
raw workout data into quick, visual insights and AI-ready prompts.

| Live demo | Tech stack | License |
|-----------|------------|---------|
| https://prompt-pump.vercel.app | Vite + React · TypeScript · Tailwind CSS · Vercel Functions (Node 20) | MIT |

---

## ✨ Features

* **Connect with Strava** — OAuth2 flow using Strava’s official button  
* **Visual dashboards** — mileage, pace, elevation and sport breakdowns  
* **Goal-oriented prompts** — copy-paste text you can drop into ChatGPT / Claude for advice on nutrition, race prep, or weight management  
* **1-click data download** — export your activity JSON, TCX or GPX for personal archiving  
* **Privacy first** — all Strava tokens & activity data live *only* in your browser session; nothing is stored on any server

---

## 🏗️ Local development

```bash
git clone https://github.com/<you>/prompt-pump
cd prompt-pump
cp .env.example .env            # fill in VITE_STRAVA_* keys for localhost
npm install
npm run dev                     # Vite on http://localhost:5173
vercel dev                      # optional: simulate prod (static + functions)
