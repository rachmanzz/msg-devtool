import { Activity } from "lucide-react";
import { formatBytes, formatDuration, formatTime } from "../lib/format";
import type { Capture } from "../lib/types";

interface CaptureListProps {
  captures: Capture[];
  hasQuery: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function CaptureList({
  captures,
  hasQuery,
  selectedId,
  onSelect,
}: CaptureListProps) {
  if (captures.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
        <Activity className="h-8 w-8 text-slate-700" />
        <p className="text-sm text-slate-400">
          {hasQuery
            ? "No captured requests match the filter."
            : "No MessagePack responses captured yet."}
        </p>
        {!hasQuery && (
          <p className="text-xs text-slate-500">
            Reload the page or trigger requests that return{" "}
            <code className="rounded bg-slate-800 px-1">application/x-msgpack</code>.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {captures.map((capture) => (
        <button
          key={capture.id}
          type="button"
          onClick={() => onSelect(capture.id)}
          style={{ contentVisibility: "auto", containIntrinsicSize: "0 76px" }}
          className={`flex w-full flex-col gap-1 border-b border-slate-800/70 px-3 py-2.5 text-left transition ${
            selectedId === capture.id ? "bg-slate-800/80" : "hover:bg-slate-900"
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
          <span className="truncate font-mono text-xs text-slate-300">{capture.url}</span>
          <span className="text-[10px] text-slate-500">
            {formatTime(capture.time)} · {formatDuration(capture.duration)} ·{" "}
            {formatBytes(capture.size)}
          </span>
        </button>
      ))}
    </div>
  );
}
