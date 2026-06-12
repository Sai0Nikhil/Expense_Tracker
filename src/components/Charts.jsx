import React, { useState } from "react";
import { CATEGORY_COLORS_HEX, CATEGORIES } from "../utils/initialData";

export function TrendChart({ expenses }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Group by date for line/area chart (last 7 days of spending)
  const dailyTotals = expenses.reduce((acc, curr) => {
    const date = curr.date;
    acc[date] = (acc[date] || 0) + curr.amount;
    return acc;
  }, {});

  const sortedDates = Object.keys(dailyTotals).sort().slice(-7);
  const chartData = sortedDates.map(date => ({
    date: date.substring(5), // MM-DD format
    fullDate: date,
    amount: dailyTotals[date]
  }));

  // Line/Area Chart SVG coordinates
  const svgWidth = 500;
  const svgHeight = 160;
  const padding = { top: 15, right: 20, bottom: 25, left: 40 };

  const maxAmount = chartData.length > 0 
    ? Math.max(...chartData.map(d => d.amount), 50) 
    : 100;
  
  const chartPoints = chartData.map((d, index) => {
    const x = padding.left + (index / Math.max(chartData.length - 1, 1)) * (svgWidth - padding.left - padding.right);
    const y = svgHeight - padding.bottom - (d.amount / maxAmount) * (svgHeight - padding.top - padding.bottom);
    return { x, y, ...d };
  });

  // Generate paths for Line & Area
  let linePath = "";
  let areaPath = "";
  if (chartPoints.length > 0) {
    linePath = `M ${chartPoints[0].x} ${chartPoints[0].y} ` + chartPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
    areaPath = `${linePath} L ${chartPoints[chartPoints.length - 1].x} ${svgHeight - padding.bottom} L ${chartPoints[0].x} ${svgHeight - padding.bottom} Z`;
  }

  return (
    <div className="glass-card col-span-6">
      <h3 className="form-label" style={{ fontSize: "16px", marginBottom: "4px", fontWeight: "600", color: "var(--text-primary)" }}>
        Spending Trend
      </h3>
      <p className="form-label" style={{ fontSize: "12px", marginBottom: "16px" }}>
        Daily spending activity for the last 7 transaction days
      </p>

      {chartPoints.length === 0 ? (
        <div style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "14px" }}>
          No transaction history to display.
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="100%" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id="chartAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-indigo)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--color-indigo)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = padding.top + ratio * (svgHeight - padding.top - padding.bottom);
              const value = Math.round(maxAmount * (1 - ratio));
              return (
                <g key={idx}>
                  <line 
                    x1={padding.left} 
                    y1={y} 
                    x2={svgWidth - padding.right} 
                    y2={y} 
                    stroke="rgba(0,0,0,0.04)" 
                    strokeDasharray="4 4" 
                  />
                  <text 
                    x={padding.left - 8} 
                    y={y + 4} 
                    fill="var(--text-muted)" 
                    fontSize="9" 
                    textAnchor="end"
                    fontFamily="var(--font-heading)"
                  >
                    ₹{value}
                  </text>
                </g>
              );
            })}

            {/* Area Under Line */}
            {areaPath && (
              <path d={areaPath} fill="url(#chartAreaGradient)" />
            )}

            {/* Main Line */}
            {linePath && (
              <path 
                d={linePath} 
                fill="none" 
                stroke="var(--color-indigo)" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            )}

            {/* Points & Interactive Tooltips */}
            {chartPoints.map((point, idx) => (
              <g key={idx}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredPoint === idx ? "6" : "4"}
                  fill={hoveredPoint === idx ? "var(--color-rose)" : "var(--color-indigo)"}
                  stroke="var(--bg-surface)"
                  strokeWidth="2"
                  style={{ transition: "all 0.1s ease", cursor: "pointer" }}
                  onMouseEnter={() => setHoveredPoint(idx)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                
                {/* X axis labels */}
                <text
                  x={point.x}
                  y={svgHeight - 8}
                  fill="var(--text-secondary)"
                  fontSize="9"
                  textAnchor="middle"
                  fontFamily="var(--font-heading)"
                >
                  {point.date}
                </text>
              </g>
            ))}
          </svg>

          {/* Float Tooltip */}
          {hoveredPoint !== null && (
            <div style={{
              position: "absolute",
              left: `${(chartPoints[hoveredPoint].x / svgWidth) * 100}%`,
              top: `${(chartPoints[hoveredPoint].y / svgHeight) * 100 - 30}%`,
              transform: "translateX(-50%)",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-color)",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              fontFamily: "var(--font-heading)",
              pointerEvents: "none",
              boxShadow: "var(--shadow-md)",
              zIndex: 10,
              whiteSpace: "nowrap"
            }}>
              <span style={{ color: "var(--text-secondary)" }}>{chartPoints[hoveredPoint].fullDate}: </span>
              <span style={{ fontWeight: "600", color: "var(--color-indigo)" }}>₹{chartPoints[hoveredPoint].amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CategoryDonut({ expenses }) {
  const [activeCategory, setActiveCategory] = useState(null);

  // Group by category
  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  // Prepare data for Donut Chart
  const donutData = Object.keys(categoryTotals).map(cat => ({
    category: cat,
    amount: categoryTotals[cat],
    percentage: totalSpent > 0 ? (categoryTotals[cat] / totalSpent) * 100 : 0,
    color: CATEGORY_COLORS_HEX[cat] || "#64748b"
  })).sort((a, b) => b.amount - a.amount);

  const radius = 50;
  const circumference = 2 * Math.PI * radius; // ~314.16
  let accumulatedOffset = 0;

  return (
    <div className="glass-card col-span-3">
      <h3 className="form-label" style={{ fontSize: "16px", marginBottom: "4px", fontWeight: "600", color: "var(--text-primary)" }}>
        Categories
      </h3>
      <p className="form-label" style={{ fontSize: "12px", marginBottom: "16px" }}>
        Breakdown of expenses
      </p>

      {totalSpent === 0 ? (
        <div style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: "14px" }}>
          No data.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          {/* SVG Donut */}
          <div style={{ position: "relative", width: "100px", height: "100px", flexShrink: 0 }}>
            <svg viewBox="0 0 120 120" width="100%" height="100%">
              <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(0,0,0,0.02)" strokeWidth="12" />
              
              {donutData.map((slice, idx) => {
                const strokeLength = (slice.amount / totalSpent) * circumference;
                const strokeOffset = circumference - accumulatedOffset;
                accumulatedOffset += strokeLength;

                return (
                  <circle
                    key={idx}
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={activeCategory === idx ? "15" : "12"}
                    strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                    strokeDashoffset={strokeOffset}
                    transform="rotate(-90 60 60)"
                    style={{ 
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", 
                      cursor: "pointer" 
                    }}
                    onMouseEnter={() => setActiveCategory(idx)}
                    onMouseLeave={() => setActiveCategory(null)}
                  />
                );
              })}
            </svg>

            {/* Text in the center */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              pointerEvents: "none"
            }}>
              <div style={{ fontSize: "8px", textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--font-heading)", fontWeight: "700" }}>
                {activeCategory !== null ? donutData[activeCategory].category : "Total"}
              </div>
              <div style={{ fontSize: "13px", fontWeight: "700", fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
                ₹{(activeCategory !== null ? donutData[activeCategory].amount : totalSpent).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          {/* Legend - small & compact */}
          <div style={{ width: "100%", maxHeight: "80px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
            {donutData.slice(0, 4).map((slice, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  fontSize: "10px",
                  cursor: "pointer",
                  padding: "1px 2px",
                  borderRadius: "4px",
                  background: activeCategory === idx ? "var(--bg-surface-elevated)" : "transparent"
                }}
                onMouseEnter={() => setActiveCategory(idx)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "4px", minWidth: 0 }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: slice.color, flexShrink: 0 }}></span>
                  <span style={{ color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{slice.category}</span>
                </div>
                <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{slice.percentage.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
