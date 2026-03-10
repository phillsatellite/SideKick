describe("Bug Fix - Chat Saving", () => {
  beforeEach(() => {
    cy.goToMainApp();
  });

  it("S-1: conversation save is triggered after recording — topbar reflects new conversation ID", () => {
    // Before recording, topbar shows the default "New conversation"
    cy.get(".chat-topbar-title").should("contain", "New conversation");

    cy.get(".mic-btn").click();
    cy.get(".mic-btn").click();
    cy.get(".output-text", { timeout: 5000 }).should("be.visible");

    // handleResult assigns a conversation ID — topbar no longer shows "New conversation"
    cy.get(".chat-topbar-title").should("not.contain", "New conversation");
  });

  it("S-2: output text is retained in the current session after recording", () => {
    cy.get(".mic-btn").click();
    cy.get(".mic-btn").click();

    cy.get(".output-text", { timeout: 5000 })
      .should("be.visible")
      .and("not.be.empty");

    // Output should still be visible without any further interaction
    cy.get(".output-text").should("exist");
  });
});

describe("Bug Fix - Page Load (no API key modal flash)", () => {
  it("S-3: logged-in user with API key goes directly to main app", () => {
    cy.goToMainApp();

    cy.get(".app-wrap--chat").should("be.visible");
    cy.get(".setup-input").should("not.exist");
  });

  it("S-4: API key setup screen never appears during load for authenticated user", () => {
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

    // Assert immediately — before any async work — that setup screen is absent
    cy.get(".setup-input").should("not.exist");
    cy.get(".mic-btn").should("be.visible");
  });
});
