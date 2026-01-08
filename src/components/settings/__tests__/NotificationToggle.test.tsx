import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ThemeProvider } from "../../../context/ThemeContext";
import { NotificationToggle } from "../NotificationToggle";

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};

describe("NotificationToggle", () => {
  it("renders correctly", () => {
    const mockOnChange = jest.fn();
    const { getByText } = render(
      <NotificationToggle value={false} onValueChange={mockOnChange} />,
      { wrapper: AllTheProviders }
    );

    expect(getByText("Notifications")).toBeTruthy();
    expect(getByText("Push Notifications")).toBeTruthy();
  });

  it("calls onValueChange when toggled", () => {
    const mockOnChange = jest.fn();
    const { getByRole } = render(
      <NotificationToggle value={false} onValueChange={mockOnChange} />,
      { wrapper: AllTheProviders }
    );

    const toggle = getByRole("switch");
    fireEvent(toggle, "valueChange", true);

    expect(mockOnChange).toHaveBeenCalledWith(true);
  });
});
