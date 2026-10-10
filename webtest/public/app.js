import { decode } from "/vendor/msgpack/index.mjs";

const ENDPOINTS = [
  { path: "/api/users", label: "users", hint: "array of users" },
  { path: "/api/products", label: "products", hint: "array of products" },
  { path: "/api/orders", label: "orders", hint: "nested line items" },
  { path: "/api/config", label: "config", hint: "nested settings" },
  { path: "/api/stats", label: "stats", hint: "numeric metrics" },
  { path: "/api/heavy", label: "heavy", hint: "large payload (250 rows)" },
  { path: "/api/plain", label: "plain", hint: "text/plain — not captured" },
  { path: "/api/json", label: "json", hint: "application/json — not captured" },
];

const endpointsEl = document.querySelector("#endpoints");
const logEl = document.querySelector("#log");
const outputEl = document.querySelector("#output");
const metaEl = document.querySelector("#meta");
const fireAllBtn = document.querySelector("#fire-all");
const clearBtn = document.querySelector("#clear");

let requestCount = 0;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function addLog(path, status, bytes, ms) {
  requestCount += 1;
  const li = document.createElement("li");
  const ok = status >= 200 && status < 300;
  const isMsgpack = status === 200 && !path.endsWith("/plain") && !path.endsWith("/json");
  li.innerHTML = `
    <span class="seq">#${requestCount}</span>
    <span class="method">GET</span>
    <span class="path">${path}</span>
    <span class="pill ${isMsgpack ? "mp" : "other"}">${isMsgpack ? "msgpack" : "other"}</span>
    <span class="status ${ok ? "ok" : "bad"}">${status}</span>
    <span class="size">${formatBytes(bytes)}</span>
    <span class="ms">${ms.toFixed(1)} ms</span>`;
  logEl.prepend(li);
}

function show(path, decoded, status, bytes, ms) {
  metaEl.textContent = `GET ${path} · ${status} · ${formatBytes(bytes)} · ${ms.toFixed(1)} ms`;
  outputEl.textContent = JSON.stringify(decoded, null, 2);
}

async function call(path, { silent = false } = {}) {
  const started = performance.now();
  let status = 0;
  let bytes = 0;
  let decoded;
  try {
    const res = await fetch(path, {
      headers: { Accept: "application/x-msgpack, application/json" },
    });
    status = res.status;
    const buffer = new Uint8Array(await res.arrayBuffer());
    bytes = buffer.length;
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("msgpack")) {
      decoded = decode(buffer);
    } else {
      decoded = { contentType, preview: new TextDecoder().decode(buffer).trim() };
    }
  } catch (error) {
    decoded = { error: String(error) };
  }
  const ms = performance.now() - started;
  if (!silent) show(path, decoded, status, bytes, ms);
  addLog(path, status, bytes, ms);
  return decoded;
}

for (const endpoint of ENDPOINTS) {
  const button = document.createElement("button");
  button.className = "endpoint";
  button.innerHTML = `<span class="endpoint-label">/api/${endpoint.label}</span><span class="endpoint-hint">${endpoint.hint}</span>`;
  button.addEventListener("click", () => call(endpoint.path));
  endpointsEl.append(button);
}

fireAllBtn.addEventListener("click", async () => {
  for (const endpoint of ENDPOINTS) {
    await call(endpoint.path, { silent: true });
  }
  await call("/api/users");
});

clearBtn.addEventListener("click", () => {
  requestCount = 0;
  logEl.replaceChildren();
  outputEl.textContent = '{\n  "cleared": true\n}';
  metaEl.textContent = "No request yet";
});

window.addEventListener("load", () => {
  call("/api/config");
  setTimeout(() => call("/api/users"), 250);
});
