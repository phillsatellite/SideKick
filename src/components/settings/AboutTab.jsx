import { MicIcon } from "../Icons";

export default function AboutTab() {
  return (
    <div className="settings-about">
      <div className="settings-about-header">
        <div className="settings-about-logo">
          <MicIcon />
        </div>
        <div>
          <h3 className="settings-about-name">Sidekick</h3>
          <span className="settings-about-version">Version 1.0.0</span>
        </div>
      </div>

      <div className="settings-about-section">
        <h4 className="settings-about-section-label">What is Sidekick?</h4>
        <p className="settings-about-text">
          Sidekick turns your voice into clean, formatted notes.
          Tap the mic, speak naturally, and get structured text back instantly.
        </p>
      </div>

      <div className="settings-about-section">
        <h4 className="settings-about-section-label">Privacy</h4>
        <p className="settings-about-text">
          Your API key is stored securely in your Firebase account and is sent directly to OpenAI.
          Your account data is securely managed by Firebase.
        </p>
      </div>

      <div className="settings-about-section">
        <h4 className="settings-about-section-label">Disclaimer</h4>
        <p className="settings-about-text">
          Sidekick is a note-taking tool only. It cannot answer questions,
          generate content, or assist with academic tasks.
        </p>
      </div>

      <div className="settings-about-section">
        <h4 className="settings-about-section-label">Credits</h4>
        <p className="settings-about-text">
          Built with React, powered by OpenAI Whisper and GPT-4o-mini.
        </p>
      </div>
    </div>
  );
}
