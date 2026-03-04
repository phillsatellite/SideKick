describe("Main App - Mic Button", () => {
  beforeEach(() => {
    cy.goToMainApp();
  });

  it("M-1: mic button renders in idle state with 'Tap to speak'", () => {
    cy.get(".mic-btn").should("be.visible");
    cy.contains("Tap to speak").should("be.visible");
  });

  it("M-2: clicking mic toggles to recording state with stop icon", () => {
    cy.get(".mic-btn").click();
    cy.get(".mic-btn").should("have.class", "recording");
    cy.contains("Listening").should("be.visible");
  });

  it("M-3: waveform animation visible during recording", () => {
    cy.get(".mic-btn").click();
    cy.get(".mic-wave.active").should("be.visible");
    cy.get(".mic-wave-bar").should("have.length", 7);
  });

  it("M-4: clicking again stops recording and shows Processing", () => {
    cy.get(".mic-btn").click();
    cy.get(".mic-btn").click();
    cy.contains("Processing").should("be.visible");
  });

  it("M-5: output appears in OutputBox after processing completes", () => {
    cy.get(".mic-btn").click();
    cy.get(".mic-btn").click();
    cy.get(".output-text", { timeout: 5000 }).should("be.visible");
    cy.get(".output-text").should("contain.text", "Technology");
  });

  it("M-6: mic button is disabled during processing", () => {
    cy.get(".mic-btn").click();
    cy.get(".mic-btn").click();
    cy.get(".mic-btn").should("be.disabled");
  });
});

describe("Main App - Output Box", () => {
  beforeEach(() => {
    cy.goToMainApp();
  });

  it("O-1: shows empty state when no output", () => {
    cy.get(".chat-empty").should("be.visible");
    cy.contains("Tap the mic to start recording").should("be.visible");
  });

  it("O-2: displays formatted text after recording", () => {
    cy.get(".mic-btn").click();
    cy.get(".mic-btn").click();
    cy.get(".output-text", { timeout: 5000 }).should("be.visible");
  });

  it("O-3: copy button triggers clipboard copy and shows check icon", () => {
    cy.get(".mic-btn").click();
    cy.get(".mic-btn").click();
    cy.get(".output-text", { timeout: 5000 }).should("be.visible");

    // Grant clipboard permissions and click copy
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, "writeText").resolves();
    });
    cy.get('.output-icon-btn[title="Copy text"]').click();
    cy.get(".output-icon-btn.copied").should("exist");
  });

  it("O-4: export button opens ExportModal", () => {
    cy.get(".mic-btn").click();
    cy.get(".mic-btn").click();
    cy.get(".output-text", { timeout: 5000 }).should("be.visible");
    cy.get('.output-icon-btn[title="Export"]').click();
    cy.get(".export-modal").should("be.visible");
  });

  it("O-5: action buttons not visible when no output (empty state shown)", () => {
    // When there's no output, the empty state is shown instead of OutputBox
    cy.get(".chat-empty").should("be.visible");
    cy.get(".output-icon-btn").should("not.exist");
  });
});

describe("Main App - Conversations", () => {
  beforeEach(() => {
    cy.goToMainApp();
  });

  it("H-1: no conversations in sidebar when none exist", () => {
    cy.get(".sidebar-convo-btn").should("not.exist");
    cy.contains("No conversations yet").should("exist");
  });

  it("H-2: conversation appears in sidebar after first recording", () => {
    cy.get(".mic-btn").click();
    cy.get(".mic-btn").click();
    cy.get(".output-text", { timeout: 5000 }).should("be.visible");
    cy.get(".sidebar-convo-btn").should("have.length", 1);
  });

  it("H-3: clicking a conversation restores its text to OutputBox", () => {
    // Create a recording first
    cy.get(".mic-btn").click();
    cy.get(".mic-btn").click();
    cy.get(".output-text", { timeout: 5000 }).should("be.visible");

    // Start a new conversation (clears output)
    cy.get(".sidebar-new-btn").click();
    cy.get(".chat-empty").should("be.visible");

    // Click the sidebar conversation to restore
    cy.get(".sidebar-convo-btn").first().click();
    cy.get(".output-text").should("be.visible");
  });

  it("H-4: new chat button clears output", () => {
    cy.get(".mic-btn").click();
    cy.get(".mic-btn").click();
    cy.get(".output-text", { timeout: 5000 }).should("be.visible");

    cy.get(".sidebar-new-btn").click();
    cy.get(".chat-empty").should("be.visible");
  });
});
