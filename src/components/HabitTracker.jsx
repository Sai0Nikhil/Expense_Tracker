import React, { useState } from "react";
import { 
  Sparkles, 
  Plus, 
  Check, 
  Trash2, 
  Flame, 
  CheckCircle2, 
  Circle,
  LayoutDashboard,
  Calendar,
  Activity,
  LogOut
} from "lucide-react";
import { initialHabits } from "../utils/initialData";

export default function HabitTracker({ habits, setHabits, onSwitchApp, activeQuote }) {
  const [newHabitName, setNewHabitName] = useState("");
  const [error, setError] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  // Add a new habit
  const handleAddHabit = (e) => {
    e.preventDefault();
    setError("");

    if (!newHabitName.trim()) {
      setError("Please enter a habit name");
      return;
    }

    const duplicate = habits.find(
      (h) => h.name.toLowerCase() === newHabitName.trim().toLowerCase()
    );
    if (duplicate) {
      setError("You are already tracking this habit!");
      return;
    }

    const newHabit = {
      id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: newHabitName.trim(),
      createdAt: todayStr,
      history: []
    };

    setHabits((prev) => [newHabit, ...prev]);
    setNewHabitName("");
  };

  // Toggle habit done for today
  const handleToggleHabit = (id) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit;

        const alreadyDoneToday = habit.history.includes(todayStr);
        let updatedHistory;
        if (alreadyDoneToday) {
          updatedHistory = habit.history.filter((date) => date !== todayStr);
        } else {
          updatedHistory = [...habit.history, todayStr];
        }

        return {
          ...habit,
          history: updatedHistory
        };
      })
    );
  };

  // Delete a habit
  const handleDeleteHabit = (id) => {
    if (confirm("Are you sure you want to delete this habit?")) {
      setHabits((prev) => prev.filter((h) => h.id !== id));
    }
  };

  // Calculate Streak Helper
  const calculateStreak = (history) => {
    if (!history || history.length === 0) return 0;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Check if completed today or yesterday. If neither, streak is 0.
    if (!history.includes(todayStr) && !history.includes(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    let currentDate = new Date();

    // If not completed today but completed yesterday, start checking from yesterday
    if (!history.includes(todayStr)) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    while (true) {
      const dateStr = currentDate.toISOString().split("T")[0];
      if (history.includes(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  // Metrics calculations
  const totalHabits = habits.length;
  const completedTodayCount = habits.filter((h) => h.history.includes(todayStr)).length;
  const completionRateToday = totalHabits > 0 ? Math.round((completedTodayCount / totalHabits) * 100) : 0;

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
            <Check size={18} style={{ color: "white" }} />
          </div>
          <span style={{ fontSize: "18px", fontWeight: "700", fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
            Obsidian Habits
          </span>
        </div>

        {/* Nav Links */}
        <nav style={{ flex: 1 }}>
          <div className="nav-item active">
            <LayoutDashboard size={18} />
            Dashboard
          </div>
          <div className="nav-item" onClick={() => {
            if (confirm("Are you sure you want to clear all habits?")) {
              setHabits([]);
            }
          }}>
            <Activity size={18} />
            Clear All Habits
          </div>
          <div className="nav-item" onClick={() => {
            if (confirm("Are you sure you want to load the demo default habits?")) {
              setHabits(initialHabits);
            }
          }}>
            <Sparkles size={18} />
            Load Demo Habits
          </div>
          <div className="nav-item" onClick={onSwitchApp} style={{ marginTop: "24px", borderTop: "1px solid var(--border-color)", paddingTop: "16px" }}>
            <LogOut size={18} style={{ color: "var(--color-rose)" }} />
            Switch Application
          </div>
        </nav>

        {/* Quotes widget */}
        <div style={{ 
          borderTop: "1px solid var(--border-color)", 
          paddingTop: "20px", 
          fontSize: "11px", 
          color: "var(--text-muted)",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>
          <div style={{ fontStyle: "italic", lineHeight: "1.4", color: "var(--text-secondary)" }} className="animate-fade-in">
            "{activeQuote.text}"
            <div style={{ fontWeight: "700", fontSize: "9px", textTransform: "uppercase", marginTop: "4px", color: "var(--color-indigo)" }}>
              — {activeQuote.author}
            </div>
          </div>
          <div style={{ fontSize: "10px", marginTop: "4px", display: "flex", justifyContent: "space-between" }}>
            <span>Build v1.4.0</span>
            <span style={{ cursor: "pointer", color: "var(--color-rose)", fontWeight: "600" }} onClick={onSwitchApp}>Exit</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Welcome Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-secondary)", fontWeight: "700" }}>
              Habit Workspace
            </span>
            <h1 style={{ fontSize: "32px", fontWeight: "700", marginTop: "4px", color: "var(--text-primary)" }}>
              Habit Command Center
            </h1>
          </div>
          <div style={{ color: "var(--text-secondary)", fontSize: "14px", fontFamily: "var(--font-heading)", fontWeight: "500" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid-layout" style={{ marginTop: "24px" }}>
          {/* Card 1: Total Habits */}
          <div className="glass-card col-span-4 metric-card">
            <div className="metric-header">
              <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "700", letterSpacing: "0.05em" }}>TOTAL HABITS</span>
              <div className="metric-icon" style={{ background: "rgba(79, 70, 229, 0.08)", color: "var(--color-indigo)" }}>
                <Calendar size={20} />
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-primary)" }}>
                {totalHabits}
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "8px" }}>
                Active habits currently tracked
              </p>
            </div>
          </div>

          {/* Card 2: Completed Today */}
          <div className="glass-card col-span-4 metric-card">
            <div className="metric-header">
              <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "700", letterSpacing: "0.05em" }}>COMPLETED TODAY</span>
              <div className="metric-icon" style={{ background: "rgba(16, 185, 129, 0.08)", color: "var(--color-emerald)" }}>
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-primary)" }}>
                {completedTodayCount} <span style={{ fontSize: "16px", fontWeight: "500", color: "var(--text-muted)" }}>/ {totalHabits}</span>
              </h2>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "8px" }}>
                Completed items for today
              </p>
            </div>
          </div>

          {/* Card 3: Completion Rate */}
          <div className="glass-card col-span-4 metric-card">
            <div className="metric-header">
              <span style={{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "700", letterSpacing: "0.05em" }}>PROGRESS SCORE</span>
              <div className="metric-icon" style={{ background: "rgba(244, 63, 94, 0.08)", color: "var(--color-rose)" }}>
                <Activity size={20} />
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: "28px", fontWeight: "700", color: "var(--text-primary)" }}>
                {completionRateToday}%
              </h2>
              {/* Simple progress bar */}
              <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.05)", borderRadius: "3px", marginTop: "14px", overflow: "hidden" }}>
                <div style={{ width: `${completionRateToday}%`, height: "100%", background: "var(--color-indigo)", borderRadius: "3px", transition: "width 0.4s ease-out" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid Actions & List */}
        <div className="grid-layout" style={{ marginTop: "24px" }}>
          {/* Left: Add Habit Card */}
          <div className="col-span-4">
            <div className="glass-card">
              <h3 className="form-label" style={{ fontSize: "16px", marginBottom: "16px", fontWeight: "600", color: "var(--text-primary)" }}>
                Track New Habit
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

              <form onSubmit={handleAddHabit}>
                <div className="form-group" style={{ marginBottom: "20px" }}>
                  <label className="form-label">Habit Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Read books, exercise..."
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                  <Plus size={16} />
                  Add Habit
                </button>
              </form>
            </div>
          </div>

          {/* Right: Habits Grid List */}
          <div className="col-span-8">
            <div className="glass-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <h3 className="form-label" style={{ fontSize: "16px", marginBottom: "16px", fontWeight: "600", color: "var(--text-primary)" }}>
                Your Habits
              </h3>

              {habits.length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "180px", color: "var(--text-muted)", fontSize: "14px" }}>
                  No habits tracked yet. Add one to get started!
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
                  {habits.map((habit) => {
                    const isDoneToday = habit.history.includes(todayStr);
                    const streak = calculateStreak(habit.history);
                    return (
                      <div 
                        key={habit.id} 
                        className="glass-card" 
                        style={{ 
                          padding: "16px", 
                          background: isDoneToday ? "rgba(126, 161, 114, 0.06)" : "var(--bg-surface-elevated)",
                          borderColor: isDoneToday ? "rgba(126, 161, 114, 0.2)" : "var(--border-color)",
                          transition: "all 0.2s ease",
                          position: "relative",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          gap: "12px"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                          <span style={{ fontWeight: "600", fontSize: "14px", color: "var(--text-primary)", wordBreak: "break-word" }}>
                            {habit.name}
                          </span>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: "4px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                            onClick={() => handleDeleteHabit(habit.id)}
                            title="Delete habit"
                          >
                            <Trash2 size={13} style={{ color: "var(--color-rose)" }} />
                          </button>
                        </div>

                        {/* Streak details */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--text-secondary)" }}>
                          <Flame size={14} style={{ color: streak > 0 ? "var(--color-rose)" : "var(--text-muted)" }} />
                          <span>Streak: <strong style={{ color: streak > 0 ? "var(--color-rose)" : "var(--text-primary)" }}>{streak} days</strong></span>
                        </div>

                        {/* Complete Today trigger */}
                        <button
                          onClick={() => handleToggleHabit(habit.id)}
                          className={`btn ${isDoneToday ? "btn-primary" : "btn-secondary"}`}
                          style={{ 
                            width: "100%", 
                            padding: "8px", 
                            fontSize: "12px", 
                            background: isDoneToday ? "var(--color-emerald)" : "",
                            borderColor: isDoneToday ? "var(--color-emerald)" : "",
                            color: isDoneToday ? "white" : "",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px"
                          }}
                        >
                          {isDoneToday ? (
                            <>
                              <Check size={14} />
                              Completed
                            </>
                          ) : (
                            <>
                              <Circle size={12} />
                              Mark Done
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
