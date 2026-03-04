describe("Theme", () => {
  it("T-1: app defaults to dark mode on first visit (no localStorage)", () => {
    // Clear any theme preference before visiting
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.removeItem("sidekick_dark_mode");
      },
    });
    cy.get("body").should("have.class", "dark");
  });

  it("T-2: body has 'dark' class on first visit", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.removeItem("sidekick_dark_mode");
      },
    });
    cy.get("body").should("have.class", "dark");
  });

  it("T-3: theme persists across page refresh", () => {
    // Go to main app and switch to light mode via sidebar settings
    cy.goToMainApp();
    cy.get(".sidebar-footer-btn").first().click();
    cy.get(".settings-toggle").last().click();
    cy.get("body").should("not.have.class", "dark");

    // Reload and verify light mode persists
    cy.reload();
    cy.get("body").should("not.have.class", "dark");
    cy.window().then((win) => {
      expect(win.localStorage.getItem("sidekick_dark_mode")).to.equal("0");
    });
  });
});

describe("Header & Sidebar", () => {
  it("HD-1: logo/branding renders on all screens", () => {
    // Welcome screen - header logo
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.removeItem("sidekick_seen_welcome");
      },
    });
    cy.get(".header-logo").should("be.visible");
    cy.get(".header-logo-name").should("contain.text", "Sidekick");

    // Auth screen - header logo
    cy.skipWelcome();
    cy.visit("/");
    cy.get(".header-logo").should("be.visible");

    // API key screen - header logo
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.setItem("sidekick_seen_welcome", "1");
        win.__CYPRESS_MOCK_USER__ = {
          uid: "test-user-123",
          email: "test@example.com",
          displayName: "Test User",
          photoURL: null,
          providerData: [{ providerId: "password" }],
        };
      },
    });
    cy.get(".header-logo").should("be.visible");

    // Main app screen - sidebar exists
    cy.goToMainApp();
    cy.get(".sidebar").should("exist");
  });

  it("HD-2: sidebar hidden on welcome screen", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.removeItem("sidekick_seen_welcome");
      },
    });
    cy.get(".welcome-card").should("be.visible");
    cy.get(".sidebar").should("not.exist");
  });

  it("HD-3: sidebar hidden on auth screen", () => {
    cy.skipWelcome();
    cy.visit("/");
    cy.get(".auth-card").should("be.visible");
    cy.get(".sidebar").should("not.exist");
  });

  it("HD-4: sidebar hidden on API key screen", () => {
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.setItem("sidekick_seen_welcome", "1");
        win.__CYPRESS_MOCK_USER__ = {
          uid: "test-user-123",
          email: "test@example.com",
          displayName: "Test User",
          photoURL: null,
          providerData: [{ providerId: "password" }],
        };
      },
    });
    cy.get(".setup-card").should("be.visible");
    cy.get(".sidebar").should("not.exist");
  });

  it("HD-5: sidebar with settings visible on main app screen", () => {
    cy.goToMainApp();
    cy.get(".sidebar").should("exist");
    cy.contains("Settings").should("exist");
  });
});
