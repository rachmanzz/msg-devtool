import { decode, encode } from "@msgpack/msgpack";
import { describe, expect, it } from "vitest";
import {
  base64ToUint8Array,
  decodeMsgpackBody,
  DEFAULT_MSGPACK_CONTENT_TYPES,
  estimateByteLength,
  isMsgPackContentType,
  uint8ArrayToBase64,
} from "./decode";

describe("base64ToUint8Array / uint8ArrayToBase64", () => {
  it("round-trips arbitrary bytes", () => {
    const original = new Uint8Array([0, 1, 127, 128, 254, 255]);
    expect(base64ToUint8Array(uint8ArrayToBase64(original))).toEqual(original);
  });

  it("decodes well-known base64", () => {
    expect(base64ToUint8Array("AAH/8g==")).toEqual(
      new Uint8Array([0x00, 0x01, 0xff, 0xf2]),
    );
  });
});

describe("isMsgPackContentType", () => {
  it("matches default content types", () => {
    for (const type of DEFAULT_MSGPACK_CONTENT_TYPES) {
      expect(isMsgPackContentType(type)).toBe(true);
    }
  });

  it("is case-insensitive and matches within parameterized values", () => {
    expect(isMsgPackContentType("Application/X-MsgPack; charset=utf-8")).toBe(true);
    expect(isMsgPackContentType("application/msgpack; charset=binary")).toBe(true);
  });

  it("rejects unrelated content types", () => {
    expect(isMsgPackContentType("application/json")).toBe(false);
    expect(isMsgPackContentType("text/html")).toBe(false);
    expect(isMsgPackContentType("")).toBe(false);
  });

  it("matches custom content types", () => {
    expect(
      isMsgPackContentType("application/vnd.mycompany.msgpack", [
        "application/vnd.mycompany.msgpack",
      ]),
    ).toBe(true);
    expect(
      isMsgPackContentType("application/vnd.other", ["application/vnd.mycompany"]),
    ).toBe(false);
  });

  it("ignores blank custom entries", () => {
    expect(isMsgPackContentType("application/json", ["", "   "])).toBe(false);
  });
});

describe("estimateByteLength", () => {
  it("estimates decoded size of base64 with and without padding", () => {
    expect(estimateByteLength("AAAA", "base64")).toBe(3);
    expect(estimateByteLength("AA==", "base64")).toBe(1);
    expect(estimateByteLength("AA=", "base64")).toBe(1);
    expect(estimateByteLength("", "base64")).toBe(0);
  });

  it("returns content length for non-base64 bodies", () => {
    expect(estimateByteLength("hello")).toBe(5);
  });
});

describe("decodeMsgpackBody", () => {
  it("decodes a base64 MessagePack payload", () => {
    const payload = { name: "natadana", items: [1, 2, 3], nested: { ok: true } };
    const base64 = uint8ArrayToBase64(encode(payload));
    const result = decodeMsgpackBody(base64, "base64");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.decoded).toEqual(payload);
      expect(result.byteLength).toBe(encode(payload).byteLength);
    }
  });

  it("round-trips binary values", () => {
    const payload = { blob: new Uint8Array([1, 2, 250]) };
    const base64 = uint8ArrayToBase64(encode(payload));
    const result = decodeMsgpackBody(base64, "base64");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(decode(encode(result.decoded))).toEqual(payload);
    }
  });

  it("returns an error result for invalid MessagePack", () => {
    const result = decodeMsgpackBody(
      uint8ArrayToBase64(new Uint8Array([0xc1, 0x00])),
      "base64",
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeTruthy();
    }
  });

  it("handles non-base64 string bodies via UTF-8 encoding", () => {
    const payload = { hello: "world" };
    const result = decodeMsgpackBody(String.fromCharCode(...encode(payload)));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.decoded).toEqual(payload);
    }
  });
});
