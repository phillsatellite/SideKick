describe("Authentication", () => {
  beforeEach(() => {
    cy.skipWelcome();
    cy.visit("/");
  });

  it("A-1: shows Create Account tab by default with username, email, password fields", () => {
    cy.contains("Create Account").should("have.class", "auth-tab-btn active");
    cy.get('.auth-input[placeholder="your-username"]').should("exist");
    cy.get('.auth-input[type="email"]').should("exist");
    cy.get('.auth-input-password').should("exist");
  });

  it("A-2: submit button disabled when username is missing", () => {
    cy.get('.auth-input[type="email"]').type("test@example.com");
    cy.get(".auth-input-password").type("password123");
    // canSubmit requires username.trim() to be truthy, so button stays disabled
    cy.get(".auth-submit-btn").should("be.disabled");
  });

  it("A-3: shows error when creating account with invalid email", () => {
    cy.get('.auth-input[placeholder="your-username"]').type("testuser");
    cy.get('.auth-input[type="email"]').type("not-an-email");
    cy.get(".auth-input-password").type("password123");
    cy.get(".auth-submit-btn").click();
    // Firebase will return an invalid-email error
    cy.get(".auth-error").should("be.visible");
  });

  it("A-4: submit button disabled when password is under 8 characters", () => {
    cy.get('.auth-input[placeholder="your-username"]').type("testuser");
    cy.get('.auth-input[type="email"]').type("test@example.com");
    cy.get(".auth-input-password").type("short");
    cy.get(".auth-submit-btn").should("be.disabled");
  });

  it("A-5: Sign In tab shows email and password fields without username", () => {
    cy.contains("Sign In").click();
    cy.get('.auth-input[placeholder="your-username"]').should("not.exist");
    cy.get('.auth-input[type="email"]').should("exist");
    cy.get(".auth-input-password").should("exist");
  });

  it("A-6: Sign In with wrong password shows error", () => {
    cy.contains("Sign In").click();
    cy.get('.auth-input[type="email"]').type("test@example.com");
    cy.get(".auth-input-password").type("wrongpassword");
    cy.get(".auth-submit-btn").click();
    cy.get(".auth-error").should("be.visible");
  });

  it("A-7: Sign In with nonexistent email shows error", () => {
    cy.contains("Sign In").click();
    cy.get('.auth-input[type="email"]').type("nonexistent@example.com");
    cy.get(".auth-input-password").type("password123");
    cy.get(".auth-submit-btn").click();
    cy.get(".auth-error").should("be.visible");
  });

  it("A-8: switching tabs clears form fields", () => {
    cy.get('.auth-input[placeholder="your-username"]').type("testuser");
    cy.get('.auth-input[type="email"]').type("test@example.com");
    cy.get(".auth-input-password").type("password123");

    // Switch to Sign In
    cy.contains("Sign In").click();
    cy.get('.auth-input[type="email"]').should("have.value", "");
    cy.get(".auth-input-password").should("have.value", "");

    // Switch back to Create Account
    cy.contains("Create Account").click();
    cy.get('.auth-input[placeholder="your-username"]').should("have.value", "");
    cy.get('.auth-input[type="email"]').should("have.value", "");
  });

  it("A-9: Forgot password link only visible on Sign In tab", () => {
    cy.get(".auth-forgot-link").should("not.exist");
    cy.contains("Sign In").click();
    cy.get(".auth-forgot-link").should("be.visible");
  });

  it("A-10: Google SSO button renders with correct text per tab", () => {
    cy.contains("Sign up with Google").should("be.visible");
    cy.contains("Sign In").click();
    cy.contains("Sign in with Google").should("be.visible");
  });

  it("A-11: Sign out clears state and returns to API key screen", () => {
    cy.goToMainApp();
    cy.get(".app-signout-btn").click();
    // With mock user, signOut clears apiKey but user persists (no real Firebase listener).
    // App shows API key setup screen since user exists but apiKey is empty.
    cy.get(".setup-card").should("exist");
  });
});
