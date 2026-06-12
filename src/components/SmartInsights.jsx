import React from "react";
import { Sparkles, AlertCircle, CheckCircle, Info } from "lucide-react";

export default function SmartInsights({ expenses }) {
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);

  // Generate offline insights
  const getInsights = () => {
    const list = [];

    if (expenses.length === 0) {
      return [
        {
          type: "info",
          text: "No transactions logged yet. Add manual expenses or import CSV/PDF to generate instant insights!"
        }
      ];
    }

    // 1. Check Largest Expense
    const sortedByAmount = [...expenses].sort((a, b) => b.amount - a.amount);
    const largest = sortedByAmount[0];
    list.push({
      type: "info",
      text: `Largest single purchase: ₹${largest.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} for "${largest.description}" on ${largest.date}.`
    });

    // 2. Daily average check
    const now = new Date();
    const daysInCurrentMonthPassed = now.getDate();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0"); 
    
    const curMonthExpenses = expenses.filter(e => e.date.startsWith(`${currentYear}-${currentMonth}`));
    const curMonthSpent = curMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const dailyAverage = daysInCurrentMonthPassed > 0 ? curMonthSpent / daysInCurrentMonthPassed : 0;

    if (dailyAverage > 2000) {
      list.push({
        type: "warning",
        text: `Your daily average this month is high at ₹${dailyAverage.toLocaleString("en-IN", { maximumFractionDigits: 0 })}. Consider freezing non-essential spending.`
      });
    } else if (dailyAverage > 500) {
      list.push({
        type: "info",
        text: `Daily spending average: ₹${dailyAverage.toLocaleString("en-IN", { maximumFractionDigits: 0 })}. Keep an eye on recurring expenses.`
      });
    } else if (dailyAverage > 0) {
      list.push({
        type: "success",
        text: `Excellent! Daily spending average is low at ₹${dailyAverage.toLocaleString("en-IN", { maximumFractionDigits: 0 })}. You are staying well within safety limits.`
      });
    }

    // 3. Recommended savings target
    const recommendedSavings = totalSpent * 0.2;
    list.push({
      type: "success",
      text: `Try allocating ₹${recommendedSavings.toLocaleString("en-IN", { maximumFractionDigits: 0 })} (20% of your current outlays) to your investment reserves.`
    });

    return list.slice(0, 3);
  };

  const insights = getInsights();

  return (
    <div className="glass-card col-span-4" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px", marginBottom: "16px" }}>
        <Sparkles size={16} style={{ color: "var(--color-indigo)" }} />
        <h3 className="form-label" style={{ fontSize: "16px", margin: 0, fontWeight: "600", color: "var(--text-primary)" }}>
          Smart Budget Insights
        </h3>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", justifyContent: expenses.length === 0 ? "center" : "flex-start" }}>
        {insights.map((insight, idx) => {
          let Icon = Info;
          let bgColor = "var(--bg-surface-elevated)";
          let borderColor = "var(--border-color)";
          let textColor = "var(--text-secondary)";

          if (insight.type === "warning") {
            Icon = AlertCircle;
            bgColor = "rgba(214, 104, 83, 0.05)";
            borderColor = "rgba(214, 104, 83, 0.15)";
            textColor = "var(--color-rose)";
          } else if (insight.type === "success") {
            Icon = CheckCircle;
            bgColor = "rgba(126, 161, 114, 0.05)";
            borderColor = "rgba(126, 161, 114, 0.15)";
            textColor = "var(--color-emerald)";
          }

          return (
            <div 
              key={idx} 
              style={{
                display: "flex",
                gap: "10px",
                padding: "12px",
                borderRadius: "12px",
                background: bgColor,
                border: `1px solid ${borderColor}`,
                fontSize: "12px",
                lineHeight: "1.5",
                alignItems: "flex-start"
              }}
            >
              <Icon size={16} style={{ color: textColor, flexShrink: 0, marginTop: "2px" }} />
              <span style={{ color: "var(--text-secondary)" }}>{insight.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
