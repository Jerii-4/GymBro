import React, { useMemo, useState } from "react";
import { Session } from "../types";

type Props = {
  sessions: Session[];
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const AttendanceHeatmap: React.FC<Props> = ({ sessions }) => {
  // Store the navigated month's base date
  const [navDate, setNavDate] = useState(() => new Date());

  // Parse all session dates into a Set for O(1) checks (format: YYYY-MM-DD)
  const presentDays = useMemo(() => {
    return new Set(
      sessions.map((s) => {
        const dateObj = new Date(s.performedAt);
        return dateObj.toISOString().slice(0, 10);
      })
    );
  }, [sessions]);

  // Calculate calendar info based on navDate
  const year = navDate.getFullYear();
  const monthIndex = navDate.getMonth();
  const monthName = navDate.toLocaleString("default", { month: "long" });

  const totalDays = useMemo(() => {
    return new Date(year, monthIndex + 1, 0).getDate();
  }, [year, monthIndex]);

  const startDay = useMemo(() => {
    return new Date(year, monthIndex, 1).getDay();
  }, [year, monthIndex]);

  // Navigate to previous month
  const handlePrevMonth = () => {
    setNavDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Navigate to next month
  const handleNextMonth = () => {
    setNavDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Generate calendar cells
  const dayCells = [];
  
  // Offset cells for empty days before the 1st of the month
  for (let i = 0; i < startDay; i++) {
    dayCells.push(<div key={`empty-${i}`} />);
  }

  // Real calendar days
  for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
    const currentMonthStr = String(monthIndex + 1).padStart(2, "0");
    const currentDayStr = String(dayNum).padStart(2, "0");
    const dateStr = `${year}-${currentMonthStr}-${currentDayStr}`;
    
    const isAttended = presentDays.has(dateStr);

    dayCells.push(
      <div
        key={`day-${dayNum}`}
        title={isAttended ? `Gym session logged on ${dateStr}` : `Rest day on ${dateStr}`}
        style={{
          height: "42px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "10px",
          fontSize: "0.9rem",
          fontWeight: "600",
          cursor: "default",
          transition: "all 0.15s ease",
          background: isAttended ? "linear-gradient(to right, #00f2fe, #a18cd1)" : "#121620",
          color: isAttended ? "#0b0e14" : "#7a8190",
          border: isAttended ? "1px solid rgba(0, 242, 254, 0.4)" : "1px solid #1f2430",
          boxShadow: isAttended ? "0 0 10px rgba(0, 242, 254, 0.25)" : "none",
        }}
      >
        {dayNum}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "420px", margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h2 style={{ color: "#e9ecf5", margin: "0 0 8px", fontSize: "1.8rem" }}>Attendance Tracker</h2>
        <p className="muted" style={{ margin: 0, fontSize: "0.95rem" }}>
          Navigate through your training history.
        </p>
      </div>

      <div
        className="card"
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Navigation Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #1f2430",
            paddingBottom: "14px",
          }}
        >
          <button
            onClick={handlePrevMonth}
            style={{
              padding: "6px 12px",
              fontSize: "0.85rem",
              background: "#161b26",
              border: "1px solid #1f2430",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "border-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(0, 242, 254, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#1f2430";
            }}
          >
            <span className="gradient-text">← Prev</span>
          </button>
          
          <h3 style={{ color: "#e9ecf5", margin: 0, fontSize: "1.15rem", fontWeight: "700" }}>
            {monthName} {year}
          </h3>

          <button
            onClick={handleNextMonth}
            style={{
              padding: "6px 12px",
              fontSize: "0.85rem",
              background: "#161b26",
              border: "1px solid #1f2430",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "border-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(0, 242, 254, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#1f2430";
            }}
          >
            <span className="gradient-text">Next →</span>
          </button>
        </div>

        {/* Weekdays Labels Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            textAlign: "center",
            gap: "8px",
          }}
        >
          {WEEKDAYS.map((day) => (
            <span
              key={day}
              style={{
                fontSize: "0.8rem",
                fontWeight: "700",
                color: "#7a8190",
              }}
            >
              {day}
            </span>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "8px",
          }}
        >
          {dayCells}
        </div>
      </div>
    </div>
  );
};



