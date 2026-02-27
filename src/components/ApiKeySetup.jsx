import { useState } from "react";
import { EyeIcon } from "./Icons";
import "./ApiKeySetup.css";

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