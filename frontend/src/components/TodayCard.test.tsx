import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { TodayEvent } from "../api/types";
import { TodayCard } from "./TodayCard";

const baseEvent: TodayEvent = {
  year: 1969,
  text: "Apollo 11 astronauts walk on the Moon.",
  page_title: "Apollo 11",
  extract: "Apollo 11 was the spaceflight that first landed humans on the Moon.",
  thumbnail_url: "https://example.com/apollo11.jpg",
  wiki_url: "https://en.wikipedia.org/wiki/Apollo_11",
};

describe("TodayCard", () => {
  it("renders the year, text, extract, and a link to Wikipedia", () => {
    render(<TodayCard event={baseEvent} />);

    expect(screen.getByText("1969")).toBeInTheDocument();
    expect(screen.getByText(baseEvent.text)).toBeInTheDocument();
    expect(screen.getByText(baseEvent.extract as string)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /read more on wikipedia/i })).toHaveAttribute(
      "href",
      baseEvent.wiki_url,
    );
  });

  it("omits the image when no thumbnail is available", () => {
    render(<TodayCard event={{ ...baseEvent, thumbnail_url: null }} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
