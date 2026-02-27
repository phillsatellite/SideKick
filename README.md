# Sidekick

**Voice-to-text, formatted for you.**

Sidekick is a progressive web app that turns your voice into clean, structured notes. Tap the mic, speak naturally, and get formatted text back instantly — powered by OpenAI Whisper for transcription and GPT-4o-mini for intelligent formatting.

## Features

### Voice Recording & Transcription
- One-tap recording with real-time waveform animation
- Audio transcription via OpenAI Whisper API
- AI-powered formatting and cleanup via GPT-4o-mini
- Built-in guardrails — Sidekick is strictly a note-taking tool and will not generate content, answer questions, or assist with academic dishonesty

### Authentication
- Email/password account creation and sign-in
- Google SSO (sign up and sign in with Google)
- Password reset via email
- Account deletion with re-authentication

### Export
- **File formats:** PDF, DOCX, TXT, Markdown
- **Destinations:** Save to computer or upload directly to Google Drive
- Google Drive integration via OAuth 2.0

### Settings
- **Account** — Profile overview, password reset, Google Drive connection status, dark/light mode toggle, sign out, delete account
- **Formats** — Voice command presets (e.g., say "new paragraph", "bullet point", or "heading" while recording to trigger formatting)
- **About** — App info, privacy notice, and credits

### Additional
- Dark and light mode (dark by default, persisted across sessions)
- Copy to clipboard with visual confirmation
- Read aloud via Web Speech Synthesis API
- History of recent transcriptions (last 5)
- First-launch onboarding walkthrough
- Installable as a PWA (standalone mode)

## Tech Stack

| Technology | Purpose |
|---|---|
| [React](https://react.dev) 18 | UI framework |
| [Vite](https://vitejs.dev) 5 | Build tool and dev server |
| [Firebase](https://firebase.google.com) 12 | Authentication and Firestore database |
| [OpenAI API](https://platform.openai.com) | Whisper (transcription) + GPT-4o-mini (formatting) |
| [jsPDF](https://github.com/parallax/jsPDF) | PDF generation |
| [docx](https://github.com/dolanmiri/docx) | DOCX generation |
| [Google Identity Services](https://developers.google.com/identity) | Google Drive OAuth |
| [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) | Service worker and PWA support |

## Project Structure

```
SideKick/
├── public/
│   ├── icons/                  # PWA icons (192px, 512px, SVG)
│   └── manifest.json           # PWA manifest
├── src/
│   ├── main.jsx                # React entry point
│   ├── App.jsx                 # Root component, auth state, routing
│   ├── App.css
│   ├── index.css               # Global styles, CSS variables, themes
│   ├── components/
│   │   ├── AuthScreen.jsx      # Sign in / Create account UI
│   │   ├── ApiKeySetup.jsx     # OpenAI API key input
│   │   ├── Welcome.jsx         # First-launch onboarding
│   │   ├── Header.jsx          # Logo and settings gear
│   │   ├── MicButton.jsx       # Voice recorder with waveform
│   │   ├── OutputBox.jsx       # Transcription display + actions
│   │   ├── History.jsx         # Recent transcription list
│   │   ├── ExportModal.jsx     # Format picker + export destinations
│   │   ├── SettingsModal.jsx   # Account / Formats / About tabs
│   │   └── *.css               # Component-scoped styles
│   └── utils/
│       ├── firebase.js         # Firebase app, auth, Firestore init
│       ├── openai.js           # Whisper + GPT-4o-mini API calls
│       ├── exportFile.js       # PDF/DOCX/TXT/MD file generation
│       └── googleDrive.js      # Google Drive OAuth + upload
├── index.html
├── vite.config.js
├── package.json
└── .env                        # Environment variables (not committed)
```

## Getting Started

> **For end users:** You just need an [OpenAI API key](https://platform.openai.com/api-keys). Create an account in the app, enter your key, and you're good to go. The sections below are for developers who want to run or self-host their own instance.

### Prerequisites

- [Node.js](https://nodejs.org) (v18 or higher recommended)
- A [Firebase project](https://console.firebase.google.com) with Authentication and Firestore enabled
- A [Google Cloud project](https://console.cloud.google.com) with the Google Drive API enabled (optional, for Drive exports)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/phillsatellite/SideKick.git
   cd SideKick
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the project root:

   ```env
   # Firebase
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # Google OAuth (for Drive export, optional)
   VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   ```

4. **Configure Firebase**

   - Go to the [Firebase Console](https://console.firebase.google.com)
   - Enable **Authentication** with Email/Password and Google providers
   - Create a **Cloud Firestore** database

5. **Configure Google Drive (optional)**

   - Go to the [Google Cloud Console](https://console.cloud.google.com)
   - Enable the **Google Drive API**
   - Create an **OAuth 2.0 Client ID** (Web application type)
   - Add your dev URL (e.g., `http://localhost:5173`) to Authorized JavaScript origins
   - If the app is in testing mode, add your email to **OAuth consent screen > Test users**

6. **Start the dev server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview   # Preview the production build locally
```

## How It Works

1. **Onboarding** — First-time users see a welcome page explaining the app
2. **Account** — Users create an account (email/password or Google) stored in Firebase Auth
3. **API Key** — Users enter their own OpenAI API key (stored locally per user, never sent to any server besides OpenAI)
4. **Record** — Tap the mic button to start recording; a waveform visualizes audio input
5. **Transcribe** — Audio is sent to OpenAI Whisper for transcription
6. **Format** — The transcript is cleaned up and formatted by GPT-4o-mini
7. **Output** — Formatted text appears on screen with options to copy, read aloud, or export
8. **Export** — Save as PDF, DOCX, TXT, or Markdown — locally or to Google Drive

## Design

- **Fonts:** [Syne](https://fonts.google.com/specimen/Syne) (UI) and [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) (display)
- **Theming:** CSS custom properties with smooth transitions between dark and light modes
- **Layout:** Mobile-first, responsive design with touch-friendly controls
- **Modals:** Rendered via React Portals to avoid stacking context issues

## Privacy

- OpenAI API keys are stored in the browser's localStorage, scoped per user. They are never stored in any database or sent to any server other than OpenAI's API.
- Audio is sent directly from the browser to OpenAI for transcription — no intermediary server.
- Firebase stores only minimal account data (username, email, creation date). No transcription data is stored in the cloud.

## License

This project is for personal/educational use.
