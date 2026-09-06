import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { decode } from "@msgpack/msgpack";
import JsonView from "@uiw/react-json-view";
import { Activity, Trash2 } from "lucide-react";
import "./index.css";

interface Capture {
  id: number;
  url: string;
  method: string;
  status: number;
  statusText: string;
  decoded: unknown;
  error?: string;
  size: number;
  time: number;
  duration: number;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function isMsgPackContentType(value: string): boolean {
  return value.includes("application/x-msgpack") || value.includes("application/msgpack");
}

function App() {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    const listener = (request: chrome.devtools.network.Request) => {
      const contentType =
        request.response.headers.find(
          (header) => header.name.toLowerCase() === "content-type",
        )?.value ?? "";

      if (!isMsgPackContentType(contentType)) return;

      request.getContent((content, encoding) => {
        try {
          const bytes =
            encoding === "base64"
              ? base64ToUint8Array(content)
              : new TextEncoder().encode(content);

          const decoded = decode(bytes);
          const id = ++idRef.current;
          const capture: Capture = {
            id,
            url: request.request.url,
            method: request.request.method,
            status: request.response.status,
            statusText: request.response.statusText,
            decoded,
            size: content.length,
            time: request.startedDateTime
              ? new Date(request.startedDateTime).getTime()
              : Date.now(),
            duration: request.time,
          };
          setCaptures((prev) => [capture, ...prev]);
          setSelectedId((current) => current ?? id);
        } catch (error) {
          const id = ++idRef.current;
          const capture: Capture = {
            id,
            url: request.request.url,
            method: request.request.method,
            status: request.response.status,
            statusText: request.response.statusText,
            decoded: null,
            error: error instanceof Error ? error.message : String(error),
            size: content.length,
            time: request.startedDateTime
              ? new Date(request.startedDateTime).getTime()
              : Date.now(),
            duration: request.time,
          };
          setCaptures((prev) => [capture, ...prev]);
        }
      });
    };

    chrome.devtools.network.onRequestFinished.addListener(listener);
    return () => {
      chrome.devtools.network.onRequestFinished.removeListener(listener);
    };
  }, []);

  const selected = captures.find((capture) => capture.id === selectedId) ?? null;

  return (
    <div className="flex h-screen w-full flex-col bg-slate-950 text-slate-200">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-slate-800 px-4">
        <div className="flex items-center gap-2 text-slate-100">
          <Activity className="h-4 w-4 text-cyan-400" />
          <span className="text-sm font-semibold tracking-wide">MessagePack Inspector</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-slate-400">
            {captures.length} captured
          </span>
          <button
            type="button"
            onClick={() => {
              setCaptures([]);
              setSelectedId(null);
            }}
            className="flex items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-80 shrink-0 flex-col border-r border-slate-800">
          {captures.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
              <Activity className="h-8 w-8 text-slate-700" />
              <p className="text-sm text-slate-400">
                No MessagePack responses captured yet.
              </p>
              <p className="text-xs text-slate-500">
                Reload the page or trigger requests that return{" "}
                <code className="rounded bg-slate-800 px-1">application/x-msgpack</code>.
              </p>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto">
              {captures.map((capture) => (
                <button
                  key={capture.id}
                  type="button"
                  onClick={() => setSelectedId(capture.id)}
                  className={`flex w-full flex-col gap-1 border-b border-slate-800/70 px-3 py-2.5 text-left transition ${
                    selectedId === capture.id
                      ? "bg-slate-800/80"
                      : "hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        capture.error
                          ? "bg-rose-500/15 text-rose-400"
                          : capture.status >= 200 && capture.status < 300
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-amber-500/15 text-amber-400"
                      }`}
                    >
                      {capture.error ? "ERR" : capture.status}
                    </span>
                    <span className="rounded bg-slate-700/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-300">
                      {capture.method}
                    </span>
                  </div>
                  <span className="truncate font-mono text-xs text-slate-300">
                    {capture.url}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(capture.time).toLocaleTimeString()} ·{" "}
                    {capture.duration.toFixed(1)} ms · {capture.size} bytes
                  </span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <main className="min-w-0 flex-1 overflow-auto p-4">
          {!selected ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Select a request to inspect its decoded payload.
            </div>
          ) : selected.error ? (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4">
              <p className="text-sm font-semibold text-rose-300">
                Failed to decode MessagePack
              </p>
              <pre className="mt-2 overflow-x-auto font-mono text-xs text-rose-200">
                {selected.error}
              </pre>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3">
                <p className="break-all font-mono text-xs text-slate-300">
                  {selected.url}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {selected.method} · {selected.status} {selected.statusText} ·{" "}
                  {selected.duration.toFixed(1)} ms
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <JsonView
                  value={selected.decoded as object}
                  collapsed={1}
                  displayDataTypes={false}
                  enableClipboard={false}
                  style={{ backgroundColor: "transparent" }}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
