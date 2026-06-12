/**
 * Parses a CSV string and returns an array of expense objects.
 * Handles quotes, commas, and tries to map columns automatically.
 */
export function parseCSV(text) {
  const lines = [];
  let row = [""];
  let inQuotes = false;

  // Character-by-character CSV cell splitter
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        row[row.length - 1] += '"';
        i++; // skip next double quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push("");
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      lines.push(row.map(cell => cell.trim()));
      row = [""];
    } else {
      row[row.length - 1] += char;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row.map(cell => cell.trim()));
  }

  if (lines.length < 2) return [];

  const headers = lines[0].map(h => h.toLowerCase().replace(/["']/g, ""));
  const dateIdx = headers.findIndex(h => h.includes("date"));
  const descIdx = headers.findIndex(h => h.includes("desc") || h.includes("item") || h.includes("name") || h.includes("particular"));
  const amountIdx = headers.findIndex(h => h.includes("amount") || h.includes("price") || h.includes("cost") || h.includes("val"));
  const catIdx = headers.findIndex(h => h.includes("cat") || h.includes("type"));

  if (dateIdx === -1 || amountIdx === -1) {
    throw new Error("CSV must contain at least 'Date' and 'Amount' columns.");
  }

  const parsedExpenses = [];
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i];
    if (columns.length < Math.max(dateIdx, amountIdx) + 1) continue;

    const rawDate = columns[dateIdx];
    const rawAmount = columns[amountIdx];
    const rawDesc = descIdx !== -1 ? columns[descIdx] : "CSV Imported Expense";
    const rawCat = catIdx !== -1 ? columns[catIdx] : "Other";

    if (!rawDate || !rawAmount) continue;

    const cleanAmountStr = rawAmount.replace(/[^\d.-]/g, "");
    const amount = parseFloat(cleanAmountStr);
    if (isNaN(amount)) continue;

    let dateVal = rawDate;
    const usDateRegex = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/;
    const match = rawDate.match(usDateRegex);
    if (match) {
      const month = match[1].padStart(2, "0");
      const day = match[2].padStart(2, "0");
      const year = match[3];
      dateVal = `${year}-${month}-${day}`;
    }

    let category = "Other";
    const stdCategories = ["Housing", "Food", "Transport", "Utilities", "Entertainment", "Shopping", "Health", "Other"];
    const matchedCat = stdCategories.find(c => c.toLowerCase() === rawCat.toLowerCase());
    if (matchedCat) {
      category = matchedCat;
    }

    parsedExpenses.push({
      id: `csv-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
      amount: Math.abs(amount),
      description: rawDesc || "CSV Imported",
      date: dateVal,
      category
    });
  }

  return parsedExpenses;
}

/**
 * Generates and triggers download of a specific type of sample CSV file.
 * Available types: 'standard', 'groceries', 'utilities'
 */
export function downloadSampleCSV(type = "standard") {
  let csvContent = "";
  let filename = "expense_template.csv";

  if (type === "standard") {
    filename = "standard_expenses_template.csv";
    csvContent = 
`Date,Description,Amount,Category
2026-06-01,Starbucks Latte & Muffin,14.50,Food
2026-06-02,Chevron Gas Fill Up,45.00,Transport
2026-06-03,Vapor Home Fiber Internet,89.99,Utilities
2026-06-04,Weekly Rent Draft,300.00,Housing
2026-06-05,Regal Cinema Tickets,32.50,Entertainment
2026-06-06,CVS Pharmacy Prescriptions,25.20,Health
2026-06-07,Target Clothes & Home Decor,129.99,Shopping
2026-06-08,Uber Eats Dinner Delivery,38.40,Food
`;
  } else if (type === "groceries") {
    filename = "food_heavy_expenses_template.csv";
    csvContent = 
`Date,Description,Amount,Category
2026-06-01,Whole Foods Market,145.20,Food
2026-06-03,Trader Joes Organic,89.50,Food
2026-06-05,Italian Bistro Restaurant,112.00,Food
2026-06-06,Starbucks Drive-Thru,18.75,Food
2026-06-08,Local Farmers Market,35.00,Food
2026-06-10,Costco Bulk Food haul,289.40,Food
2026-06-11,Burger Joint lunch,15.60,Food
2026-06-12,Sushi Bar dinner,92.50,Food
`;
  } else if (type === "utilities") {
    filename = "utility_bills_template.csv";
    csvContent = 
`Date,Description,Amount,Category
2026-06-01,Power Grid Electric Bill,120.40,Utilities
2026-06-02,City Water District,45.10,Utilities
2026-06-03,Sewer & Waste management,35.00,Utilities
2026-06-04,Verizon Mobile Unlimited,95.00,Utilities
2026-06-05,Comcast Broadband Fiber,79.99,Utilities
2026-06-06,Gas heating utility,54.80,Utilities
2026-06-10,Hulu & Disney bundle,18.99,Entertainment
`;
  }

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
