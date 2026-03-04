import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./utils/firebase";
import Welcome from "./components/Welcome.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import ApiKeySetup from "./components/ApiKeySetup.jsx";
import MicButton from "./components/MicButton.jsx";
import OutputBox from "./components/OutputBox.jsx";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ExportModal from "./components/ExportModal.jsx";
import SettingsModal from "./components/SettingsModal.jsx";
import { HamburgerIcon } from "./components/Icons.jsx";
import "./App.css";

export default function App() {
  const [showWelcome, setShowWelcome] = useState(
    () => !localStorage.getItem("sidekick_seen_welcome")
  );
  const [user, setUser] = useState(undefined);
  const [authLoading, setAuthLoading] = useState(true);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("sidekick_dark_mode");
    return saved === null ? true : saved === "1";
  });
  const [apiKey, setApiKey] = useState("");
  const [output, setOutput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => window.innerWidth < 768
  );

  // Dark mode
  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("sidekick_dark_mode", dark ? "1" : "0");
  }, [dark]);

  // Auth listener
  useEffect(() => {
    const mockUser = window.__CYPRESS_MOCK_USER__;
    if (mockUser) {
      setUser(mockUser);
      setAuthLoading(false);
      const savedKey = localStorage.getItem(`sidekick_apikey_${mockUser.uid}`);
      if (savedKey) setApiKey(savedKey);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      if (firebaseUser) {
        const savedKey = localStorage.getItem(`sidekick_apikey_${firebaseUser.uid}`);
        if (savedKey) setApiKey(savedKey);
      } else {
        setApiKey("");
      }
    });
    return () => unsubscribe();
  }, []);

  // Load conversations when user authenticates
  useEffect(() => {
    if (user && user.uid) {
      const saved = localStorage.getItem(`sidekick_conversations_${user.uid}`);
      if (saved) {
        try {
          setConversations(JSON.parse(saved));
        } catch {
          setConversations([]);
        }
      }
    }
  }, [user]);

  // Persist conversations
  useEffect(() => {
    if (user && user.uid && conversations.length > 0) {
      localStorage.setItem(
        `sidekick_conversations_${user.uid}`,
        JSON.stringify(conversations)
      );
    }
  }, [conversations, user]);

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
    setConversations([]);
    setActiveConversationId(null);
  };

  const handleResult = (text) => {
    setOutput(text);
    const title =
      text.substring(0, 60).replace(/\n/g, " ").trim() || "Untitled";
    const now = new Date().toISOString();

    if (activeConversationId) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, text, title, updatedAt: now }
            : c
        )
      );
    } else {
      const newId = crypto.randomUUID();
      setConversations((prev) => [
        { id: newId, title, text, createdAt: now, updatedAt: now },
        ...prev,
      ]);
      setActiveConversationId(newId);
    }
  };

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setOutput("");
  };

  const handleSelectConversation = (id) => {
    const convo = conversations.find((c) => c.id === id);
    if (convo) {
      setActiveConversationId(id);
      setOutput(convo.text);
    }
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  };

  const isMainApp = !authLoading && !showWelcome && !!user && !!apiKey;

  const hero = (
    <div className="app-hero">
      <h1 className="app-hero-title">
        Talk.
        <br />
        <em>We'll take notes.</em>
      </h1>
      <p className="app-hero-sub">Voice-to-text, formatted for you</p>
    </div>
  );

  // ── Non-main screens ──
  if (!isMainApp) {
    const renderScreen = () => {
      if (authLoading) return null;
      if (showWelcome)
        return (
          <>
            {hero}
            <Welcome onContinue={handleWelcomeContinue} />
          </>
        );
      if (!user)
        return (
          <>
            {hero}
            <AuthScreen />
          </>
        );
      if (!apiKey)
        return (
          <>
            {hero}
            <ApiKeySetup onSubmit={handleKeySubmit} />
          </>
        );
      return null;
    };

    return (
      <div className="app-wrap">
        <Header />
        {renderScreen()}
      </div>
    );
  }

  // ── Main app: sidebar + chat ──
  return (
    <div className="app-wrap app-wrap--chat">
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onOpenSettings={() => setShowSettingsModal(true)}
        onSignOut={handleSignOut}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      <div className="chat-main">
        <div className="chat-topbar">
          <button
            className={`chat-topbar-toggle${sidebarCollapsed ? "" : " hidden"}`}
            onClick={() => setSidebarCollapsed(false)}
            aria-label="Open sidebar"
          >
            <HamburgerIcon />
          </button>
          <span className="chat-topbar-title">
            {activeConversationId
              ? conversations.find((c) => c.id === activeConversationId)
                  ?.title || ""
              : "New conversation"}
          </span>
        </div>

        <div className="chat-content">
          <div className="chat-content-inner">
            {!output && !processing ? (
              <div className="chat-empty">
                <div className="chat-empty-logo">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  </svg>
                </div>
                <p className="chat-empty-text">
                  Tap the mic to start recording
                </p>
              </div>
            ) : (
              <OutputBox
                output={output}
                processing={processing}
                onExport={() => setShowExportModal(true)}
              />
            )}
          </div>
        </div>

        <div className="chat-inputbar">
          <div className="chat-inputbar-inner">
            <MicButton
              apiKey={apiKey}
              processing={processing}
              setProcessing={setProcessing}
              onResult={handleResult}
            />
          </div>
        </div>
      </div>

      {showExportModal && (
        <ExportModal
          output={output}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showSettingsModal && (
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
