# 1 Finance — Internal Stakeholder Chatbot (Gemini Edition)

A professional dark-themed internal chatbot portal for 1 Finance stakeholders.
AI powered by **Google Gemini 1.5 Flash** — completely free, no credit card needed.

---

## Features

- Two-step auth — company email validation + 6-digit OTP
- 6 service tabs — Investment, Banking, Insurance, Tax, Real Estate, Retirement
- Per-tab chat history — each service has isolated conversation history
- AI chatbot — Gemini 1.5 Flash with mock client data injected as context
- Inline charts — bar, pie, line charts via Recharts
- CSV export — one-click download of any tabular data
- Loading / error / empty states handled
- Responsive — desktop and tablet

---

## Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Framework  | React 18 + Vite         |
| Styling    | Tailwind CSS            |
| Routing    | React Router v6         |
| Charts     | Recharts                |
| AI         | Google Gemini 1.5 Flash |
| Deploy     | Vercel (free)           |

---

## Step-by-Step Setup (From Zero)

### Step 1 — Install Node.js

Download from https://nodejs.org — choose the LTS version.
After installing, verify in terminal:

```bash
node --version   # v18 or higher
npm --version
```

### Step 2 — Get your FREE Gemini API key

1. Go to https://aistudio.google.com
2. Sign in with any Google account
3. Click "Get API Key" → "Create API key in new project"
4. Copy the key (starts with "AIza...")
5. No credit card. No billing. Free forever up to 60 req/min.

### Step 3 — Set up the project

Unzip the downloaded project folder, then in your terminal:

```bash
cd 1finance-chatbot
npm install
```

### Step 4 — Add your API key

```bash
cp .env.example .env
```

Open the `.env` file in any text editor and paste your key:

```
VITE_GEMINI_API_KEY=AIzaSy...your-actual-key-here
```

### Step 5 — Run locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Step 6 — Demo login

| Field    | Value                        |
|----------|------------------------------|
| Email    | demo@1finance.co.in          |
| Password | any 6+ character string      |
| OTP      | press F12 → Console tab      |

---

## Deploy to Vercel (Free)

### Option A — Website (easiest)

1. Push to GitHub:
```bash
git init
git add .
git commit -m "1Finance chatbot"
# create repo on github.com, then:
git remote add origin https://github.com/YOUR_NAME/1finance-chatbot.git
git push -u origin main
```

2. Go to vercel.com → Sign up with GitHub → "Add New Project" → Import repo
3. Before deploying, click "Environment Variables" and add:
   - Key:   VITE_GEMINI_API_KEY
   - Value: AIzaSy...your-key
4. Click Deploy — live in ~60 seconds

### Option B — Terminal

```bash
npm i -g vercel
vercel login
vercel --prod
```

Then in Vercel dashboard → Settings → Environment Variables → add VITE_GEMINI_API_KEY → Redeploy.

---

## Project Structure

```
src/
├── components/
│   ├── ChatInput.jsx         # Message input with suggestions
│   ├── ChatMessage.jsx       # Bubbles with chart + CSV rendering
│   ├── ChartRenderer.jsx     # Recharts bar/pie/line
│   ├── Sidebar.jsx           # Per-tab chat history
│   └── TypingIndicator.jsx   # Animated typing dots
├── data/
│   └── mockData.json         # Mock client data (4 clients)
├── pages/
│   ├── LoginPage.jsx         # Email validation + password
│   ├── OTPPage.jsx           # 6-digit OTP with resend
│   ├── ServicesPage.jsx      # Service cards dashboard
│   └── ChatPage.jsx          # Main chat interface
├── utils/
│   ├── exportCSV.js          # CSV download utility
│   └── geminiService.js      # Gemini API + mock fallback
├── App.jsx                   # Routes + auth guard
├── index.css                 # Global styles + Tailwind
└── main.jsx                  # Entry point
```

---

## Cost

Gemini 1.5 Flash free tier:
- 60 requests per minute
- 1 million tokens per minute
- 1,500 requests per day
- No credit card ever needed

This is more than enough for an internal stakeholder tool.

---

## Submission Checklist

- [x] GitHub repository with source code
- [x] Mock JSON data (src/data/mockData.json)
- [x] README with setup instructions
- [x] Login with company email validation
- [x] OTP two-factor authentication
- [x] Services dashboard (6 services)
- [x] Chat interface with per-tab history
- [x] Chart rendering (bar, pie, line)
- [x] CSV export button
- [x] Loading, error, empty states
- [x] Responsive layout
- [x] AI integration via Gemini (optional task done)
