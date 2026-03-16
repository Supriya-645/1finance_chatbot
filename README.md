# 1 Finance — Internal Stakeholder Chatbot Portal

A production-ready internal web portal built for 1 Finance stakeholders to query client financial data through AI-powered service chatbots.

**Built by:** Supriya Patil  
**Submitted:** 16 March 2026

---

## Live Demo

🔗 **[https://1finance-chatbot.vercel.app](https://1finance-chatbot.vercel.app)**

**Demo Credentials**
- Email: `demo@1finance.co.in`
- Password: `Demo@1234`
- OTP: Press `F12` → Console tab to view

---

## Features

**Authentication**
- Two-step login — company email validation + 6-digit OTP
- Personal email domains blocked (Gmail, Yahoo, Outlook etc.)
- Password requires 8+ characters, letters, numbers and a symbol
- Stay logged in option with localStorage persistence
- Auto-redirect on return visits for authenticated users

**Service Chatbots**
- 6 independent chatbots — Investment, Banking, Insurance, Tax Planning, Real Estate, Retirement
- Each chatbot is scoped strictly to its service domain
- AI responses powered by Google Gemini 1.5 Flash
- Smart mock fallback with real data when API is unavailable
- Inline chart rendering — pie, bar and line charts via Recharts
- One-click CSV export for tabular data responses
- Suggestion chips after every response for guided navigation

**Chat Management**
- Per-service chat history stored in localStorage
- Persistent across browser sessions
- Recent Activity panel showing top 5 queries across all services
- Continue Last Query prompt for quick resumption

**UI & Experience**
- Live clock in market ticker bar
- Typing indicator while AI is responding
- Loading, empty and error states on all screens
- Responsive layout across desktop and tablet

---

## Design Decisions

**Colour Scheme**  
The dark gold palette (`#C9A84C` gold on `#0A0A0A` near-black) directly mirrors the official 1Finance website aesthetic — communicating the same sense of premium financial expertise and trust. Each service module uses a distinct accent colour consistent with the 1Finance brand's approach to visual hierarchy:

| Service | Accent | Rationale |
|---|---|---|
| Investment | `#2E9E5B` Forest Green | Growth, returns, equity markets |
| Banking | `#C9A84C` Gold | Stability, wealth, financial products |
| Insurance | `#E8843A` Amber | Protection, warmth, risk coverage |
| Tax Planning | `#4A90D9` Blue | Compliance, trust, government |
| Real Estate | `#8B5E3C` Earthy Brown | Property, land, tangible assets |
| Retirement | `#B59AE8` Soft Purple | Long-term vision, calm, planning |

These accent colours are applied consistently across the sidebar, header, send button, typing indicator, message borders and suggestion chips — creating a cohesive per-service identity without ever feeling disconnected from the parent brand.

**Typography**  
Playfair Display for headings (matching 1Finance's editorial tone) and DM Sans for UI text (clean, modern, readable at small sizes).

**Chart Strategy**  
Pie charts for proportions and allocations, bar charts for cross-client comparisons, line charts for rates and trends. Charts are only rendered when they genuinely add value — simple factual answers return plain text or bullet points.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + inline styles |
| Routing | React Router v6 |
| Charts | Recharts |
| AI | Google Gemini 1.5 Flash API |
| Data | Mock JSON (`src/data/mockData.json`) |
| Deployment | Vercel |

---

## Setup Instructions

**Prerequisites:** Node.js v18+
```bash
# 1. Clone the repository
git clone https://github.com/Supriya-645/1finance_chatbot.git
cd 1finance_chatbot

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and add your Gemini API key
# Get a free key from https://aistudio.google.com

# 4. Start development server
npm run dev
# Open http://localhost:3000

# 5. Build for production
npm run build
```

**.env file:**
```
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

> The app works fully without an API key using built-in mock responses with real client data, charts and CSV exports.

---

## Project Structure
```
src/
├── components/
│   ├── ChatInput.jsx       # Message input with suggestion chips
│   ├── ChatMessage.jsx     # Message renderer with bold/bullet/code support
│   ├── ChartRenderer.jsx   # Recharts pie/bar/line renderer
│   ├── Sidebar.jsx         # Per-service chat history sidebar
│   └── TypingIndicator.jsx # Animated typing dots
├── data/
│   └── mockData.json       # Client data, market data, products
├── pages/
│   ├── LoginPage.jsx       # Email + password with validation
│   ├── OTPPage.jsx         # 6-digit OTP verification
│   ├── ServicesPage.jsx    # Service selection + recent activity panel
│   └── ChatPage.jsx        # Main chatbot interface
└── utils/
    ├── exportCSV.js        # CSV generation and download
    └── geminiService.js    # Gemini API + mock response engine
```

---

## Mock Data

`src/data/mockData.json` contains 4 fictional client profiles (Priya Sharma, Rahul Mehta, Anjali Singh, Vikram Nair) with complete data across all 6 service domains — investments, banking, insurance, tax, real estate and retirement. Also includes market summary, product rates and tax rules for FY 2025-26.

---

*Internal use only · 1 Finance Stakeholder Portal · Powered by Google Gemini 1.5 Flash*
