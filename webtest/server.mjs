/**
 * MessagePack demo server for testing/screenshotting the "MessagePack DevTools"
 * extension. Zero dependencies — runs with `node server.mjs` or `bun server.mjs`.
 *
 * Endpoints (all return `application/x-msgpack` unless noted):
 *   GET /api/users      array of users
 *   GET /api/products   array of products
 *   GET /api/orders     array of orders (nested line items)
 *   GET /api/config     nested settings object
 *   GET /api/stats      numeric metrics
 *   GET /api/heavy      large payload (for size/duration)
 *   GET /api/plain      text/plain (control — not captured)
 *   GET /api/json       application/json (control — not captured)
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize, extname } from "node:path";
import { encode } from "./encode.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "public");
const VENDOR_DIR = join(
  __dirname,
  "..",
  "node_modules",
  "@msgpack",
  "msgpack",
  "dist.esm",
);
const PORT = Number(process.env.PORT ?? 4000);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = [
  "Ava",
  "Liam",
  "Noah",
  "Emma",
  "Olivia",
  "Mia",
  "Kai",
  "Leo",
  "Zoe",
  "Ivan",
  "Ayu",
  "Budi",
];
const LAST = [
  "Chen",
  "Patel",
  "Garcia",
  "Kim",
  "Novak",
  "Rahman",
  "Silva",
  "Khan",
  "Wong",
  "Diaz",
];
const ROLES = ["admin", "editor", "viewer", "billing"];
const TAGSET = ["beta", "internal", "vip", "trial", "enterprise"];
const PRODUCTS = [
  "Wireless Mouse",
  "Mechanical Keyboard",
  "4K Monitor",
  "USB-C Hub",
  "Noise-Cancelling Headset",
  "Laptop Stand",
  "Webcam 1080p",
  "External SSD 1TB",
];

const pick = (rand, list) => list[Math.floor(rand() * list.length)];
const round2 = (n) => Math.round(n * 100) / 100;

function makeUsers(count) {
  const rand = rng(1337);
  return Array.from({ length: count }, (_, i) => ({
    id: 1000 + i,
    name: `${pick(rand, FIRST)} ${pick(rand, LAST)}`,
    email: `user${i + 1}@example.com`,
    role: pick(rand, ROLES),
    active: rand() > 0.25,
    score: round2(rand() * 100),
    tags: Array.from({ length: Math.floor(rand() * 3) }, () => pick(rand, TAGSET)),
    createdAt: new Date(Date.UTC(2024, 0, 1) + i * 86400000).toISOString(),
  }));
}

function makeProducts() {
  const rand = rng(2468);
  return PRODUCTS.map((name, i) => ({
    sku: `SKU-${(i + 1).toString().padStart(4, "0")}`,
    name,
    price: round2(9.99 + rand() * 290),
    stock: Math.floor(rand() * 500),
    rating: round2(3 + rand() * 2),
    categories: [
      pick(rand, ["peripherals", "audio", "display", "storage"]),
      pick(rand, ["wired", "wireless", "premium"]),
    ],
  }));
}

function makeOrders(count) {
  const rand = rng(90210);
  return Array.from({ length: count }, (_, i) => {
    const items = Array.from({ length: 1 + Math.floor(rand() * 4) }, () => {
      const qty = 1 + Math.floor(rand() * 3);
      const price = round2(9.99 + rand() * 290);
      return {
        sku: `SKU-${(1 + Math.floor(rand() * PRODUCTS.length)).toString().padStart(4, "0")}`,
        qty,
        price,
        total: round2(qty * price),
      };
    });
    const total = round2(items.reduce((sum, item) => sum + item.total, 0));
    return {
      id: `ORD-${(5000 + i).toString()}`,
      customer: `${pick(rand, FIRST)} ${pick(rand, LAST)}`,
      status: pick(rand, ["pending", "paid", "shipped", "cancelled"]),
      currency: "USD",
      items,
      total,
      placedAt: new Date(Date.UTC(2025, 0, 1) + i * 3600000).toISOString(),
    };
  });
}

const config = {
  app: { name: "Acme Store", version: "3.4.1", environment: "staging" },
  features: {
    newCheckout: true,
    darkMode: false,
    recommendations: true,
    chatSupport: false,
  },
  pagination: { defaultPageSize: 25, maxPageSize: 200 },
  limits: { maxUploadMb: 20, requestsPerMinute: 600 },
  integrations: [
    { name: "stripe", enabled: true, mode: "test" },
    { name: "sendgrid", enabled: true, mode: "live" },
    { name: "algolia", enabled: false, mode: "test" },
  ],
};

const stats = {
  window: "24h",
  requests: 1284932,
  errors: 341,
  errorRate: round2((341 / 1284932) * 100),
  p50Ms: 42.7,
  p95Ms: 138.2,
  p99Ms: 421.9,
  regions: { "us-east-1": "43.1%", "eu-west-1": "31.8%", "ap-southeast-1": "25.1%" },
};

function makeHeavy(count) {
  const rand = rng(555);
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    label: `row-${i + 1}`,
    value: round2(rand() * 1000),
    flag: rand() > 0.5,
    meta: {
      bucket: Math.floor(rand() * 10),
      notes: "generated for the MessagePack demo",
    },
  }));
}

const routes = {
  "/api/users": () => makeUsers(12),
  "/api/products": () => makeProducts(),
  "/api/orders": () => makeOrders(10),
  "/api/config": () => config,
  "/api/stats": () => stats,
  "/api/heavy": () => makeHeavy(250),
};

function sendMsgpack(res, data) {
  const body = encode(data);
  res.writeHead(200, {
    "Content-Type": "application/x-msgpack",
    "Content-Length": body.length,
    "Cache-Control": "no-store",
    "X-Demo-Server": "msgpack",
  });
  res.end(body);
}

async function serveFile(res, baseDir, relPath) {
  const safe = normalize(relPath).replace(/^(\.\.[/\\])+/, "");
  const full = join(baseDir, safe);
  if (!full.startsWith(baseDir)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  try {
    const body = await readFile(full);
    res.writeHead(200, {
      "Content-Type": MIME[extname(full)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (pathname in routes) return sendMsgpack(res, routes[pathname]());

  if (pathname === "/api/plain") {
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return res.end(
      "This is a plain-text response and should NOT be captured by the extension.\n",
    );
  }
  if (pathname === "/api/json") {
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });
    return res.end(
      JSON.stringify({
        message: "This is JSON and should NOT be captured by the extension.",
      }),
    );
  }

  if (pathname.startsWith("/vendor/msgpack/")) {
    return serveFile(res, VENDOR_DIR, pathname.slice("/vendor/msgpack/".length));
  }

  if (pathname === "/") return serveFile(res, PUBLIC_DIR, "index.html");
  return serveFile(res, PUBLIC_DIR, pathname.replace(/^\//, ""));
});

server.listen(PORT, () => {
  console.log(`MessagePack demo server running at http://localhost:${PORT}`);
  console.log("Open it in Chrome, then open DevTools → MsgPack.");
});
