import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../utils/firebase";
import { EyeIcon, GoogleIcon } from "./Icons";
import "./AuthScreen.css";

function mapFirebaseError(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 8 characters.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/wrong-password":
      return "Incorrect password. Try again.";
    case "auth/invalid-credential":
      return "Invalid email or password. Try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/popup-closed-by-user":
      return "";
    case "auth/network-request-failed":
      return "Network error. Check your connection.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export default function AuthScreen() {
  const [mode, setMode] = useState("create");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleCreateAccount = async () => {
    if (!username.trim()) { setError("Please enter a username."); return; }
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    setError("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: username.trim() });
      await setDoc(doc(db, "users", cred.user.uid), {
        username: username.trim(),
        email: email.trim(),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      setError(mapFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!password) { setError("Please enter your password."); return; }

    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(mapFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          username: user.displayName || "",
          email: user.email || "",
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      const msg = mapFirebaseError(err.code);
      if (msg) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) { setError("Enter your email above, then click forgot password."); return; }
    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err) {
      setError(mapFirebaseError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = mode === "create" ? handleCreateAccount : handleSignIn;

  const canSubmit = mode === "create"
    ? username.trim() && email.trim() && password.length >= 8
    : email.trim() && password;

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-tabs">
          <button
            className={`auth-tab-btn${mode === "create" ? " active" : ""}`}
            onClick={() => { setMode("create"); setEmail(""); setPassword(""); setError(""); setResetSent(false); }}
          >
            Create Account
          </button>
          <button
            className={`auth-tab-btn${mode === "signin" ? " active" : ""}`}
            onClick={() => { setMode("signin"); setEmail(""); setPassword(""); setUsername(""); setError(""); setResetSent(false); }}
          >
            Sign In
          </button>
        </div>

        {mode === "create" && (
          <div className="auth-field">
            <label className="auth-field-label">Username</label>
            <input
              className="auth-input"
              type="text"
              placeholder="your-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
            />
          </div>
        )}

        <div className="auth-field">
          <label className="auth-field-label">Email</label>
          <input
            className="auth-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
          />
        </div>

        <div className="auth-field">
          <label className="auth-field-label">Password</label>
          <div className="auth-input-wrap">
            <input
              className="auth-input auth-input-password"
              type={showPassword ? "text" : "password"}
              placeholder={mode === "create" ? "At least 8 characters" : "Your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
            />
            <button className="auth-eye-btn" type="button" onClick={() => setShowPassword((s) => !s)}>
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>

        <button
          className="auth-submit-btn"
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
        >
          {loading ? "Please wait..." : mode === "create" ? "Create Account" : "Sign In"}
        </button>

        {error && <p className="auth-error">{error}</p>}
        {resetSent && <p className="auth-success">Password reset email sent. Check your inbox.</p>}

        <div className="auth-divider">
          <div className="auth-divider-line" />
          <span className="auth-divider-text">or</span>
          <div className="auth-divider-line" />
        </div>

        <button
          className="auth-google-btn"
          onClick={handleGoogleAuth}
          disabled={loading}
        >
          <GoogleIcon />
          <span>{mode === "create" ? "Sign up with Google" : "Sign in with Google"}</span>
        </button>

        {mode === "signin" && (
          <button className="auth-forgot-link" onClick={handleForgotPassword} disabled={loading}>
            Forgot password?
          </button>
        )}
      </div>
    </div>
  );
}
