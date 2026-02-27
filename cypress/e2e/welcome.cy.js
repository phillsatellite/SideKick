describe("Onboarding / Welcome", () => {
  it("W-1: first-time user sees Welcome screen", () => {
    cy.visit("/");
    cy.contains("Welcome to Sidekick").should("be.visible");
  });

  it("W-2: Welcome screen displays 3 steps and disclaimer", () => {
    cy.visit("/");
    cy.get(".welcome-step").should("have.length", 3);
    cy.contains("Create your account").should("be.visible");
    cy.contains("Tap the mic and speak").should("be.visible");
    cy.contains("Get formatted notes").should("be.visible");
    cy.contains("note-taking tool only").should("be.visible");
  });

  it("W-3: clicking Continue dismisses Welcome and sets localStorage flag", () => {
    cy.visit("/");
    cy.contains("Welcome to Sidekick").should("be.visible");
    cy.get(".welcome-btn").click();
    cy.contains("Welcome to Sidekick").should("not.exist");
    cy.window().then((win) => {
      expect(win.localStorage.getItem("sidekick_seen_welcome")).to.equal("1");
    });
  });

  it("W-4: returning user skips Welcome screen", () => {
    cy.skipWelcome();
    cy.visit("/");
    cy.contains("Welcome to Sidekick").should("not.exist");
  });
});
