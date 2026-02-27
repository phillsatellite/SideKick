import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { sendPasswordResetEmail, deleteUser, reauthenticateWithCredential, EmailAuthProvider, reauthenticateWithPopup } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../utils/firebase";
import { getAccessToken } from "../utils/googleDrive";
import { CloseIcon } from "./Icons";
import "./SettingsModal.css";

/* ── Icons ── */

const UserIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const FormatsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const InfoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const DriveIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 19.5h20L12 2z" />
    <path d="M2 19.5l5-8.5h14" />
    <path d="M16 11L22 19.5" />
  </svg>
);

/* ── Tab config ── */

const TABS = [
  { id: "account", label: "Account", icon: <UserIcon /> },
  { id: "formats", label: "Formats", icon: <FormatsIcon /> },
  { id: "about", label: "About", icon: <InfoIcon /> },
];

/* ── Format presets ── */

const DEFAULT_PRESETS = [
  { id: "indent", keyword: "indent", description: "Indents the current line with a tab", enabled: true },
  { id: "new_paragraph", keyword: "new paragraph", description: "Forces a paragraph break", enabled: true },
  { id: "bullet_point", keyword: "bullet point", description: "Starts a bullet point list", enabled: true },
  { id: "heading", keyword: "heading", description: "Formats the next line as a heading", enabled: true },
  { id: "numbered_list", keyword: "numbered list", description: "Starts a numbered list", enabled: true },
];

/* ── Tab panels ── */

function AccountTab({ user, onSignOut, onClose, dark, onToggleTheme }) {
  const [resetStatus, setResetStatus] = useState("");
  const [deleteStep, setDeleteStep] = useState("idle"); // idle | confirm | password | deleting | error
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const driveConnected = !!getAccessToken();

  const isGoogleUser = user?.providerData?.some(
    (p) => p.providerId === "google.com"
  );

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setResetStatus("sending");
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetStatus("sent");
    } catch {
      setResetStatus("error");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteStep === "idle") {
      setDeleteStep("confirm");
      return;
    }

    if (deleteStep === "confirm") {
      // Need re-authentication before deletion
      if (isGoogleUser) {
        setDeleteStep("deleting");
        try {
          await reauthenticateWithPopup(user, googleProvider);
          await performDeletion();
        } catch (err) {
          setDeleteError(err.code === "auth/popup-closed-by-user"
            ? "Sign-in popup was closed. Please try again."
            : "Re-authentication failed. Please try again.");
          setDeleteStep("error");
        }
      } else {
        setDeleteStep("password");
      }
      return;
    }

    if (deleteStep === "password") {
      if (!deletePassword) {
        setDeleteError("Please enter your password.");
        return;
      }
      setDeleteStep("deleting");
      try {
        const credential = EmailAuthProvider.credential(user.email, deletePassword);
        await reauthenticateWithCredential(user, credential);
        await performDeletion();
      } catch (err) {
        setDeleteError(
          err.code === "auth/wrong-password" || err.code === "auth/invalid-credential"
            ? "Incorrect password. Please try again."
            : "Something went wrong. Please try again."
        );
        setDeleteStep("error");
      }
      return;
    }

    if (deleteStep === "error") {
      setDeleteError("");
      setDeletePassword("");
      setDeleteStep("idle");
    }
  };

  const performDeletion = async () => {
    const uid = user.uid;
    try {
      // Delete Firestore user document
      await deleteDoc(doc(db, "users", uid));
    } catch {
      // Firestore doc may not exist, continue anyway
    }
    // Clean up localStorage
    localStorage.removeItem(`sidekick_apikey_${uid}`);
    // Delete Firebase auth account
    await deleteUser(user);
    // Close the modal — onAuthStateChanged will handle the rest
    onClose();
  };

  return (
    <div className="settings-account">
      <div className="settings-avatar-section">
        {user?.photoURL ? (
          <img
            className="settings-avatar settings-avatar-img"
            src={user.photoURL}
            alt="Profile"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="settings-avatar">
            <UserIcon size={26} />
          </div>
        )}
        <div className="settings-user-info">
          <span className="settings-user-name">{user?.displayName || "User"}</span>
          <span className="settings-user-email">{user?.email || ""}</span>
        </div>
      </div>

      <div className="settings-field">
        <label className="settings-field-label">Username</label>
        <input
          className="settings-field-input"
          type="text"
          value={user?.displayName || ""}
          disabled
        />
      </div>

      <div className="settings-field">
        <label className="settings-field-label">Email</label>
        <input
          className="settings-field-input"
          type="email"
          value={user?.email || ""}
          disabled
        />
      </div>

      {!isGoogleUser && (
        <div className="settings-field">
          <label className="settings-field-label">Password</label>
          <button
            className="settings-field-btn"
            onClick={handleResetPassword}
            disabled={resetStatus === "sending" || resetStatus === "sent"}
          >
            {resetStatus === "sent"
              ? "Reset email sent"
              : resetStatus === "sending"
              ? "Sending..."
              : resetStatus === "error"
              ? "Failed — try again"
              : "Reset password"}
          </button>
        </div>
      )}

      <div className="settings-field">
        <label className="settings-field-label">Linked accounts</label>
        <div className="settings-linked-account">
          <DriveIcon />
          <span>Google Drive</span>
          <span className={`settings-connection-status${driveConnected ? " connected" : ""}`}>
            {driveConnected ? "Connected" : "Not connected"}
          </span>
        </div>
      </div>

      <div className="settings-field">
        <label className="settings-field-label">Appearance</label>
        <div className="settings-theme-row">
          <span className="settings-theme-label">{dark ? "Dark mode" : "Light mode"}</span>
          <button
            className={`settings-toggle${dark ? " on" : ""}`}
            onClick={onToggleTheme}
            role="switch"
            aria-checked={dark}
            aria-label="Toggle dark mode"
          >
            <span className="settings-toggle-thumb" />
          </button>
        </div>
      </div>

      <button className="settings-signout-btn" onClick={onSignOut}>
        Sign out
      </button>

      {/* ── Delete account ── */}
      <div className="settings-danger-zone">
        <label className="settings-field-label">Danger zone</label>

        {deleteStep === "idle" && (
          <button className="settings-delete-btn" onClick={handleDeleteAccount}>
            Delete account
          </button>
        )}

        {deleteStep === "confirm" && (
          <div className="settings-delete-confirm">
            <p className="settings-delete-warn">
              This will permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <div className="settings-delete-actions">
              <button className="settings-delete-cancel" onClick={() => setDeleteStep("idle")}>
                Cancel
              </button>
              <button className="settings-delete-confirm-btn" onClick={handleDeleteAccount}>
                Continue
              </button>
            </div>
          </div>
        )}

        {deleteStep === "password" && (
          <div className="settings-delete-confirm">
            <p className="settings-delete-warn">
              Enter your password to confirm account deletion.
            </p>
            <input
              className="settings-field-input settings-delete-input"
              type="password"
              placeholder="Your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDeleteAccount()}
              autoFocus
            />
            {deleteError && <p className="settings-delete-error">{deleteError}</p>}
            <div className="settings-delete-actions">
              <button className="settings-delete-cancel" onClick={() => { setDeleteStep("idle"); setDeletePassword(""); setDeleteError(""); }}>
                Cancel
              </button>
              <button className="settings-delete-confirm-btn" onClick={handleDeleteAccount}>
                Delete my account
              </button>
            </div>
          </div>
        )}

        {deleteStep === "deleting" && (
          <div className="settings-delete-confirm">
            <p className="settings-delete-warn">Deleting your account...</p>
          </div>
        )}

        {deleteStep === "error" && (
          <div className="settings-delete-confirm">
            <p className="settings-delete-error">{deleteError}</p>
            <div className="settings-delete-actions">
              <button className="settings-delete-cancel" onClick={handleDeleteAccount}>
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FormatsTab({ presets, onToggle }) {
  return (
    <div className="settings-formats">
      <p className="settings-formats-description">
        Voice commands that control how your text is formatted.
        Say these keywords while recording to trigger formatting.
      </p>
      <div className="settings-presets-list">
        {presets.map((preset) => (
          <div key={preset.id} className="settings-preset-row">
            <div className="settings-preset-info">
              <span className="settings-preset-keyword">"{preset.keyword}"</span>
              <span className="settings-preset-desc">{preset.description}</span>
            </div>
            <button
              className={`settings-toggle${preset.enabled ? " on" : ""}`}
              onClick={() => onToggle(preset.id)}
              role="switch"
              aria-checked={preset.enabled}
              aria-label={`Toggle ${preset.keyword}`}
            >
              <span className="settings-toggle-thumb" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutTab() {
  return (
    <div className="settings-about">
      <div className="settings-about-header">
        <div className="settings-about-logo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          </svg>
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
          Your API key is stored only in your browser and is sent directly to OpenAI.
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

/* ── Main modal ── */

export default function SettingsModal({ onClose, user, onSignOut, dark, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState("account");
  const [presets, setPresets] = useState(() => {
    const saved = localStorage.getItem("sidekick_format_presets");
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

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleTogglePreset = (presetId) => {
    setPresets((prev) => {
      const updated = prev.map((p) =>
        p.id === presetId ? { ...p, enabled: !p.enabled } : p
      );
      localStorage.setItem("sidekick_format_presets", JSON.stringify(updated));
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
