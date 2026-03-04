import { useState } from "react";
import { sendPasswordResetEmail, deleteUser, reauthenticateWithCredential, EmailAuthProvider, reauthenticateWithPopup } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../../utils/firebase";
import { getAccessToken } from "../../utils/googleDrive";
import { STORAGE_KEYS } from "../../utils/constants";
import { UserIcon, DriveIcon } from "../Icons";

export default function AccountTab({ user, onSignOut, onClose, dark, onToggleTheme }) {
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
      await deleteDoc(doc(db, "users", uid));
    } catch {
      // Firestore doc may not exist, continue anyway
    }
    localStorage.removeItem(STORAGE_KEYS.apiKey(uid));
    await deleteUser(user);
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
