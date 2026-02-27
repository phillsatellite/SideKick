import React from "react";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./utils/firebase";
import Welcome from "./components/Welcome.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import ApiKeySetup from "./components/ApiKeySetup.jsx";
import MicButton from "./components/MicButton.jsx";
import OutputBox from "./components/OutputBox.jsx";
import History from "./components/History.jsx";
import Header from "./components/Header.jsx";
import ExportModal from "./components/ExportModal.jsx";
import SettingsModal from "./components/SettingsModal.jsx";
import "./App.css";

export default function App() {
  const [showWelcome, setShowWelcome] = useState(
    () => !localStorage.getItem("sidekick_seen_welcome")
  );
  const [user, setUser] = useState(undefined);
  const [authLoading, setAuthLoading] = useState(true);
  const [dark, setDark] = useState(
    () => {
      const saved = localStorage.getItem("sidekick_dark_mode");
      return saved === null ? true : saved === "1";
    }
  );
  const [apiKey, setApiKey] = useState("");
  const [output, setOutput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [history, setHistory] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("sidekick_dark_mode", dark ? "1" : "0");
  }, [dark]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);

      if (firebaseUser) {
        const savedKey = localStorage.getItem(`sidekick_apikey_${firebaseUser.uid}`);
        if (savedKey) {
          setApiKey(savedKey);
        }
      } else {
        setApiKey("");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleWelcomeContinue = () => {
    localStorage.setItem("sidekick_seen_welcome", "1");
    setShowWelcome(false);
  };

  const handleKeySubmit = (key) => {
    setApiKey(key);
    if (user) {
      localStorage.setItem(`sidekick_apikey_${user.uid}`, key);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setApiKey("");
    setOutput("");
    setHistory([]);
  };

  const handleResult = (text) => {
    setOutput(text);
    setHistory((prev) => [
      {
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      ...prev.slice(0, 4),
    ]);
  };

  const hero = (
    <div className="app-hero">
      <h1 className="app-hero-title">
        Talk.<br />
        <em>We'll take notes.</em>
      </h1>
      <p className="app-hero-sub">Voice-to-text, formatted for you</p>
    </div>
  );

  const renderContent = () => {
    if (authLoading) return null;

    if (showWelcome) {
      return (
        <>
          {hero}
          <Welcome onContinue={handleWelcomeContinue} />
        </>
      );
    }

    if (!user) {
      return (
        <>
          {hero}
          <AuthScreen />
        </>
      );
    }

    if (!apiKey) {
      return (
        <>
          {hero}
          <ApiKeySetup onSubmit={handleKeySubmit} />
        </>
      );
    }

    return (
      <div className="app-screen">
        <MicButton
          apiKey={apiKey}
          processing={processing}
          setProcessing={setProcessing}
          onResult={handleResult}
        />
        <OutputBox output={output} processing={processing} onExport={() => setShowExportModal(true)} />
        {history.length > 0 && (
          <History items={history} onSelect={(text) => setOutput(text)} />
        )}
        <footer className="app-footer">
          <div className="app-footer-key">
            <div className="app-footer-key-dot" />
            <span>API key connected</span>
          </div>
          <button className="app-signout-btn" onClick={handleSignOut}>
            Sign out
          </button>
        </footer>
      </div>
    );
  };

  const isMainApp = !authLoading && !showWelcome && !!user && !!apiKey;

  return (
    <div className="app-wrap">
      <Header onOpenSettings={() => setShowSettingsModal(true)} showSettings={isMainApp} />

      {renderContent()}

      {showExportModal && (
        <ExportModal
          output={output}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showSettingsModal && isMainApp && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          user={user}
          onSignOut={handleSignOut}
          dark={dark}
          onToggleTheme={() => setDark((d) => !d)}
        />
      )}
    </div>
  );
}
