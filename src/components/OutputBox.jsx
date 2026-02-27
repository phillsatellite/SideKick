import { useState } from "react";
import "./OutputBox.css";

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SpeakIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const ExportIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function OutputBox({ output, processing, onExport }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSpeak = () => {
    if (!output) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(output);
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className={`output-card${output ? " has-content" : ""}`}>
      <div className="output-header">
        <span className="output-label">Formatted text</span>
        <div className="output-actions">
          <button
            className="output-icon-btn"
            onClick={onExport}
            disabled={!output}
            title="Export"
          >
            <ExportIcon />
          </button>
          <button
            className="output-icon-btn"
            onClick={handleSpeak}
            disabled={!output}
            title="Read aloud"
          >
            <SpeakIcon />
          </button>
          <button
            className={`output-icon-btn${copied ? " copied" : ""}`}
            onClick={handleCopy}
            disabled={!output}
            title="Copy text"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>
      </div>

      <div className="output-body">
        {processing ? (
          <div className="output-processing">
            <div className="output-dot" />
            <div className="output-dot" />
            <div className="output-dot" />
          </div>
        ) : output ? (
          <div className="output-text">{output}</div>
        ) : (
          <p className="output-placeholder">
            Your formatted text will appear here after recording.
          </p>
        )}
      </div>
    </div>
  );
}