import { useState } from "react";
import { createPortal } from "react-dom";
import { CloseIcon, UserIcon, FormatsIcon, InfoIcon } from "./Icons";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { STORAGE_KEYS } from "../utils/constants";
import AccountTab from "./settings/AccountTab";
import FormatsTab from "./settings/FormatsTab";
import AboutTab from "./settings/AboutTab";
import "./SettingsModal.css";

const TABS = [
  { id: "account", label: "Account", icon: <UserIcon /> },
  { id: "formats", label: "Formats", icon: <FormatsIcon /> },
  { id: "about", label: "About", icon: <InfoIcon /> },
];

const DEFAULT_PRESETS = [
  { id: "indent", keyword: "indent", description: "Indents the current line with a tab", enabled: true },
  { id: "new_paragraph", keyword: "new paragraph", description: "Forces a paragraph break", enabled: true },
  { id: "bullet_point", keyword: "bullet point", description: "Starts a bullet point list", enabled: true },
  { id: "heading", keyword: "heading", description: "Formats the next line as a heading", enabled: true },
  { id: "numbered_list", keyword: "numbered list", description: "Starts a numbered list", enabled: true },
];

export default function SettingsModal({ onClose, user, onSignOut, dark, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState("account");
  const [presets, setPresets] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FORMAT_PRESETS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return DEFAULT_PRESETS.map((def) => {
          const existing = parsed.find((p) => p.id === def.id);
          return existing ? { ...def, enabled: existing.enabled } : def;
        });
      } catch {
        return DEFAULT_PRESETS;
      }
    }
    return DEFAULT_PRESETS;
  });

  useEscapeKey(onClose);

  const handleTogglePreset = (presetId) => {
    setPresets((prev) => {
      const updated = prev.map((p) =>
        p.id === presetId ? { ...p, enabled: !p.enabled } : p
      );
      localStorage.setItem(STORAGE_KEYS.FORMAT_PRESETS, JSON.stringify(updated));
      return updated;
    });
  };

  const handleSignOutAndClose = async () => {
    onClose();
    if (onSignOut) await onSignOut();
  };

  return createPortal(
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <span className="settings-modal-title">Settings</span>
          <button className="settings-close-btn" onClick={onClose} title="Close">
            <CloseIcon />
          </button>
        </div>

        <div className="settings-body">
          <nav className="settings-sidebar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`settings-tab-btn${activeTab === tab.id ? " active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="settings-content">
            {activeTab === "account" && <AccountTab user={user} onSignOut={handleSignOutAndClose} onClose={onClose} dark={dark} onToggleTheme={onToggleTheme} />}
            {activeTab === "formats" && <FormatsTab presets={presets} onToggle={handleTogglePreset} />}
            {activeTab === "about" && <AboutTab />}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
