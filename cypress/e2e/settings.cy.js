describe("Settings Modal", () => {
  beforeEach(() => {
    cy.goToMainApp();
  });

  it("S-1: gear icon only visible on main app screen", () => {
    cy.get('.header-icon-btn[aria-label="Settings"]').should("be.visible");
  });

  it("S-2: opens when gear icon is clicked", () => {
    cy.get('.header-icon-btn[aria-label="Settings"]').click();
    cy.get(".settings-modal").should("be.visible");
  });

  it("S-3: three sidebar tabs render (Account, Formats, About)", () => {
    cy.get('.header-icon-btn[aria-label="Settings"]').click();
    cy.get(".settings-tab-btn").should("have.length", 3);
    cy.contains("Account").should("be.visible");
    cy.contains("Formats").should("be.visible");
    cy.contains("About").should("be.visible");
  });

  it("S-4: closes on overlay click", () => {
    cy.get('.header-icon-btn[aria-label="Settings"]').click();
    cy.get(".settings-modal").should("be.visible");
    cy.get(".settings-overlay").click({ force: true });
    cy.get(".settings-modal").should("not.exist");
  });

  it("S-5: closes on Escape key", () => {
    cy.get('.header-icon-btn[aria-label="Settings"]').click();
    cy.get(".settings-modal").should("be.visible");
    cy.get("body").type("{esc}");
    cy.get(".settings-modal").should("not.exist");
  });

  it("S-6: closes on X button", () => {
    cy.get('.header-icon-btn[aria-label="Settings"]').click();
    cy.get(".settings-modal").should("be.visible");
    cy.get(".settings-close-btn").click();
    cy.get(".settings-modal").should("not.exist");
  });
});

describe("Settings - Account Tab", () => {
  beforeEach(() => {
    cy.goToMainApp();
    cy.get('.header-icon-btn[aria-label="Settings"]').click();
  });

  it("SA-1: displays user name and email", () => {
    cy.get(".settings-user-name").should("contain.text", "Test User");
    cy.get(".settings-user-email").should("contain.text", "test@example.com");
  });

  it("SA-2: password reset button visible for email users", () => {
    cy.contains("Reset password").should("be.visible");
  });

  it("SA-3: password reset button hidden for Google users", () => {
    // Re-visit with a Google provider user
    cy.visit("/", {
      onBeforeLoad(win) {
        win.__CYPRESS_MOCK_USER__ = {
          uid: "google-user-456",
          email: "google@example.com",
          displayName: "Google User",
          photoURL: "https://example.com/photo.jpg",
          providerData: [{ providerId: "google.com" }],
        };
        win.localStorage.setItem("sidekick_seen_welcome", "1");
        win.localStorage.setItem("sidekick_apikey_google-user-456", "sk-test-key-1234567890");
      },
    });
    cy.get('.header-icon-btn[aria-label="Settings"]').click();
    cy.contains("Reset password").should("not.exist");
  });

  it("SA-4: dark/light mode toggle switches theme", () => {
    // App starts in dark mode by default
    cy.get("body").should("have.class", "dark");
    cy.get(".settings-toggle").last().click();
    cy.get("body").should("not.have.class", "dark");
  });

  it("SA-5: theme change persists to localStorage", () => {
    cy.get(".settings-toggle").last().click();
    cy.window().then((win) => {
      expect(win.localStorage.getItem("sidekick_dark_mode")).to.equal("0");
    });
  });

  it("SA-6: sign out button signs out and closes modal", () => {
    cy.get(".settings-signout-btn").click();
    cy.get(".settings-modal").should("not.exist");
  });

  it("SA-7: delete account shows confirmation step", () => {
    cy.get(".settings-delete-btn").click();
    cy.contains("permanently delete").should("be.visible");
    cy.get(".settings-delete-cancel").should("exist");
    cy.get(".settings-delete-confirm-btn").should("exist");
  });

  it("SA-8: delete account cancel returns to idle state", () => {
    cy.get(".settings-delete-btn").click();
    cy.contains("permanently delete").should("be.visible");
    cy.get(".settings-delete-cancel").click();
    cy.get(".settings-delete-btn").should("be.visible");
    cy.contains("permanently delete").should("not.exist");
  });
});

describe("Settings - Formats Tab", () => {
  beforeEach(() => {
    cy.goToMainApp();
    cy.get('.header-icon-btn[aria-label="Settings"]').click();
    cy.contains("Formats").click();
  });

  it("SF-1: displays 5 format presets with toggle switches", () => {
    cy.get(".settings-preset-row").should("have.length", 5);
    cy.contains('"indent"').should("be.visible");
    cy.contains('"new paragraph"').should("be.visible");
    cy.contains('"bullet point"').should("be.visible");
    cy.contains('"heading"').should("be.visible");
    cy.contains('"numbered list"').should("be.visible");
  });

  it("SF-2: toggling a preset updates its visual state", () => {
    cy.get(".settings-preset-row").first().find(".settings-toggle").as("toggle");
    cy.get("@toggle").should("have.class", "on");
    cy.get("@toggle").click();
    cy.get("@toggle").should("not.have.class", "on");
  });

  it("SF-3: preset state persists in localStorage", () => {
    cy.get(".settings-preset-row").first().find(".settings-toggle").click();
    cy.window().then((win) => {
      const presets = JSON.parse(win.localStorage.getItem("sidekick_format_presets"));
      const indent = presets.find((p) => p.id === "indent");
      expect(indent.enabled).to.equal(false);
    });
  });

  it("SF-4: preset state persists across modal open/close", () => {
    // Toggle off the first preset
    cy.get(".settings-preset-row").first().find(".settings-toggle").click();
    cy.get(".settings-preset-row").first().find(".settings-toggle").should("not.have.class", "on");

    // Close and reopen settings
    cy.get(".settings-close-btn").click();
    cy.get('.header-icon-btn[aria-label="Settings"]').click();
    cy.contains("Formats").click();

    // Should still be toggled off
    cy.get(".settings-preset-row").first().find(".settings-toggle").should("not.have.class", "on");
  });
});

describe("Settings - About Tab", () => {
  beforeEach(() => {
    cy.goToMainApp();
    cy.get('.header-icon-btn[aria-label="Settings"]').click();
    cy.contains("About").click();
  });

  it("SB-1: displays app name and version", () => {
    cy.get(".settings-about-name").should("contain.text", "Sidekick");
    cy.get(".settings-about-version").should("contain.text", "1.0.0");
  });

  it("SB-2: displays description, privacy, disclaimer, and credits sections", () => {
    cy.contains("What is Sidekick?").should("be.visible");
    cy.contains("Privacy").should("be.visible");
    cy.contains("Disclaimer").should("be.visible");
    cy.contains("Credits").should("be.visible");
  });
});
