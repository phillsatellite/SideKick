import { useState, useRef } from "react";
import { MOCK_ESSAY } from "../utils/mockData";
import { StopIcon, MicIcon } from "./Icons";
import "./MicButton.css";

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
    ? "Processing..."
    : "Tap to speak";

  return (
    <div className="mic-wrap">
      <button
        className={`mic-btn${active ? " recording" : ""}`}
        onClick={handleToggle}
        disabled={processing}
        aria-label={active ? "Stop recording" : "Start recording"}
      >
        {active ? <StopIcon /> : <MicIcon />}
      </button>
      <span className={`mic-status${active ? " recording" : ""}`}>
        {statusText}
      </span>
      <Waveform active={active} />
      <p className="mic-mock-notice">Work in progress — results are mock data.</p>
    </div>
  );
}
