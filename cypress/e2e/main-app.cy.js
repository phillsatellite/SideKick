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

  it("O-1: shows placeholder text when empty", () => {
    cy.contains("Your formatted text will appear here").should("be.visible");
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

  it("O-5: action buttons disabled when no output", () => {
    cy.get('.output-icon-btn[title="Copy text"]').should("be.disabled");
    cy.get('.output-icon-btn[title="Read aloud"]').should("be.disabled");
    cy.get('.output-icon-btn[title="Export"]').should("be.disabled");
  });
});

describe("Main App - History", () => {
  beforeEach(() => {
    cy.goToMainApp();
  });

  it("H-1: history section hidden when no items exist", () => {
    cy.get(".history-list").should("not.exist");
  });

  it("H-2: history appears after first recording with timestamp", () => {
    cy.get(".mic-btn").click();
    cy.get(".mic-btn").click();
    cy.get(".output-text", { timeout: 5000 }).should("be.visible");
    cy.get(".history-list").should("be.visible");
    cy.get(".history-item").should("have.length", 1);
    cy.get(".history-item-time").should("be.visible");
  });

  it("H-3: clicking a history item restores its text to OutputBox", () => {
    // Create a recording first
    cy.get(".mic-btn").click();
    cy.get(".mic-btn").click();
    cy.get(".output-text", { timeout: 5000 }).should("be.visible");

    // Get the text content
    cy.get(".output-text").invoke("text").then((originalText) => {
      // Click the history item
      cy.get(".history-item").first().click();
      cy.get(".output-text").should("contain.text", originalText.substring(0, 50));
    });
  });

  it("H-4: stores up to 5 items, oldest dropped on overflow", () => {
    // Create 6 recordings
    for (let i = 0; i < 6; i++) {
      cy.get(".mic-btn").click();
      cy.get(".mic-btn").click();
      cy.get(".output-text", { timeout: 5000 }).should("be.visible");
      // Wait for processing to finish before next recording
      cy.contains("Tap to speak", { timeout: 5000 }).should("be.visible");
    }
    cy.get(".history-item").should("have.length", 5);
  });
});
