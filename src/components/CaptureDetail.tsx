import { encode } from "@msgpack/msgpack";
import JsonView from "@uiw/react-json-view";
import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";
import { formatBytes, formatDuration, formatTime } from "../lib/format";
import type { Capture } from "../lib/types";

interface CaptureDetailProps {
  capture: Capture | null;
}

function safeFilename(url: string, id: number): string {
  try {
    const pathname = new URL(url).pathname;
    const lastSegment = pathname.split("/").filter(Boolean).pop() ?? "response";
    return `msgpack-${id}-${lastSegment.replace(/[^a-zA-Z0-9._-]/g, "_")}.json`;
  } catch {
    return `msgpack-${id}.json`;
  }
}

export function CaptureDetail({ capture }: CaptureDetailProps) {
  const [copied, setCopied] = useState(false);

  if (!capture) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Select a request to inspect its decoded payload.
      </div>
    );
  }

  const jsonText =
    capture.error === undefined ? JSON.stringify(capture.decoded, null, 2) : null;

  const copyJson = async () => {
    if (jsonText === null) return;
    await navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadJson = () => {
    if (jsonText === null) return;
    const blob = new Blob([jsonText], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = safeFilename(capture.url, capture.id);
    anchor.click();
    URL.revokeObjectURL(href);
  };

  const downloadMsgpack = () => {
    if (capture.error !== undefined) return;
    const bytes = encode(capture.decoded);
    const blob = new Blob([bytes], { type: "application/x-msgpack" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = safeFilename(capture.url, capture.id).replace(
      /\.json$/,
      ".msgpack",
    );
    anchor.click();
    URL.revokeObjectURL(href);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 break-all font-mono text-xs text-slate-300">
            {capture.url}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={copyJson}
              disabled={jsonText === null}
              className="flex items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy JSON"}
            </button>
            <button
              type="button"
              onClick={downloadJson}
              disabled={jsonText === null}
              className="flex items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" />
              JSON
            </button>
            <button
              type="button"
              onClick={downloadMsgpack}
              disabled={capture.error !== undefined}
              className="flex items-center gap-1.5 rounded-md border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" />
              Msgpack
            </button>
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          {capture.method} · {capture.status} {capture.statusText} ·{" "}
          {formatTime(capture.time)} · {formatDuration(capture.duration)} ·{" "}
          {formatBytes(capture.size)}
        </p>
      </div>

      {capture.error !== undefined ? (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4">
          <p className="text-sm font-semibold text-rose-300">
            Failed to decode MessagePack
          </p>
          <pre className="mt-2 overflow-x-auto font-mono text-xs text-rose-200">
            {capture.error}
          </pre>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
          <JsonView
            value={capture.decoded as object}
            collapsed={1}
            displayDataTypes={false}
            enableClipboard={false}
            style={{ backgroundColor: "transparent" }}
          />
        </div>
      )}

      <p className="text-[11px] text-slate-600">
        Re-encoded payload can be re-imported with{" "}
        <code className="text-slate-500">msgpack decode</code> CLI for verification.
      </p>
    </div>
  );
}
