import { describe, expect, it } from "vitest";
import { isTextMimeType, resolveResponseEncoding } from "./browser";

describe("isTextMimeType", () => {
  it("treats common text types as text", () => {
    expect(isTextMimeType("text/plain")).toBe(true);
    expect(isTextMimeType("text/html; charset=utf-8")).toBe(true);
    expect(isTextMimeType("application/json")).toBe(true);
    expect(isTextMimeType("application/ld+json")).toBe(true);
    expect(isTextMimeType("application/xml")).toBe(true);
    expect(isTextMimeType("application/xhtml+xml")).toBe(true);
    expect(isTextMimeType("application/javascript")).toBe(true);
  });

  it("treats binary types as non-text", () => {
    expect(isTextMimeType("application/x-msgpack")).toBe(false);
    expect(isTextMimeType("application/msgpack")).toBe(false);
    expect(isTextMimeType("application/octet-stream")).toBe(false);
    expect(isTextMimeType("image/png")).toBe(false);
  });

  it("treats a missing mime type as text", () => {
    expect(isTextMimeType("")).toBe(true);
  });

  it("is case-insensitive and ignores parameters", () => {
    expect(isTextMimeType("APPLICATION/JSON")).toBe(true);
    expect(isTextMimeType("Application/X-MsgPack; charset=binary")).toBe(false);
  });
});

describe("resolveResponseEncoding", () => {
  it("passes through Chrome's encoding flag", () => {
    expect(resolveResponseEncoding("base64", false)).toBe("base64");
    expect(resolveResponseEncoding("", false)).toBe("");
  });

  it("maps Firefox's mime type to an encoding", () => {
    expect(resolveResponseEncoding("application/x-msgpack", true)).toBe("base64");
    expect(resolveResponseEncoding("application/msgpack", true)).toBe("base64");
    expect(resolveResponseEncoding("text/plain", true)).toBe("");
    expect(resolveResponseEncoding("application/json", true)).toBe("");
  });
});
