/**
 * Minimal, dependency-free MessagePack encoder.
 *
 * Supports the subset of types the demo endpoints need: null, boolean,
 * numbers (int/float), strings, binary, arrays and maps. Kept small on
 * purpose so the test server runs with just `node` or `bun` and no install.
 */

const f64 = new Float64Array(1);

function encodeNumber(value, parts) {
  if (Number.isInteger(value)) {
    if (value >= 0) {
      if (value < 0x80) return parts.push(Buffer.from([value]));
      if (value < 0x100) return parts.push(Buffer.from([0xcc, value]));
      if (value < 0x10000) {
        const b = Buffer.allocUnsafe(3);
        b[0] = 0xcd;
        b.writeUInt16BE(value, 1);
        return parts.push(b);
      }
      if (value < 0x100000000) {
        const b = Buffer.allocUnsafe(5);
        b[0] = 0xce;
        b.writeUInt32BE(value, 1);
        return parts.push(b);
      }
      const b = Buffer.allocUnsafe(9);
      b[0] = 0xcf;
      b.writeBigUInt64BE(BigInt(value), 1);
      return parts.push(b);
    }
    if (value >= -0x20) return parts.push(Buffer.from([0xe0 + (value + 0x20)]));
    if (value >= -0x80) return parts.push(Buffer.from([0xd0, value & 0xff]));
    if (value >= -0x8000) {
      const b = Buffer.allocUnsafe(3);
      b[0] = 0xd1;
      b.writeInt16BE(value, 1);
      return parts.push(b);
    }
    if (value >= -0x80000000) {
      const b = Buffer.allocUnsafe(5);
      b[0] = 0xd2;
      b.writeInt32BE(value, 1);
      return parts.push(b);
    }
    const b = Buffer.allocUnsafe(9);
    b[0] = 0xd3;
    b.writeBigInt64BE(BigInt(value), 1);
    return parts.push(b);
  }

  f64[0] = value;
  const b = Buffer.allocUnsafe(9);
  b[0] = 0xcb;
  b.writeDoubleBE(value, 1);
  return parts.push(b);
}

function encodeString(value, parts) {
  const bytes = Buffer.from(value, "utf8");
  const len = bytes.length;
  if (len < 0x20) parts.push(Buffer.from([0xa0 | len]));
  else if (len < 0x100) parts.push(Buffer.from([0xd9, len]));
  else if (len < 0x10000) {
    const b = Buffer.allocUnsafe(3);
    b[0] = 0xda;
    b.writeUInt16BE(len, 1);
    parts.push(b);
  } else {
    const b = Buffer.allocUnsafe(5);
    b[0] = 0xdb;
    b.writeUInt32BE(len, 1);
    parts.push(b);
  }
  return parts.push(bytes);
}

function encodeBinary(value, parts) {
  const bytes = Buffer.isBuffer(value)
    ? value
    : Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  const len = bytes.length;
  if (len < 0x100) parts.push(Buffer.from([0xc4, len]));
  else if (len < 0x10000) {
    const b = Buffer.allocUnsafe(3);
    b[0] = 0xc5;
    b.writeUInt16BE(len, 1);
    parts.push(b);
  } else {
    const b = Buffer.allocUnsafe(5);
    b[0] = 0xc6;
    b.writeUInt32BE(len, 1);
    parts.push(b);
  }
  return parts.push(bytes);
}

function encodeArrayHeader(len, parts) {
  if (len < 0x10) parts.push(Buffer.from([0x90 | len]));
  else if (len < 0x10000) {
    const b = Buffer.allocUnsafe(3);
    b[0] = 0xdc;
    b.writeUInt16BE(len, 1);
    parts.push(b);
  } else {
    const b = Buffer.allocUnsafe(5);
    b[0] = 0xdd;
    b.writeUInt32BE(len, 1);
    parts.push(b);
  }
}

function encodeMapHeader(len, parts) {
  if (len < 0x10) parts.push(Buffer.from([0x80 | len]));
  else if (len < 0x10000) {
    const b = Buffer.allocUnsafe(3);
    b[0] = 0xde;
    b.writeUInt16BE(len, 1);
    parts.push(b);
  } else {
    const b = Buffer.allocUnsafe(5);
    b[0] = 0xdf;
    b.writeUInt32BE(len, 1);
    parts.push(b);
  }
}

function encodeValue(value, parts) {
  if (value === null || value === undefined) return parts.push(Buffer.from([0xc0]));
  if (typeof value === "boolean") return parts.push(Buffer.from([value ? 0xc3 : 0xc2]));
  if (typeof value === "number") return encodeNumber(value, parts);
  if (typeof value === "string") return encodeString(value, parts);
  if (value instanceof Uint8Array) return encodeBinary(value, parts);
  if (Array.isArray(value)) {
    encodeArrayHeader(value.length, parts);
    for (const item of value) encodeValue(item, parts);
    return undefined;
  }
  if (typeof value === "object") {
    const keys = Object.keys(value);
    encodeMapHeader(keys.length, parts);
    for (const key of keys) {
      encodeString(key, parts);
      encodeValue(value[key], parts);
    }
    return undefined;
  }
  throw new TypeError(`Cannot encode value of type ${typeof value}`);
}

export function encode(value) {
  const parts = [];
  encodeValue(value, parts);
  return Buffer.concat(parts);
}
