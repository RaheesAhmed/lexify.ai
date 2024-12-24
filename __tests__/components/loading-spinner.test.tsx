import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

describe("LoadingSpinner", () => {
  it("renders with default props", () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders with custom label", () => {
    render(<LoadingSpinner label="Custom loading message" />);
    expect(screen.getByText("Custom loading message")).toBeInTheDocument();
  });

  it("renders with different sizes", () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    expect(screen.getByRole("status").querySelector("svg")).toHaveClass(
      "h-4 w-4"
    );

    rerender(<LoadingSpinner size="md" />);
    expect(screen.getByRole("status").querySelector("svg")).toHaveClass(
      "h-8 w-8"
    );

    rerender(<LoadingSpinner size="lg" />);
    expect(screen.getByRole("status").querySelector("svg")).toHaveClass(
      "h-12 w-12"
    );
  });

  it("renders fullscreen overlay when fullScreen is true", () => {
    render(<LoadingSpinner fullScreen />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });
});
