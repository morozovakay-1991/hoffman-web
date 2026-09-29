import { describe, expect, it } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodeInput, emptyCode } from "./CodeInput";

function Harness() {
  const [code, setCode] = useState(emptyCode);
  return (
    <>
      <CodeInput value={code} onChange={setCode} />
      <output>{code.join("")}</output>
    </>
  );
}

const cell = (n: number) => screen.getByLabelText(`Цифра ${n} из 6`);

describe("CodeInput", () => {
  it("рисует 6 ячеек и переводит фокус при вводе", async () => {
    render(<Harness />);
    expect(screen.getAllByRole("textbox")).toHaveLength(6);

    await userEvent.type(cell(1), "12");
    expect(cell(3)).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("12");
  });

  it("игнорирует не-цифры", async () => {
    render(<Harness />);
    await userEvent.type(cell(1), "a");
    expect(cell(1)).toHaveValue("");
  });

  it("раскладывает вставленный код по ячейкам", async () => {
    render(<Harness />);
    cell(1).focus();
    await userEvent.paste("12 34 56");
    expect(screen.getByRole("status")).toHaveTextContent("123456");
    expect(cell(6)).toHaveFocus();
  });

  it("Backspace в пустой ячейке стирает предыдущую", async () => {
    render(<Harness />);
    await userEvent.type(cell(1), "12");
    await userEvent.keyboard("{Backspace}");
    expect(cell(2)).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(/^1$/);
  });
});
