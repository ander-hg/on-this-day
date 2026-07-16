import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoadingState } from "./LoadingState";

describe("LoadingState", () => {
  it("announces the loading status", () => {
    render(<LoadingState />);

    expect(screen.getByRole("status")).toHaveTextContent(/loading/i);
  });
});
