import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ErrorState } from "./ErrorState";

describe("ErrorState", () => {
  it("announces the error message as an alert", () => {
    render(<ErrorState message="Wikipedia request timed out" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Wikipedia request timed out");
  });
});
