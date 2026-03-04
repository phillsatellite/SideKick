import { useState, useRef, useEffect } from "react";
import { CopyIcon, CheckIcon, SpeakIcon, DownloadIcon } from "./Icons";
import "./OutputBox.css";

export default function OutputBox({ output, processing, onExport }) {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(copyTimerRef.current);
  }, []);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 1800);
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
            <DownloadIcon />
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