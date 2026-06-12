import React, { useState } from "react";

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
    <div className="glass-card col-span-8">
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
