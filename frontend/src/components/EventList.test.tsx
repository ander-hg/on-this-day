import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { TodayEvent } from "../api/types";
import { EventList } from "./EventList";

const events: TodayEvent[] = [
  {
    year: 1815,
    text: "The Battle of Waterloo is fought.",
    page_title: "Battle of Waterloo",
    extract: null,
    thumbnail_url: null,
    wiki_url: "https://en.wikipedia.org/wiki/Battle_of_Waterloo",
  },
  {
    year: 1990,
    text: "The Hubble Space Telescope is launched.",
    page_title: null,
    extract: null,
    thumbnail_url: null,
    wiki_url: null,
  },
];

describe("EventList", () => {
  it("renders one item per event with a source link when available", () => {
    render(<EventList events={events} />);

    expect(screen.getByText("1815")).toBeInTheDocument();
    expect(screen.getByText(/battle of waterloo is fought/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /battle of waterloo/i })).toHaveAttribute(
      "href",
      "https://en.wikipedia.org/wiki/Battle_of_Waterloo",
    );
    expect(screen.getByText(/hubble space telescope is launched/i)).toBeInTheDocument();
  });

  it("renders nothing when there are no events", () => {
    const { container } = render(<EventList events={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
