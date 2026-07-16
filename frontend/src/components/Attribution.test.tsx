import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Attribution } from "./Attribution";

describe("Attribution", () => {
  it("links back to the Wikipedia On This Day feed", () => {
    render(<Attribution />);

    expect(screen.getByRole("link", { name: /wikipedia on this day feed/i })).toHaveAttribute(
      "href",
      "https://en.wikipedia.org/wiki/Wikipedia:On_this_day",
    );
  });
});
