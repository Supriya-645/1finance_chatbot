/**
 * Exports an array of objects to a downloadable CSV file
 * @param {Array<Object>} data - Array of row objects
 * @param {string} filename - Output filename (with .csv)
 */
export function exportToCSV(data, filename = "1finance_export.csv") {
  if (!data || data.length === 0) {
    alert("No data to export.");
    return;
  }

  const headers = Object.keys(data[0]);

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = typeof val === "object" ? JSON.stringify(val) : String(val);
    // Escape quotes and wrap in quotes if contains comma/newline/quote
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const csvRows = [
    headers.join(","),
    ...data.map((row) => headers.map((h) => escapeCell(row[h])).join(",")),
  ];

  const csvContent = csvRows.join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Flattens client data for CSV export
 */
export function flattenClientsForCSV(clients) {
  return clients.map((c) => ({
    "Client ID": c.id,
    "Name": c.name,
    "Age": c.age,
    "City": c.city,
    "Portfolio Value (₹)": c.portfolio_value.toLocaleString("en-IN"),
    "Monthly SIP (₹)": c.sip_amount.toLocaleString("en-IN"),
    "Risk Profile": c.risk_profile,
    "Annual Income (₹)": c.annual_income.toLocaleString("en-IN"),
    "Equity %": c.investments.equity,
    "Debt %": c.investments.debt,
    "Gold %": c.investments.gold,
    "Real Estate %": c.investments.real_estate,
    "Tax Bracket": c.tax.tax_bracket,
    "80C Invested (₹)": c.tax.section_80c_invested.toLocaleString("en-IN"),
    "Term Life Cover (₹)": c.insurance.term_life ? c.insurance.term_life.cover.toLocaleString("en-IN") : "None",
    "Health Cover (₹)": c.insurance.health ? c.insurance.health.cover.toLocaleString("en-IN") : "None",
  }));
}
