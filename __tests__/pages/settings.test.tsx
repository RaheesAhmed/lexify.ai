import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsPage from "@/app/(dashboard)/settings/page";

// Mock the dynamic imports
jest.mock("@/components/settings/user-profile-form", () => ({
  UserProfileForm: () => (
    <div data-testid="user-profile-form">User Profile Form</div>
  ),
}));

jest.mock("@/components/settings/team-management", () => ({
  TeamManagement: () => (
    <div data-testid="team-management">Team Management</div>
  ),
}));

describe("SettingsPage", () => {
  it("renders loading state initially", () => {
    render(<SettingsPage />);
    expect(screen.getByText("Loading settings...")).toBeInTheDocument();
  });

  it("renders settings page with tabs", async () => {
    render(<SettingsPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Settings" })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("tablist", { name: "Settings sections" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "User Profile" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Team Management" })
    ).toBeInTheDocument();
  });

  it("switches between tabs", async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Settings" })
      ).toBeInTheDocument();
    });

    // Initially shows User Profile
    expect(
      screen.getByRole("tabpanel", { name: "User profile settings" })
    ).toBeInTheDocument();

    // Switch to Team Management
    await user.click(screen.getByRole("tab", { name: "Team Management" }));
    expect(
      screen.getByRole("tabpanel", { name: "Team management settings" })
    ).toBeInTheDocument();

    // Switch back to User Profile
    await user.click(screen.getByRole("tab", { name: "User Profile" }));
    expect(
      screen.getByRole("tabpanel", { name: "User profile settings" })
    ).toBeInTheDocument();
  });

  it("loads components dynamically", async () => {
    render(<SettingsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("user-profile-form")).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: "Team Management" }));

    await waitFor(() => {
      expect(screen.getByTestId("team-management")).toBeInTheDocument();
    });
  });
});
