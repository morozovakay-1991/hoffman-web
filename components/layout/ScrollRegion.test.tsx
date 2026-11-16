import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScrollRegion } from "./ScrollRegion";

/** jsdom не считает раскладку: задаём ширины прокрутки и вызываем ResizeObserver вручную. */
function stubLayout(scrollWidth: number, clientWidth: number) {
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(scrollWidth);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(clientWidth);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private callback: () => void) {}
      observe() {
        this.callback();
      }
      disconnect() {}
    },
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("ScrollRegion", () => {
  it("содержимое прокручивается — подписанная область, доступная с клавиатуры", () => {
    stubLayout(1200, 390);
    render(<ScrollRegion label="Карточки">контент</ScrollRegion>);
    const region = screen.getByRole("region", { name: "Карточки" });
    expect(region).toHaveAttribute("tabindex", "0");
  });

  it("прокрутки нет (десктопная сетка) — обычный блок без остановки Tab", () => {
    stubLayout(1440, 1440);
    render(<ScrollRegion label="Карточки">контент</ScrollRegion>);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(screen.getByText("контент")).not.toHaveAttribute("tabindex");
  });
});
