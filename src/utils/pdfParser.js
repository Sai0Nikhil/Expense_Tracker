/**
 * PDF Statement Parser Utility
 * Dynamically loads PDF.js from a CDN to parse text content from PDFs client-side.
 */

// Function to load PDF.js scripts dynamically if not already loaded
function loadPdfJS() {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) {
      resolve(window.pdfjsLib);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
    script.onload = () => {
      // Configure the worker
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
      resolve(window.pdfjsLib);
    };
    script.onerror = (err) => reject(new Error("Failed to load PDF.js from CDN: " + err.message));
    document.head.appendChild(script);
  });
}

/**
 * Extracts raw text from a PDF file
 * @param {File} file - The PDF file object
 * @returns {Promise<string>} The extracted text content
 */
export async function extractTextFromPDF(file) {
  const pdfjsLib = await loadPdfJS();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = "";
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(" ");
    fullText += pageText + "\n";
  }
  
  return fullText;
}

/**
 * Parses raw text from monthly statement into list of expenses using heuristics.
 * Looks for lines containing both a date and a monetary value.
 * @param {string} text - The raw text of the PDF
 * @returns {Array<object>} Parsed expense items
 */
export function parseStatementHeuristic(text) {
  const lines = text.split("\n");
  const parsedExpenses = [];
  
  // Date patterns:
  // 1. MM/DD/YYYY or DD/MM/YYYY (e.g. 06/12/2026, 12-06-2026)
  const datePattern1 = /\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/;
  // 2. YYYY-MM-DD (e.g. 2026-06-12)
  const datePattern2 = /\b(\d{4})[/-](\d{1,2})[/-](\d{1,2})\b/;
  // 3. Month Day (e.g. Jun 12, June 12, 12 Jun)
  const months = "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|May|June|July|August|September|October|November|December";
  const datePattern3 = new RegExp(`\\b(?:(${months})\\s+(\\d{1,2})|(\\d{1,2})\\s+(${months}))\\b`, "i");

  // Currency pattern
  const amountPattern = /(?:[-$€£\s]|^)(?:\d{1,3}(?:,\d{3})*|\d+)\.\d{2}\b/;

  lines.forEach((line, index) => {
    const cleanLine = line.replace(/\s+/g, " ").trim();
    if (cleanLine.length < 10) return;

    const amountMatch = cleanLine.match(amountPattern);
    if (!amountMatch) return;

    const cleanAmountStr = amountMatch[0].replace(/[^\d.-]/g, "");
    let amount = parseFloat(cleanAmountStr);
    if (isNaN(amount)) return;
    amount = Math.abs(amount);

    let dateStr = "";
    let dateMatch = cleanLine.match(datePattern2);
    
    if (dateMatch) {
      dateStr = dateMatch[0];
    } else {
      dateMatch = cleanLine.match(datePattern1);
      if (dateMatch) {
        const p1 = dateMatch[1].padStart(2, "0");
        const p2 = dateMatch[2].padStart(2, "0");
        let year = dateMatch[3];
        if (year.length === 2) year = "20" + year;
        
        dateStr = `${year}-${p1}-${p2}`;
      } else {
        dateMatch = cleanLine.match(datePattern3);
        if (dateMatch) {
          const monthStr = dateMatch[1] || dateMatch[4];
          const dayStr = dateMatch[2] || dateMatch[3];
          
          const monthIndex = [
            "jan", "feb", "mar", "apr", "may", "jun", 
            "jul", "aug", "sep", "oct", "nov", "dec"
          ].findIndex(m => monthStr.toLowerCase().startsWith(m));
          
          if (monthIndex !== -1) {
            const currentYear = new Date().getFullYear();
            const monthVal = String(monthIndex + 1).padStart(2, "0");
            const dayVal = dayStr.padStart(2, "0");
            dateStr = `${currentYear}-${monthVal}-${dayVal}`;
          }
        }
      }
    }

    if (!dateStr) return;

    let description = cleanLine
      .replace(amountMatch[0], "")
      .replace(dateMatch[0], "")
      .replace(/[\s\-,$€£]+/g, " ")
      .trim();

    if (description.length < 2) {
      description = "Statement Transaction";
    }

    parsedExpenses.push({
      id: `pdf-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
      amount,
      description,
      date: dateStr
    });
  });

  return parsedExpenses;
}
