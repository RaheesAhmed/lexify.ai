describe("Document Upload and Analysis Workflow", () => {
  beforeEach(() => {
    // Mock the authentication
    cy.intercept("/api/auth/session", {
      statusCode: 200,
      body: {
        user: {
          id: "test-user-id",
          name: "Test User",
          email: "test@example.com",
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    // Visit the dashboard
    cy.visit("/dashboard");
  });

  it("should upload a document and view its analysis", () => {
    // Mock the document upload response
    cy.intercept("POST", "/api/documents", {
      statusCode: 200,
      body: {
        id: "test-doc-id",
        title: "test-document.pdf",
        status: "PENDING",
      },
    });

    // Mock the document analysis status updates
    cy.intercept("GET", "/api/documents*", {
      statusCode: 200,
      body: {
        documents: [
          {
            id: "test-doc-id",
            title: "test-document.pdf",
            file_type: "application/pdf",
            file_size: 1024,
            created_at: new Date().toISOString(),
            metadata: {
              originalName: "test-document.pdf",
              uploadedAt: new Date().toISOString(),
              status: "ANALYZED",
            },
          },
        ],
      },
    });

    // Upload a document
    cy.get('input[type="file"]').attachFile("test-document.pdf");

    // Wait for upload to complete
    cy.get('[data-testid="upload-progress"]').should("not.exist");

    // Verify document appears in recent documents
    cy.get('[data-testid="recent-documents"]')
      .should("contain", "test-document.pdf")
      .and("contain", "ANALYZED");

    // Click on the document to view analysis
    cy.get('[data-testid="document-link"]').first().click();

    // Verify we're on the document details page
    cy.url().should("include", "/dashboard/documents/test-doc-id");

    // Verify analysis content is displayed
    cy.get('[data-testid="document-analysis"]').should("exist");
  });

  it("should handle upload errors gracefully", () => {
    // Mock a failed upload
    cy.intercept("POST", "/api/documents", {
      statusCode: 400,
      body: {
        error: "Invalid file type",
      },
    });

    // Try to upload an invalid file
    cy.get('input[type="file"]').attachFile("invalid.txt");

    // Verify error message is displayed
    cy.get('[data-testid="error-message"]')
      .should("be.visible")
      .and("contain", "Invalid file type");
  });

  it("should navigate through document analysis tabs", () => {
    // Mock the document details response
    cy.intercept("GET", "/api/documents/test-doc-id", {
      statusCode: 200,
      body: {
        id: "test-doc-id",
        title: "test-document.pdf",
        analysis: {
          summary: "Test summary",
          entities: ["Entity 1", "Entity 2"],
          keyPoints: ["Point 1", "Point 2"],
        },
      },
    });

    // Visit document details page
    cy.visit("/dashboard/documents/test-doc-id");

    // Check summary tab
    cy.get('[role="tab"]').contains("Summary").click();
    cy.get('[data-testid="summary-content"]')
      .should("be.visible")
      .and("contain", "Test summary");

    // Check entities tab
    cy.get('[role="tab"]').contains("Entities").click();
    cy.get('[data-testid="entities-content"]')
      .should("be.visible")
      .and("contain", "Entity 1");

    // Check key points tab
    cy.get('[role="tab"]').contains("Key Points").click();
    cy.get('[data-testid="key-points-content"]')
      .should("be.visible")
      .and("contain", "Point 1");
  });
});
