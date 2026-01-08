import React from "react";
import { render } from "@testing-library/react-native";
import { ThemeProvider } from "../../../context/ThemeContext";
import { ThemeSelector } from "../ThemeSelector";

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};

describe("ThemeSelector", () => {
  it("renders correctly", async () => {
    const { getByText, findByText } = render(<ThemeSelector />, {
      wrapper: AllTheProviders,
    });

    // Wait for theme to load
    await findByText("Appearance");

    expect(getByText("Appearance")).toBeTruthy();
    expect(getByText("Light")).toBeTruthy();
    expect(getByText("Dark")).toBeTruthy();
    expect(getByText("System")).toBeTruthy();
  });

  it("displays all theme options", async () => {
    const { getAllByRole, findByText } = render(<ThemeSelector />, {
      wrapper: AllTheProviders,
    });
    await findByText("Appearance");

    const buttons = getAllByRole("button");
    expect(buttons).toHaveLength(3);
  });
});
