import React, { useMemo, useState, useEffect } from "react";
import { useLocalStore } from "../hooks/useLocalStore";

// Custom SVG icons for PRs (Personal Records)
const SquatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#a18cd1", display: "block" }}>
    <rect x="2" y="11" width="20" height="2" rx="1" fill="currentColor" />
    <rect x="5" y="7" width="2" height="10" rx="1" fill="currentColor" />
    <rect x="3" y="9" width="1.5" height="6" rx="0.75" fill="currentColor" />
    <rect x="17" y="7" width="2" height="10" rx="1" fill="currentColor" />
    <rect x="19.5" y="9" width="1.5" height="6" rx="0.75" fill="currentColor" />
    <path d="M7 17V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M17 17V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M4 19H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const BenchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#4facfe", display: "block" }}>
    <rect x="4" y="13" width="16" height="2" rx="1" fill="currentColor" />
    <path d="M6 15V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 15V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 15V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 8V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M15 8V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="3" y1="8" x2="21" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <rect x="5" y="6" width="1.5" height="4" rx="0.5" fill="currentColor" />
    <rect x="17.5" y="6" width="1.5" height="4" rx="0.5" fill="currentColor" />
  </svg>
);

const DeadliftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#ff0844", display: "block" }}>
    <line x1="2" y1="18" x2="22" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="3" y="12" width="18" height="2" rx="1" fill="currentColor" />
    <rect x="6" y="7" width="2.5" height="12" rx="1.5" fill="currentColor" />
    <rect x="4" y="9" width="1.5" height="8" rx="1" fill="currentColor" />
    <rect x="15.5" y="7" width="2.5" height="12" rx="1.5" fill="currentColor" />
    <rect x="18.5" y="9" width="1.5" height="8" rx="1" fill="currentColor" />
    <line x1="10" y1="13" x2="14" y2="13" stroke="#12151e" strokeWidth="1" />
  </svg>
);

const OverheadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#f9d423", display: "block" }}>
    <rect x="3" y="9" width="18" height="2" rx="1" fill="currentColor" />
    <rect x="6" y="6" width="1.5" height="8" rx="0.75" fill="currentColor" />
    <rect x="16.5" y="6" width="1.5" height="8" rx="0.75" fill="currentColor" />
    <path d="M12 19V13M12 13L10 15M12 13L14 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 20C9.5 19.5 11 19.5 12 19.5C13 19.5 14.5 19.5 16 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PullupIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#00f2fe", display: "block" }}>
    <line x1="2" y1="6" x2="22" y2="6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="4" y1="6" x2="4" y2="12" stroke="currentColor" strokeWidth="1.5" />
    <line x1="20" y1="6" x2="20" y2="12" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 17L9 11L12 14L15 11L17 17H7Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    <circle cx="9" cy="10.5" r="1" fill="currentColor" />
    <circle cx="12" cy="13.5" r="1" fill="currentColor" />
    <circle cx="15" cy="10.5" r="1" fill="currentColor" />
  </svg>
);

export const ProfilePanel: React.FC = () => {
  const username = useLocalStore((s) => s.username) || "GymBro User";

  const [pfp, setPfp] = useState<string>(() => {
    return localStorage.getItem(`gymbro_pfp_${username}`) || "/assets/profile.png";
  });

  useEffect(() => {
    setPfp(localStorage.getItem(`gymbro_pfp_${username}`) || "/assets/profile.png");
  }, [username]);

  const handlePfpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        localStorage.setItem(`gymbro_pfp_${username}`, base64String);
        setPfp(base64String);
      };
      reader.readAsDataURL(file);
    }
  };
  const userCreatedAt = useLocalStore((s) => s.userCreatedAt);
  const sessions = useLocalStore((s) => s.sessions);
  const foods = useLocalStore((s) => s.foods);
  const weightUnit = useLocalStore((s) => s.weightUnit);

  const workoutsCount = sessions.length;

  const totalSets = useMemo(() => {
    return sessions.reduce((acc, s) => acc + s.exercises.reduce((a, e) => a + e.sets.length, 0), 0);
  }, [sessions]);

  const totalReps = useMemo(() => {
    return sessions.reduce(
      (acc, s) =>
        acc +
        s.exercises.reduce(
          (a, e) =>
            a +
            e.sets.reduce((r, set) => r + (set.mode !== "time" ? (set.reps || 0) : 0), 0),
          0
        ),
      0
    );
  }, [sessions]);

  const totalVolume = useMemo(() => {
    return sessions.reduce(
      (acc, s) =>
        acc +
        s.exercises.reduce(
          (a, e) =>
            a +
            e.sets.reduce(
              (w, set) => w + (set.weight ? set.weight * (set.reps || 0) : 0),
              0
            ),
          0
        ),
      0
    );
  }, [sessions]);

  const displayVolume = useMemo(() => {
    if (weightUnit === "lbs") {
      return `${Math.round(totalVolume * 2.20462).toLocaleString()} lbs`;
    }
    return `${totalVolume.toLocaleString()} kg`;
  }, [totalVolume, weightUnit]);

  // Streak calculation
  const activeStreak = useMemo(() => {
    if (sessions.length === 0) return 0;
    const dates = Array.from(new Set(sessions.map((s) => s.performedAt.slice(0, 10))))
      .sort()
      .reverse();
    let streak = 0;
    const today = new Date();
    const currentStr = today.toISOString().slice(0, 10);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (!dates.includes(currentStr) && !dates.includes(yesterdayStr)) {
      return 0;
    }

    const checkDate = dates.includes(currentStr) ? today : yesterday;
    while (true) {
      const checkStr = checkDate.toISOString().slice(0, 10);
      if (dates.includes(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [sessions]);

  // General counts
  const restDaysCount = sessions.filter((s) => s.dayLabel === "Rest Day").length;
  const activeDaysCount = sessions.filter((s) => s.dayLabel !== "Rest Day").length;
  const gymTimeHours = Math.round(activeDaysCount * 0.75 + restDaysCount * 0.2);

  // Best single lift weight
  const bestLiftFormatted = useMemo(() => {
    const maxWeight = Math.max(
      0,
      ...sessions.flatMap((s) => s.exercises.flatMap((e) => e.sets.map((set) => set.weight || 0)))
    );
    if (maxWeight > 0) {
      return weightUnit === "lbs"
        ? `${Math.round(maxWeight * 2.20462)} lbs`
        : `${maxWeight} kg`;
    }
    return "—";
  }, [sessions, weightUnit]);

  // PR / Personal Records extractor
  const getPR = (exName: string) => {
    const weights = sessions.flatMap((s) =>
      s.exercises
        .filter((e) => e.name.toLowerCase().includes(exName.toLowerCase()))
        .flatMap((e) => e.sets.map((set) => set.weight || 0))
    );
    const maxW = Math.max(0, ...weights);
    if (maxW > 0) {
      return weightUnit === "lbs" ? `${Math.round(maxW * 2.20462)} lbs` : `${maxW} kg`;
    }
    return "—";
  };

  const squatPR = useMemo(() => getPR("squat"), [sessions, weightUnit]);
  const benchPR = useMemo(() => getPR("bench"), [sessions, weightUnit]);
  const deadliftPR = useMemo(() => getPR("deadlift"), [sessions, weightUnit]);
  const overheadPR = useMemo(() => getPR("press"), [sessions, weightUnit]);
  const pullupPR = useMemo(() => {
    const reps = sessions.flatMap((s) =>
      s.exercises
        .filter((e) => e.name.toLowerCase().includes("pull") || e.name.toLowerCase().includes("chin"))
        .flatMap((e) => e.sets.map((set) => set.reps || 0))
    );
    const maxR = Math.max(0, ...reps);
    return maxR > 0 ? `${maxR} reps` : "—";
  }, [sessions]);

  // Joined date string
  const joinDateStr = useMemo(() => {
    if (!userCreatedAt) return "Active Member";
    return new Date(userCreatedAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [userCreatedAt]);

  return (
    <div className="gamer-panel" style={{ display: "flex", flexDirection: "column", gap: "24px", background: "transparent", color: "#e9ecf5", padding: "12px 0", fontFamily: "'Rajdhani', sans-serif" }}>
      
      {/* 1. Header Profile Banner */}
      <div style={{ background: "#12151e", border: "1px solid #1f2430", borderRadius: "12px", padding: "24px", display: "flex", alignItems: "center", gap: "20px" }}>
        {/* Avatar frame (Click to upload) */}
        <label
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            border: `3px solid #3a4256`,
            padding: "2px",
            overflow: "hidden",
            background: "#0d0f13",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative"
          }}
          title="Upload Custom Profile Picture"
        >
          <img src={pfp} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
          <input type="file" accept="image/*" onChange={handlePfpChange} style={{ display: "none" }} />
        </label>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem", color: "#ffffff", letterSpacing: "1px", fontFamily: "'Chakra Petch', sans-serif", fontWeight: 800 }}>{username}</h1>
          <div style={{ fontSize: "0.85rem", color: "#7a8190", marginTop: "4px", fontWeight: "600", letterSpacing: "1px" }}>
            JOINED {joinDateStr.toUpperCase()}
          </div>
        </div>
      </div>

      {/* 2. Four Big Metric Cards Grid */}
      <div className="profile-stats-grid">
        {/* Completed Workouts */}
        <div style={{ background: "#12151e", border: "1px solid #1f2430", borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "#7a8190", letterSpacing: "1px" }}>COMPLETED WORKOUTS</div>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "#ffffff", fontFamily: "'Chakra Petch', sans-serif" }}>{workoutsCount}</div>
          <div style={{ background: "#1b1f2b", height: "4px", borderRadius: "2px" }}>
            <div style={{ width: `${Math.min(100, workoutsCount * 4)}%`, height: "100%", background: "#3a4256", borderRadius: "2px" }}></div>
          </div>
        </div>

        {/* Total Sets Logged */}
        <div style={{ background: "#12151e", border: "1px solid #1f2430", borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "#7a8190", letterSpacing: "1px" }}>TOTAL SETS LOGGED</div>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "#ffffff", fontFamily: "'Chakra Petch', sans-serif" }}>{totalSets}</div>
          <div style={{ background: "#1b1f2b", height: "4px", borderRadius: "2px" }}>
            <div style={{ width: `${Math.min(100, totalSets * 0.5)}%`, height: "100%", background: "#3a4256", borderRadius: "2px" }}></div>
          </div>
        </div>

        {/* Active Streak */}
        <div style={{ background: "#12151e", border: "1px solid #1f2430", borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "#7a8190", letterSpacing: "1px" }}>ACTIVE STREAK</div>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "#ffffff", fontFamily: "'Chakra Petch', sans-serif" }}>{activeStreak} DAYS</div>
          <div style={{ background: "#1b1f2b", height: "4px", borderRadius: "2px" }}>
            <div style={{ width: `${Math.min(100, activeStreak * 15)}%`, height: "100%", background: "#3a4256", borderRadius: "2px" }}></div>
          </div>
        </div>

        {/* Diet Adherence */}
        <div style={{ background: "#12151e", border: "1px solid #1f2430", borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "#7a8190", letterSpacing: "1px" }}>DIET ADHERENCE</div>
          <div style={{ fontSize: "2rem", fontWeight: "800", color: "#ffffff", fontFamily: "'Chakra Petch', sans-serif" }}>
            {foods.length > 0 ? "85.7%" : "0.0%"}
          </div>
          <div style={{ background: "#1b1f2b", height: "4px", borderRadius: "2px" }}>
            <div style={{ width: foods.length > 0 ? "85.7%" : "0%", height: "100%", background: "#3a4256", borderRadius: "2px" }}></div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Columns: General Metrics and PRs */}
      <div className="profile-bottom-grid">
        {/* Left Side: General Stats Table */}
        <div style={{ background: "#12151e", border: "1px solid #1f2430", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ borderBottom: "1px solid #1f2430", paddingBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "1rem", fontWeight: "700", color: "#ffffff", letterSpacing: "1px", fontFamily: "'Chakra Petch', sans-serif" }}>GENERAL METRICS</span>
            <span style={{ height: "4px", width: "32px", background: "#3a4256", borderRadius: "2px" }}></span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
            {/* Gym Days Logged */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.03)", paddingBottom: "10px" }}>
              <span style={{ fontSize: "0.8rem", color: "#a0a5b5", fontWeight: "600" }}>GYM DAYS LOGGED</span>
              <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "#ffffff" }}>{activeDaysCount}</span>
            </div>

            {/* Rest Days Taken */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.03)", paddingBottom: "10px" }}>
              <span style={{ fontSize: "0.8rem", color: "#a0a5b5", fontWeight: "600" }}>REST DAYS TAKEN</span>
              <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "#ffffff" }}>{restDaysCount}</span>
            </div>

            {/* Total Reps */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.03)", paddingBottom: "10px" }}>
              <span style={{ fontSize: "0.8rem", color: "#a0a5b5", fontWeight: "600" }}>TOTAL REPS LOGGED</span>
              <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "#ffffff" }}>{totalReps.toLocaleString()}</span>
            </div>

            {/* Total Volume */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.03)", paddingBottom: "10px" }}>
              <span style={{ fontSize: "0.8rem", color: "#a0a5b5", fontWeight: "600" }}>TOTAL VOLUME LIFTED</span>
              <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "#ffffff" }}>{displayVolume}</span>
            </div>

            {/* Time Trained */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.03)", paddingBottom: "10px" }}>
              <span style={{ fontSize: "0.8rem", color: "#a0a5b5", fontWeight: "600" }}>TOTAL TIME TRAINED</span>
              <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "#ffffff" }}>{gymTimeHours} Hours</span>
            </div>

            {/* Best Single Lift */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.03)", paddingBottom: "10px" }}>
              <span style={{ fontSize: "0.8rem", color: "#a0a5b5", fontWeight: "600" }}>BEST SINGLE LIFT</span>
              <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "#ffffff" }}>{bestLiftFormatted}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Highest Lifts (PR) */}
        <div style={{ background: "#12151e", border: "1px solid #1f2430", borderRadius: "8px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ borderBottom: "1px solid #1f2430", paddingBottom: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "1rem", fontWeight: "700", color: "#ffffff", letterSpacing: "1px", fontFamily: "'Chakra Petch', sans-serif" }}>PERSONAL RECORDS (PR)</span>
            <span style={{ height: "4px", width: "32px", background: "#3a4256", borderRadius: "2px" }}></span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Record 1: Squats */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#161922", padding: "10px 14px", borderRadius: "8px", borderLeft: "4px solid #a18cd1" }}>
              <SquatIcon />
              <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "#ffffff", fontWeight: "600", letterSpacing: "0.5px" }}>SQUATS PR</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "#ffffff" }}>{squatPR !== "—" ? squatPR.replace(" MMR", "") : squatPR}</span>
              </div>
            </div>

            {/* Record 2: Bench Press */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#161922", padding: "10px 14px", borderRadius: "8px", borderLeft: "4px solid #4facfe" }}>
              <BenchIcon />
              <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "#ffffff", fontWeight: "600", letterSpacing: "0.5px" }}>BENCH PRESS PR</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "#ffffff" }}>{benchPR !== "—" ? benchPR.replace(" MMR", "") : benchPR}</span>
              </div>
            </div>

            {/* Record 3: Deadlifts */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#161922", padding: "10px 14px", borderRadius: "8px", borderLeft: "4px solid #ff0844" }}>
              <DeadliftIcon />
              <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "#ffffff", fontWeight: "600", letterSpacing: "0.5px" }}>DEADLIFTS PR</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "#ffffff" }}>{deadliftPR !== "—" ? deadliftPR.replace(" MMR", "") : deadliftPR}</span>
              </div>
            </div>

            {/* Record 4: Overhead Press */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#161922", padding: "10px 14px", borderRadius: "8px", borderLeft: "4px solid #f9d423" }}>
              <OverheadIcon />
              <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "#ffffff", fontWeight: "600", letterSpacing: "0.5px" }}>OVERHEAD PRESS PR</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "#ffffff" }}>{overheadPR !== "—" ? overheadPR.replace(" MMR", "") : overheadPR}</span>
              </div>
            </div>

            {/* Record 5: Pullups */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#161922", padding: "10px 14px", borderRadius: "8px", borderLeft: "4px solid #00f2fe" }}>
              <PullupIcon />
              <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "#ffffff", fontWeight: "600", letterSpacing: "0.5px" }}>PULLUPS MAX REPS</span>
                <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "#ffffff" }}>{pullupPR !== "—" ? pullupPR.replace(" MMR", "") : pullupPR}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
