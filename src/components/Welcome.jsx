import React from "react";
import "./Welcome.css";

export default function Welcome({ onContinue }) {
  return (
    <div className="welcome-wrap">
      <div className="welcome-card">
        <h2>Welcome to Sidekick</h2>
        <p className="welcome-intro">
          Sidekick turns your voice into clean, formatted notes — instantly.
          Just tap the mic, speak naturally, and let us handle the rest.
        </p>

        <div className="welcome-steps">
          <div className="welcome-step">
            <span className="welcome-step-num">1</span>
            <div>
              <strong>Create your account</strong>
              <p>Sign up with your email or Google account, then connect your OpenAI API key. Your key stays in your browser and is sent directly to OpenAI.</p>
            </div>
          </div>

          <div className="welcome-step">
            <span className="welcome-step-num">2</span>
            <div>
              <strong>Tap the mic and speak</strong>
              <p>Press the microphone button and talk naturally. Say whatever you need — lecture notes, thoughts, ideas, anything.</p>
            </div>
          </div>

          <div className="welcome-step">
            <span className="welcome-step-num">3</span>
            <div>
              <strong>Get formatted notes</strong>
              <p>Sidekick transcribes your speech and formats it into clean, readable text. Copy it, listen back, or revisit it from your history.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="welcome-note">
        <svg className="welcome-note-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>
          Sidekick is a note-taking tool only. It cannot answer questions, generate content, or assist with academic tasks.
        </span>
      </div>

      <button className="welcome-btn" onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}
