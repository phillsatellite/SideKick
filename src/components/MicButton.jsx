import { useState, useRef } from "react";
import { MOCK_ESSAY } from "../utils/mockData";
import "./MicButton.css";

const StopIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);

const MicIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="9" y1="22" x2="15" y2="22" />
  </svg>
);

const Waveform = ({ active }) => (
  <div className={`mic-wave${active ? " active" : ""}`}>
    {[...Array(7)].map((_, i) => (
      <div key={i} className="mic-wave-bar" />
    ))}
  </div>
);

export default function MicButton({ apiKey, processing, setProcessing, onResult }) {
  const [active, setActive] = useState(false);
  const timerRef = useRef(null);

  const handleToggle = async () => {
    if (active) {
      setActive(false);
      setProcessing(true);
      clearTimeout(timerRef.current);

      // ── TODO: Replace mock with real API calls ──────────────────────────
      // 1. Stop MediaRecorder, get audioBlob
      // 2. const transcript = await transcribeAudio(audioBlob, apiKey);
      // 3. const result     = await clarifyWithAI(transcript, apiKey);
      // 4. onResult(result);
      // ───────────────────────────────────────────────────────────────────

      timerRef.current = setTimeout(() => {
        onResult(MOCK_ESSAY);
        setProcessing(false);
      }, 1800);
    } else {
      setActive(true);
    }
  };

  const statusText = active
    ? "Listening — tap to stop"
    : processing
    ? "Processing…"
    : "Tap to speak";

  return (
    <div className="mic-card">
      <button
        className={`mic-btn${active ? " recording" : ""}`}
        onClick={handleToggle}
        disabled={processing}
        aria-label={active ? "Stop recording" : "Start recording"}
      >
        {active ? <StopIcon /> : <MicIcon />}
      </button>

      <Waveform active={active} />

      <span className={`mic-status${active ? " recording" : ""}`}>
        {statusText}
      </span>
    </div>
  );
}