import React, { useState, useEffect } from "react";
import { initialExpenses } from "./utils/initialData";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import { TrendChart, CategoryDonut } from "./components/Charts";
import BulkImport from "./components/BulkImport";
import AIReceiptScanner from "./components/AIAdvisor";
import SmartInsights from "./components/SmartInsights";
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  Calendar, 
  Activity, 
  PieChart, 
  Sparkles,
  LayoutDashboard,
  Settings,
  ShieldCheck
} from "lucide-react";

export default function App() {
  // Load expenses from localStorage or fall back to empty array
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("expenses");
    return saved ? JSON.parse(saved) : [];
  });

  // Save expenses to localStorage when updated
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  // Load API Key from localStorage
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem("claude_api_key") || "";
  });

  const [tempKey, setTempKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [keySavedMessage, setKeySavedMessage] = useState(false);

  const handleSaveKey = (e) => {
    e.preventDefault();
    setApiKey(tempKey.trim());
    localStorage.setItem("claude_api_key", tempKey.trim());
    setKeySavedMessage(true);
    setTimeout(() => setKeySavedMessage(false), 3500);
  };

  // Add a single expense
  const handleAddExpense = (newExpense) => {
    setExpenses((prev) => [newExpense, ...prev]);
  };

  // Delete an expense
  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  // Import multiple expenses
  const handleImportExpenses = (newExpenses) => {
    setExpenses((prev) => [...newExpenses, ...prev]);
  };

  // Calculations for KPI Cards
  const getKpis = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0"); 
    const prevMonthVal = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const prevMonthYear = now.getMonth() === 0 ? currentYear - 1 : currentYear;
    const prevMonth = String(prevMonthVal + 1).padStart(2, "0");

    const curMonthExpenses = expenses.filter(e => e.date.startsWith(`${currentYear}-${currentMonth}`));
    const curMonthSpent = curMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    const prevMonthExpenses = expenses.filter(e => e.date.startsWith(`${prevMonthYear}-${prevMonth}`));
    const prevMonthSpent = prevMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    let diffPercent = 0;
    let isUp = true;
    if (prevMonthSpent > 0) {
      diffPercent = ((curMonthSpent - prevMonthSpent) / prevMonthSpent) * 100;
      isUp = diffPercent > 0;
      diffPercent = Math.abs(diffPercent);
    } else if (curMonthSpent > 0) {
      diffPercent = 100;
      isUp = true;
    }

    const daysInCurrentMonthPassed = now.getDate();
    const dailyAverage = daysInCurrentMonthPassed > 0 ? curMonthSpent / daysInCurrentMonthPassed : 0;

    const categoryTotals = expenses.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});
    
    let highestCategory = "None";
    let highestAmount = 0;
    Object.keys(categoryTotals).forEach(cat => {
      if (categoryTotals[cat] > highestAmount) {
        highestAmount = categoryTotals[cat];
        highestCategory = cat;
      }
    });

    let healthScore = 100;
    const totalSpentAllTime = expenses.reduce((sum, e) => sum + e.amount, 0);
    if (totalSpentAllTime > 0) {
      const foodTotal = categoryTotals["Food"] || 0;
      const shoppingTotal = categoryTotals["Shopping"] || 0;
      const entertainmentTotal = categoryTotals["Entertainment"] || 0;
      
      const luxuryRatio = (foodTotal + shoppingTotal + entertainmentTotal) / totalSpentAllTime;
      
      if (luxuryRatio > 0.5) healthScore -= 25;
      else if (luxuryRatio > 0.35) healthScore -= 12;

      if (curMonthSpent > 3000) healthScore -= 15;
      else if (curMonthSpent > 1500) healthScore -= 8;
    }
    healthScore = Math.max(healthScore, 35); 

    return {
      curMonthSpent,
      prevMonthSpent,
      diffPercent,
      isUp,
      dailyAverage,
      highestCategory,
      healthScore
    };
  };

  const kpis = getKpis();

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        {/* App Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "36px" }}>
          <div style={{ 
            width: "36px", 
            height: "36px", 
            borderRadius: "12px", 
            background: "linear-gradient(135deg, var(--color-indigo), var(--color-rose))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow-glow)"
          }}>
            <Sparkles size={18} style={{ color: "white" }} />
          </div>
          <span style={{ fontSize: "18px", fontWeight: "700", fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
            Obsidian Pay
          </span>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1 }}>
          <div className="nav-item active">
            <LayoutDashboard size={18} />
            Dashboard
          </div>
          <div className="nav-item" onClick={() => {
            if (confirm("Are you sure you want to clear all transactions to start fresh?")) {
              setExpenses([]);
            }
          }}>
            <Activity size={18} />
            Clear All Data
          </div>
          <div className="nav-item" onClick={() => {
            if (confirm("Are you sure you want to load the demo default data?")) {
              setExpenses(initialExpenses);
            }
          }}>
            <Sparkles size={18} />
            Load Demo Data
          </div>
        </nav>

        {/* Footer info */}
        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "16px", fontSize: "12px", color: "var(--text-muted)" }}>
          <p>Local Storage Active</p>
          <p style={{ marginTop: "4px" }}>Build v1.3.0 (Gemini 3.5)</p>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        {/* Welcome Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-secondary)", fontWeight: "700" }}>
              Workspace Dashboard
            </span>
            <h1 style={{ fontSize: "32px", fontWeight: "700", marginTop: "4px", color: "var(--text-primary)" }}>
              Financial Command Center
            </h1>
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: "14px", fontFamily: "var(--font-heading)", fontWeight: "500" }}>
            {new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Top Prominent API Configuration Bar */}
        <div className="header-config-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShieldCheck size={18} style={{ color: "var(--color-indigo)" }} />
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>
              Claude AI Assistant Setup:
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="indicator-pulse" style={{ color: apiKey ? "var(--color-emerald)" : "var(--color-rose)" }}></span>
              <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "700" }}>
                {apiKey ? "Active (Connected)" : "Offline (Key Required)"}
              </span>
            </div>
          </div>
          
          <form onSubmit={handleSaveKey} style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, maxWidth: "550px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type={showKey ? "text" : "password"}
                className="form-input"
                style={{ paddingRight: "46px", paddingLeft: "12px", height: "36px", fontSize: "12px" }}
                placeholder="Paste Anthropic API Key here (sk-ant-...)"
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  fontSize: "11px",
                  fontWeight: "600"
                }}
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: "0 16px", height: "36px", fontSize: "12px" }}>
              Save
            </button>
          </form>
          {keySavedMessage && (
            <span className="animate-fade-in" style={{ fontSize: "12px", color: "var(--color-emerald)", fontWeight: "700" }}>✓ Saved!</span>
          )}
        </div>

        {/* KPI Metrics Grid */}
        <div className="grid-layout">
          {/* Card 1: Total Spent */}
          <div className="glass-card col-span-3 metric-card">
            <div className="metric-header">
              <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "700", letterSpacing: "0.05em" }}>MONTH TO DATE</span>
              <div className="metric-icon" style={{ background: "rgba(223, 122, 94, 0.08)", color: "var(--color-indigo)" }}>
                <IndianRupee size={20} />
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
                ₹{kpis.curMonthSpent.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", fontSize: "12px" }}>
                <span style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  color: kpis.isUp ? "var(--color-rose)" : "var(--color-emerald)", 
                  fontWeight: "700" 
                }}>
                  {kpis.isUp ? <TrendingUp size={14} style={{ marginRight: "3px" }} /> : <TrendingDown size={14} style={{ marginRight: "3px" }} />}
                  {kpis.diffPercent.toFixed(1)}%
                </span>
                <span style={{ color: "var(--text-muted)" }}>vs last month</span>
              </div>
            </div>
          </div>

          {/* Card 2: Daily Average */}
          <div className="glass-card col-span-3 metric-card">
            <div className="metric-header">
              <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "700", letterSpacing: "0.05em" }}>DAILY AVERAGE</span>
              <div className="metric-icon" style={{ background: "rgba(204, 167, 162, 0.1)", color: "var(--color-violet)" }}>
                <Calendar size={20} />
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
                ₹{kpis.dailyAverage.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "8px" }}>
                Calculated on active month days
              </p>
            </div>
          </div>

          {/* Card 3: Top Category */}
          <div className="glass-card col-span-3 metric-card">
            <div className="metric-header">
              <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "700", letterSpacing: "0.05em" }}>TOP CATEGORY</span>
              <div className="metric-icon" style={{ background: "rgba(232, 169, 124, 0.1)", color: "var(--color-amber)" }}>
                <PieChart size={20} />
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
                {kpis.highestCategory}
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "8px" }}>
                Consumes most budget alloc.
              </p>
            </div>
          </div>

          {/* Card 4: Health Score */}
          <div className="glass-card col-span-3 metric-card">
            <div className="metric-header">
              <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "700", letterSpacing: "0.05em" }}>HEALTH SCORE</span>
              <div className="metric-icon" style={{ 
                background: kpis.healthScore > 75 ? "rgba(126, 161, 114, 0.08)" : "rgba(232, 169, 124, 0.08)", 
                color: kpis.healthScore > 75 ? "var(--color-emerald)" : "var(--color-amber)"
              }}>
                <Activity size={20} />
              </div>
            </div>
            <div>
              <h2 style={{ 
                fontSize: "28px", 
                fontWeight: "700", 
                letterSpacing: "-0.03em",
                color: kpis.healthScore > 75 ? "var(--color-emerald)" : "var(--color-amber)"
              }}>
                {kpis.healthScore} <span style={{ fontSize: "16px", fontWeight: "500", color: "var(--text-muted)" }}>/ 100</span>
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "8px" }}>
                {kpis.healthScore > 75 ? "Excellent budget discipline" : "High leisure spend detected"}
              </p>
            </div>
          </div>
        </div>

        {/* Charts & Offline Insights Row */}
        <div className="grid-layout">
          <TrendChart expenses={expenses} />
          <CategoryDonut expenses={expenses} />
          <SmartInsights expenses={expenses} />
        </div>

        {/* Input & Upload Actions Row */}
        <div className="grid-layout">
          <div className="col-span-4">
            <ExpenseForm onAddExpense={handleAddExpense} />
          </div>

          <div className="col-span-4">
            <BulkImport onImportExpenses={handleImportExpenses} apiKey={apiKey} />
          </div>

          <div className="col-span-4">
            <AIReceiptScanner 
              onAddExpense={handleAddExpense} 
              apiKey={apiKey} 
            />
          </div>
        </div>

        {/* Bottom Section: Searchable Expense Table List */}
        <div className="col-span-12">
          <ExpenseList expenses={expenses} onDeleteExpense={handleDeleteExpense} />
        </div>
      </main>
    </div>
  );
}
