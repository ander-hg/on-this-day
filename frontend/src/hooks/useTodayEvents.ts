import { useEffect, useState } from "react";

import type { TodayResponse } from "../api/types";

export type TodayEventsState =
  | { status: "loading" }
  | { status: "success"; data: TodayResponse }
  | { status: "empty" }
  | { status: "error"; message: string };

function isEmptyPayload(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  const hasFeatured = record.featured !== null && record.featured !== undefined;
  const hasEvents = Array.isArray(record.events) && record.events.length > 0;
  return !hasFeatured && !hasEvents;
}

function isTodayResponse(value: unknown): value is TodayResponse {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.date === "string" &&
    typeof record.generated_at === "string" &&
    Array.isArray(record.events) &&
    typeof record.featured === "object" &&
    record.featured !== null
  );
}

async function extractErrorMessage(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null);
  if (
    body &&
    typeof body === "object" &&
    "detail" in body &&
    typeof (body as Record<string, unknown>).detail === "string"
  ) {
    return (body as Record<string, string>).detail;
  }
  return `Request failed with status ${String(response.status)}`;
}

export function useTodayEvents(date?: string): TodayEventsState {
  const [state, setState] = useState<TodayEventsState>({ status: "loading" });
  const [pendingDate, setPendingDate] = useState(date);

  if (date !== pendingDate) {
    setPendingDate(date);
    setState({ status: "loading" });
  }

  useEffect(() => {
    const controller = new AbortController();
    const url = date ? `/api/today?date=${encodeURIComponent(date)}` : "/api/today";

    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(await extractErrorMessage(response));
        }
        return (await response.json()) as unknown;
      })
      .then((json) => {
        if (isEmptyPayload(json)) {
          setState({ status: "empty" });
          return;
        }
        if (!isTodayResponse(json)) {
          throw new Error("Received an unexpected response shape from the server");
        }
        setState({ status: "success", data: json });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        const message = error instanceof Error ? error.message : "Something went wrong";
        setState({ status: "error", message });
      });

    return () => {
      controller.abort();
    };
  }, [date]);

  return state;
}
