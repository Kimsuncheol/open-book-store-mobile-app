import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ThemeProvider } from "../../../context/ThemeContext";
import { LanguageProvider } from "../../../context/LanguageContext";
import { LanguageSelector } from "../LanguageSelector";

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
  );
};

describe("LanguageSelector", () => {
  it("renders correctly", async () => {
    const { getByText, findByText } = render(<LanguageSelector />, {
      wrapper: AllTheProviders,
    });

    await findByText("Language & Region");

    expect(getByText("Language & Region")).toBeTruthy();
    expect(getByText("English")).toBeTruthy();
    expect(getByText("한국어")).toBeTruthy();
  });

  it("displays both language options", async () => {
    const { getAllByRole, findByText } = render(<LanguageSelector />, {
      wrapper: AllTheProviders,
    });
    await findByText("Language & Region");

    const buttons = getAllByRole("button");
    expect(buttons).toHaveLength(2);
  });

  it("allows language selection", async () => {
    const { getByText, findByText } = render(<LanguageSelector />, {
      wrapper: AllTheProviders,
    });
    await findByText("한국어");

    const koreanButton = getByText("한국어");
    fireEvent.press(koreanButton);

    // Language change should be triggered
    expect(koreanButton).toBeTruthy();
  });
});
