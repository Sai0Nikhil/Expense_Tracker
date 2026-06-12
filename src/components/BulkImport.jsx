import React, { useState, useRef } from "react";
import { Upload, FileSpreadsheet, FileText, Download, Check, AlertCircle, HelpCircle, Loader2 } from "lucide-react";
import { parseCSV, downloadSampleCSV } from "../utils/csvHelper";
import { extractTextFromPDF, parseStatementHeuristic } from "../utils/pdfParser";

export default function BulkImport({ onImportExpenses, apiKey }) {
  const [activeTab, setActiveTab] = useState("csv"); // 'csv' or 'pdf'
  const [dragActive, setDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }
  const [previewExpenses, setPreviewExpenses] = useState([]); // transactions parsed, waiting for approval
  const [extractedPdfText, setExtractedPdfText] = useState(""); // hold text for AI parsing

  const fileInputRef = useRef(null);

  // Handle Drag Events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Process File
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    setIsLoading(true);
    setMessage(null);
    setPreviewExpenses([]);
    setExtractedPdfText("");

    try {
      if (activeTab === "csv") {
        if (!file.name.endsWith(".csv")) {
          throw new Error("Please upload a .csv file.");
        }
        const text = await file.text();
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          throw new Error("No valid transactions found in the CSV file.");
        }
        setPreviewExpenses(parsed);
      } else {
        // PDF Statement parsing
        if (!file.name.endsWith(".pdf")) {
          throw new Error("Please upload a .pdf file.");
        }
        
        // Extract PDF text
        const text = await extractTextFromPDF(file);
        setExtractedPdfText(text);

        // Run Heuristic Parser
        const parsed = parseStatementHeuristic(text);
        if (parsed.length === 0) {
          setMessage({
            type: "warning",
            text: "Heuristic parser couldn't extract any structured transactions. Try copying text or pasting your Claude API key to use AI parsing."
          });
        } else {
          setPreviewExpenses(parsed);
        }
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Parse PDF text with Claude AI if key is available
  const handleAIPdfParse = async () => {
    if (!apiKey) {
      setMessage({ type: "error", text: "Please enter your Claude API key in the AI panel first." });
      return;
    }
    if (!extractedPdfText) {
      setMessage({ type: "error", text: "No statement text extracted yet. Please upload a PDF first." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Direct message call through proxy
      const prompt = `You are a financial statement parsing tool. Extract ALL transaction expenses from the following text extracted from a monthly bank or credit card statement. Return ONLY a valid JSON array of objects, each object containing the following keys exactly:
- date (in YYYY-MM-DD format)
- description (merchant or clean description name)
- amount (positive float number)

Do not return any other text, conversational intro/outro, or markdown blocks except the raw JSON array.
Statement Text:
${extractedPdfText.substring(0, 12000)} // truncate if too long to save token limit
`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API request failed: ${response.statusText} (${response.status}). Please check your API key.`);
      }

      const resData = await response.json();
      const contentText = resData.content[0].text;
      
      // Attempt to clean JSON
      const jsonStart = contentText.indexOf("[");
      const jsonEnd = contentText.lastIndexOf("]") + 1;
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("Could not parse JSON response from Claude.");
      }
      
      const cleanJson = contentText.substring(jsonStart, jsonEnd);
      const parsedExpenses = JSON.parse(cleanJson);
      
      const parsedWithIds = parsedExpenses.map((exp, index) => ({
        ...exp,
        id: `pdf-ai-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
        amount: Math.abs(parseFloat(exp.amount)) || 0
      }));

      setPreviewExpenses(parsedWithIds);
      setMessage({ type: "success", text: `AI parsed ${parsedWithIds.length} transactions successfully!` });

    } catch (err) {
      setMessage({ type: "error", text: "AI parsing error: " + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (previewExpenses.length === 0) return;
    onImportExpenses(previewExpenses);
    setMessage({ type: "success", text: `Successfully imported ${previewExpenses.length} transactions!` });
    setPreviewExpenses([]);
    setExtractedPdfText("");
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="glass-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <h3 className="form-label" style={{ fontSize: "16px", marginBottom: "16px", fontWeight: "600", color: "var(--text-primary)" }}>
        Import Statement
      </h3>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "10px" }}>
        <button
          className={`btn ${activeTab === "csv" ? "btn-primary" : "btn-secondary"}`}
          style={{ padding: "6px 14px", fontSize: "13px" }}
          onClick={() => { setActiveTab("csv"); setMessage(null); setPreviewExpenses([]); }}
        >
          <FileSpreadsheet size={14} />
          Bulk CSV
        </button>
        <button
          className={`btn ${activeTab === "pdf" ? "btn-primary" : "btn-secondary"}`}
          style={{ padding: "6px 14px", fontSize: "13px" }}
          onClick={() => { setActiveTab("pdf"); setMessage(null); setPreviewExpenses([]); }}
        >
          <FileText size={14} />
          Monthly PDF
        </button>
      </div>

      {/* Actions / Instructions info */}
      {activeTab === "csv" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Upload standard transaction CSV columns.</span>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", alignSelf: "center", marginRight: "4px" }}>Samples:</span>
            <button 
              className="btn btn-secondary" 
              style={{ padding: "4px 8px", fontSize: "10px", gap: "2px" }}
              onClick={() => downloadSampleCSV("standard")}
            >
              <Download size={10} />
              Standard
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ padding: "4px 8px", fontSize: "10px", gap: "2px" }}
              onClick={() => downloadSampleCSV("groceries")}
            >
              <Download size={10} />
              Food
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ padding: "4px 8px", fontSize: "10px", gap: "2px" }}
              onClick={() => downloadSampleCSV("utilities")}
            >
              <Download size={10} />
              Bills
            </button>
          </div>
        </div>
      )}

      {activeTab === "pdf" && (
        <div style={{ marginBottom: "12px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            Upload banking PDF statement. Runs local regex extraction or enhances via Claude Vision/AI.
          </span>
        </div>
      )}

      {/* Drag & Drop Area */}
      {!previewExpenses.length && (
        <div
          className={`dropzone ${dragActive ? "active" : ""}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "150px" }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={activeTab === "csv" ? ".csv" : ".pdf"}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          {isLoading ? (
            <>
              <Loader2 size={32} className="animate-spin-slow" style={{ color: "var(--color-indigo)", animation: "spin 2s linear infinite" }} />
              <p style={{ marginTop: "12px", fontSize: "13px", color: "var(--text-secondary)" }}>Parsing document...</p>
            </>
          ) : (
            <>
              <Upload size={32} style={{ color: "var(--text-muted)", marginBottom: "8px" }} />
              <p style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-primary)" }}>
                Drag & drop file here or <span style={{ color: "var(--color-indigo)" }}>browse</span>
              </p>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                Supports {activeTab === "csv" ? ".csv spreadsheets" : ".pdf statements"}
              </p>
            </>
          )}
        </div>
      )}

      {/* Notifications/Feedback */}
      {message && (
        <div style={{ 
          background: message.type === "error" ? "rgba(244, 63, 94, 0.1)" : message.type === "warning" ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)",
          border: `1px solid ${message.type === "error" ? "rgba(244, 63, 94, 0.2)" : message.type === "warning" ? "rgba(245, 158, 11, 0.2)" : "rgba(16, 185, 129, 0.2)"}`,
          color: message.type === "error" ? "var(--color-rose)" : message.type === "warning" ? "var(--color-amber)" : "var(--color-emerald)",
          padding: "10px 14px", 
          borderRadius: "8px", 
          fontSize: "12px", 
          margin: "12px 0",
          display: "flex",
          gap: "8px",
          alignItems: "center"
        }}>
          {message.type === "error" ? <AlertCircle size={14} /> : <Check size={14} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Previews / Validation Panel */}
      {previewExpenses.length > 0 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", fontWeight: "600" }}>Preview Transactions ({previewExpenses.length})</span>
            {activeTab === "pdf" && apiKey && (
              <button 
                className="btn btn-secondary" 
                style={{ padding: "4px 8px", fontSize: "11px" }} 
                onClick={handleAIPdfParse}
                disabled={isLoading}
              >
                {isLoading ? "Running AI..." : "Optimize with Claude"}
              </button>
            )}
          </div>
          
          {/* Scrollable list */}
          <div style={{ 
            flex: 1, 
            maxHeight: "180px", 
            overflowY: "auto", 
            border: "1px solid var(--border-color)", 
            borderRadius: "8px",
            background: "var(--bg-surface-elevated)"
          }}>
            {previewExpenses.map((exp, idx) => (
              <div key={idx} style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center", 
                padding: "8px 12px", 
                fontSize: "12px",
                borderBottom: idx === previewExpenses.length - 1 ? "none" : "1px solid var(--border-color)"
              }}>
                <div style={{ minWidth: 0, marginRight: "8px" }}>
                  <div style={{ fontWeight: "500", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {exp.description}
                  </div>
                   <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                    {exp.date}
                  </div>
                </div>
                <div style={{ fontWeight: "600", color: "var(--color-indigo)" }}>
                  ₹{exp.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <button className="btn btn-primary" style={{ flex: 1, padding: "8px" }} onClick={handleConfirmImport} disabled={isLoading}>
              Confirm Import
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ padding: "8px" }} 
              onClick={() => { setPreviewExpenses([]); setExtractedPdfText(""); setMessage(null); }}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
