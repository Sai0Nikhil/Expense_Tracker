import React, { useState } from "react";
import { CATEGORIES } from "../utils/initialData";
import { PlusCircle, Calendar, IndianRupee, Tag, FileText } from "lucide-react";

export default function ExpenseForm({ onAddExpense }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("Food");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description");
      return;
    }

    if (!date) {
      setError("Please select a date");
      return;
    }

    const newExpense = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      amount: parsedAmount,
      description: description.trim(),
      date,
      category
    };

    onAddExpense(newExpense);

    // Reset fields except date and category for faster double entries
    setAmount("");
    setDescription("");
  };

  return (
    <div className="glass-card">
      <h3 className="form-label" style={{ fontSize: "16px", marginBottom: "16px", fontWeight: "600", color: "var(--text-primary)" }}>
        Add New Expense
      </h3>

      {error && (
        <div style={{ 
          background: "rgba(244, 63, 94, 0.1)", 
          border: "1px solid rgba(244, 63, 94, 0.2)", 
          color: "var(--color-rose)", 
          padding: "10px 14px", 
          borderRadius: "8px", 
          fontSize: "13px", 
          marginBottom: "16px" 
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Amount Input */}
        <div className="form-group">
          <label className="form-label">
            <IndianRupee size={13} style={{ marginRight: "4px", verticalAlign: "middle" }} />
            Amount (₹)
          </label>
          <div style={{ position: "relative" }}>
            <input
              type="number"
              step="0.01"
              className="form-input"
              style={{ fontSize: "18px", fontWeight: "600", paddingLeft: "36px" }}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <span style={{ 
              position: "absolute", 
              left: "14px", 
              top: "50%", 
              transform: "translateY(-50%)", 
              color: "var(--text-muted)",
              fontSize: "18px",
              fontWeight: "600"
            }} stroke="currentColor">₹</span>
          </div>
        </div>

        {/* Description Input */}
        <div className="form-group">
          <label className="form-label">
            <FileText size={13} style={{ marginRight: "4px", verticalAlign: "middle" }} />
            Description
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Weekly Groceries"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Date Input */}
        <div className="form-group">
          <label className="form-label">
            <Calendar size={13} style={{ marginRight: "4px", verticalAlign: "middle" }} />
            Date
          </label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Category Picker */}
        <div className="form-group" style={{ marginBottom: "24px" }}>
          <label className="form-label">
            <Tag size={13} style={{ marginRight: "4px", verticalAlign: "middle" }} />
            Category
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-btn ${category === cat ? "active" : ""}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
          <PlusCircle size={16} />
          Add Expense
        </button>
      </form>
    </div>
  );
}
