import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { auth, db } from "./utils/firebase";
import Welcome from "./components/Welcome.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import ApiKeySetup from "./components/ApiKeySetup.jsx";
import MicButton from "./components/MicButton.jsx";
import OutputBox from "./components/OutputBox.jsx";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ExportModal from "./components/ExportModal.jsx";
import SettingsModal from "./components/SettingsModal.jsx";
import { HamburgerIcon, MicIcon } from "./components/Icons.jsx";
import { clearAccessToken } from "./utils/googleDrive";
import { STORAGE_KEYS } from "./utils/constants";
import "./App.css";

export default function App() {
  const [showWelcome, setShowWelcome] = useState(
    () => !localStorage.getItem(STORAGE_KEYS.SEEN_WELCOME)
  );
  const [user, setUser] = useState(undefined);
  const [authLoading, setAuthLoading] = useState(true);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
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
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, dark ? "1" : "0");
  }, [dark]);

  // Auto-collapse sidebar on resize to mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarCollapsed(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auth listener
  useEffect(() => {
    const mockUser = window.__CYPRESS_MOCK_USER__;
    if (mockUser) {
      setUser(mockUser);
      setAuthLoading(false);
      // In Cypress tests, check localStorage for mock API key
      const savedKey = localStorage.getItem(STORAGE_KEYS.apiKey(mockUser.uid));
      if (savedKey) setApiKey(savedKey);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch API key from Firestore before revealing the app
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          if (snap.exists() && snap.data().apiKey) {
            setApiKey(snap.data().apiKey);
          }
        } catch {
          // Firestore fetch failed — user will see API key setup screen
        }
      } else {
        setApiKey("");
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync conversations from Firestore in real time
  useEffect(() => {
    if (!user?.uid) {
      setConversations([]);
      return;
    }
    const q = query(
      collection(db, "users", user.uid, "conversations"),
      orderBy("updatedAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setConversations(snapshot.docs.map((d) => d.data()));
    }, () => {
      // snapshot error — leave conversations as-is
    });
    return () => unsubscribe();
  }, [user]);

  const handleWelcomeContinue = () => {
    localStorage.setItem(STORAGE_KEYS.SEEN_WELCOME, "1");
    setShowWelcome(false);
  };

  const handleKeySubmit = async (key) => {
    setApiKey(key);
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), { apiKey: key }, { merge: true });
      } catch {
        // Firestore save failed — key is still in memory for this session
      }
    }
  };

  const handleSignOut = async () => {
    clearAccessToken();
    await signOut(auth);
    setApiKey("");
    setOutput("");
    setConversations([]);
    setActiveConversationId(null);
  };

  const handleResult = async (text) => {
    setOutput(text);
    const title =
      text.substring(0, 60).replace(/\n/g, " ").trim() || "Untitled";
    const now = new Date().toISOString();
    const convId = activeConversationId || crypto.randomUUID();

    if (!activeConversationId) setActiveConversationId(convId);

    try {
      await setDoc(
        doc(db, "users", user.uid, "conversations", convId),
        activeConversationId
          ? { title, text, updatedAt: now }
          : { id: convId, title, text, createdAt: now, updatedAt: now },
        { merge: true }
      );
    } catch {
      // Firestore write failed — onSnapshot won't update, nothing to do
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
                  <MicIcon />
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
