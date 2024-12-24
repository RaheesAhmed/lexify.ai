describe("Settings Page Workflows", () => {
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

    // Visit the settings page
    cy.visit("/settings");
  });

  it("should update user profile", () => {
    // Mock profile update response
    cy.intercept("PATCH", "/api/user/profile", {
      statusCode: 200,
      body: {
        message: "Profile updated successfully",
      },
    });

    // Fill in profile form
    cy.get('input[name="name"]').clear().type("Updated Name");
    cy.get('input[name="email"]').clear().type("updated@example.com");

    // Submit form
    cy.get('button[type="submit"]').click();

    // Verify success message
    cy.get('[role="status"]')
      .should("be.visible")
      .and("contain", "Profile updated successfully");
  });

  it("should handle profile update errors", () => {
    // Mock profile update error
    cy.intercept("PATCH", "/api/user/profile", {
      statusCode: 400,
      body: {
        error: "Email already in use",
      },
    });

    // Fill in profile form
    cy.get('input[name="name"]').clear().type("Updated Name");
    cy.get('input[name="email"]').clear().type("existing@example.com");

    // Submit form
    cy.get('button[type="submit"]').click();

    // Verify error message
    cy.get('[role="alert"]')
      .should("be.visible")
      .and("contain", "Email already in use");
  });

  it("should manage team members", () => {
    // Mock team members response
    cy.intercept("GET", "/api/team/members", {
      statusCode: 200,
      body: {
        members: [
          {
            id: "member-1",
            name: "Team Member 1",
            email: "member1@example.com",
            role: "MEMBER",
            status: "ACTIVE",
          },
        ],
      },
    });

    // Mock invite response
    cy.intercept("POST", "/api/team/invite", {
      statusCode: 200,
      body: {
        message: "Invitation sent successfully",
      },
    });

    // Switch to team management tab
    cy.get('[role="tab"]').contains("Team Management").click();

    // Fill in invite form
    cy.get('input[name="email"]').type("new@example.com");
    cy.get('select[name="role"]').select("MEMBER");

    // Submit invite
    cy.get("button").contains("Send Invitation").click();

    // Verify success message
    cy.get('[role="status"]')
      .should("be.visible")
      .and("contain", "Invitation sent successfully");

    // Verify member appears in list
    cy.get('[role="table"]')
      .should("contain", "member1@example.com")
      .and("contain", "MEMBER");
  });

  it("should remove team members", () => {
    // Mock team members response
    cy.intercept("GET", "/api/team/members", {
      statusCode: 200,
      body: {
        members: [
          {
            id: "member-1",
            name: "Team Member 1",
            email: "member1@example.com",
            role: "MEMBER",
            status: "ACTIVE",
          },
        ],
      },
    });

    // Mock remove member response
    cy.intercept("DELETE", "/api/team/members/*", {
      statusCode: 200,
      body: {
        message: "Team member removed successfully",
      },
    });

    // Switch to team management tab
    cy.get('[role="tab"]').contains("Team Management").click();

    // Click remove button
    cy.get('[aria-label="Remove team member"]').first().click();

    // Confirm removal
    cy.get("button").contains("Remove").click();

    // Verify success message
    cy.get('[role="status"]')
      .should("be.visible")
      .and("contain", "Team member removed successfully");

    // Verify member is removed from list
    cy.get('[role="table"]').should("not.contain", "member1@example.com");
  });
});
