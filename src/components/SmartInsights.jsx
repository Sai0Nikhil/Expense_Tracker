import React from "react";
import { Sparkles, AlertCircle, CheckCircle, Info } from "lucide-react";

export default function SmartInsights({ expenses }) {
  // Category totals
  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

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
      text: `Largest expense: ₹${largest.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} for "${largest.description}" on ${largest.date}.`
    });

    // 2. Check Luxury vs Necessity
    const foodTotal = categoryTotals["Food"] || 0;
    const shoppingTotal = categoryTotals["Shopping"] || 0;
    const entTotal = categoryTotals["Entertainment"] || 0;
    const luxurySum = foodTotal + shoppingTotal + entTotal;
    const luxuryRatio = totalSpent > 0 ? (luxurySum / totalSpent) * 100 : 0;

    if (luxuryRatio > 50) {
      list.push({
        type: "warning",
        text: `Leisure spending (Food, Shopping, Entertainment) is high at ${luxuryRatio.toFixed(0)}% of total. Consider setting strict weekly limits.`
      });
    } else if (luxuryRatio > 0) {
      list.push({
        type: "success",
        text: `Leisure spending is healthy at ${luxuryRatio.toFixed(0)}% of your total budget. Good job maintaining balance!`
      });
    }

    // 3. Category Specific Checks
    if (foodTotal > 0 && totalSpent > 0) {
      const foodRatio = (foodTotal / totalSpent) * 100;
      if (foodRatio > 35) {
        list.push({
          type: "warning",
          text: `Dining & Groceries consume ${foodRatio.toFixed(0)}% of your budget. Try planning meals at home to trim down.`
        });
      }
    }

    if (shoppingTotal > 0 && totalSpent > 0) {
      const shopRatio = (shoppingTotal / totalSpent) * 100;
      if (shopRatio > 25) {
        list.push({
          type: "warning",
          text: `Shopping takes up ${shopRatio.toFixed(0)}% of your budget. Delay impulse buys for 48 hours to check necessity.`
        });
      }
    }

    // 4. Default saving suggestion if total is not empty
    const recommendedSavings = totalSpent * 0.2;
    list.push({
      type: "success",
      text: `Aim to set aside at least ₹${recommendedSavings.toLocaleString("en-IN", { maximumFractionDigits: 0 })} (20%) this month for savings/investments.`
    });

    return list.slice(0, 3); // Return top 3 most relevant insights
  };

  const insights = getInsights();

  return (
    <div className="glass-card col-span-3" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
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
