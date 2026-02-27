describe("API Key Setup", () => {
  beforeEach(() => {
    cy.skipWelcome();
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

  it("K-1: API key screen appears after auth when no key is stored", () => {
    cy.contains("Almost there").should("be.visible");
    cy.get(".setup-input").should("exist");
  });

  it("K-2: submit button disabled when key is shorter than 10 characters", () => {
    cy.get(".setup-input").type("short");
    cy.get(".setup-submit-btn").should("be.disabled");
  });

  it("K-3: submit button enabled when key is 10+ characters", () => {
    cy.get(".setup-input").type("sk-test-key-1234567890");
    cy.get(".setup-submit-btn").should("not.be.disabled");
  });

  it("K-4: submitting valid key transitions to main app", () => {
    cy.get(".setup-input").type("sk-test-key-1234567890");
    cy.get(".setup-submit-btn").click();
    cy.get(".mic-btn").should("be.visible");
  });

  it("K-5: eye icon toggles key visibility", () => {
    cy.get(".setup-input").should("have.attr", "type", "password");
    cy.get(".setup-eye-btn").click();
    cy.get(".setup-input").should("have.attr", "type", "text");
    cy.get(".setup-eye-btn").click();
    cy.get(".setup-input").should("have.attr", "type", "password");
  });

  it("K-6: key persists in localStorage scoped to user UID", () => {
    const testKey = "sk-test-key-1234567890";
    cy.get(".setup-input").type(testKey);
    cy.get(".setup-submit-btn").click();
    cy.window().then((win) => {
      expect(win.localStorage.getItem("sidekick_apikey_test-user-123")).to.equal(testKey);
    });
  });
});
