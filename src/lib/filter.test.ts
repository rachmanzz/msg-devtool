import { describe, expect, it } from "vitest";
import { filterCaptures } from "./filter";
import type { Capture } from "./types";

function capture(overrides: Partial<Capture>): Capture {
  return {
    id: 1,
    url: "https://api.example.com/users",
    method: "GET",
    status: 200,
    statusText: "OK",
    decoded: { ok: true },
    size: 42,
    time: 1_700_000_000_000,
    duration: 12.5,
    ...overrides,
  };
}

describe("filterCaptures", () => {
  const captures = [
    capture({ id: 1, url: "https://api.example.com/users", method: "GET", status: 200 }),
    capture({ id: 2, url: "https://cdn.example.com/blob", method: "POST", status: 500 }),
    capture({ id: 3, url: "https://api.example.com/orders", method: "PUT", status: 201 }),
  ];

  it("returns everything for empty or whitespace queries", () => {
    expect(filterCaptures(captures, "")).toHaveLength(3);
    expect(filterCaptures(captures, "   ")).toHaveLength(3);
  });

  it("filters by URL substring, case-insensitively", () => {
    expect(filterCaptures(captures, "API.EXAMPLE").map((c) => c.id)).toEqual([1, 3]);
  });

  it("filters by method", () => {
    expect(filterCaptures(captures, "post").map((c) => c.id)).toEqual([2]);
  });

  it("filters by status code", () => {
    expect(filterCaptures(captures, "500").map((c) => c.id)).toEqual([2]);
    expect(filterCaptures(captures, "201").map((c) => c.id)).toEqual([3]);
  });

  it("filters by decode error message", () => {
    const withError = capture({ id: 9, error: "Invalid symbol: c1" });
    expect(filterCaptures([withError], "invalid symbol").map((c) => c.id)).toEqual([9]);
  });

  it("returns empty array when nothing matches", () => {
    expect(filterCaptures(captures, "nonexistent")).toEqual([]);
  });
});
