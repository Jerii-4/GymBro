import React, { useEffect, useRef, useState } from "react";
import { MusicTrack } from "../types";
import { useLocalStore } from "../hooks/useLocalStore";

const uuid = () => crypto.randomUUID();

export const MusicPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { tracks, addTracks } = useLocalStore();
  const [queue, setQueue] = useState<MusicTrack[]>(tracks);
  const [current, setCurrent] = useState(0);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setQueue(tracks);
  }, [tracks]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.play().catch(() => setPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [playing, current]);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const mapped: MusicTrack[] = Array.from(files).map((f) => ({
      id: uuid(),
      name: f.name,
      url: URL.createObjectURL(f)
    }));
    addTracks(mapped);
    setQueue((prev) => [...prev, ...mapped]);
  };

  const playNext = () => {
    setCurrent((idx) => {
      if (repeat) return idx;
      if (shuffle) return Math.floor(Math.random() * queue.length);
      return (idx + 1) % queue.length;
    });
  };

  const playPrev = () => setCurrent((idx) => (idx - 1 + queue.length) % queue.length);

  const notify = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  return (
    <div className="card">
      <h2>Music</h2>
      <input type="file" multiple accept="audio/*" onChange={(e) => onFiles(e.target.files)} />
      {queue.length === 0 && <p className="muted">Add audio files to start playing.</p>}
      {queue.length > 0 && (
        <>
          <audio
            ref={audioRef}
            src={queue[current]?.url}
            onEnded={() => {
              notify("Track finished", queue[current]?.name ?? "");
              playNext();
            }}
            onPlay={() => notify("Now playing", queue[current]?.name ?? "")}
          />
          <div className="list-item" style={{ marginTop: 10 }}>
            <div>
              <strong>{queue[current]?.name}</strong>
              <div className="muted">Track {current + 1} / {queue.length}</div>
            </div>
            <div className="chips">
              <button onClick={playPrev}>Prev</button>
              <button onClick={() => setPlaying((p) => !p)}>{playing ? "Pause" : "Play"}</button>
              <button onClick={playNext}>Next</button>
              <button onClick={() => setShuffle((s) => !s)}>{shuffle ? "Unshuffle" : "Shuffle"}</button>
              <button onClick={() => setRepeat((r) => !r)}>{repeat ? "Unrepeat" : "Repeat"}</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

