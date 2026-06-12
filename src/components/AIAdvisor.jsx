import React, { useState, useRef } from "react";
import { ScanLine, Camera, Loader2, Plus, AlertCircle, Check } from "lucide-react";

export default function AIReceiptScanner({ onAddExpense, apiKey }) {
  const [scannedExpense, setScannedExpense] = useState(null);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const scannerInputRef = useRef(null);

  // Handle Receipt Image Drag/Upload
  const handleReceiptFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processReceiptImage(e.target.files[0]);
    }
  };

  const handleDragReceipt = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDropReceipt = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processReceiptImage(e.dataTransfer.files[0]);
    }
  };

  const processReceiptImage = (file) => {
    if (!apiKey) {
      setScanMessage({ type: "error", text: "Please enter your Claude API key in the top header widget first!" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      setScanMessage({ type: "error", text: "Please upload an image file (PNG, JPG, WEBP)." });
      return;
    }

    setScannerLoading(true);
    setScannedExpense(null);
    setScanMessage(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Data = reader.result.split(",")[1];
        const mediaType = file.type;

        // Call Claude Messages Vision API
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
            max_tokens: 500,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "image",
                    source: {
                      type: "base64",
                      media_type: mediaType,
                      data: base64Data
                    }
                  },
                  {
                    type: "text",
                    text: `Analyze this bill or receipt image. Extract:
1. The transaction Date in YYYY-MM-DD format (look for date of purchase. If year is missing or unclear, default to 2026. If no date found, return current date).
2. Clean Description (merchant/store name, e.g. "Target", "Starbucks").
3. Amount (Total spent amount, positive float).

Return ONLY a valid JSON object with keys: "date", "description", "amount". No other text.`
                  }
                ]
              }
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`Claude API request failed: ${response.statusText} (${response.status}). Please check your API key.`);
        }

        const resData = await response.json();
        const contentText = resData.content[0].text;
        
        const jsonStart = contentText.indexOf("{");
        const jsonEnd = contentText.lastIndexOf("}") + 1;
        if (jsonStart === -1 || jsonEnd === -1) {
          throw new Error("Could not extract receipt data from response.");
        }

        const cleanJson = contentText.substring(jsonStart, jsonEnd);
        const parsedData = JSON.parse(cleanJson);

        setScannedExpense({
          amount: parseFloat(parsedData.amount) || 0,
          description: parsedData.description || "Scanned Bill",
          date: parsedData.date || new Date().toISOString().split("T")[0]
        });

        setScanMessage({ type: "success", text: "Receipt scanned successfully! Review below:" });

      } catch (err) {
        setScanMessage({ type: "error", text: "Vision Scanning Error: " + err.message });
      } finally {
        setScannerLoading(false);
      }
    };
  };

  const handleAddScannedExpense = () => {
    if (!scannedExpense) return;
    onAddExpense({
      id: `scan-${Date.now()}`,
      ...scannedExpense
    });
    setScannedExpense(null);
    setScanMessage({ type: "success", text: "Receipt expense added to tracker!" });
  };

  return (
    <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Panel Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px" }}>
        <ScanLine size={18} style={{ color: "var(--color-indigo)" }} />
        <h3 className="form-label" style={{ fontSize: "16px", margin: 0, fontWeight: "600", color: "var(--text-primary)" }}>
          AI Bill Image Scanner
        </h3>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", justifyContent: "center" }}>
        {!apiKey && (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "12px" }}>
            <AlertCircle size={24} style={{ marginBottom: "8px", color: "var(--color-indigo)", display: "inline" }} />
            <p style={{ fontSize: "13px", marginTop: "8px" }}>
              Please enter your Claude API key in the top header widget to enable bill image scanning.
            </p>
          </div>
        )}

        {apiKey && !scannedExpense && !scannerLoading && (
          <div
            className={`dropzone ${dragActive ? "active" : ""}`}
            onDragEnter={handleDragReceipt}
            onDragOver={handleDragReceipt}
            onDragLeave={handleDragReceipt}
            onDrop={handleDropReceipt}
            onClick={() => scannerInputRef.current.click()}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", borderStyle: "dashed", minHeight: "150px" }}
          >
            <input
              ref={scannerInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleReceiptFileChange}
            />
            <Camera size={28} style={{ color: "var(--text-muted)", marginBottom: "8px" }} />
            <p style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-primary)" }}>
              Upload Receipt Image
            </p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
              Drag & drop bill photo (PNG, JPG, WEBP)
            </p>
          </div>
        )}

        {scannerLoading && (
          <div style={{ textAlign: "center", padding: "24px" }}>
            <Loader2 size={32} style={{ animation: "spin 2s linear infinite", color: "var(--color-indigo)", marginBottom: "8px", display: "inline" }} />
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "8px" }}>
              Claude Vision is parsing the bill image...
            </p>
          </div>
        )}

        {/* Feedback messages */}
        {scanMessage && (
          <div style={{ 
            background: scanMessage.type === "error" ? "rgba(214, 104, 83, 0.08)" : "rgba(126, 161, 114, 0.08)",
            border: `1px solid ${scanMessage.type === "error" ? "rgba(214, 104, 83, 0.2)" : "rgba(126, 161, 114, 0.2)"}`,
            color: scanMessage.type === "error" ? "var(--color-rose)" : "var(--color-emerald)",
            padding: "8px 12px", 
            borderRadius: "8px", 
            fontSize: "12px",
            display: "flex",
            gap: "8px",
            alignItems: "center"
          }}>
            {scanMessage.type === "error" ? <AlertCircle size={14} style={{ flexShrink: 0 }} /> : <Check size={14} style={{ flexShrink: 0 }} />}
            <span>{scanMessage.text}</span>
          </div>
        )}

        {/* Scan result card */}
        {scannedExpense && (
          <div style={{ 
            border: "1px solid var(--border-color)", 
            borderRadius: "12px", 
            padding: "16px", 
            background: "var(--bg-surface-elevated)",
            display: "flex",
            flexDirection: "column",
            gap: "10px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Merchant</span>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>{scannedExpense.description}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Amount</span>
              <span style={{ fontSize: "18px", fontWeight: "700", color: "var(--color-indigo)" }}>₹{scannedExpense.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Date</span>
              <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{scannedExpense.date}</span>
            </div>

            <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
              <button className="btn btn-primary" style={{ flex: 1, padding: "8px" }} onClick={handleAddScannedExpense}>
                <Plus size={14} />
                Add to Tracker
              </button>
              <button 
                className="btn btn-secondary" 
                style={{ padding: "8px" }}
                onClick={() => { setScannedExpense(null); setScanMessage(null); }}
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
