import React from "react";
import { useState } from "react";
import "./ApiKeySetup.css";

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

export default function ApiKeySetup({ onSubmit }) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = () => {
    if (apiKey.trim().length >= 10) onSubmit(apiKey.trim());
  };

  return (
    <div className="setup-wrap">
      <div className="setup-card">
        <h2>Almost there — add your API key</h2>
        <p>Your key is stored locally in your browser and sent directly to OpenAI.</p>

        <div className="setup-input-wrap">
          <input
            className="setup-input"
            type={showKey ? "text" : "password"}
            placeholder="sk-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button className="setup-eye-btn" type="button" onClick={() => setShowKey((s) => !s)}>
            <EyeIcon open={showKey} />
          </button>
        </div>

        <button
          className="setup-submit-btn"
          onClick={handleSubmit}
          disabled={apiKey.trim().length < 10}
        >
          Get started
        </button>
      </div>

    </div>
  );
}