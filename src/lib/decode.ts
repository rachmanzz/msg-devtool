import { decode } from "@msgpack/msgpack";

export const DEFAULT_MSGPACK_CONTENT_TYPES = [
  "application/x-msgpack",
  "application/msgpack",
  "application/vnd.msgpack",
];

export interface DecodeSuccess {
  ok: true;
  decoded: unknown;
  byteLength: number;
}

export interface DecodeFailure {
  ok: false;
  error: string;
  byteLength: number;
}

export type DecodeResult = DecodeSuccess | DecodeFailure;

export function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  return binaryStringToUint8Array(binary);
}

export function binaryStringToUint8Array(binary: string): Uint8Array {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export function isMsgPackContentType(
  value: string,
  customTypes: readonly string[] = [],
): boolean {
  const lower = value.toLowerCase();
  const types = [...DEFAULT_MSGPACK_CONTENT_TYPES, ...customTypes];
  return types.some((type) => type.trim() !== "" && lower.includes(type.toLowerCase()));
}

export function estimateByteLength(content: string, encoding?: string): number {
  if (encoding === "base64") {
    const padding = content.endsWith("==") ? 2 : content.endsWith("=") ? 1 : 0;
    return Math.max(0, Math.floor((content.length * 3) / 4) - padding);
  }
  return content.length;
}

export function decodeMsgpackBody(content: string, encoding?: string): DecodeResult {
  const byteLength = estimateByteLength(content, encoding);
  try {
    const bytes =
      encoding === "base64"
        ? base64ToUint8Array(content)
        : binaryStringToUint8Array(content);
    const decoded = decode(bytes);
    return { ok: true, decoded, byteLength: bytes.byteLength };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      byteLength,
    };
  }
}
