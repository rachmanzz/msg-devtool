import { describe, expect, it } from "vitest";
import { parseContentTypes } from "./settings";

describe("parseContentTypes", () => {
  it("splits, trims, and drops blanks", () => {
    expect(parseContentTypes(" a/b , c/d ,,  e/f  ")).toEqual(["a/b", "c/d", "e/f"]);
  });

  it("returns empty array for empty input", () => {
    expect(parseContentTypes("")).toEqual([]);
    expect(parseContentTypes(" , , ")).toEqual([]);
  });
});
