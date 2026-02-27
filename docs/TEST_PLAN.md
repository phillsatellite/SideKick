# Sidekick Test Plan

Test framework: **Cypress** (E2E)

---

## Authentication

| # | Test Case | Type |
|---|-----------|------|
| A-1 | Create account with valid email/password populates user | E2E |
| A-2 | Create account rejects missing username | E2E |
| A-3 | Create account rejects invalid email | E2E |
| A-4 | Create account rejects password under 8 characters | E2E |
| A-5 | Sign in with valid email/password authenticates user | E2E |
| A-6 | Sign in with wrong password shows error | E2E |
| A-7 | Sign in with nonexistent email shows error | E2E |
| A-8 | Switching between Create Account and Sign In clears form fields | E2E |
| A-9 | Forgot password sends reset email (sign-in tab only) | E2E |
| A-10 | Google SSO button renders and is clickable | E2E |
| A-11 | Sign out clears app state and returns to auth screen | E2E |

---

## Onboarding / Welcome

| # | Test Case | Type |
|---|-----------|------|
| W-1 | First-time user sees Welcome screen | E2E |
| W-2 | Welcome screen displays 3 steps and disclaimer | E2E |
| W-3 | Clicking Continue dismisses Welcome and sets localStorage flag | E2E |
| W-4 | Returning user (localStorage flag set) skips Welcome screen | E2E |

---

## API Key Setup

| # | Test Case | Type |
|---|-----------|------|
| K-1 | API key screen appears after auth when no key is stored | E2E |
| K-2 | Submit button disabled when key is shorter than 10 characters | E2E |
| K-3 | Submit button enabled when key is 10+ characters | E2E |
| K-4 | Submitting valid key transitions to main app | E2E |
| K-5 | Eye icon toggles key visibility (password/text) | E2E |
| K-6 | Key persists in localStorage scoped to user UID | E2E |

---

## Main App / Mic Button

| # | Test Case | Type |
|---|-----------|------|
| M-1 | Mic button renders in idle state with "Tap to speak" | E2E |
| M-2 | Clicking mic toggles to recording state with stop icon | E2E |
| M-3 | Waveform animation visible during recording | E2E |
| M-4 | Clicking again stops recording and shows "Processing..." | E2E |
| M-5 | Output appears in OutputBox after processing completes | E2E |
| M-6 | Mic button is disabled during processing | E2E |

---

## Output Box

| # | Test Case | Type |
|---|-----------|------|
| O-1 | Shows placeholder text when empty | E2E |
| O-2 | Displays formatted text after recording | E2E |
| O-3 | Copy button copies text to clipboard and shows check icon | E2E |
| O-4 | Export button opens ExportModal | E2E |
| O-5 | Action buttons disabled when no output | E2E |

---

## History

| # | Test Case | Type |
|---|-----------|------|
| H-1 | History section hidden when no items exist | E2E |
| H-2 | History appears after first recording with timestamp | E2E |
| H-3 | Clicking a history item restores its text to OutputBox | E2E |
| H-4 | Stores up to 5 items, oldest dropped on overflow | E2E |

---

## Export Modal

| # | Test Case | Type |
|---|-----------|------|
| E-1 | Opens when export button is clicked | E2E |
| E-2 | Four format buttons render (PDF, DOCX, TXT, MD) | E2E |
| E-3 | Selecting a format highlights it | E2E |
| E-4 | Save to computer triggers file download | E2E |
| E-5 | Google Drive button shows correct label based on connection | E2E |
| E-6 | Closes on overlay click | E2E |
| E-7 | Closes on Escape key | E2E |

---

## Settings Modal

| # | Test Case | Type |
|---|-----------|------|
| S-1 | Gear icon only visible on main app screen | E2E |
| S-2 | Opens when gear icon is clicked | E2E |
| S-3 | Three sidebar tabs render (Account, Formats, About) | E2E |
| S-4 | Closes on overlay click | E2E |
| S-5 | Closes on Escape key | E2E |
| S-6 | Closes on X button | E2E |

---

## Settings - Account Tab

| # | Test Case | Type |
|---|-----------|------|
| SA-1 | Displays user name and email | E2E |
| SA-2 | Password reset button visible for email users | E2E |
| SA-3 | Password reset button hidden for Google users | E2E |
| SA-4 | Dark/light mode toggle switches theme | E2E |
| SA-5 | Theme change persists to localStorage | E2E |
| SA-6 | Sign out button signs out and closes modal | E2E |
| SA-7 | Delete account shows confirmation step | E2E |
| SA-8 | Delete account cancel returns to idle state | E2E |

---

## Settings - Formats Tab

| # | Test Case | Type |
|---|-----------|------|
| SF-1 | Displays 5 format presets with toggle switches | E2E |
| SF-2 | Toggling a preset updates its visual state | E2E |
| SF-3 | Preset state persists in localStorage | E2E |
| SF-4 | Preset state persists across modal open/close | E2E |

---

## Settings - About Tab

| # | Test Case | Type |
|---|-----------|------|
| SB-1 | Displays app name and version | E2E |
| SB-2 | Displays description, privacy notice, disclaimer, and credits sections | E2E |

---

## Theme

| # | Test Case | Type |
|---|-----------|------|
| T-1 | App defaults to dark mode on first visit (no localStorage) | E2E |
| T-2 | Body has "dark" class on first visit | E2E |
| T-3 | Theme persists across page refresh | E2E |

---

## Header

| # | Test Case | Type |
|---|-----------|------|
| HD-1 | Logo renders on all screens | E2E |
| HD-2 | Gear icon hidden on welcome screen | E2E |
| HD-3 | Gear icon hidden on auth screen | E2E |
| HD-4 | Gear icon hidden on API key screen | E2E |
| HD-5 | Gear icon visible on main app screen | E2E |

---

## Total: 58 test cases
