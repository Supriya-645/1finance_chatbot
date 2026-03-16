import mockData from "../data/mockData.json";

const SERVICE_CONTEXTS = {
  investment:  "investment advisory, mutual funds, SIP, portfolio management, equity/debt allocation, returns analysis",
  banking:     "banking products, savings accounts, fixed deposits, loans, interest rates",
  insurance:   "insurance products, term life, health insurance, ULIP, premium planning",
  tax:         "tax planning, ITR filing, Section 80C deductions, capital gains, ELSS",
  realestate:  "real estate investment, property, REITs, home loans, EMI, rental yield",
  retirement:  "retirement planning, NPS, PPF, pension, corpus calculation, SWP",
};

export function buildSystemPrompt(service) {
  return `You are an expert AI financial advisor for 1 Finance, a premium Indian personal finance company. You specialize in ${SERVICE_CONTEXTS[service] || service}.

You have access to the following LIVE CLIENT DATA (use this to answer specific questions):

${JSON.stringify(mockData, null, 2)}

═══════════════════════════════════════════
RESPONSE RULES:
1. Be professional, concise, and data-driven. Use ₹ for all Indian currency values.
2. Format numbers in Indian system: ₹2,85,000 not ₹285,000. Use Lakhs/Crores where appropriate.
3. STAY STRICTLY within ${service}-related topics. Politely redirect off-topic questions.
4. Only output a chart block when it genuinely adds value (comparisons, allocations, trends with 3+ data points). For simple factual questions, lists, or single-client queries — respond in plain text paragraphs or bullet points WITHOUT a chart. When you do use a chart, format it like this:

\`\`\`chart
{"type":"pie","title":"Portfolio Allocation — Priya Sharma","data":[{"name":"Equity","value":58},{"name":"Debt","value":28},{"name":"Gold","value":8},{"name":"Real Estate","value":6}]}
\`\`\`

Use:
- "pie" for allocations, distributions and proportions
- "bar" for comparing values across clients or funds
- "line" for rates, percentages, yields and trends over time

5. When the response includes tabular client data that would be useful to export, add a CSV block like:

\`\`\`csv_export
[{"Client":"Priya Sharma","Portfolio":"₹28.5L","SIP":"₹15,000","Risk":"Moderate","1yr Returns Avg":"18.6%"}]
\`\`\`

6. Keep responses under 200 words unless detailed analysis is requested.
7. Always cite specific client names and numbers from the data when relevant.
8. For missing data, say "Data not available" — do not guess.
9. Most responses should be plain text paragraphs or bullet points. Only use charts for genuine comparisons or visual data (3+ items). Never force a chart where a sentence works better.
═══════════════════════════════════════════`;
}

export async function callOpenAI(userMessage, history, service) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === "your-gemini-api-key-here") {
    console.warn("Gemini API key missing or placeholder; using mock response.");
    return buildMockResponse(userMessage, service);
  }

  const contents = [
    ...history
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-10)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const body = {
    systemInstruction: { parts: [{ text: buildSystemPrompt(service) }] },
    contents,
    generationConfig: { maxOutputTokens: 1024, temperature: 0.4, topP: 0.9 },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.warn("Gemini API responded with non-OK status", response.status, err);
      return buildMockResponse(userMessage, service);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    if (!candidate) {
      console.warn("Gemini API returned no candidates", data);
      return buildMockResponse(userMessage, service);
    }

    const text = candidate.content?.parts?.[0]?.text;
    if (!text) {
      console.warn("Gemini API returned empty text candidate", candidate);
      return buildMockResponse(userMessage, service);
    }

    return text;
  } catch (err) {
    console.warn("Gemini API request failed", err);
    return buildMockResponse(userMessage, service);
  }
}

export function parseAIResponse(rawText) {
  let chartData = null;
  let csvData   = null;
  const text = typeof rawText === "string" ? rawText : String(rawText || "");
  let cleanText = text;

  const chartMatch = text.match(/```chart\n([\s\S]*?)```/);
  if (chartMatch) {
    try { chartData = JSON.parse(chartMatch[1].trim()); }
    catch (e) { console.warn("Chart parse error:", e); }
    cleanText = cleanText.replace(/```chart\n[\s\S]*?```/, "").trim();
  }

  const csvMatch = text.match(/```csv_export\n([\s\S]*?)```/);
  if (csvMatch) {
    try { csvData = JSON.parse(csvMatch[1].trim()); }
    catch (e) { console.warn("CSV parse error:", e); }
    cleanText = cleanText.replace(/```csv_export\n[\s\S]*?```/, "").trim();
  }

  return { cleanText, chartData, csvData };
}

function buildMockResponse(question, service) {
  const q       = question.toLowerCase();
  const clients = mockData.clients;

  // ── Investment ──────────────────────────────────────────────
  if (q.includes("portfolio") && (q.includes("allocation") || q.includes("breakdown"))) {
    const c = clients[0];
    return `Here is the portfolio allocation for **${c.name}** (₹${(c.portfolio_value / 100000).toFixed(1)}L total):

\`\`\`chart
{"type":"pie","title":"Portfolio Allocation — ${c.name}","data":[{"name":"Equity","value":${c.investments.equity}},{"name":"Debt","value":${c.investments.debt}},{"name":"Gold","value":${c.investments.gold}},{"name":"Real Estate","value":${c.investments.real_estate}}]}
\`\`\`

The portfolio is ${c.risk_profile.toLowerCase()}-risk with ${c.investments.equity}% equity exposure, appropriate for age ${c.age}.`;
  }

  if (q.includes("compare") || q.includes("all clients") || q.includes("portfolio value")) {
    return `Here is a comparison of all client portfolios:

\`\`\`chart
{"type":"bar","title":"Client Portfolio Values (₹ Lakhs)","data":[${clients.map(c => `{"name":"${c.name.split(" ")[0]}","value":${Math.round(c.portfolio_value / 100000)}}`).join(",")}]}
\`\`\`

\`\`\`csv_export
${JSON.stringify(clients.map(c => ({ "Client": c.name, "Portfolio (₹L)": (c.portfolio_value / 100000).toFixed(1), "SIP (₹)": c.sip_amount.toLocaleString("en-IN"), "Risk": c.risk_profile })))}
\`\`\`

**Vikram Nair** leads with ₹1.56 Cr, followed by **Rahul Mehta** at ₹82L. **Anjali Singh** at ₹4.5L is ideal for long-term aggressive growth.`;
  }

  if (q.includes("csv") || q.includes("download") || q.includes("export")) {
    return `Here is the complete client data ready for export:

\`\`\`csv_export
${JSON.stringify(clients.map(c => ({ "Client": c.name, "Age": c.age, "City": c.city, "Portfolio (₹)": c.portfolio_value, "SIP (₹)": c.sip_amount, "Risk": c.risk_profile })))}
\`\`\`

Click the **Download CSV** button below to save this data.`;
  }

  if (q.includes("sip") || q.includes("mutual fund") || q.includes("fund") || q.includes("returns")) {
    return `Here are the top performing funds across all clients:

\`\`\`chart
{"type":"bar","title":"Top Fund Returns (1 Year %)","data":[{"name":"Quant Active","value":42.1},{"name":"Nippon Small Cap","value":38.6},{"name":"HDFC Mid-Cap","value":22.4},{"name":"Parag Parikh","value":18.3},{"name":"Mirae Large Cap","value":14.2}]}
\`\`\`

**Anjali Singh's** aggressive portfolio is outperforming with 40%+ returns in small/mid cap funds. Suitable for her 28-year-old risk profile and 10+ year horizon.`;
  }

  if (q.includes("aggressive") || q.includes("risk profile")) {
      return `Here are the risk profiles across all 4 clients:

  - **Anjali Singh** (28, Delhi) — Aggressive. 80% equity allocation. Long 27-year horizon makes this appropriate. Highest returns at 40%+ in small/mid cap funds.

  - **Priya Sharma** (34, Mumbai) — Moderate. 58% equity, balanced with 28% debt. Suited for her mid-career stage and financial goals.

  - **Rahul Mehta** (45, Bangalore) — Conservative. Only 35% equity. Focused on capital preservation as he approaches retirement in 10 years.

  - **Vikram Nair** (52, Chennai) — Conservative. Just 20% equity. Heavily debt-oriented with 55% in fixed income, appropriate for his 8-year retirement timeline.`;
    }

  // ── Tax ─────────────────────────────────────────────────────
  if (q.includes("tax") || q.includes("80c") || q.includes("elss")) {
    return `Here is the 80C utilisation status for all clients:

\`\`\`chart
{"type":"bar","title":"Section 80C Invested (₹)","data":[{"name":"Priya","value":145000},{"name":"Rahul","value":150000},{"name":"Anjali","value":72000},{"name":"Vikram","value":150000}]}
\`\`\`

**Anjali Singh** has only invested ₹72,000 against the ₹1,50,000 limit — she can save ₹78,000 more via ELSS funds before this financial year ends.`;
  }

  if (q.includes("tax bracket") || q.includes("income tax")) {
    return `Here are the taxable incomes across all clients:

\`\`\`chart
{"type":"line","title":"Taxable Income by Client (₹ Lakhs)","data":[{"name":"Anjali","value":7.8},{"name":"Priya","value":16.2},{"name":"Rahul","value":39},{"name":"Vikram","value":55}]}
\`\`\`

\`\`\`csv_export
${JSON.stringify(clients.map(c => ({ "Client": c.name, "Taxable Income": `₹${(c.tax.taxable_income / 100000).toFixed(1)}L`, "Tax Bracket": c.tax.tax_bracket, "Tax Payable": `₹${(c.tax.tax_payable / 100000).toFixed(1)}L` })))}
\`\`\`

**Vikram** and **Rahul** are in the 30% bracket. **Anjali** is in 20% — she should evaluate the new tax regime for potential savings.`;
  }

  if (q.includes("capital gain")) {
    return `Here are capital gains for all clients:

\`\`\`chart
{"type":"pie","title":"Capital Gains Distribution (₹)","data":[{"name":"Vikram LTCG","value":420000},{"name":"Priya LTCG","value":120000},{"name":"Priya STCG","value":45000},{"name":"Anjali STCG","value":28000}]}
\`\`\`

LTCG above ₹1.25L is taxed at 12.5%. **Vikram Nair** has ₹4.2L LTCG — only ₹2.95L is taxable after exemption. Consider tax-loss harvesting before 31 March.`;
  }

  // ── Banking ─────────────────────────────────────────────────
  if (service === "banking") {
    if (q.includes("fd") || q.includes("fixed deposit")) {
      return `Here are the best FD rates currently available:

\`\`\`chart
{"type":"line","title":"FD Interest Rates — 1 Year (%)","data":[{"name":"SBI","value":6.8},{"name":"ICICI","value":6.9},{"name":"HDFC","value":6.9},{"name":"Axis","value":7.0},{"name":"Kotak","value":7.1}]}
\`\`\`

**Kotak Mahindra** offers the highest 1-year rate at 7.1%. Senior citizens get an additional 0.5–0.75%. **Rahul Mehta** has ₹30L in FDs — his ICICI FD matures in Sep 2026.`;
    }
    if (q.includes("loan") || q.includes("emi")) {
          return `Active loans across all clients:

    **Priya Sharma** has a home loan of ₹32 Lakhs with HDFC Bank at 8.75% interest. Her monthly EMI is ₹28,500 with 15 years (180 months) remaining. The loan is well-managed relative to her income.

    **Anjali Singh** has a personal loan of ₹1.2 Lakhs with Bajaj Finance at 14% interest — EMI of ₹5,500 with 24 months remaining. Given the high interest rate, early closure is strongly recommended. She would save approximately ₹8,000 in interest by paying it off now.

    **Rahul Mehta** and **Vikram Nair** have no outstanding loans — their balance sheets are clean.`;
        }
    if (q.includes("savings") || q.includes("balance")) {
      return `Here are savings account balances across all clients:

\`\`\`chart
{"type":"pie","title":"Savings Account Balances Distribution","data":[{"name":"Vikram","value":2200000},{"name":"Rahul","value":850000},{"name":"Priya","value":180000},{"name":"Anjali","value":45000}]}
\`\`\`

\`\`\`csv_export
${JSON.stringify([{ "Client": "Vikram Nair", "Bank": "SBI", "Balance": "₹22L", "Rate": "3.0%" }, { "Client": "Rahul Mehta", "Bank": "Kotak", "Balance": "₹8.5L", "Rate": "4.0%" }, { "Client": "Priya Sharma", "Bank": "HDFC", "Balance": "₹1.8L", "Rate": "3.5%" }, { "Client": "Anjali Singh", "Bank": "ICICI", "Balance": "₹45K", "Rate": "3.5%" }])}
\`\`\`

**Vikram Nair** has ₹22L idle in savings — recommend moving to a liquid fund or short-term FD for better returns.`;
    }
    if (q.includes("highest fd") || q.includes("highest fixed")) {
      return `Here is the total FD investment per client:

\`\`\`chart
{"type":"bar","title":"Total FD Investment per Client (₹ Lakhs)","data":[{"name":"Vikram","value":70},{"name":"Rahul","value":30},{"name":"Priya","value":7},{"name":"Anjali","value":0}]}
\`\`\`

**Vikram Nair** has the highest FD investment at ₹70L — split between SBI (₹50L, 7.5%, 3yr) and Post Office (₹20L, 7.5%, 5yr). **Anjali Singh** has no FDs — recommend starting a small RD for discipline.`;
    }
  }

  // ── Insurance ───────────────────────────────────────────────
  if (service === "insurance") {
    if (q.includes("term life") || q.includes("no term") || q.includes("don't have")) {
          return `Term life insurance status across all clients:

    - **Anjali Singh** — NO term life cover. This is a critical gap. At age 28, a ₹1 Crore cover would cost only ~₹7,800/year with Max Life Smart Secure Plus (99.3% claim ratio). Immediate action recommended.

    - **Priya Sharma** — ₹1 Crore cover with HDFC Life at ₹18,000/year. Adequate for her current stage but may need enhancement as income grows.

    - **Rahul Mehta** — ₹3 Crore cover with LIC at ₹42,000/year. Well covered given his family responsibilities and income level.

    - **Vikram Nair** — ₹5 Crore cover with Max Life at ₹95,000/year. Excellent coverage for his asset base and family obligations.`;
        }
    if (q.includes("health") || q.includes("medical")) {
      return `Here are health insurance covers across all clients:

\`\`\`chart
{"type":"bar","title":"Health Insurance Cover (₹ Lakhs)","data":[{"name":"Vikram","value":50},{"name":"Rahul","value":20},{"name":"Priya","value":5},{"name":"Anjali","value":3}]}
\`\`\`

**Priya** and **Anjali** have inadequate health cover. With medical inflation at 12–14% annually, minimum ₹10L family floater is recommended. Niva Bupa ReAssure 2.0 offers ₹10L at ~₹22,000/year with 100% no-claim bonus.`;
    }
    if (q.includes("premium")) {
      return `Here are total annual insurance premiums per client:

\`\`\`chart
{"type":"line","title":"Total Annual Insurance Premiums (₹)","data":[{"name":"Anjali","value":6500},{"name":"Priya","value":30000},{"name":"Rahul","value":88000},{"name":"Vikram","value":179000}]}
\`\`\`

\`\`\`csv_export
${JSON.stringify([{ "Client": "Vikram Nair", "Term Life": "₹95,000", "Health": "₹52,000", "Critical Illness": "₹32,000", "Total": "₹1,79,000" }, { "Client": "Rahul Mehta", "Term Life": "₹42,000", "Health": "₹28,000", "Critical Illness": "₹18,000", "Total": "₹88,000" }, { "Client": "Priya Sharma", "Term Life": "₹18,000", "Health": "₹12,000", "Critical Illness": "Nil", "Total": "₹30,000" }, { "Client": "Anjali Singh", "Term Life": "Nil", "Health": "₹6,500", "Critical Illness": "Nil", "Total": "₹6,500" }])}
\`\`\``;
    }
    if (q.includes("critical illness")) {
      return `Critical illness cover status across all clients:

- **Vikram Nair** — ₹1Cr cover with HDFC Ergo (₹32,000/year)
- **Rahul Mehta** — ₹50L cover with ICICI Lombard (₹18,000/year)
- **Priya Sharma** — No critical illness cover — recommend ₹25L cover
- **Anjali Singh** — No critical illness cover — at age 28 premium would be very low (~₹5,000/year)`;
    }
  }

  // ── Real estate ─────────────────────────────────────────────
  if (service === "realestate") {
    if (q.includes("propert") || q.includes("all client")) {
      return `Here are all client properties:

\`\`\`chart
{"type":"bar","title":"Property Values (₹ Lakhs)","data":[{"name":"Vikram — Chennai","value":150},{"name":"Vikram — Coimbatore","value":45},{"name":"Rahul — Bengaluru 1","value":120},{"name":"Rahul — Bengaluru 2","value":45},{"name":"Priya — Mumbai","value":85}]}
\`\`\`

\`\`\`csv_export
${JSON.stringify([{ "Client": "Vikram Nair", "Property": "Residential — Chennai", "Value": "₹1.5Cr", "Status": "Self-occupied", "Rental": "Nil" }, { "Client": "Vikram Nair", "Property": "Residential — Coimbatore", "Value": "₹45L", "Status": "Rented", "Rental": "₹28,000/mo" }, { "Client": "Rahul Mehta", "Property": "Residential — Bangalore", "Value": "₹1.2Cr", "Status": "Self-occupied", "Rental": "Nil" }, { "Client": "Rahul Mehta", "Property": "Commercial — Bangalore", "Value": "₹45L", "Status": "Rented", "Rental": "₹35,000/mo" }, { "Client": "Priya Sharma", "Property": "Residential — Mumbai", "Value": "₹85L", "Status": "Self-occupied", "Rental": "Nil" }, { "Client": "Anjali Singh", "Property": "None", "Value": "Nil", "Status": "Renting", "Rental": "Paying ₹18,000/mo" }])}
\`\`\``;
    }
    if (q.includes("rental") || q.includes("rent income")) {
      return `Here are rental income details for clients with investment properties:

\`\`\`chart
{"type":"pie","title":"Monthly Rental Income Distribution","data":[{"name":"Rahul — Commercial Bangalore","value":35000},{"name":"Vikram — Coimbatore","value":28000}]}
\`\`\`

**Rahul Mehta** earns ₹35,000/month from his commercial property (yield: 9.3%). **Vikram Nair** earns ₹28,000/month from Coimbatore property (yield: 7.5%). **Anjali Singh** is paying ₹18,000/month rent — recommend starting a home purchase plan.`;
    }
    if (q.includes("reit")) {
      return `Here are available REIT options in India:

\`\`\`chart
{"type":"line","title":"REIT Distribution Yields (%)","data":[{"name":"Embassy","value":6.8},{"name":"Mindspace","value":7.1},{"name":"Brookfield","value":8.2}]}
\`\`\`

**Brookfield India REIT** offers the highest yield at 8.2% (₹245/unit). All 3 REITs invest in Grade-A commercial properties. Ideal for **Anjali Singh** who cannot afford direct property but wants real estate exposure starting at just ₹245.`;
    }
    if (q.includes("home loan") || q.includes("emi")) {
      return `Here are the best home loan rates currently available:

\`\`\`chart
{"type":"line","title":"Home Loan Interest Rates (%)","data":[{"name":"LIC HFL","value":8.4},{"name":"SBI","value":8.5},{"name":"HDFC","value":8.75},{"name":"ICICI","value":8.75}]}
\`\`\`

**LIC HFL** offers the lowest rate at 8.4% with minimal processing fee of 0.25%. For a ₹50L loan over 20 years at 8.5% — EMI would be approximately ₹43,400/month.`;
    }
  }

  // ── Retirement ──────────────────────────────────────────────
  if (service === "retirement") {
    if (q.includes("closest") || q.includes("retirement age") || q.includes("near retirement")) {
          return `Retirement timeline for all clients, nearest first:

    **Vikram Nair** (52) is closest to retirement — only 8 years away at his target age of 60. He currently has ₹1.56 Crore but requires approximately ₹8 Crore. Significant gap — needs immediate corpus acceleration strategy.

    **Rahul Mehta** (45) has 10 years to his target retirement at 55. Current corpus of ₹82L against a ₹10 Crore goal. He must increase monthly investments significantly in this decade.

    **Priya Sharma** (34) has 24 years — time is on her side. Increasing SIP from ₹15,000 to ₹45,000/month would put her on track for her ₹4.5 Crore target.

    **Anjali Singh** (28) has 27 years — her greatest asset. Starting NPS now with consistent SIP contributions will compound significantly by retirement.`;
        }
    if (q.includes("nps") || q.includes("ppf") || q.includes("compare nps")) {
      return `Here are NPS and PPF balances across all clients:

\`\`\`chart
{"type":"bar","title":"NPS vs PPF Balances (₹ Lakhs)","data":[{"name":"Vikram NPS","value":48},{"name":"Vikram PPF","value":52},{"name":"Rahul NPS","value":18},{"name":"Rahul PPF","value":21},{"name":"Priya NPS","value":2.8},{"name":"Priya PPF","value":4.2},{"name":"Anjali NPS","value":0},{"name":"Anjali PPF","value":0.48}]}
\`\`\`

\`\`\`csv_export
${JSON.stringify([{ "Client": "Vikram Nair", "NPS Balance": "₹48L", "PPF Balance": "₹52L", "EPF Balance": "₹85L", "Total": "₹1.85Cr" }, { "Client": "Rahul Mehta", "NPS Balance": "₹18L", "PPF Balance": "₹21L", "EPF Balance": "₹32L", "Total": "₹71L" }, { "Client": "Priya Sharma", "NPS Balance": "₹2.8L", "PPF Balance": "₹4.2L", "EPF Balance": "₹6.8L", "Total": "₹13.8L" }, { "Client": "Anjali Singh", "NPS Balance": "Nil", "PPF Balance": "₹48K", "EPF Balance": "₹95K", "Total": "₹1.43L" }])}
\`\`\`

**Anjali Singh** has no NPS — recommend starting immediately for ₹50,000 additional tax deduction under 80CCD(1B).`;
    }
    if (q.includes("on track") || q.includes("corpus") || q.includes("projected")) {
      return `Here is the retirement readiness status for all clients:

\`\`\`chart
{"type":"bar","title":"Current vs Required Corpus (₹ Lakhs)","data":[{"name":"Priya Current","value":28.5},{"name":"Priya Required","value":450},{"name":"Rahul Current","value":82},{"name":"Rahul Required","value":1000},{"name":"Vikram Current","value":156},{"name":"Vikram Required","value":800}]}
\`\`\`

No client is fully on track yet. **Vikram** is closest at 19.5% of goal. **Priya** needs to increase SIP from ₹15,000 to ₹45,000/month to reach ₹4.5Cr target. **Anjali's** 27-year runway is her biggest asset.`;
    }
    if (q.includes("epf") || q.includes("provident fund")) {
          return `EPF balances and insights for all clients:

    EPF currently earns 8.25% per annum, fully tax-free on maturity — one of the best risk-adjusted returns available in India.

    - **Vikram Nair** — ₹85 Lakhs. The highest EPF balance, built over 30+ years of employment. This alone will be a significant retirement anchor.

    - **Rahul Mehta** — ₹32 Lakhs. Solid foundation. He contributes ₹20,000/month to NPS additionally which will compound well over the next 10 years.

    - **Priya Sharma** — ₹6.8 Lakhs. Early stage but growing steadily. Recommend maximising VPF contributions for additional tax-free accumulation.

    - **Anjali Singh** — ₹95,000. Just starting out. She should consider increasing Voluntary PF (VPF) contributions since returns at 8.25% tax-free beat most debt instruments.`;
        }
  }

  // ── Default — service specific suggestions ──────────────────
  const suggestions = {
    investment: `I have data for **${clients.length} clients** in the Investment module. You can ask me:

- Show portfolio allocation for Priya Sharma
- Compare 1-year returns of all mutual funds
- Which clients have aggressive risk profiles?
- Download client portfolio summary as CSV`,

    banking: `I have data for **${clients.length} clients** in the Banking module. You can ask me:

- Compare FD rates across all banks
- Which clients have active loans?
- Show savings account balances for all clients
- Who has the highest FD investment?`,

    insurance: `I have data for **${clients.length} clients** in the Insurance module. You can ask me:

- Which clients don't have term life insurance?
- Compare health cover amounts across clients
- Show total insurance premiums per client
- Which clients have critical illness cover?`,

    tax: `I have data for **${clients.length} clients** in the Tax Planning module. You can ask me:

- Which clients haven't fully utilised 80C?
- Show tax brackets for all clients
- Who needs ELSS investment planning?
- Show capital gains for all clients`,

    realestate: `I have data for **${clients.length} clients** in the Real Estate module. You can ask me:

- Show all client properties
- Which clients earn rental income?
- Compare property values across clients
- Show REIT options available`,

    retirement: `I have data for **${clients.length} clients** in the Retirement module. You can ask me:

- Who is closest to retirement age?
- Compare NPS and PPF balances across clients
- Which clients are on track for retirement?
- Show EPF balances for all clients`,
  };

  return suggestions[service] || suggestions.investment;
}