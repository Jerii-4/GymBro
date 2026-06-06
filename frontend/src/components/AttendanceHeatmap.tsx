import React, { useMemo, useState } from "react";
import { Session } from "../types";
import { useLocalStore } from "../hooks/useLocalStore";

type Props = {
  sessions: Session[];
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const AttendanceHeatmap: React.FC<Props> = ({ sessions }) => {
  // Store the navigated month's base date
  const [navDate, setNavDate] = useState(() => new Date());

  // Get user account creation date from store
  const userCreatedAt = useLocalStore((state) => state.userCreatedAt);

  const createdDate = useMemo(() => {
    if (!userCreatedAt) return null;
    return new Date(userCreatedAt);
  }, [userCreatedAt]);

  // Today's date string in local timezone (YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const dMonth = String(d.getMonth() + 1).padStart(2, "0");
    const dDay = String(d.getDate()).padStart(2, "0");
    return `${y}-${dMonth}-${dDay}`;
  }, []);

  // Format catchy started sentence
  const catchyStartText = useMemo(() => {
    if (!createdDate) return null;
    const formatted = createdDate.toLocaleDateString("default", { month: "short", day: "numeric" });
    return `⚡ The Grind Started on ${formatted}!`;
  }, [createdDate]);

  // Map date strings (YYYY-MM-DD) to session objects for metadata checks
  const dateToSessionMap = useMemo(() => {
    const map = new Map<string, Session>();
    sessions.forEach((s) => {
      const dateObj = new Date(s.performedAt);
      const dateStr = dateObj.toISOString().slice(0, 10);
      if (!map.has(dateStr)) {
        map.set(dateStr, s);
      }
    });
    return map;
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

  // Check if previous month is disabled based on registration month
  const prevMonthDisabled = useMemo(() => {
    if (!createdDate) return false;
    const prevMonthDate = new Date(navDate.getFullYear(), navDate.getMonth() - 1, 1);
    const regMonthDate = new Date(createdDate.getFullYear(), createdDate.getMonth(), 1);
    return prevMonthDate < regMonthDate;
  }, [navDate, createdDate]);

  // Navigate to previous month
  const handlePrevMonth = () => {
    if (prevMonthDisabled) return;
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
    
    const session = dateToSessionMap.get(dateStr);
    const isAttended = !!session;
    const isRestDay = session?.dayLabel === "Rest Day";
    const isMissed = !isAttended && dateStr < todayStr;

    // Check if cell date is prior to user account creation
    const cellDate = new Date(year, monthIndex, dayNum);
    const regDayOnly = createdDate ? new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate()) : null;
    const isBeforeRegistration = regDayOnly && cellDate < regDayOnly;

    let cellBackground = "#121620";
    let cellColor = "#7a8190";
    let cellBorder = "1px solid #1f2430";
    let cellBoxShadow = "none";
    let cellTitle = `No Log on ${dateStr}`;

    if (isBeforeRegistration) {
      cellBackground = "#121620";
      cellColor = "#7a8190";
      cellBorder = "1px solid #1f2430";
      cellTitle = `No Log on ${dateStr}`;
    } else if (isAttended) {
      if (isRestDay) {
        cellBackground = "linear-gradient(to right, #10b981, #059669)";
        cellColor = "#ffffff";
        cellBorder = "1px solid rgba(16, 185, 129, 0.4)";
        cellBoxShadow = "0 0 10px rgba(16, 185, 129, 0.25)";
        cellTitle = `Rest Day on ${dateStr}`;
      } else {
        cellBackground = "linear-gradient(to right, #00f2fe, #a18cd1)";
        cellColor = "#0b0e14";
        cellBorder = "1px solid rgba(0, 242, 254, 0.4)";
        cellBoxShadow = "0 0 10px rgba(0, 242, 254, 0.25)";
        cellTitle = `${session.dayLabel} on ${dateStr}`;
      }
    } else if (isMissed) {
      cellBackground = "rgba(239, 68, 68, 0.05)";
      cellColor = "rgba(239, 68, 68, 0.6)";
      cellBorder = "1px solid rgba(239, 68, 68, 0.2)";
      cellTitle = `Missed on ${dateStr}`;
    } else if (dateStr === todayStr) {
      cellTitle = `Today - Not logged yet`;
    }

    // Apply a unique border style for today's date cell
    if (dateStr === todayStr) {
      cellBorder = "2px solid #ff4a5a";
      cellBoxShadow = "0 0 12px rgba(255, 74, 90, 0.5)";
    }

    dayCells.push(
      <div
        key={`day-${dayNum}`}
        title={cellTitle}
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
          background: cellBackground,
          color: cellColor,
          border: cellBorder,
          boxShadow: cellBoxShadow,
        }}
      >
        {dayNum}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "420px", margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "8px" }}>
          <img src="/assets/attendance.png" alt="" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
          <h2 style={{ color: "#e9ecf5", margin: 0, fontSize: "1.8rem" }}>Attendance Tracker</h2>
        </div>
        
        {catchyStartText ? (
          <div 
            style={{ 
              display: "inline-block",
              background: "rgba(0, 242, 254, 0.08)",
              border: "1px solid rgba(0, 242, 254, 0.2)",
              borderRadius: "20px",
              padding: "4px 14px",
              fontSize: "0.88rem",
              fontWeight: 700,
              color: "#00f2fe",
              marginTop: "4px"
            }}
          >
            {catchyStartText}
          </div>
        ) : (
          <p className="muted" style={{ margin: 0, fontSize: "0.95rem" }}>
            Navigate through your training history.
          </p>
        )}
      </div>

      <div
        className="card scrollable-card"
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
            disabled={prevMonthDisabled}
            style={{
              padding: "6px 12px",
              fontSize: "0.85rem",
              background: "#161b26",
              border: "1px solid #1f2430",
              borderRadius: "8px",
              cursor: prevMonthDisabled ? "not-allowed" : "pointer",
              opacity: prevMonthDisabled ? 0.3 : 1,
              transition: "border-color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!prevMonthDisabled) {
                e.currentTarget.style.borderColor = "rgba(0, 242, 254, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!prevMonthDisabled) {
                e.currentTarget.style.borderColor = "#1f2430";
              }
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

        {/* Legend */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginTop: "20px", fontSize: "0.8rem", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "linear-gradient(to right, #00f2fe, #a18cd1)" }} />
            <span style={{ color: "#e9ecf5", fontWeight: "600" }}>Workout Logged</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "linear-gradient(to right, #10b981, #059669)" }} />
            <span style={{ color: "#e9ecf5", fontWeight: "600" }}>Rest Day</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)" }} />
            <span style={{ color: "#e9ecf5", fontWeight: "600" }}>Missed Day</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#121620", border: "1px solid #1f2430" }} />
            <span style={{ color: "#e9ecf5", fontWeight: "600" }}>No Log</span>
          </div>
        </div>
      </div>
    </div>
  );
};
