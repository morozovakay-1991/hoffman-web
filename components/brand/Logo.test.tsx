import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "./Logo";

describe("Logo", () => {
  it("отображает название бренда", () => {
    render(<Logo />);
    expect(screen.getByText("Hoffman")).toBeInTheDocument();
  });
});
