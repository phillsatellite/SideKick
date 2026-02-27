// ***********************************************
// Cypress custom commands for Sidekick tests
// ***********************************************

/**
 * Bypass the welcome screen by setting the localStorage flag.
 */
Cypress.Commands.add("skipWelcome", () => {
  localStorage.setItem("sidekick_seen_welcome", "1");
});

/**
 * Set up a mock authenticated state by stubbing Firebase Auth.
 * This injects a fake user into the app via the onAuthStateChanged listener.
 */
Cypress.Commands.add("mockAuth", (overrides = {}) => {
  const defaultUser = {
    uid: "test-user-123",
    email: "test@example.com",
    displayName: "Test User",
    photoURL: null,
    providerData: [{ providerId: "password" }],
  };
  const user = { ...defaultUser, ...overrides };

  cy.window().then((win) => {
    win.__CYPRESS_MOCK_USER__ = user;
  });
});

/**
 * Set a mock API key in localStorage for the test user.
 */
Cypress.Commands.add("setApiKey", (uid = "test-user-123", key = "sk-test-key-1234567890") => {
  localStorage.setItem(`sidekick_apikey_${uid}`, key);
});

/**
 * Navigate to the app with welcome screen bypassed.
 */
Cypress.Commands.add("visitApp", () => {
  cy.skipWelcome();
  cy.visit("/");
});

/**
 * Get to the main app screen (past welcome, auth, and API key).
 * Uses localStorage shortcuts — does not go through real Firebase.
 */
Cypress.Commands.add("goToMainApp", () => {
  cy.skipWelcome();
  cy.setApiKey();
  cy.visit("/", {
    onBeforeLoad(win) {
      win.__CYPRESS_MOCK_USER__ = {
        uid: "test-user-123",
        email: "test@example.com",
        displayName: "Test User",
        photoURL: null,
        providerData: [{ providerId: "password" }],
      };
    },
  });
});
