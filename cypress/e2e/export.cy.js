describe("Export Modal", () => {
  beforeEach(() => {
    cy.goToMainApp();
    // Create output so export button is enabled
    cy.get(".mic-btn").click();
    cy.get(".mic-btn").click();
    cy.get(".output-text", { timeout: 5000 }).should("be.visible");
  });

  it("E-1: opens when export button is clicked", () => {
    cy.get('.output-icon-btn[title="Export"]').click();
    cy.get(".export-modal").should("be.visible");
  });

  it("E-2: four format buttons render (PDF, DOCX, TXT, MD)", () => {
    cy.get('.output-icon-btn[title="Export"]').click();
    cy.get(".export-format-btn").should("have.length", 4);
    cy.contains("PDF").should("be.visible");
    cy.contains("DOCX").should("be.visible");
    cy.contains("TXT").should("be.visible");
    cy.contains("MD").should("be.visible");
  });

  it("E-3: selecting a format highlights it", () => {
    cy.get('.output-icon-btn[title="Export"]').click();
    // PDF is selected by default
    cy.contains("PDF").closest(".export-format-btn").should("have.class", "selected");
    // Click TXT
    cy.contains("TXT").click();
    cy.contains("TXT").closest(".export-format-btn").should("have.class", "selected");
    cy.contains("PDF").closest(".export-format-btn").should("not.have.class", "selected");
  });

  it("E-4: save to computer triggers file download", () => {
    cy.get('.output-icon-btn[title="Export"]').click();
    cy.contains("Save to computer").click();
    cy.contains("File downloaded!").should("be.visible");
  });

  it("E-5: Google Drive button shows correct label", () => {
    cy.get('.output-icon-btn[title="Export"]').click();
    // Without Google connected, should show connect text
    cy.get(".export-dest-btn").last().should("contain.text", "Google Drive");
  });

  it("E-6: closes on overlay click", () => {
    cy.get('.output-icon-btn[title="Export"]').click();
    cy.get(".export-modal").should("be.visible");
    cy.get(".export-overlay").click({ force: true });
    cy.get(".export-modal").should("not.exist");
  });

  it("E-7: closes on Escape key", () => {
    cy.get('.output-icon-btn[title="Export"]').click();
    cy.get(".export-modal").should("be.visible");
    cy.get("body").type("{esc}");
    cy.get(".export-modal").should("not.exist");
  });
});
