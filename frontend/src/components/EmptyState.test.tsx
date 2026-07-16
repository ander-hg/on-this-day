import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("tells the user no events were found", () => {
    render(<EmptyState />);

    expect(screen.getByRole("status")).toHaveTextContent(/no historical events/i);
  });
});
