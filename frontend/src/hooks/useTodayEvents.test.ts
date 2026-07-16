import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTodayEvents } from "./useTodayEvents";

describe("useTodayEvents", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts in the loading state", () => {
    vi.mocked(fetch).mockReturnValue(new Promise(() => undefined));

    const { result } = renderHook(() => useTodayEvents());

    expect(result.current.status).toBe("loading");
  });

  it("transitions to success with the parsed payload", async () => {
    const payload = {
      date: "07-16",
      featured: {
        year: 1969,
        text: "Apollo 11 astronauts walk on the Moon.",
        page_title: "Apollo 11",
        extract: null,
        thumbnail_url: null,
        wiki_url: null,
      },
      events: [],
      generated_at: "2026-07-16T00:00:00Z",
    };
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }));

    const { result } = renderHook(() => useTodayEvents());

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });
    if (result.current.status !== "success") throw new Error("expected success state");
    expect(result.current.data.featured.text).toBe("Apollo 11 astronauts walk on the Moon.");
  });

  it("transitions to error when the response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ detail: "date must be in MM-DD format" }), { status: 400 }),
    );

    const { result } = renderHook(() => useTodayEvents("13-40"));

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });
    if (result.current.status !== "error") throw new Error("expected error state");
    expect(result.current.message).toBe("date must be in MM-DD format");
  });

  it("transitions to empty when the payload has no featured event or events", async () => {
    const payload = { date: "07-16", featured: null, events: [], generated_at: "2026-07-16T00:00:00Z" };
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(payload), { status: 200 }));

    const { result } = renderHook(() => useTodayEvents());

    await waitFor(() => {
      expect(result.current.status).toBe("empty");
    });
  });

  it("transitions to error on a network failure", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"));

    const { result } = renderHook(() => useTodayEvents());

    await waitFor(() => {
      expect(result.current.status).toBe("error");
    });
  });
});
