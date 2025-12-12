import React, { useEffect, useRef, useState } from "react";

type Props = {
  seconds: number;
};

export const RestTimer: React.FC<Props> = ({ seconds }) => {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<number>();

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!running) return;
    timerRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setRunning(false);
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Rest over", { body: "Time to lift again." });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [running]);

  const reset = () => {
    setRemaining(seconds);
    setRunning(false);
  };

  return (
    <div className="timer">
      <span className="pill">{remaining}s</span>
      <button onClick={() => setRunning((p) => !p)}>{running ? "Pause" : "Start"}</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};

